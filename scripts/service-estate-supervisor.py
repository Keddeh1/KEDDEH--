"""Restart one configured service with exclusive ownership and bounded backoff."""
import argparse
import fcntl
import json
import os
from pathlib import Path
import signal
import subprocess
import time
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--config',type=Path,required=True)
parser.add_argument('--service',required=True)
args=parser.parse_args();service=json.loads(args.config.read_text())[args.service]
root=args.config.parent
lock=open(root/(args.service+'.lock'),'a');os.chmod(root/(args.service+'.lock'),0o600)
fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
stopping=False;child=None

def stop(signum,frame):
    global stopping
    stopping=True
    if child is not None and child.poll() is None:child.terminate()
signal.signal(signal.SIGTERM,stop);signal.signal(signal.SIGINT,stop)
delay=.2
while not stopping:
    started=time.monotonic()
    child=subprocess.Popen(service['command'],cwd=service['cwd'])
    (root/(args.service+'.worker.pid')).write_text(str(child.pid))
    while child.poll() is None:
        if stopping:
            child.terminate()
            try:child.wait(timeout=5)
            except subprocess.TimeoutExpired:child.kill();child.wait()
            break
        time.sleep(.1)
    if stopping:break
    if time.monotonic()-started>30:delay=.2
    deadline=time.monotonic()+delay
    while not stopping and time.monotonic()<deadline:time.sleep(.1)
    delay=min(delay*2,10)
(root/(args.service+'.worker.pid')).unlink(missing_ok=True)
