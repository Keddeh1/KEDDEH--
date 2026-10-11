import copy,hashlib,json,sys
from pathlib import Path
BASE=Path(__file__).resolve().parents[2];sys.path.insert(0,str(BASE))
from ingestion_adapter import map_team
checks=[]
instance=next(x for x in json.loads((BASE/'evidence/independent-review/fixed/team-interface.json').read_text()) if x['instance_key']=='beta')
p=map_team(instance,'project-canary','vfs://project-canary','dot.local-beta')
assert p['composition']['teamInstanceId']==instance['team_instance_id'];checks.append('team UUID preserved')
assert p['composition']['teamTemplateId']==instance['team_template_id'];checks.append('team template identity preserved')
byid={m['workerInstanceId']:m for m in p['composition']['members']}
for member in instance['members']:
 mapped=byid[member['member_id']]
 assert mapped['vfsRoot']==member['vfs_root'] and mapped['workerTemplateId']==member['worker_template_id']
checks.append('all five member UUID/template/VFS references preserved')
for kind in ['scope','permission','manager']:
 bad=copy.deepcopy(instance)
 if kind=='scope':bad['members'][0]['vfs_root']+='/../../other'
 if kind=='permission':bad['members'][0]['permissions'].append('credentials:grant')
 try:map_team(bad,'project-canary','vfs://project-canary','unqualified' if kind=='manager' else 'dot.local-beta')
 except ValueError:checks.append(kind+' adaptation rejected')
 else:raise AssertionError(kind)
report=json.loads((BASE/'evidence/independent-review/ingestion-roundtrip.json').read_text());r=report['registry_readback']
assert r['state']=='assigned' and r['teamComposition']['locallyVerified'] is False and r['workerRunning'] is False and r['executionId'] is None
assert r['actorProcessRefs']==[] and r['receiverReadbackRefs']==[] and r['transportRefs']==[]
checks.append('registry reference assignment has no runtime or verification promotion')
assert report['native_dispatch_executed'] is False and report['credentials_created'] is False
checks.append('no native dispatch or credentials claimed')
print(json.dumps({'checks_passed':len(checks),'checks':checks,'reviewed_source_sha256':{f:hashlib.sha256((BASE/f).read_bytes()).hexdigest() for f in ['ingestion_adapter.py','integration_roundtrip.py']},'scope':'Independent adapter/output checks plus actor integration rerun against exact unchanged imported source; not live admission'},indent=2))
