"""Authenticated circuit execution persisted by the resident signed namespace registry."""
import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
import sqlite3
import threading
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from keddeh_namespace.envelope import SCHEMA, content_root
from keddeh_namespace.logical_vfs import Conflict
from keddeh_namespace.registry_service import MAX_REQUEST
from keddeh_namespace.signatures import sign_observation
from network_registry import make_tls_server
from quantum_statevector import simulate_circuit

RUNTIME = 'runtime://keddeh/quantum-computer'
GENERATOR = 'local-circuit-executor'
JOB_ID = re.compile(r'[A-Za-z0-9][A-Za-z0-9._-]{0,95}')


def decimal_result(value):
    if type(value) is float:
        return format(value, '.17g')
    if type(value) is list:
        return [decimal_result(x) for x in value]
    if type(value) is dict:
        return {k: decimal_result(v) for k, v in value.items()}
    return value


class CircuitExecutor:
    def __init__(self, registry, key):
        self.registry = registry
        self.key = key
        self.lock = threading.Lock()
        self.source_digest = hashlib.sha256((Path(__file__).parent / 'quantum_statevector.py').read_bytes()).hexdigest()

    def execute(self, job_id, circuit):
        if type(job_id) is not str or not JOB_ID.fullmatch(job_id):
            raise ValueError('Invalid job ID')
        raw = json.dumps(circuit, sort_keys=True, separators=(',', ':'), allow_nan=False)
        request_id = 'circuit:' + job_id
        with self.lock:
            self.registry.replay()
            with self.registry.vfs.connect() as db:
                prior = db.execute('SELECT result FROM requests WHERE request_id=?', (request_id,)).fetchone()
                parent = db.execute('SELECT digest FROM observation_heads WHERE runtime_id=?', (RUNTIME,)).fetchone()
            if prior:
                receipt = json.loads(prior['result'])
                generation = json.loads(self.registry.vfs.read_object(receipt['digest']))
                if generation['desired_state'].get('circuit_request') != raw:
                    raise Conflict('Job ID already belongs to a different circuit')
                return {'job_id': job_id, 'result': generation['desired_state']['result'], 'receipt': receipt}
            result = decimal_result(simulate_circuit(circuit))
            result['scalar_encoding'] = 'decimal-text'
            state = {'circuit_request': raw, 'circuit_sha256': hashlib.sha256(raw.encode()).hexdigest(), 'result': result}
            phase = {'status': 'EXECUTED', 'transport': 'TLS'}
            path = 'runtime/keddeh/quantum-computer/jobs/' + job_id
            envelope = dict(schema=SCHEMA, runtime_id=RUNTIME, source_sha256=self.source_digest,
                            generator_id=GENERATOR, observer_id='local-tls-circuit-service',
                            metric='registry-generation:' + path, execution_plane='classical-cloud-runtime',
                            observed_at=datetime.now(timezone.utc).isoformat(timespec='microseconds').replace('+00:00', 'Z'),
                            transaction=request_id, readback='/generations?path=' + path,
                            stateRoot=content_root('state', state), phaseRoot=content_root('phase', phase),
                            parent_envelope_sha256=parent['digest'] if parent else None)
            receipt = self.registry.commit(dict(request_id=request_id, path=path, expected_version=0,
                                               signed=sign_observation(envelope, self.key), desired_state=state, phase_state=phase))
            return {'job_id': job_id, 'result': result, 'receipt': receipt}


def make_circuit_server(root, trust, token, certificate, tls_key, signing_key, port=0):
    server = make_tls_server(root, trust, token, certificate, tls_key, port=port)
    # Reuse the original registry and its authenticated read/write handler.
    from keddeh_namespace.registry_service import Registry
    registry = Registry(root, trust)
    executor = CircuitExecutor(registry, signing_key)
    original = server.RequestHandlerClass

    class Handler(original):
        def do_GET(self):
            if self.path != '/health':
                return super().do_GET()
            if not self.authorized():
                return self.reply(401, {'error': 'unauthorized'})
            try:
                count = len(registry.replay())
                return self.reply(200, {'status': 'ok', 'service': 'circuits', 'verified_events': count})
            except (ValueError, OSError, sqlite3.Error):
                return self.reply(503, {'status': 'invalid registry'})

        def do_POST(self):
            if self.path != '/circuits':
                return super().do_POST()
            if not self.authorized():
                return self.reply(401, {'error': 'unauthorized'})
            try:
                lengths = self.headers.get_all('Content-Length', [])
                if len(lengths) != 1 or self.headers.get('Transfer-Encoding'):
                    return self.reply(400, {'error': 'invalid request framing'})
                length = int(lengths[0])
                if not 0 < length <= MAX_REQUEST:
                    return self.reply(413, {'error': 'invalid request size'})
                raw = self.rfile.read(length)
                if len(raw) != length:
                    return self.reply(400, {'error': 'incomplete request body'})
                request = json.loads(raw)
                if type(request) is not dict or set(request) != {'job_id', 'circuit'}:
                    raise ValueError('Invalid execution fields')
                response = executor.execute(request['job_id'], request['circuit'])
            except Conflict as exc:
                return self.reply(409, {'error': str(exc)})
            except (ValueError, TypeError, KeyError, ArithmeticError):
                return self.reply(400, {'error': 'invalid circuit'})
            except (OSError, sqlite3.Error):
                return self.reply(503, {'error': 'storage failure; reconcile the job ID before retry'})
            return self.reply(201, response)

    server.RequestHandlerClass = Handler
    return server


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--deployment', type=Path, required=True)
    parser.add_argument('--port', type=int, default=8444)
    args = parser.parse_args()
    root = args.deployment
    server = make_circuit_server(root / 'ledger', json.loads((root / 'trust.json').read_text()),
                                 (root / 'registry.token').read_text().strip(), root / 'tls.crt', root / 'tls.key',
                                 Ed25519PrivateKey.from_private_bytes((root / 'circuit-executor.key').read_bytes()), args.port)
    try:
        server.serve_forever()
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
