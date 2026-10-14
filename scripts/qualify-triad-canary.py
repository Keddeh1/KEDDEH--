"""Persist measured, revision-specific gRPC qualification only after required tests pass."""
import datetime
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
ROOT=Path(__file__).resolve().parents[1]
root=Path('/workspace/deployments/serverspace/runtime/triad-v1');config=json.loads((root/'config.json').read_text());python=ROOT/'.triad-env/bin/python'
checks={}
started=datetime.datetime.now(datetime.timezone.utc).isoformat()
latest=root/'qualification.json'
if latest.exists():
    previous=latest.read_bytes()
    (root/('qualification-history-'+hashlib.sha256(previous).hexdigest()+'.json')).write_bytes(previous)
latest.write_text(json.dumps({'status':'RUNNING','started_at_utc':started,'source_revision':config['revision']})+'\n')
for name,file in [('contract','triad-contract.test.py'),('live','triad-live.test.py'),('supervisor','service-supervisor.test.py')]:
    result=subprocess.run([str(python),str(ROOT/'tests'/file)],capture_output=True,text=True)
    (root/(name+'-tests.log')).write_text(result.stdout+result.stderr)
    if result.returncode!=0:
        latest.write_text(json.dumps({'status':'FAILED','started_at_utc':started,'source_revision':config['revision'],'failed_check':name,'completed_checks':checks})+'\n')
        raise RuntimeError('Qualification failed: '+name+'; inspect '+str(root/(name+'-tests.log')))
    import re
    count=re.search(r'Ran (\d+) tests? in',result.stderr)
    if not count:raise RuntimeError('No verified test count: '+name)
    checks[name]={'passed':int(count[1]),'failed':0}
spec=importlib.util.spec_from_file_location('triad_client',ROOT/'scripts/triad-client.py');client=importlib.util.module_from_spec(spec);spec.loader.exec_module(client)
import triad_mesh_pb2 as pb
import triad_mesh_pb2_grpc as rpc
with client.channel(root,config['port']) as channel:
    stub=rpc.TriadMeshOrchestratorStub(channel)
    ready=stub.Readiness(pb.TriadReadinessRequest(),timeout=10,wait_for_ready=True)
    request=client.signed(root,'qualification-release-'+config['revision'][:16],'Qualify the installed typed Triad canary',config['revision'],1e12)
    response=stub.TraversalMatrixHop(request,timeout=45)
    stream=stub.StreamMatrixTelemetry(request,timeout=5)
    try:sample=next(stream)
    finally:stream.cancel()
    from google.protobuf.json_format import MessageToDict
    measured=MessageToDict(sample.measured_metrics,preserving_proto_field_name=True)
pid=int(Path('/workspace/deployments/service-estate/triad-grpc-canary.worker.pid').read_text())
limits=Path(f'/proc/{pid}/limits').read_text()
assert ready.readiness_mask==7 and ready.ledger_integrity
assert response.integration.sdk_commit_verified and response.vfs_receipt_digest
report={'observed_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'isolated mTLS gRPC canary with existing official MCP, resident BRAINK, signed substrate and contextual VFS','deployed_revision':ready.source_git_revision,'source_revision':config['revision'],'checks':checks,'readiness_mask':ready.readiness_mask,'ledger_integrity':ready.ledger_integrity,'canonical_response_sha256':hashlib.sha256(response.SerializeToString(deterministic=True)).hexdigest(),'vfs_artifact_digest':response.vfs_artifact_digest,'vfs_receipt_digest':response.vfs_receipt_digest,'mcp_protocol_version':response.integration.mcp_transport_version,'measured_metrics':measured,'calibration_admission_effect':'ADVISORY_ONLY','declared_test_load_factor':request.current_load_factor,'da_registrar':{'verified':False,'status':'UNCONFIGURED_ISOLATED','affects_braink_admission':False},'multi_region_apply':False,'node_identity':ready.node_identity,'worker_pid':pid,'worker_limits':limits}
report['status']='PASSED'
latest.write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k!='worker_limits'}))
