"""Observed canary qualification; no remote-host or universal delivery claims."""
import base64
import hashlib
import http.client
import json
import os
from pathlib import Path
import signal
import sys
import time
import zlib
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'runtime'))
from serverspace_substrate import CanonicalState,call,canonical,digest
root=Path('/workspace/deployments/serverspace/runtime/canary-v1');store=CanonicalState(root)
datasets={}
for name in ['runtime/serverspace-baseline.json','runtime/tensor_shell.py']:
    raw=(ROOT/name).read_bytes();datasets[name]={'content_b64':base64.b64encode(raw).decode(),'sha256':hashlib.sha256(raw).hexdigest(),'crc32':format(zlib.crc32(raw)&0xffffffff,'08x')}
changes={'datasets':datasets,'domains':{'a':{'identity':'domain://canary/a','origin':'origin://canary/a','unity':1},'b':{'identity':'domain://canary/b','origin':'origin://canary/b','unity':1},'unassigned':{'identity':'domain://canary/unassigned','origin':'origin://canary/unassigned','unity':None}}}
receipt=call(root,'commit',{'request_id':'baseline-canary-reference-v1','expected_version':1,'changes':changes})
record=store.read_shared();health=call(root);assert health['readiness_mask']==7 and health['datasets_verified']==2
for sequence in range(64):
    frame={'sequence':sequence,'payload':'verified-local-frame'}
    response=call(root,'echo',{'sequence':sequence,'payload':frame})
    assert response=={'sequence':sequence,'sha256':digest(frame),'crc32':format(zlib.crc32(canonical(frame))&0xffffffff,'08x')}
def http_get(path,port=8795):
    client=http.client.HTTPConnection('127.0.0.1',port,timeout=3)
    try:
        client.request('GET',path);response=client.getresponse();return response.status,response.read()
    finally:client.close()
for sequence in range(64):
    status,raw=http_get('/health');frame=json.loads(raw);assert status==200 and frame['sha256']==record['sha256'] and frame['crc32']==record['crc32'] and frame['readiness_mask']==7
old=int((root/'worker.pid').read_text());os.kill(old,signal.SIGKILL)
for _ in range(100):
    time.sleep(.1)
    try:
        new=int((root/'worker.pid').read_text())
        if new!=old and call(root)['readiness_mask']==7:break
    except Exception:pass
else:raise RuntimeError('Canary worker recovery failed')
assert store.read_shared()==record
projection=call(root,'project',{'view_identity':'view://canary/qualification','domain_names':['a','b']})
assert len(projection['domains'])==2 and projection['domains']['a']['identity']!=projection['domains']['b']['identity']
assert projection['parent_identity']==record['body']['payload']['identity']
assert call(root,'commit',{'request_id':'baseline-canary-reference-v1','expected_version':1,'changes':changes})==receipt
pid=int((root/'worker.pid').read_text());os.kill(pid,signal.SIGSTOP)
try:assert http_get('/health')[0]==503
finally:os.kill(pid,signal.SIGCONT)
for _ in range(30):
    try:
        if http_get('/health')[0]==200:break
    except OSError:pass
    time.sleep(.1)
else:raise RuntimeError('Canary gate did not recover')
status,_=http_get('/api/mining/viabtc/config');assert status==200
limits=(Path('/proc')/str(pid)/'limits').read_text();assert '268435456' in limits and '128' in limits
report={'scope':'isolated local ServerSpace canary','readiness':call(root),'cached_datasets_verified':2,'uds_frames_sent':64,'uds_frames_verified':64,'loopback_tcp_responses_verified':64,'observed_missing_frames':0,'worker_crash_recovery':True,'canonical_and_shared_state_retained':True,'retry_receipt_equal':True,'substrate_unavailable_api_status':503,'upstream_mining_config_status':status,'worker_address_space_limit_bytes':268435456,'worker_open_file_limit':128,'projection_parent_identity_retained':True,'independent_domain_count':len(record['body']['payload']['domains']),'unassigned_unity_retained':record['body']['payload']['domains']['unassigned']['unity'] is None,'state_path':str(root/'canonical.json'),'uds_path':str(root/'ready.sock'),'verified_remote_serverspace_baseline':False,'external_canary_publication':False}
# Verify the actual parent and HTTP worker limits, not just the substrate child.
import re
report['canary_process_limits']={}
estate=Path('/workspace/deployments/service-estate')
for name in ['serverspace-canary-watchdog','serverspace-canary-mining-api']:
    worker=int((estate/(name+'.worker.pid')).read_text())
    actual=Path(f'/proc/{worker}/limits').read_text()
    assert re.search(r'Max address space\s+268435456\s+268435456',actual)
    assert re.search(r'Max open files\s+128\s+128',actual)
    report['canary_process_limits'][name]={'pid':worker,'address_space_bytes':268435456,'open_files':128}
(root/'qualification.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
