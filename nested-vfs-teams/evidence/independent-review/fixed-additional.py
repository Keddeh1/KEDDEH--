import json,os,sys,tempfile,hashlib
from pathlib import Path
BASE=Path(__file__).resolve().parents[2];sys.path.insert(0,str(BASE))
from runtime import Runtime,ROLES,Denied,Fenced
from storage import StorageDenied
checks=[]
def fixture(d,key):
 r=Runtime(d);t=r.instantiate(key,BASE/'templates',set().union(*ROLES.values()));return r,t['team_instance_id'],{m['role']:m['member_id'] for m in t['members']}
def denies(name,fn):
 try:fn()
 except (Denied,StorageDenied,Fenced):checks.append(name)
 else:raise AssertionError(name)
with tempfile.TemporaryDirectory() as d:
 r,t,m=fixture(d,'wrong');j=r.enqueue(t,m['manager'],m['production'],'x','EXPECTED');r.produce(r.claim(t,m['production']),b'WRONG')
 denies('coordinator-spawned observer rejects wrong expected bytes',lambda:r.verify_job(t,m['verification'],j['id']));assert r.job(j['id'])['state']=='PRODUCED';checks.append('wrong artifact remains PRODUCED')
 denies('production role cannot verify',lambda:r.verify_job(t,m['production'],j['id']))
with tempfile.TemporaryDirectory() as d,tempfile.TemporaryDirectory() as outside:
 r,t,m=fixture(d,'fanout');s=r.member_store(t,m['production']);b=b'fanout unique';h=hashlib.sha256(b).hexdigest();(s.objects/h[:2]).symlink_to(outside,target_is_directory=True)
 r.enqueue(t,m['manager'],m['production'],'x','x');c=r.claim(t,m['production']);denies('object fanout symlink denied',lambda:r.produce(c,b));assert not list(Path(outside).rglob('*'));checks.append('fanout target stays empty')
for suffix in ['','-wal','-shm','-journal']:
 with tempfile.TemporaryDirectory() as d,tempfile.TemporaryDirectory() as outside:
  r=Runtime(d);p=Path(str(r.db_path)+suffix)
  if p.exists():p.unlink()
  p.symlink_to(Path(outside)/'db')
  denies('queue backing symlink denied '+suffix,lambda: r.team('unknown'))
p=json.loads((BASE/'evidence/independent-review/fixed/canary.json').read_text());runs=p['process_runs'];rss=[x['measurement']['child_peak_rss_bytes'] for x in runs];assert all(x>0 for x in rss)
checks.append('every executed child has measured nonzero OS peak RSS')
print(json.dumps({'checks_passed':len(checks),'checks':checks,'measured_children':len(rss),'min_child_peak_rss_bytes':min(rss),'max_child_peak_rss_bytes':max(rss),'source_sha256':{f:hashlib.sha256((BASE/f).read_bytes()).hexdigest() for f in ['runtime.py','storage.py','observer.py','process_runner.py']},'scope':'static trusted-API containment; not hostile-code OS confinement'},indent=2))
