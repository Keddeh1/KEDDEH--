import importlib.util
from pathlib import Path
import tempfile
import subprocess
import sys
import unittest
from unittest.mock import patch
from concurrent.futures import ThreadPoolExecutor

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('braink_family', ROOT / 'runtime/braink_family.py')
family = importlib.util.module_from_spec(spec)
spec.loader.exec_module(family)


class FamilyIntegration(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.path = Path(self.temp.name) / 'family.sqlite3'
        self.store = family.resident_module().EnterpriseStore(self.path)

    def tearDown(self):
        self.store.close()
        self.temp.cleanup()

    def test_group_readback_and_restart(self):
        result = family.run_family(self.store, 'family-01', 'Organise learning', {'pace': 'self-directed'})
        state = self.store.state()
        self.assertEqual(len(state['mesh']['nodes']), 6)
        self.assertEqual(len(state['mesh']['edges']), 5)
        self.assertEqual(result['assistant']['state'], 'RESOLVED')
        self.assertEqual(result['claim']['status'], 'RESOLVED')
        self.assertAlmostEqual(sum(v*v for v in result['quantum']['vector']), 1)
        self.assertFalse(result['quantum']['physical_hardware'])
        self.assertEqual(state['workbook']['sheets']['family-01']['A1']['value'], {'pace': 'self-directed'})
        self.store.close()
        self.store = family.resident_module().EnterpriseStore(self.path)
        count = self.store.verify_ledger()['count']
        self.assertEqual(family.run_family(self.store, 'family-01', 'Organise learning', {'pace': 'self-directed'}), result)
        self.assertEqual(self.store.verify_ledger()['count'], count)
        self.assertEqual(self.store.verify_ledger()['status'], 'PASS')

    def test_failure_rolls_back_state_and_evidence(self):
        before = self.store.state()
        original = self.store.operate
        def failing(product, operation, payload):
            if operation == 'write_cell':
                raise OSError('injected carrier failure')
            return original(product, operation, payload)
        with patch.object(self.store, 'operate', side_effect=failing):
            with self.assertRaises(OSError):
                family.run_family(self.store, 'family-02', 'Prepare task')
        self.assertEqual(self.store.state(), before)
        self.assertEqual(self.store.verify_ledger()['count'], 0)
        self.assertEqual(family.run_family(self.store, 'family-02', 'Prepare task')['assistant']['state'], 'RESOLVED')

    def test_conflicting_retry_cannot_overwrite_family(self):
        family.run_family(self.store, 'family-03', 'Initial task')
        before = self.store.state()
        with self.assertRaises(ValueError):
            family.run_family(self.store, 'family-03', 'Changed task')
        self.assertEqual(before, self.store.state())

    def test_two_store_connections_commit_one_request(self):
        other = family.resident_module().EnterpriseStore(self.path)
        try:
            with ThreadPoolExecutor(max_workers=2) as pool:
                results = list(pool.map(lambda st: family.run_family(st, 'family-04', 'Concurrent request'), [self.store, other]))
            self.assertEqual(results[0], results[1])
            self.assertEqual(len(self.store.state()['mesh']['edges']), 5)
            self.assertEqual(self.store.verify_ledger()['status'], 'PASS')
        finally:
            other.close()

    def test_families_keep_distinct_assistant_and_learning_contexts(self):
        a = family.run_family(self.store, 'family-A', 'Task A', {'pace': 'A'})
        b = family.run_family(self.store, 'family-B', 'Task B', {'pace': 'B'})
        self.assertNotEqual(a['assistant']['matches'], b['assistant']['matches'])
        self.assertEqual(len(self.store.state()['mesh']['nodes']), 12)
        self.assertEqual(self.store.state()['workbook']['sheets']['family-A']['A1']['value'], {'pace': 'A'})

    def test_process_death_does_not_publish_partial_family(self):
        code = '''
import os, sys
sys.path.insert(0, sys.argv[1])
import braink_family as family
store = family.resident_module().EnterpriseStore(sys.argv[2])
original = store.operate
def dying(product, operation, payload):
    result = original(product, operation, payload)
    if operation == 'create_task':
        os._exit(73)
    return result
store.operate = dying
family.run_family(store, 'crash-family', 'Recover incomplete undertaking')
'''
        before = self.store.state()
        process = subprocess.run([sys.executable, '-c', code, str(ROOT / 'runtime'), str(self.path)])
        self.assertEqual(process.returncode, 73)
        self.assertEqual(self.store.state(), before)
        self.assertEqual(self.store.verify_ledger()['count'], 0)
        result = family.run_family(self.store, 'crash-family', 'Recover incomplete undertaking')
        self.assertEqual(result['assistant']['state'], 'RESOLVED')


if __name__ == '__main__':
    unittest.main()
