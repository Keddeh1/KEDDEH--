"""Build a secret-free archive containing the actual pinned namespace source."""
import hashlib
import io
import json
from pathlib import Path
import shutil
import subprocess
import tarfile

ROOT = Path(__file__).resolve().parents[1]
source = next(c for c in json.loads((ROOT / 'runtime/component-sources.json').read_text())['components'] if c['role'] == 'runtime')
checkout = ROOT / '.runtime-components' / source['repository'].split('/')[1]
if subprocess.check_output(['git', '-C', str(checkout), 'rev-parse', 'HEAD'], text=True).strip() != source['commit']:
    raise SystemExit('Namespace source pin mismatch')
out = ROOT / 'dist/network-deployment'
out.mkdir(parents=True, exist_ok=True)
bundle = out / 'keddeh-network'
if bundle.exists():
    raise SystemExit('Build output already exists; choose a clean build after preserving any deployed state')
bundle.mkdir()
archive = subprocess.check_output(['git', '-C', str(checkout), 'archive', source['commit'], 'src', 'pyproject.toml', 'uv.lock'])
vendor = bundle / 'vendor/namespace'
vendor.mkdir(parents=True)
with tarfile.open(fileobj=io.BytesIO(archive)) as tar:
    tar.extractall(vendor, filter='data')
for name in ('runtime/network_registry.py', 'scripts/provision-local-registry.py', 'scripts/registry-client.py', 'tests/network-registry.test.py'):
    target = bundle / name
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(ROOT / name, target)
shutil.copyfile(ROOT / 'deployment/setup.py', bundle / 'setup.py')
files = {str(p.relative_to(bundle)): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(bundle.rglob('*')) if p.is_file()}
(bundle / 'bundle-manifest.json').write_text(json.dumps({'schema': 'keddeh.network.bundle.v1', 'namespace_repository': source['repository'], 'namespace_commit': source['commit'], 'files': files}, indent=2)+'\n')
path = out / 'keddeh-network.tar.gz'
with tarfile.open(path, 'w:gz') as tar:
    tar.add(bundle, arcname='keddeh-network')
digest = hashlib.sha256(path.read_bytes()).hexdigest()
(path.with_suffix(path.suffix + '.sha256')).write_text(digest + '  ' + path.name + '\n')
print(json.dumps({'bundle': str(path), 'sha256': digest, 'source_commit': source['commit']}))
