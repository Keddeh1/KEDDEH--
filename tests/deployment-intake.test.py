import importlib.util,json,tempfile,unittest,zipfile
from pathlib import Path
spec=importlib.util.spec_from_file_location('intake',Path(__file__).resolve().parents[1]/'tools/deployment_intake.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class IntakeTests(unittest.TestCase):
 def test_preservation_and_instruction_inertness(self):
  with tempfile.TemporaryDirectory() as directory:
   root=Path(directory);src=root/'source';src.mkdir();(src/'deploy.sh').write_text('touch NEVER_EXECUTE\n')
   with zipfile.ZipFile(src/'bundle.zip','w') as z:z.writestr('install.sh','touch NEVER_EXECUTE\n')
   report=m.preserve(src,root/'custody');self.assertEqual(report['source_files'],2);self.assertFalse((src/'NEVER_EXECUTE').exists())
   for entry in report['records']:self.assertEqual(m.digest(root/'custody'/entry['custody_path']),entry['sha256'])
 def test_unsafe_archives_are_preserved_but_not_extracted(self):
  with tempfile.TemporaryDirectory() as directory:
   archive=Path(directory)/'unsafe.zip'
   with zipfile.ZipFile(archive,'w') as z:z.writestr('../outside.txt','no');z.writestr('/absolute.txt','no')
   result=m.inspect_archive(archive);self.assertEqual(sum(x['finding']=='UNSAFE_PATH' for x in result['findings']),2);self.assertFalse(result['extracted']);self.assertFalse((Path(directory)/'outside.txt').exists())
 def test_symbolic_source_is_rejected(self):
  with tempfile.TemporaryDirectory() as directory:
   root=Path(directory);src=root/'source';src.mkdir();(src/'linked').symlink_to('/etc/passwd')
   with self.assertRaisesRegex(ValueError,'SYMLINK_SOURCE_REJECTED'):m.preserve(src,root/'custody')
if __name__=='__main__':unittest.main()
