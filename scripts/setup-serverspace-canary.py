"""Stage and start separate ServerSpace canary services without replacing active nodes."""
import json
import os
from pathlib import Path
import subprocess
import sys
ROOT=Path(__file__).resolve().parents[1]
BASE=Path('/workspace/deployments/serverspace/runtime')
BASE.mkdir(mode=0o700,parents=True,exist_ok=True)
root=BASE/'canary-v1'
python=ROOT/'.runtime-env/bin/python'
if not root.exists():subprocess.run([str(python),str(ROOT/'runtime/serverspace_substrate.py'),'--root',str(root),'--provision','--identity','serverspace://canary/v1'],check=True)
# Validate the selected root before recording any startup bindings.
subprocess.run([str(python),'-c','import sys;sys.path.insert(0,sys.argv[1]);from serverspace_substrate import secured; secured(sys.argv[2])',str(ROOT/'runtime'),str(root)],check=True)
estate=Path('/workspace/deployments/service-estate');estate.mkdir(mode=0o700,exist_ok=True)
file=estate/'service-addons.json'
addons=json.loads(file.read_text()) if file.exists() else {}
new_addons={
 'serverspace-canary-watchdog':{'kind':'uds','command':[str(python),str(ROOT/'runtime/serverspace_watchdog.py'),'--root',str(root)],'cwd':str(ROOT),'health_command':[str(python),str(ROOT/'runtime/serverspace_substrate.py'),'--root',str(root),'--health']},
 'serverspace-canary-mining-api':{'command':[str(python),str(ROOT/'runtime/serverspace_mining_gate.py'),'--root',str(root),'--port','8795','--upstream-port','3000'],'cwd':str(ROOT),'scheme':'http','port':8795,'health':'/health','sdk_url':'http://127.0.0.1:8795'}
}
for name,service in new_addons.items():
    if name in addons and addons[name]!=service:raise RuntimeError('Existing canary binding differs; preserve it for inspection: '+name)
    addons.setdefault(name,service)
file.write_text(json.dumps(addons,indent=2)+'\n');os.chmod(file,0o600)
subprocess.run([sys.executable,str(ROOT/'scripts/setup-service-estate.py')],check=True)
