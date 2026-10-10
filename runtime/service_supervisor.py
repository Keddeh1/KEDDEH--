"""Single-owner POSIX supervisor for the resident TLS service."""
import argparse
import fcntl
import os
from pathlib import Path
import signal
import subprocess
import sys
import time


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--deployment', type=Path, required=True)
    parser.add_argument('--port', type=int, required=True)
    parser.add_argument('--service', choices=['registry', 'circuits'], default='registry')
    args = parser.parse_args()
    state = args.deployment.resolve()
    lock = open(state / 'supervisor.lock', 'a')
    os.chmod(state / 'supervisor.lock', 0o600)
    fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    stopping = False
    child = None
    def stop(signum, frame):
        nonlocal stopping
        stopping = True
        if child is not None and child.poll() is None:
            child.terminate()
    signal.signal(signal.SIGTERM, stop)
    signal.signal(signal.SIGINT, stop)
    script = 'circuit_service.py' if args.service == 'circuits' else 'network_registry.py'
    delay = .2
    while not stopping:
        started = time.monotonic()
        child = subprocess.Popen([sys.executable, str(Path(__file__).parent / script), '--deployment', str(state), '--port', str(args.port)])
        (state / 'worker.pid').write_text(str(child.pid))
        while child.poll() is None:
            if stopping:
                try:
                    child.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    child.kill()
                    child.wait()
                break
            time.sleep(.1)
        if stopping:
            break
        if time.monotonic() - started > 30:
            delay = .2
        deadline = time.monotonic() + delay
        while not stopping and time.monotonic() < deadline:
            time.sleep(.1)
        delay = min(delay * 2, 10)
    (state / 'worker.pid').unlink(missing_ok=True)


if __name__ == '__main__':
    main()
