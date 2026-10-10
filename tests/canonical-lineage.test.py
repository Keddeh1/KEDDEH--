import sys,os,json,signal,subprocess,tempfile,concurrent.futures,time
from pathlib import Path
import unittest
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'runtime'))
import canonical_lineage as m
import serverspace_substrate as s
class LineageTests(unittest.TestCase):
    def setUp(self):self.temp=tempfile.TemporaryDirectory();self.root=Path(self.temp.name)
    def tearDown(self):self.temp.cleanup()
    def test_readback_idempotency_and_namespace(self):
        receipt=m.commit(self.root,'A',{'x':b'first'},0,'request-1')
        self.assertEqual(m.commit(self.root,'A',{'x':b'first'},0,'request-1'),receipt)
        with self.assertRaisesRegex(ValueError,'REQUEST_ID_CONFLICT'):m.commit(self.root,'A',{'x':b'other'},0,'request-1')
        with self.assertRaises(ValueError):m.recover(self.root,'B')
        state,ledger=m.recover(self.root,'A');self.assertEqual(len(ledger),1);self.assertEqual(state['digest'],receipt['state_digest'])
    def test_concurrent_writers_have_single_revision_owner(self):
        m.commit(self.root,'A',{'x':b'first'},0,'initial')
        def attempt(i):
            try:return m.commit(self.root,'A',{'x':bytes([i])},1,str(i))['revision']
            except ValueError:return 'conflict'
        with concurrent.futures.ThreadPoolExecutor(8) as pool:results=list(pool.map(attempt,range(8)))
        self.assertEqual(results.count(2),1);self.assertEqual(results.count('conflict'),7)
    def test_sigkill_each_persistence_boundary_recovers_identical_receipt(self):
        for stage in ['wal_persisted','state_persisted','ledger_partial','ledger_persisted','pending_cleared']:
            with self.subTest(stage=stage),tempfile.TemporaryDirectory() as temporary:
                root=Path(temporary);m.commit(root,'A',{'x':b'first'},0,'initial')
                code=f'''import sys,os,signal;sys.path.insert(0,{str(ROOT/'runtime')!r});import canonical_lineage as m
from pathlib import Path
def boundary(stage):
 if stage=={stage!r}:os.kill(os.getpid(),signal.SIGKILL)
m.commit(Path({temporary!r}),'A',{{'x':b'next'}},1,'next',boundary=boundary)
'''
                child=subprocess.run([sys.executable,'-c',code],timeout=5)
                self.assertEqual(child.returncode,-signal.SIGKILL)
                state,ledger=m.recover(root,'A');self.assertEqual(state['revision'],2);self.assertEqual(len(ledger),2)
                self.assertEqual(m.commit(root,'A',{'x':b'next'},1,'next'),ledger[-1]);self.assertFalse((root/m.PENDING).exists())
                with s.lock(root,'writer.lock',True):pass
    def test_legacy_history_not_fabricated(self):
        s.write_state(self.root,'A',{'x':b'legacy'},0);before=(self.root/'canonical-state.json').read_bytes()
        with self.assertRaisesRegex(ValueError,'UNSEALED_LEGACY'):m.commit(self.root,'A',{},1,'new')
        self.assertEqual((self.root/'canonical-state.json').read_bytes(),before)
    def test_tampered_ledger_and_unowned_tail_rejected(self):
        m.commit(self.root,'A',{'x':b'first'},0,'initial');path=self.root/m.LEDGER
        original=path.read_bytes();path.write_bytes(original+b'partial')
        with self.assertRaisesRegex(ValueError,'UNAUTHORIZED_PARTIAL'):m.recover(self.root,'A')
        bad=json.loads(original);bad['state_digest']='f'*64;path.write_bytes(s.encoded(bad)+b'\n')
        with self.assertRaisesRegex(ValueError,'LINEAGE_SEAL'):m.recover(self.root,'A')
    def test_sealed_daemon_readiness_binds_live_lineage(self):
        child=subprocess.Popen([sys.executable,str(ROOT/'runtime/serverspace_substrate.py'),'daemon','--root',str(self.root),'--namespace','A','--sealed-lineage'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        try:
            deadline=time.monotonic()+5
            while time.monotonic()<deadline:
                try:observed=s.probe(self.root,'A');break
                except (OSError,ValueError):time.sleep(.05)
            else:self.fail('Sealed daemon did not reach readiness')
            state,ledger=m.recover(self.root,'A')
            self.assertEqual(observed['mask'],7);self.assertEqual(observed['lineage_seal'],ledger[-1]['seal']);self.assertEqual(observed['digest'],state['digest'])
        finally:
            child.terminate();child.wait(timeout=3)
    def test_sealed_daemon_rejects_legacy_without_overwrite(self):
        s.write_state(self.root,'A',{'x':b'legacy'},0);before=(self.root/'canonical-state.json').read_bytes()
        child=subprocess.run([sys.executable,str(ROOT/'runtime/serverspace_substrate.py'),'daemon','--root',str(self.root),'--namespace','A','--sealed-lineage'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,timeout=3)
        self.assertNotEqual(child.returncode,0);self.assertEqual((self.root/'canonical-state.json').read_bytes(),before);self.assertFalse((self.root/'readiness.sock').exists())
    def test_foreign_pending_cannot_overwrite_current_state(self):
        m.commit(self.root,'A',{'x':b'first'},0,'initial');before=(self.root/'canonical-state.json').read_bytes()
        pending={'state':s.read_json(self.root/'canonical-state.json'),'record':json.loads((self.root/m.LEDGER).read_bytes())};pending['state']['namespace']='B'
        s.atomic(self.root,m.PENDING,m.seal(pending))
        with self.assertRaises(ValueError):m.recover(self.root,'A')
        self.assertEqual((self.root/'canonical-state.json').read_bytes(),before)
if __name__=='__main__':unittest.main()
