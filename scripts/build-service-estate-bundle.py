"""Archive tracked source and pinned resident dependencies without live state or secrets."""
import argparse
import hashlib
import io
import json
from pathlib import Path
import shutil
import subprocess
import tarfile
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output',type=Path,required=True)
args=parser.parse_args();out=args.output.resolve();out.mkdir(parents=True,exist_ok=True)
bundle=out/'keddeh-service-estate';bundle.mkdir()
files=subprocess.check_output(['git','ls-files','-z'],cwd=ROOT).decode().split('\0')
for name in filter(None,files):
    source=ROOT/name
    if source.is_symlink() or not source.is_file():raise RuntimeError('Unsupported source entry: '+name)
    target=bundle/name;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,target)
components=json.loads((ROOT/'runtime/component-sources.json').read_text())['components']
vfs=json.loads((ROOT/'mcp/backing-components.json').read_text())['vfs']
for role,directory in [('runtime','namespace'),('braink-family-runtime','braink'),('vfs','braink-vfs')]:
    component=vfs if role=='vfs' else next(c for c in components if c['role']==role)
    checkout=Path('/workspace/component-sources')/component['repository'].split('/')[1] if role=='vfs' else ROOT/'.runtime-components'/component['repository'].split('/')[1]
    if subprocess.check_output(['git','-C',str(checkout),'rev-parse','HEAD'],text=True).strip()!=component['commit']:raise RuntimeError('Backing source pin mismatch: '+role)
    selected=['src','pyproject.toml','uv.lock'] if role=='runtime' else list(component['files']) if role=='braink-family-runtime' else ['braink','vfs_server','pyproject.toml','README.md']
    archive=subprocess.check_output(['git','-C',str(checkout),'archive',component['commit'],*selected])
    with tarfile.open(fileobj=io.BytesIO(archive)) as tar:tar.extractall(bundle/'vendor'/directory,filter='data')
manifest={str(p.relative_to(bundle)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(bundle.rglob('*')) if p.is_file()}
(bundle/'service-bundle-manifest.json').write_text(json.dumps({'schema':'keddeh.service-estate.bundle.v1','files':manifest},indent=2)+'\n')
archive=out/'keddeh-service-estate.tar.gz'
with tarfile.open(archive,'w:gz') as tar:tar.add(bundle,arcname=bundle.name)
digest=hashlib.sha256(archive.read_bytes()).hexdigest();(out/'keddeh-service-estate.tar.gz.sha256').write_text(digest+'  '+archive.name+'\n')
print(json.dumps({'bundle':str(archive),'sha256':digest,'installer':'scripts/install-service-estate.py'}))
