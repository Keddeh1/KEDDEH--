"""Integration against the sourced Keddeh runtime, not a replacement VFS."""
import tempfile
import unittest
from keddeh_namespace.logical_vfs import LogicalVFS, Conflict
from keddeh_namespace.native_labels import native_label, displacement

class RuntimePackageIntegration(unittest.TestCase):
    def test_vfs_recovery_and_native_origin(self):
        with tempfile.TemporaryDirectory() as root:
            vfs = LogicalVFS(root)
            first = vfs.write('workstation/state', b'continuity', expected_version=0)
            self.assertEqual(first['sequence'], 1)
            self.assertEqual(native_label(0), 1)
            self.assertEqual(displacement(1), 0)
            restarted = LogicalVFS(root)
            head, payload = restarted.read('workstation/state')
            self.assertEqual(payload, b'continuity')
            self.assertEqual(head['version'], 1)
            with self.assertRaises(Conflict):
                restarted.write('workstation/state', b'stale', expected_version=0)
            restarted.history()

if __name__ == '__main__':
    unittest.main()
