"""Fetch the recorded runtime revision and install its existing frozen environment."""
import json
import os
from pathlib import Path
import subprocess

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / 'runtime/component-sources.json').read_text())
runtime = next(c for c in manifest['components'] if c['role'] == 'runtime')
components = root / '.runtime-components'
checkout = components / runtime['repository'].split('/')[1]
components.mkdir(exist_ok=True)
if not checkout.exists():
    subprocess.run(['git', 'clone', 'https://github.com/' + runtime['repository'] + '.git', str(checkout)], check=True)
actual = subprocess.check_output(['git', '-C', str(checkout), 'rev-parse', 'HEAD'], text=True).strip()
if actual != runtime['commit']:
    changed = subprocess.check_output(['git', '-C', str(checkout), 'status', '--porcelain'], text=True)
    if changed:
        raise SystemExit('Runtime source contains changes; refusing to replace them')
    subprocess.run(['git', '-C', str(checkout), 'fetch', 'origin', runtime['commit']], check=True)
    subprocess.run(['git', '-C', str(checkout), 'checkout', '--detach', runtime['commit']], check=True)
settings = dict(os.environ, UV_PROJECT_ENVIRONMENT=str(root / '.runtime-env'), UV_CACHE_DIR=str(root / '.runtime-cache'))
subprocess.run(['uv', 'sync', '--frozen'], cwd=checkout, env=settings, check=True)
subprocess.run([str(root / '.runtime-env/bin/python'), str(root / 'tests/runtime-package.test.py')], check=True)
