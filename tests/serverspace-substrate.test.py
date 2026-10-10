import base64
from concurrent.futures import ThreadPoolExecutor
import hashlib
import http.client
import json
import os
from pathlib import Path
import signal
import socket
import subprocess
import sys
import tempfile
import time
import unittest
import zlib
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'runtime'))
from serverspace_substrate import CanonicalState,call,canonical,digest,provision

class SubstrateTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.root=Path(self.temp.name)/'runtime';provision(self.root,'serverspace://test/isolated');self.store=CanonicalState(self.root);self.processes=[]
    def tearDown(self):
        for child in reversed(self.processes):
            if child.poll() is None:
                child.terminate()
                try:child.wait(timeout=5)
                except subprocess.TimeoutExpired:child.kill();child.wait()
        self.temp.cleanup()
    def start(self,script,*args):
        child=subprocess.Popen([sys.executable,str(ROOT/'runtime'/script),'--root',str(self.root),*args],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);self.processes.append(child);return child
    def ready(self):
        for _ in range(100):
            try:return call(self.root)
            except Exception:time.sleep(.1)
        self.fail('No signed readiness')
    def test_shared_state_matches_canonical(self):
        self.assertEqual(self.store.read_shared(),self.store.read())
    def test_atomic_retry_retained(self):
        first=self.store.commit('one',1,{'counter':1})
        self.assertEqual(CanonicalState(self.root).commit('one',1,{'counter':1}),first)
        self.assertEqual(self.store.read()['body']['version'],2)
        with self.assertRaises(ValueError):self.store.commit('one',1,{'counter':2})
    def test_concurrent_fencing_one_writer(self):
        def commit(i):
            try:return self.store.commit(str(i),1,{'counter':i})
            except ValueError:return None
        with ThreadPoolExecutor(max_workers=8) as pool:results=list(pool.map(commit,range(8)))
        self.assertEqual(sum(x is not None for x in results),1)
    def test_equal_unity_domains_stay_distinct(self):
        domains={'a':{'identity':'domain://a','origin':'origin://a','unity':1},'b':{'identity':'domain://b','origin':'origin://b','unity':1}}
        self.store.commit('domains',1,{'domains':domains})
        self.assertEqual(self.store.read()['body']['payload']['domains'],domains)
        with self.assertRaises(ValueError):self.store.commit('merge',2,{'domains':{'a':domains['a']}})
    def test_unassigned_unity_retained(self):
        domain={'identity':'domain://unassigned','origin':'origin://a','unity':None}
        self.store.commit('domains',1,{'domains':{'a':domain}})
        self.assertIsNone(self.store.read()['body']['payload']['domains']['a']['unity'])
    def test_crc_dataset_integrity(self):
        raw=b'cache frame';dataset={'content_b64':base64.b64encode(raw).decode(),'sha256':hashlib.sha256(raw).hexdigest(),'crc32':format(zlib.crc32(raw)&0xffffffff,'08x')}
        self.store.commit('cache',1,{'datasets':{'one':dataset}})
        with self.assertRaises(ValueError):self.store.commit('bad',2,{'datasets':{'one':dict(dataset,crc32='00000000')}})
        self.assertEqual(self.store.read_shared()['body']['version'],2)
    def test_canonical_tampering_detected(self):
        record=self.store.read();record['body']['payload']['counter']=9;(self.root/'canonical.json').write_bytes(canonical(record))
        with self.assertRaises(ValueError):self.store.read()
    def test_shared_carrier_rehydration(self):
        record=self.store.read();(self.root/'substrate.shm').write_bytes(bytes(65536))
        with self.assertRaises(ValueError):self.store.read_shared()
        self.store.rehydrate();self.assertEqual(self.store.read_shared(),record)
    def test_signed_udS_frames_and_exact_mask(self):
        self.start('serverspace_watchdog.py');self.assertEqual(self.ready()['readiness_mask'],7)
        for i in range(64):
            payload={'sequence':i,'value':'frame-'+str(i)};reply=call(self.root,'echo',{'sequence':i,'payload':payload})
            self.assertEqual(reply['sequence'],i);self.assertEqual(reply['sha256'],digest(payload));self.assertEqual(reply['crc32'],format(zlib.crc32(canonical(payload))&0xffffffff,'08x'))
    def test_wrong_pinned_peer_rejected(self):
        self.start('serverspace_watchdog.py');self.ready();(self.root/'server.pub').write_bytes(bytes(32))
        with self.assertRaises(Exception):call(self.root)
    def test_worker_crash_retains_state_and_receipt(self):
        self.start('serverspace_watchdog.py');self.ready()
        first=call(self.root,'commit',{'request_id':'durable','expected_version':1,'changes':{'counter':19}})
        old=int((self.root/'worker.pid').read_text());os.kill(old,signal.SIGKILL)
        for _ in range(100):
            time.sleep(.1)
            if int((self.root/'worker.pid').read_text())!=old:break
        self.ready();self.assertEqual(call(self.root,'commit',{'request_id':'durable','expected_version':1,'changes':{'counter':19}}),first)
        self.assertEqual(self.store.read_shared()['body']['payload']['counter'],19)
    def test_api_waits_for_handshake(self):
        with socket.socket() as probe:probe.bind(('127.0.0.1',0));port=probe.getsockname()[1]
        self.start('serverspace_mining_gate.py','--port',str(port));time.sleep(.3)
        with socket.socket() as probe:self.assertNotEqual(probe.connect_ex(('127.0.0.1',port)),0)
        self.start('serverspace_watchdog.py');self.ready()
        for _ in range(50):
            client=http.client.HTTPConnection('127.0.0.1',port,timeout=2)
            try:
                client.request('GET','/health');reply=client.getresponse();body=json.loads(reply.read());self.assertEqual(reply.status,200);self.assertEqual(body['readiness_mask'],7);break
            except ConnectionError:time.sleep(.1)
            finally:client.close()
        else:self.fail('Gated API failed to start')
    def test_paths_reject_symlink_and_open_permissions(self):
        (self.root/'canonical.json').unlink();(self.root/'canonical.json').symlink_to('/tmp/unrelated')
        with self.assertRaises(ValueError):CanonicalState(self.root)
    def test_projection_keeps_parent_and_isolates_views(self):
        domains={'a':{'identity':'domain://a','origin':'origin://a','unity':1},'b':{'identity':'domain://b','origin':'origin://b','unity':1}}
        self.store.commit('domains',1,{'domains':domains})
        first=self.store.project('view://a',['a']);second=self.store.project('view://b',['b'])
        first['domains']['a']['unity']=9
        self.assertEqual(self.store.read()['body']['payload']['domains'],domains)
        self.assertNotEqual(first['view_identity'],second['view_identity'])
        self.assertEqual(first['parent_identity'],second['parent_identity'])
    def test_crash_after_canonical_commit_before_shared_mirror(self):
        code="""import os,sys
sys.path.insert(0,sys.argv[1])
from serverspace_substrate import CanonicalState
store=CanonicalState(sys.argv[2]);store._mirror=lambda *args:os._exit(73)
store.commit('uncertain',1,{'counter':23})
"""
        child=subprocess.run([sys.executable,'-c',code,str(ROOT/'runtime'),str(self.root)],timeout=5)
        self.assertEqual(child.returncode,73)
        recovered=CanonicalState(self.root);record=recovered.rehydrate()
        self.assertEqual(record['body']['payload']['counter'],23)
        self.assertEqual(recovered.commit('uncertain',1,{'counter':23}),record['body']['continuations']['uncertain'])
        self.assertEqual(recovered.read_shared(),record)
    def test_worker_resource_limits(self):
        self.start('serverspace_watchdog.py');self.ready();pid=int((self.root/'worker.pid').read_text())
        limits=Path('/proc')/str(pid)/'limits';text=limits.read_text();self.assertIn('268435456',text);self.assertIn('128',text)

if __name__=='__main__':unittest.main()
