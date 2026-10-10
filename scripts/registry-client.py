"""Authenticated TLS readback and signed publication through the resident contract."""
import argparse
import base64
from datetime import datetime, timezone
import hashlib
import http.client
import json
from pathlib import Path
import ssl
import uuid
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from keddeh_namespace.envelope import SCHEMA, canonical_bytes, content_root, envelope_digest
from keddeh_namespace.signatures import sign_observation


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--deployment', type=Path, required=True)
    parser.add_argument('--port', type=int, default=8443)
    parser.add_argument('--source', type=Path)
    args = parser.parse_args()
    root = args.deployment
    context = ssl.create_default_context(cafile=str(root / 'tls.crt'))
    token = (root / 'registry.token').read_text().strip()
    def request(method, path, value=None):
        client = http.client.HTTPSConnection('127.0.0.1', args.port, timeout=5, context=context)
        try:
            client.request(method, path, body=canonical_bytes(value) if value is not None else None, headers={'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'})
            result = client.getresponse()
            return result.status, json.loads(result.read())
        finally:
            client.close()
    if args.source:
        payload = args.source.read_bytes()
        digest = hashlib.sha256(payload).hexdigest()
        status, previous = request('GET', '/generations?path=runtime/kex/core')
        if status not in (200, 404):
            raise SystemExit('Could not reconcile authoritative generation')
        expected = previous['head']['version'] if status == 200 else 0
        parent = envelope_digest(previous['generation']['signed']['envelope']) if status == 200 else None
        state = {'runtime': 'runtime://kex/core', 'source_sha256': digest, 'payload_base64': base64.b64encode(payload).decode()}
        phase = {'state': 'ADMITTED', 'transport': 'TLS'}
        tx = str(uuid.uuid4())
        envelope = dict(schema=SCHEMA, runtime_id='runtime://kex/core', source_sha256=digest, generator_id='local-deployment-generator', observer_id='local-network-client', metric='registry-generation:runtime/kex/core', execution_plane='cloud-loopback', observed_at=datetime.now(timezone.utc).isoformat(timespec='microseconds').replace('+00:00', 'Z'), transaction=tx, readback='/generations?path=runtime/kex/core', stateRoot=content_root('state', state), phaseRoot=content_root('phase', phase), parent_envelope_sha256=parent)
        key = Ed25519PrivateKey.from_private_bytes((root / 'generator.key').read_bytes())
        status, receipt = request('POST', '/generations', dict(request_id=tx, path='runtime/kex/core', expected_version=expected, signed=sign_observation(envelope, key), desired_state=state, phase_state=phase))
        if status != 201:
            raise SystemExit('Publication was not accepted: ' + str(status))
        status, readback = request('GET', '/generations?path=runtime/kex/core')
        if status != 200 or readback['head']['receipt'] != receipt['receipt'] or readback['generation']['desired_state'] != state:
            raise SystemExit('Publication requires receipt reconciliation')
        print(json.dumps({'status': 'COMMITTED_AND_READ_BACK', 'receipt': receipt, 'payload_sha256': digest}))
    else:
        status, health = request('GET', '/health')
        if status != 200:
            raise SystemExit('Health readback failed')
        print(json.dumps(health))


if __name__ == '__main__':
    main()
