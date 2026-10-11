import sys,json,tempfile,os,time,threading,resource,subprocess,hashlib
from pathlib import Path
BASE=Path(__file__).resolve().parents[2];sys.path.insert(0,str(BASE))
from runtime import Runtime,ROLES
results=[]
def fixture(root,key):
 r=Runtime(root);t=r.instantiate(key,BASE/'templates',set().union(*ROLES.values())); ids={m['role']:m['member_id'] for m in t['members']};return r,t['team_instance_id'],ids
def record(name,observed,**details):results.append(dict(name=name,vulnerability_reproduced=observed,**details))
with tempfile.TemporaryDirectory() as d:
 r,t,m=fixture(d,'forge');j=r.enqueue(t,m['manager'],m['production'],'forge','expected');c=r.claim(t,m['production']);p=r.produce(c,b'WRONG')
 try:
  r.accept_verification(t,m['verification'],j['id'],{'digest':p['digest'],'pid':os.getpid()+100000,'content_matches':True,'native_observer_receipt':'invented'})
  record('forged observer promotes incorrect artifact',r.job(j['id'])['state']=='VERIFIED',state=r.job(j['id'])['state'])
 except Exception as e:record('forged observer promotes incorrect artifact',False,error=str(e))
with tempfile.TemporaryDirectory() as d,tempfile.TemporaryDirectory() as outside:
 r,t,m=fixture(d,'symlink');s=r.member_store(t,m['production']);(s.root/'objects').rename(s.root/'objects.saved');(s.root/'objects').symlink_to(outside,target_is_directory=True)
 j=r.enqueue(t,m['manager'],m['production'],'outside','x');c=r.claim(t,m['production'])
 try:
  r.produce(c,b'EXTERNAL WRITE');files=list(Path(outside).rglob('*'));record('nested objects symlink writes outside scope',any(p.is_file() for p in files),files=[str(p.relative_to(outside)) for p in files if p.is_file()])
 except Exception as e:record('nested objects symlink writes outside scope',False,error=str(e))
with tempfile.TemporaryDirectory() as d,tempfile.TemporaryDirectory() as outside:
 r,t,m=fixture(d,'db-symlink');s=r.member_store(t,m['production']);p=s.root/'vfs.sqlite3';dest=Path(outside)/'external.sqlite';p.rename(dest);p.symlink_to(dest)
 try:
  r.member_store(t,m['production']);record('nested database symlink followed',True)
 except Exception as e:record('nested database symlink followed',False,error=str(e))
with tempfile.TemporaryDirectory() as d:
 r,t,m=fixture(d,'lease');r.enqueue(t,m['manager'],m['production'],'wait','x');ready=threading.Event()
 def lock():
  with r.transaction():ready.set();time.sleep(.3)
 th=threading.Thread(target=lock);th.start();ready.wait();c=r.claim(t,m['production'],.1);th.join();record('lease expires before claim returns under lock contention',c['expires']<=time.time(),remaining_seconds=c['expires']-time.time())
print(json.dumps({'source_sha256':hashlib.sha256((BASE/'runtime.py').read_bytes()).hexdigest(),'findings':results,'reviewer_peak_rss_bytes':resource.getrusage(resource.RUSAGE_SELF).ru_maxrss*1024,'scope':'trusted API probes; no hostile-code confinement claim'},indent=2))
