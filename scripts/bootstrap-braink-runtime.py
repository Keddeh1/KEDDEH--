"""Fetch the resident BRAINK carrier at the recorded source revision."""
import json
from pathlib import Path
import subprocess

root = Path(__file__).resolve().parents[1]
source = next(c for c in json.loads((root / 'runtime/component-sources.json').read_text())['components'] if c['role'] == 'braink-family-runtime')
checkout = root / '.runtime-components' / source['repository'].split('/')[1]
checkout.parent.mkdir(exist_ok=True)
if not checkout.exists():
    subprocess.run(['git', 'clone', 'https://github.com/' + source['repository'] + '.git', str(checkout)], check=True)
if subprocess.check_output(['git', '-C', str(checkout), 'status', '--porcelain', '--untracked-files=no'], text=True).strip():
    raise SystemExit('Resident source has changes; refusing replacement')
actual = subprocess.check_output(['git', '-C', str(checkout), 'rev-parse', 'HEAD'], text=True).strip()
if actual != source['commit']:
    subprocess.run(['git', '-C', str(checkout), 'fetch', 'origin', source['commit']], check=True)
    subprocess.run(['git', '-C', str(checkout), 'checkout', '--detach', source['commit']], check=True)
subprocess.run(['python3', str(root / 'tests/braink-family.test.py')], cwd=root, check=True)
