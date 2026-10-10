"""Verify, install, provision and start the portable resident TLS deployment."""
import argparse
import hashlib
import http.client
import json
import os
from pathlib import Path
import shutil
import ssl
import subprocess
import sys
import time


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8443)
    parser.add_argument('--service', choices=['registry', 'circuits'], default='registry')
    parser.add_argument('--install-only', action='store_true')
    args = parser.parse_args()
    if sys.version_info < (3, 12):
        raise SystemExit('Python 3.12 or later is required')
    root = Path(__file__).resolve().parent
    manifest = json.loads((root / 'bundle-manifest.json').read_text())
    for name, digest in manifest['files'].items():
        path = (root / name).resolve()
        if not path.is_relative_to(root) or hashlib.sha256(path.read_bytes()).hexdigest() != digest:
            raise SystemExit('Bundle integrity failed: ' + name)
    uv = shutil.which('uv')
    if not uv:
        installer = root / '.installer'
        subprocess.run([sys.executable, '-m', 'venv', str(installer)], check=True)
        installer_python = installer / ('Scripts/python.exe' if os.name == 'nt' else 'bin/python')
        subprocess.run([str(installer_python), '-m', 'pip', 'install', 'uv==0.12.19'], check=True)
        uv = str(installer / ('Scripts/uv.exe' if os.name == 'nt' else 'bin/uv'))
    settings = dict(os.environ, UV_PROJECT_ENVIRONMENT=str(root / '.venv'), UV_CACHE_DIR=str(root / '.cache/uv'))
    subprocess.run([uv, 'sync', '--frozen', '--project', str(root / 'vendor/namespace')], env=settings, check=True)
    python = root / '.venv' / ('Scripts/python.exe' if os.name == 'nt' else 'bin/python')
    state = root / 'state'
    if not state.exists():
        subprocess.run([str(python), str(root / 'scripts/provision-local-registry.py'), '--deployment', str(state)], check=True)
    subprocess.run([str(python), str(root / 'tests/network-registry.test.py')], check=True)
    subprocess.run([str(python), str(root / 'tests/quantum-statevector.test.py')], check=True)
    subprocess.run([str(python), str(root / 'tests/braink-family.test.py')], check=True)
    subprocess.run([str(python), str(root / 'tests/circuit-service.test.py')], check=True)
    subprocess.run([str(python), str(root / 'tests/tensor-shell.test.py')], check=True)
    if args.install_only:
        print(json.dumps({'installed': True, 'deployment': str(state), 'source_commit': manifest['namespace_commit']}))
        return
    def health():
        context = ssl.create_default_context(cafile=str(state / 'tls.crt'))
        client = http.client.HTTPSConnection('127.0.0.1', args.port, timeout=2, context=context)
        try:
            client.request('GET', '/health', headers={'Authorization': 'Bearer ' + (state / 'registry.token').read_text().strip()})
            response = client.getresponse()
            result = json.loads(response.read())
            if response.status != 200 or result.get('status') != 'ok':
                raise RuntimeError('Resident registry readback failed')
            if args.service == 'circuits' and result.get('service') != 'circuits':
                raise RuntimeError('Port belongs to a different service')
            return result
        finally:
            client.close()
    try:
        result = health()
        print(json.dumps({'status': 'ALREADY_RUNNING', 'health': result}))
        return
    except (ConnectionError, OSError):
        pass
    with open(state / 'service.log', 'ab') as log:
        os.chmod(state / 'service.log', 0o600)
        child = subprocess.Popen([str(python), str(root / 'runtime/service_supervisor.py'), '--service', args.service, '--deployment', str(state), '--port', str(args.port)], cwd=root, stdout=log, stderr=log, start_new_session=True)
    (state / 'service.pid').write_text(str(child.pid))
    for attempt in range(30):
        if child.poll() is not None:
            raise SystemExit('Service failed; inspect private state/service.log')
        try:
            result = health()
            print(json.dumps({'status': 'RUNNING', 'pid': child.pid, 'health': result, 'access_credentials': str(state / 'registry.token'), 'tls_trust': str(state / 'tls.crt')}))
            return
        except (ConnectionError, OSError):
            time.sleep(0.1)
    child.terminate()
    raise SystemExit('Service did not become ready')


if __name__ == '__main__':
    main()
