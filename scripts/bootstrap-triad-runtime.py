"""Hash-locked gRPC installation and reproducible Protobuf generation."""
import os
from pathlib import Path
import shutil
import subprocess
ROOT=Path(__file__).resolve().parents[1]
uv=shutil.which('uv') or (str(ROOT/'.installer/bin/uv') if (ROOT/'.installer/bin/uv').exists() else None)
if not uv:raise RuntimeError('Install uv before bootstrapping the gRPC runtime')
env={**os.environ,'UV_CACHE_DIR':str(ROOT/'.runtime-cache/uv')}
subprocess.run([uv,'venv','--allow-existing',str(ROOT/'.triad-env')],env=env,check=True)
python=ROOT/'.triad-env/bin/python'
subprocess.run([uv,'pip','sync','--python',str(python),str(ROOT/'runtime/triad/requirements.lock')],env=env,check=True)
subprocess.run([str(python),'-m','grpc_tools.protoc','-I'+str(ROOT/'protobuf'),'--python_out='+str(ROOT/'runtime/triad'),'--grpc_python_out='+str(ROOT/'runtime/triad'),str(ROOT/'protobuf/triad_mesh.proto')],check=True)
