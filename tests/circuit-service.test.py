"""Exercise circuit execution over verified TLS and the resident durable ledger."""
from concurrent.futures import ThreadPoolExecutor
import http.client
import importlib.util
import json
from pathlib import Path
import sqlite3
import ssl
import sys
import tempfile
import threading
import unittest
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'runtime'))
from circuit_service import make_circuit_server
spec = importlib.util.spec_from_file_location('provision', ROOT / 'scripts/provision-local-registry.py')
provision = importlib.util.module_from_spec(spec)
spec.loader.exec_module(provision)
BELL = {'schema': 'keddeh.quantum.circuit.v1', 'qubits': 2, 'gates': [{'gate': 'H', 'target': 1}, {'gate': 'CX', 'control': 1, 'target': 2}]}

class CircuitNetwork(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name) / 'state'
        provision.provision(self.root)
        self.token = (self.root / 'registry.token').read_text().strip()
        self.context = ssl.create_default_context(cafile=str(self.root / 'tls.crt'))
        self.start()
    def start(self):
        self.server = make_circuit_server(self.root / 'ledger', json.loads((self.root / 'trust.json').read_text()), self.token, self.root / 'tls.crt', self.root / 'tls.key', Ed25519PrivateKey.from_private_bytes((self.root / 'circuit-executor.key').read_bytes()))
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
    def stop(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join()
    def tearDown(self):
        self.stop()
        self.temp.cleanup()
    def request(self, method, path, body=None, token=None):
        client = http.client.HTTPSConnection('127.0.0.1', self.server.server_address[1], context=self.context, timeout=5)
        try:
            client.request(method, path, body=json.dumps(body) if body is not None else None, headers={'Authorization': 'Bearer ' + (self.token if token is None else token), 'Content-Type': 'application/json'})
            response = client.getresponse()
            return response.status, json.loads(response.read())
        finally:
            client.close()
    def execute(self, job='bell', circuit=BELL):
        return self.request('POST', '/circuits', {'job_id': job, 'circuit': circuit})
    def count(self):
        return self.request('GET', '/health')[1]['verified_events']
    def test_bell_signed_durable_readback(self):
        status, result = self.execute()
        self.assertEqual(status, 201)
        self.assertEqual([round(float(x), 9) for x in result['result']['probabilities']], [.5, 0, 0, .5])
        self.assertFalse(result['result']['physical_hardware'])
        status, readback = self.request('GET', '/generations?path=runtime/keddeh/quantum-computer/jobs/bell')
        self.assertEqual(status, 200)
        self.assertEqual(readback['generation']['desired_state']['result'], result['result'])
        self.assertEqual(self.count(), 1)
    def test_unauthorized_no_commit(self):
        self.assertEqual(self.request('POST', '/circuits', {'job_id': 'bell', 'circuit': BELL}, token='wrong')[0], 401)
        self.assertEqual(self.count(), 0)
    def test_invalid_no_commit(self):
        self.assertEqual(self.execute(circuit=dict(BELL, qubits=0))[0], 400)
        self.assertEqual(self.execute(job='../escape')[0], 400)
        self.assertEqual(self.count(), 0)
    def test_restart_retry_is_same_receipt(self):
        first = self.execute()
        self.stop()
        self.start()
        self.assertEqual(self.execute(), first)
        self.assertEqual(self.count(), 1)
    def test_conflicting_retry_rejected(self):
        self.execute()
        self.assertEqual(self.execute(circuit=dict(BELL, gates=[]))[0], 409)
        self.assertEqual(self.count(), 1)
    def test_concurrent_retry_one_commit(self):
        with ThreadPoolExecutor(max_workers=4) as pool:
            results = list(pool.map(lambda _: self.execute(), range(4)))
        self.assertTrue(all(x == results[0] for x in results))
        self.assertEqual(results[0][0], 201)
        self.assertEqual(self.count(), 1)
    def test_storage_failure_retry(self):
        database = self.root / 'ledger/journal.sqlite3'
        with sqlite3.connect(database) as db:
            db.execute("CREATE TRIGGER fail_commit BEFORE INSERT ON events BEGIN SELECT RAISE(ABORT, 'forced storage rejection'); END")
        self.assertEqual(self.execute()[0], 503)
        self.assertEqual(self.count(), 0)
        with sqlite3.connect(database) as db:
            db.execute('DROP TRIGGER fail_commit')
        self.assertEqual(self.execute()[0], 201)
        self.assertEqual(self.count(), 1)

if __name__ == '__main__':
    unittest.main()
