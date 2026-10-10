import sys,tempfile,json
from pathlib import Path
import unittest
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'runtime'))
import incident_ledger as m
class IncidentTests(unittest.TestCase):
    def setUp(self):self.temp=tempfile.TemporaryDirectory();self.root=Path(self.temp.name)
    def tearDown(self):self.temp.cleanup()
    def test_actual_bounded_disk_chain_and_hashes(self):
        for i in range(205):m.record(self.root,'IPC',{'fault':i})
        path=self.root/'.braink/it_incidents/IT_INCIDENT_DISPATCH_LEDGER.ndjson'
        records=[json.loads(x) for x in path.read_bytes().splitlines()]
        self.assertEqual(len(records),200);self.assertLessEqual(path.stat().st_size,m.MAX_BYTES);m.check(records)
        self.assertTrue(records[-1]['incident_id'].startswith('KEX-404-INC-IPC-'))
        records[-1]['details']['fault']=-1
        with self.assertRaises(ValueError):m.check(records)
    def test_invalid_and_large_records_do_not_replace_ledger(self):
        m.record(self.root,'IPC',{'fault':'initial'})
        path=self.root/'.braink/it_incidents/IT_INCIDENT_DISPATCH_LEDGER.ndjson';before=path.read_bytes()
        with self.assertRaises(ValueError):m.record(self.root,'../escape',{})
        with self.assertRaises(ValueError):m.record(self.root,'IPC',{'fault':'x'*5000})
        self.assertEqual(path.read_bytes(),before)
if __name__=='__main__':unittest.main()
