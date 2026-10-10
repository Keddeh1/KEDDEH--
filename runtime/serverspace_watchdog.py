"""Local process watchdog with signed UDS heartbeats and bounded worker resources."""
import argparse
import fcntl
import json
import os
from pathlib import Path
import resource
import signal
import subprocess
import sys
import time
from serverspace_substrate import call, secured
parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--root',type=Path,required=True);args=parser.parse_args()
root=secured(args.root);lock=open(root/'watchdog.lock','a');fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
stopping=False;child=None

def stop(signum,frame):
    global stopping
    stopping=True
    if child is not None and child.poll() is None:child.terminate()
def limits():
    resource.setrlimit(resource.RLIMIT_AS,(256*1024*1024,256*1024*1024));resource.setrlimit(resource.RLIMIT_NOFILE,(128,128));resource.setrlimit(resource.RLIMIT_CORE,(0,0))
signal.signal(signal.SIGTERM,stop);signal.signal(signal.SIGINT,stop)
while not stopping:
    child=subprocess.Popen([sys.executable,str(Path(__file__).with_name('serverspace_substrate.py')),'--root',str(root)],preexec_fn=limits)
    (root/'worker.pid').write_text(str(child.pid));misses=0
    while not stopping and child.poll() is None:
        try:
            health=call(root)
            if health['readiness_mask']!=7:raise ValueError('Readiness mask rejected')
            misses=0
            (root/'watchdog-health.json').write_text(json.dumps({'observed_at':time.time(),'worker_pid':child.pid,'signed_heartbeat':True,**health}))
        except Exception:
            misses+=1
            if misses>=3:child.terminate();break
        time.sleep(.5)
    if child.poll() is None:
        child.terminate()
        try:child.wait(timeout=3)
        except subprocess.TimeoutExpired:child.kill();child.wait()
    if not stopping:time.sleep(.2)
(root/'worker.pid').unlink(missing_ok=True)
