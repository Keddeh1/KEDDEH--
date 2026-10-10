"""Install a verified service bundle; preserve credentials and existing runtime state."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import secrets
import shutil
import subprocess
import sys
ROOT=Path(__file__).resolve().parents[1]

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--deployments',type=Path,default=Path('/workspace/deployments'))
    parser.add_argument('--prepare-only',action='store_true')
    args=parser.parse_args()
    if sys.version_info<(3,12):raise RuntimeError('Python 3.12 or later is required')
    manifest=json.loads((ROOT/'service-bundle-manifest.json').read_text())
    for name,digest in manifest['files'].items():
        source=(ROOT/name).resolve()
        if not source.is_relative_to(ROOT) or source.is_symlink() or hashlib.sha256(source.read_bytes()).hexdigest()!=digest:raise RuntimeError('Bundle integrity failed: '+name)
    uv=shutil.which('uv')
    if not uv:
        installer=ROOT/'.installer';subprocess.run([sys.executable,'-m','venv',str(installer)],check=True)
        subprocess.run([str(installer/'bin/python'),'-m','pip','install','uv==0.12.19'],check=True);uv=str(installer/'bin/uv')
    subprocess.run(['npm','ci','--cache',str(ROOT/'.runtime-cache/npm'),'--no-audit','--no-fund'],cwd=ROOT,check=True)
    deploy=args.deployments.resolve();deploy.mkdir(parents=True,exist_ok=True)
    family=deploy/'keddeh-tensor-shell-20261010'
    for name in ['keddeh-network','keddeh-circuit-service-20261010','keddeh-tensor-shell-20261010']:
        destination=deploy/name;destination.mkdir(parents=True,exist_ok=True)
        settings=dict(os.environ,UV_PROJECT_ENVIRONMENT=str(destination/'.venv'),UV_CACHE_DIR=str(ROOT/'.runtime-cache/uv'))
        subprocess.run([uv,'sync','--frozen','--project',str(ROOT/'vendor/namespace')],env=settings,check=True)
        if not (destination/'runtime').exists():shutil.copytree(ROOT/'runtime',destination/'runtime',ignore=shutil.ignore_patterns('__pycache__','*.pyc'))
        state=destination/'state'
        if not state.exists():subprocess.run([str(destination/'.venv/bin/python'),str(ROOT/'scripts/provision-local-registry.py'),'--deployment',str(state)],check=True)
    if not (family/'state/tensor-family.sqlite3').exists():
        request={'family_id':'installation-readiness','goal':'Verify bundled resident tensor workflow','shell':json.loads((ROOT/'runtime/shells/tetrahedron.json').read_text())}
        subprocess.run([str(family/'.venv/bin/python'),str(ROOT/'scripts/braink-family-request.py'),'--state',str(family/'state/tensor-family.sqlite3')],input=json.dumps(request),text=True,stdout=subprocess.DEVNULL,check=True)
    vfs=deploy/'braink-contextual-history';vfs.mkdir(parents=True,exist_ok=True)
    subprocess.run([uv,'--cache-dir',str(ROOT/'.runtime-cache/uv'),'venv','--allow-existing',str(vfs/'.venv')],check=True)
    subprocess.run([uv,'--cache-dir',str(ROOT/'.runtime-cache/uv'),'pip','install','--python',str(vfs/'.venv/bin/python'),'--require-hashes','-r',str(ROOT/'deployment/vfs-requirements.lock')],check=True)
    subprocess.run([uv,'--cache-dir',str(ROOT/'.runtime-cache/uv'),'pip','install','--python',str(vfs/'.venv/bin/python'),'--no-deps',str(ROOT/'vendor/braink-vfs')],check=True)
    token=vfs/'access.token'
    if not token.exists():
        fd=os.open(token,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
        with os.fdopen(fd,'w') as stream:stream.write(secrets.token_urlsafe(32))
    # Qualify the package installed into the new destination without relying on
    # imports from the source checkout or a service's live data.
    installed_tests=subprocess.check_output([str(vfs/'.venv/bin/python'),'-c','import pathlib,vfs_server; print(pathlib.Path(vfs_server.__file__).parent / "tests")'],cwd='/tmp',text=True).strip()
    subprocess.run([str(vfs/'.venv/bin/python'),'-m','unittest','discover','-s',installed_tests,'-q'],cwd='/tmp',check=True)
    for test in ['network-registry.test.py','circuit-service.test.py','quantum-statevector.test.py','tensor-shell.test.py','braink-family.test.py']:
        subprocess.run([str(family/'.venv/bin/python'),str(ROOT/'tests'/test)],check=True)
    command=[sys.executable,str(ROOT/'scripts/setup-service-estate.py'),'--deployments',str(deploy)]
    if args.prepare_only:command.append('--configure-only')
    subprocess.run(command,check=True)

if __name__=='__main__':main()
