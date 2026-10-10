"""Real TLS sockets, Ed25519 signatures and resident durable registry integration."""
import base64
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import hashlib
import http.client
import importlib.util
import json
from pathlib import Path
import ssl
import tempfile
import threading
import unittest
import uuid
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from keddeh_namespace.envelope import SCHEMA, canonical_bytes, content_root
from keddeh_namespace.signatures import sign_observation

ROOT = Path(__file__).resolve().parents[1]
def module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result
network = module('network', ROOT / 'runtime/network_registry.py')
provision = module('provision', ROOT / 'scripts/provision-local-registry.py')


class RealNetworkAdmission(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name) / 'deployment'
        provision.provision(self.root)
        self.token = (self.root / 'registry.token').read_text()
        self.key = Ed25519PrivateKey.from_private_bytes((self.root / 'generator.key').read_bytes())
        self.context = ssl.create_default_context(cafile=str(self.root / 'tls.crt'))
        self.start()

    def start(self):
        self.server = network.make_tls_server(self.root / 'ledger', json.loads((self.root / 'trust.json').read_text()), self.token, self.root / 'tls.crt', self.root / 'tls.key', port=0)
        self.port = self.server.server_address[1]
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()

    def stop(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join()

    def tearDown(self):
        self.stop()
        self.temp.cleanup()

    def request(self, method, path, body=None, token=None, context=None):
        client = http.client.HTTPSConnection('127.0.0.1', self.port, timeout=5, context=context or self.context)
        try:
            client.connect()
            tls_version = client.sock.version()
            headers = {'Authorization': 'Bearer ' + (self.token if token is None else token)}
            if body is not None:
                headers['Content-Type'] = 'application/json'
            client.request(method, path, body=canonical_bytes(body) if body is not None else None, headers=headers)
            response = client.getresponse()
            return response.status, json.loads(response.read()), tls_version
        finally:
            client.close()

    def generation(self):
        source = (ROOT / 'runtime/network_registry.py').read_bytes()
        state = {'source_sha256': hashlib.sha256(source).hexdigest(), 'runtime': 'runtime://kex/core'}
        phase = {'state': 'ADMITTED', 'transport': 'TLS'}
        transaction = str(uuid.uuid4())
        envelope = dict(schema=SCHEMA, runtime_id='runtime://kex/core', source_sha256=state['source_sha256'], generator_id='local-deployment-generator', observer_id='local-network-client', metric='registry-generation:runtime/kex/core', execution_plane='cloud-loopback', observed_at=datetime.now(timezone.utc).isoformat(timespec='microseconds').replace('+00:00', 'Z'), transaction=transaction, readback='/generations?path=runtime/kex/core', stateRoot=content_root('state', state), phaseRoot=content_root('phase', phase), parent_envelope_sha256=None)
        return dict(request_id=transaction, path='runtime/kex/core', expected_version=0, signed=sign_observation(envelope, self.key), desired_state=state, phase_state=phase)

    def test_tls_authenticated_health(self):
        status, result, tls = self.request('GET', '/health')
        self.assertEqual(status, 200)
        self.assertEqual(result['status'], 'ok')
        self.assertIn(tls, ['TLSv1.2', 'TLSv1.3'])

    def test_untrusted_certificate_rejected(self):
        with self.assertRaises(ssl.SSLCertVerificationError):
            self.request('GET', '/health', context=ssl.create_default_context())

    def test_unauthorized_write_rejected(self):
        self.assertEqual(self.request('POST', '/generations', self.generation(), token='wrong')[0], 401)
        self.assertEqual(self.request('GET', '/health')[1]['verified_events'], 0)

    def test_signed_write_readback_restart_and_idempotency(self):
        request = self.generation()
        status, result, _ = self.request('POST', '/generations', request)
        self.assertEqual(status, 201)
        self.assertEqual(result['version'], 1)
        self.stop()
        self.start()
        self.assertEqual(self.request('POST', '/generations', request)[1], result)
        readback = self.request('GET', '/generations?path=runtime/kex/core')[1]
        self.assertEqual(readback['generation']['desired_state'], request['desired_state'])
        self.assertEqual(readback['head']['receipt'], result['receipt'])
        self.assertEqual(self.request('GET', '/health')[1]['verified_events'], 1)

    def test_real_signature_tamper_rejected(self):
        request = self.generation()
        request['signed']['signature'] = base64.b64encode(bytes(64)).decode()
        self.assertEqual(self.request('POST', '/generations', request)[0], 400)
        self.assertEqual(self.request('GET', '/health')[1]['verified_events'], 0)

    def test_concurrent_generations_have_one_commit(self):
        requests = [self.generation(), self.generation()]
        with ThreadPoolExecutor(max_workers=2) as pool:
            results = list(pool.map(lambda value: self.request('POST', '/generations', value), requests))
        self.assertEqual(sorted(value[0] for value in results), [201, 409])
        self.assertEqual(self.request('GET', '/health')[1]['verified_events'], 1)


if __name__ == '__main__':
    unittest.main()
