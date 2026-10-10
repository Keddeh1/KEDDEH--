"""Preserve existing state, configure SDK adapters, and start verified local services."""
import argparse
import fcntl
import http.client
import json
import os
from pathlib import Path
import secrets
import shutil
import ssl
import subprocess
import sys
import time
ROOT=Path(__file__).resolve().parents[1]


def health(service):
    secure=service['scheme']=='https'
    options={'context':ssl.create_default_context(cafile=service['ca_file'])} if secure else {}
    client=(http.client.HTTPSConnection if secure else http.client.HTTPConnection)('127.0.0.1',service['port'],timeout=3,**options)
    headers={}
    if service.get('token_file'):headers['Authorization']='Bearer '+Path(service['token_file']).read_text().strip()
    try:
        client.request('GET',service['health'],headers=headers)
        response=client.getresponse();result=json.loads(response.read())
        if response.status!=200 or not (result.get('status')=='ok' or result.get('ready') is True or result.get('ok') is True):raise RuntimeError('Service readiness rejected')
        if service.get('marker') and result.get('service')!=service['marker']:raise RuntimeError('Service identity mismatch')
        return result
    finally:client.close()


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--deployments',type=Path,default=Path('/workspace/deployments'))
    parser.add_argument('--configure-only',action='store_true')
    args=parser.parse_args();deployments=args.deployments.resolve()
    estate=deployments/'service-estate';estate.mkdir(mode=0o700,parents=True,exist_ok=True)
    lock=open(estate/'setup.lock','a');fcntl.flock(lock,fcntl.LOCK_EX)
    mcp=deployments/'keddeh-mcp-sdk';mcp.mkdir(mode=0o700,exist_ok=True)
    token=mcp/'access.token'
    if not token.exists():
        fd=os.open(token,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
        with os.fdopen(fd,'w') as stream:stream.write(secrets.token_urlsafe(32))
    node=shutil.which('node')
    if not node:raise RuntimeError('Node runtime unavailable')
    def entry(command,port,route='/health',state=None,scheme='http',marker=None):
        result={'command':list(map(str,command)),'cwd':str(ROOT),'port':port,'health':route,'scheme':scheme}
        if state:
            result['token_file']=str(state/'registry.token');result['ca_file']=str(state/'tls.crt')
        if marker:result['marker']=marker
        return result
    registry=deployments/'keddeh-network';circuits=deployments/'keddeh-circuit-service-20261010';vfs=deployments/'braink-contextual-history';family=deployments/'keddeh-tensor-shell-20261010'
    for required in [registry/'.venv/bin/python',circuits/'.venv/bin/python',vfs/'.venv/bin/python',family/'state/tensor-family.sqlite3',vfs/'access.token',ROOT/'node_modules/@modelcontextprotocol/sdk/package.json']:
        if not required.exists():raise RuntimeError('Required installed service component missing: '+str(required))
    sdk_services={
      'registry':{'url':'https://127.0.0.1:8443','health':'/health','token_file':str(registry/'state/registry.token'),'ca_file':str(registry/'state/tls.crt')},
      'circuits':{'url':'https://127.0.0.1:8444','health':'/health','token_file':str(circuits/'state/registry.token'),'ca_file':str(circuits/'state/tls.crt')},
      'vfs':{'url':'http://127.0.0.1:8791','health':'/ready','token_file':str(vfs/'access.token')},
      'workstation':{'url':'http://127.0.0.1:3000','health':'/api/kera_domain/health'}
    }
    sdk={'services':sdk_services,'access_token_file':str(token),'family':{'python':str(family/'.venv/bin/python'),'bridge':str(ROOT/'scripts/braink-family-request.py'),'state':str(family/'state/tensor-family.sqlite3')}}
    sdk_path=mcp/'services.json';sdk_path.write_text(json.dumps(sdk,indent=2)+'\n');os.chmod(sdk_path,0o600)
    services={
      'registry':entry([registry/'.venv/bin/python',registry/'runtime/network_registry.py','--deployment',registry/'state','--port','8443'],8443,state=registry/'state',scheme='https'),
      'circuits':entry([circuits/'.venv/bin/python',circuits/'runtime/circuit_service.py','--deployment',circuits/'state','--port','8444'],8444,state=circuits/'state',scheme='https',marker='circuits'),
      'vfs':entry([vfs/'.venv/bin/python','-m','vfs_server.server','--root',vfs/'state','--token-file',vfs/'access.token','--port','8791'],8791,route='/ready'),
      'workstation':entry([ROOT/'node_modules/.bin/tsx',ROOT/'server.ts'],3000,route='/api/kera_domain/health'),
      'mcp-sdk':entry([node,ROOT/'mcp/sdk-server.mjs','--config',sdk_path,'--http','--port','8961'],8961,marker='mcp-sdk')
    }
    services['vfs']['token_file']=str(vfs/'access.token');services['mcp-sdk']['token_file']=str(token)
    config=estate/'services.json';config.write_text(json.dumps(services,indent=2)+'\n');os.chmod(config,0o600)
    if args.configure_only:
        print(json.dumps({'configured':list(services),'sdk_config':str(sdk_path)}));return
    outcomes={}
    for name,service in services.items():
        try:
            result=health(service);outcomes[name]={'status':'ALREADY_RUNNING','health':result};continue
        except (OSError,ConnectionError):pass
        with open(estate/(name+'.log'),'ab') as log:
            os.chmod(estate/(name+'.log'),0o600)
            child=subprocess.Popen([sys.executable,str(ROOT/'scripts/service-estate-supervisor.py'),'--config',str(config),'--service',name],cwd=ROOT,stdout=log,stderr=log,start_new_session=True)
        (estate/(name+'.pid')).write_text(str(child.pid))
        for attempt in range(100):
            if child.poll() is not None:raise RuntimeError(name+' supervisor failed; inspect its private log')
            try:
                result=health(service);outcomes[name]={'status':'RUNNING','health':result};break
            except (OSError,ConnectionError):time.sleep(.1)
        else:
            child.terminate();raise RuntimeError(name+' readiness failed; inspect its private log')
    report={'services':outcomes,'sdk_config':str(sdk_path),'stdio_command':[node,str(ROOT/'mcp/sdk-server.mjs'),'--config',str(sdk_path)]}
    (estate/'readiness.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))


if __name__=='__main__':main()
