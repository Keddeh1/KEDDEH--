"""Local contract probe; supplied BRAINK checkout only, fake backend, no outbound I/O.
Run python3 -S this_file.py /path/to/BRAINK. Not a native dispatcher receipt.
"""
import sys, tempfile, json, sqlite3
from pathlib import Path
sys.path.insert(0, sys.argv[1])
from mcp.braink_process_adapter.capability_catalog import GovernedCapabilityService
from mcp.braink_process_adapter.capability_runtime import AuthorizationError, IdempotencyConflict, CircuitOpen
class Backend:
    calls=0
    def current_lease(self, work_id): return {'state':'LEASED','holder':'local-test','epoch':1}
    def observe_domain_authority(self, domain):
        self.calls+=1
        return {'status':'FAILED' if domain=='fail.invalid' else 'OBSERVED','domain':domain}
checks=[]
def check(name, value):
    assert value, name
    checks.append(name)
def rejects(name, exc, fn):
    try: fn()
    except exc: checks.append(name)
    else: raise AssertionError(name)
with tempfile.TemporaryDirectory() as td:
    b=Backend(); svc=GovernedCapabilityService(b,Path(td)/'receipts.sqlite')
    ctx={'work_id':'local-contract','actor_id':'local-test','lease_epoch':1,'scopes':['domain:read']}
    call=lambda c,p,k:svc.invoke('domain.observe',c,{'domain':p},k)
    manifest=svc.manifest();check('unique capability identities',len({x['capability_id'] for x in manifest})==len(manifest))
    rejects('missing scope denied',AuthorizationError,lambda:call({**ctx,'scopes':[]},'example.invalid','deny'))
    rejects('wrong holder denied',AuthorizationError,lambda:call({**ctx,'actor_id':'other'},'example.invalid','deny'))
    rejects('stale epoch denied',AuthorizationError,lambda:call({**ctx,'lease_epoch':0},'example.invalid','deny'))
    first=call(ctx,'example.invalid','once');again=call(ctx,'example.invalid','once')
    check('replay does not invoke backend twice', b.calls==1 and again['invocation_id']==first['invocation_id'])
    rejects('idempotency conflict denied',IdempotencyConflict,lambda:call(ctx,'different.invalid','once'))
    for i in range(3):
        result=call(ctx,'fail.invalid','failure-'+str(i));check('semantic failure '+str(i),result['status']=='FAILED')
    rejects('circuit denies fourth failure',CircuitOpen,lambda:call(ctx,'fail.invalid','failure-4'))
    with sqlite3.connect(Path(td)/'receipts.sqlite') as db:
        rows=db.execute('SELECT state,count(*) FROM invocations GROUP BY state').fetchall()
    check('independent SQLite lifecycle readback',dict(rows)=={'FAILED':3,'SUCCEEDED':1})
print(json.dumps({'scope':'isolated local contract; fake backend; not native offload','capabilityCount':len(manifest),'checks':checks,'passed':len(checks)},indent=2))
