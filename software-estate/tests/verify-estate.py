"""Verify custody independently of application UI and historical PASS labels."""
from pathlib import Path
import hashlib, json, re

base = Path(__file__).resolve().parents[1]
rows = []
for family in ('drive', 'github'):
    manifest = json.loads((base / 'originals' / family / 'manifest.json').read_text())
    for item in manifest if isinstance(manifest, list) else manifest['files']:
        file = base / 'originals' / family / (item.get('filename') or item['path'])
        data = file.read_bytes()
        assert len(data) == item['bytes'], file
        assert hashlib.sha256(data).hexdigest() == item['sha256'], file
        if family == 'github':
            blob = hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()
            assert blob == item['git_blob_sha'], file
        rows.append({'path': str(file.relative_to(base)), 'sha256': hashlib.sha256(data).hexdigest()})
assert len(rows) == 27
for name in ('r14', 'aether'):
    change = json.loads((base / 'development/r2' / f'{name}-r2-change.json').read_text())
    assert hashlib.sha256((base / change['file']).read_bytes()).hexdigest() == change['afterSHA256']
    if name == 'r14':
        source = (base / change['file']).read_text()
        body = re.search(r'<script id="p19-host-adapter-runtime">([\s\S]*?)</script>', source).group(1)
        assert body == (base / 'development/r2/p19-host-adapter-runtime.js').read_text()
for change in json.loads((base / 'development/r2-family/changes.json').read_text())['changes']:
    assert hashlib.sha256((base / change['path']).read_bytes()).hexdigest() == change['afterSha256']
print('PASS: 27 original sizes/SHA256, 17 Git blob hashes, 5 R2 working hashes, P19 extracted source')
