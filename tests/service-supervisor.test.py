"""Prove optional readiness supervision restarts a living but unhealthy owned child."""
import json
from pathlib import Path
import signal
import subprocess
import sys
import tempfile
import time
import unittest
ROOT=Path(__file__).resolve().parents[1]
class SupervisionTests(unittest.TestCase):
    def test_live_unhealthy_child_is_replaced_and_ownership_is_exclusive(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory);config=root/'services.json';flag=root/'unhealthy'
            health=[sys.executable,'-c',"import json,pathlib,sys;print(json.dumps({'readiness_mask':0 if pathlib.Path(sys.argv[1]).exists() else 7}))",str(flag)]
            config.write_text(json.dumps({'test':{'command':[sys.executable,'-c','import time;time.sleep(60)'],'cwd':str(root),'health_command':health,'health_interval_seconds':.1,'health_timeout_seconds':1}}))
            command=[sys.executable,str(ROOT/'scripts/service-estate-supervisor.py'),'--config',str(config),'--service','test']
            supervisor=subprocess.Popen(command,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
            try:
                pidfile=root/'test.worker.pid'
                for _ in range(100):
                    if pidfile.exists():break
                    time.sleep(.01)
                old=int(pidfile.read_text())
                duplicate=subprocess.run(command,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,timeout=3)
                self.assertNotEqual(duplicate.returncode,0);self.assertEqual(int(pidfile.read_text()),old)
                flag.touch()
                for _ in range(100):
                    time.sleep(.05)
                    new=int(pidfile.read_text())
                    if new!=old:break
                else:self.fail('Living unhealthy worker was not replaced')
                flag.unlink();self.assertFalse(Path(f'/proc/{old}').exists())
                time.sleep(.3);self.assertIsNone(supervisor.poll())
            finally:
                supervisor.terminate();supervisor.wait(timeout=8)
                self.assertFalse(pidfile.exists())
if __name__=='__main__':unittest.main()
