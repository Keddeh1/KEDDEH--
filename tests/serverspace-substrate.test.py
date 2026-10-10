"""Actual isolated processes and sockets; no success fixtures or mining results."""
import concurrent.futures
import importlib.util
import json
import os
from pathlib import Path
import signal
import socket
import struct
import subprocess
import sys
import tempfile
import time
import unittest
ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / 'runtime/serverspace_substrate.py'
spec = importlib.util.spec_from_file_location('substrate', SCRIPT)
s = importlib.util.module_from_spec(spec); spec.loader.exec_module(s)

class SubstrateTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(); self.root = Path(self.temp.name); self.children = []
    def tearDown(self):
        for child in reversed(self.children):
            if child.poll() is None:
                child.terminate()
                try: child.wait(timeout=4)
                except subprocess.TimeoutExpired: child.kill(); child.wait()
        self.temp.cleanup()
    def launch(self, mode, extra=None):
        child = subprocess.Popen([sys.executable, str(SCRIPT), mode, '--root', str(self.root), '--namespace', 'canary-A', *(extra or [])], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        self.children.append(child); return child
    def ready(self):
        deadline = time.monotonic() + 8
        while time.monotonic() < deadline:
            try: return s.probe(self.root, 'canary-A')
            except (OSError, ValueError, KeyError): time.sleep(.05)
        self.fail('No authenticated readiness handshake')
    def test_real_uds_readiness_mask_state_and_permissions(self):
        child = self.launch('daemon'); observed = self.ready()
        self.assertEqual(observed['mask'], 7); self.assertEqual(observed['pid'], child.pid)
        for name in ['readiness.sock', 'canonical-state.json', 'peer.key', 'shared-memory.bin']:
            self.assertEqual((self.root/name).stat().st_mode & 0o777, 0o600)
    def test_atomic_writer_concurrency_crc_and_readback(self):
        first = s.write_state(self.root, 'canary-A', {'frames': b'\x00\xffabc'}, 0)
        self.assertEqual(s.validate(s.read_json(self.root/'canonical-state.json'), 'canary-A'), first)
        def attempt(i):
            try: return s.write_state(self.root, 'canary-A', {'frames': bytes([i])}, 1)['revision']
            except ValueError: return 'conflict'
        with concurrent.futures.ThreadPoolExecutor(8) as pool: results = list(pool.map(attempt, range(8)))
        self.assertEqual(results.count(2), 1); self.assertEqual(results.count('conflict'), 7)
    def test_corrupt_canonical_state_cannot_be_ready(self):
        s.write_state(self.root, 'canary-A', {'x': b'abc'}, 0)
        bad = s.read_json(self.root/'canonical-state.json'); bad['datasets']['x']['hex'] = '00'
        s.atomic(self.root, 'canonical-state.json', bad)
        child = self.launch('daemon'); self.assertNotEqual(child.wait(timeout=3), 0)
        with self.assertRaises(ValueError): s.validate(bad, 'canary-A')
    def test_cached_crc_is_checked_even_when_digest_matches(self):
        bad = s.write_state(self.root, 'canary-A', {'x': b'abc'}, 0)
        bad['datasets']['x']['crc32'] = 0; del bad['digest']
        bad['digest'] = s.hashlib.sha256(s.encoded(bad)).hexdigest()
        with self.assertRaisesRegex(ValueError, 'DATASET_CRC'): s.validate(bad, 'canary-A')
    def test_contexts_not_merged(self):
        self.launch('daemon'); self.ready()
        with self.assertRaises((ConnectionError, ValueError)): s.probe(self.root, 'canary-B')
        with self.assertRaisesRegex(ValueError, 'CONTEXT_IDENTITY'): s.write_state(self.root, 'canary-B', {}, 1)
    def test_watchdog_recovers_crash_retaining_state_and_memory(self):
        s.write_state(self.root, 'canary-A', {'retained': b'exact state'}, 0)
        self.launch('watchdog'); first = self.ready()
        with open(self.root/'shared-memory.bin', 'r+b') as stream: stream.seek(8192); stream.write(b'retained-map')
        os.kill(first['pid'], signal.SIGKILL)
        deadline = time.monotonic() + 8
        while time.monotonic() < deadline:
            try:
                second = s.probe(self.root, 'canary-A')
                if second['pid'] != first['pid']: break
            except (OSError, ValueError): pass
            time.sleep(.05)
        else: self.fail('Watchdog did not recover')
        self.assertEqual(first['digest'], second['digest'])
        with open(self.root/'shared-memory.bin', 'rb') as stream: stream.seek(8192); self.assertEqual(stream.read(12), b'retained-map')
    def test_gate_waits_for_bidirectional_handshake(self):
        marker = self.root/'api-started'
        gate = self.launch('gate', ['--timeout','3','--',sys.executable,'-c',f'from pathlib import Path; Path({str(marker)!r}).write_text("started")'])
        time.sleep(.2); self.assertFalse(marker.exists()); self.assertIsNone(gate.poll())
        self.launch('daemon'); self.ready(); self.assertEqual(gate.wait(timeout=4), 0); self.assertTrue(marker.exists())
    def test_gate_times_out_without_api_execution(self):
        marker = self.root/'api-started'
        gate = self.launch('gate', ['--timeout','.1','--',sys.executable,'-c',f'from pathlib import Path; Path({str(marker)!r}).touch()'])
        self.assertNotEqual(gate.wait(timeout=3), 0); self.assertFalse(marker.exists())
    def test_fragmented_frames_are_reassembled_and_crc_fault_rejected(self):
        import threading
        a,b = socket.socketpair(); payload = s.encoded({'frame':42}); packet = struct.pack('!II', len(payload), s.zlib.crc32(payload)) + payload
        def sender():
            for byte in packet: a.sendall(bytes([byte]))
        thread = threading.Thread(target=sender); thread.start()
        self.assertEqual(s.receive_frame(b), {'frame':42}); thread.join(); a.close(); b.close()
        a,b = socket.socketpair(); a.sendall(struct.pack('!II', 2, 0) + b'{}')
        with self.assertRaisesRegex(ValueError, 'FRAME_CRC'): s.receive_frame(b)
        a.close(); b.close()
    def test_exclusive_daemon_and_symlink_rejection(self):
        self.launch('daemon'); self.ready(); duplicate = self.launch('daemon')
        self.assertNotEqual(duplicate.wait(timeout=3), 0)
        outside = self.root/'outside'; outside.mkdir(mode=0o700); link = self.root/'alias'; link.symlink_to(outside)
        with self.assertRaises(ValueError): s.secure_root(link)
    def test_dynamic_socket_discovery_and_path_isolation(self):
        self.launch('daemon'); self.ready()
        metadata = s.read_json(self.root/'daemon.json')
        renamed = self.root/'discovered.sock'; (self.root/'readiness.sock').rename(renamed)
        metadata['uds'] = str(renamed); s.atomic(self.root,'daemon.json',metadata)
        self.assertEqual(s.probe(self.root,'canary-A')['mask'],7)
        metadata['uds'] = '/tmp/foreign.sock'; s.atomic(self.root,'daemon.json',metadata)
        with self.assertRaisesRegex(ValueError,'ESCAPES_RUNTIME'): s.probe(self.root,'canary-A')
    def test_malformed_payload_does_not_crash_daemon(self):
        child = self.launch('daemon'); self.ready()
        for bad in ([], {'payload':[],'signature':'bad'}, {'payload':{},'signature':7}):
            with socket.socket(socket.AF_UNIX) as conn:
                conn.settimeout(2);conn.connect(str(self.root/'readiness.sock'));s.send_frame(conn,bad)
                with self.assertRaises(ConnectionError):s.receive_frame(conn)
        self.assertIsNone(child.poll()); self.assertEqual(self.ready()['mask'],7)
    def test_stable_worker_pid_and_observed_child_inventory(self):
        child=self.launch('daemon');self.ready()
        def children():
            observed=[]
            for entry in Path('/proc').iterdir():
                if not entry.name.isdigit():continue
                try:fields=(entry/'stat').read_text().rsplit(')',1)[1].split()
                except (OSError,IndexError):continue
                if int(fields[1])==child.pid:observed.append(entry.name)
            return sorted(observed)
        before=children()
        for _ in range(25):self.assertEqual(s.probe(self.root,'canary-A')['pid'],child.pid)
        self.assertEqual(children(),before)
        self.assertIsNone(child.poll())
    def test_untrusted_signature_rejected_without_success(self):
        self.launch('daemon'); self.ready()
        with socket.socket(socket.AF_UNIX) as conn:
            conn.settimeout(2); conn.connect(str(self.root/'readiness.sock'))
            s.send_frame(conn, {'payload': {'namespace':'canary-A','nonce':'replay','op':'readiness'}, 'signature':'0'*64})
            with self.assertRaises(ConnectionError): s.receive_frame(conn)

if __name__ == '__main__': unittest.main()
