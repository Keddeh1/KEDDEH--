import assert from 'node:assert/strict';
import {test,before,after} from 'node:test';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import os from 'node:os';
import {randomUUID} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {TOOLS} from '../mcp/server.mjs';
const ROOT=path.resolve(import.meta.dirname,'..');
const configPath=process.env.MCP_SERVICE_CONFIG??'/workspace/deployments/keddeh-mcp-sdk/services.json';
const config=JSON.parse(fs.readFileSync(configPath,'utf8'));
const session=randomUUID();let client;
const circuit=JSON.parse(fs.readFileSync(path.join(ROOT,'runtime/circuits/bell.json'),'utf8'));
async function stdio(configFile=configPath){
  const result=new Client({name:'keddeh-sdk-qualification',version:'1.0.0'});
  await result.connect(new StdioClientTransport({command:process.execPath,args:[path.join(ROOT,'mcp/sdk-server.mjs'),'--config',configFile],stderr:'pipe'}));
  return result;
}
async function call(name,args={},connection=client){
  const result=await connection.callTool({name,arguments:args});assert.equal(result.isError,undefined,JSON.stringify(result.content));return result.structuredContent;
}
before(async()=>{client=await stdio();});
after(async()=>{await client?.close();});
test('official SDK negotiates and preserves all legacy tools and schemas',async()=>{
  const list=await client.listTools();
  for(const [name,tool] of Object.entries(TOOLS))assert.deepEqual(list.tools.find(t=>t.name===name).inputSchema,tool.schema);
  assert.equal(list.tools.length,Object.keys(TOOLS).length+7);
  assert.equal((await call('engineering_self_test')).status,'PASS');
});
test('legacy resources read through SDK',async()=>{
  const list=await client.listResources();assert.ok(list.resources.length);
  const value=await client.readResource({uri:list.resources[0].uri});assert.ok(value.contents[0].text);
});
test('SDK reports actual backing readiness',async()=>{
  const result=await call('services_status');assert.equal(result.registry.status,'ok');assert.equal(result.circuits.service,'circuits');assert.equal(result.vfs.ready,true);assert.equal(result.workstation.ok,true);
});
test('VFS byte readback and same continuation receipt',async()=>{
  const args={path:'/qualification/sdk/'+session,source:'qualification://mcp-sdk',content_b64:Buffer.from('SDK continuation').toString('base64'),continuation_id:session,expected_version:0};
  const first=await call('vfs_artifact_write',args);assert.deepEqual(await call('vfs_artifact_write',args),first);
  const read=await call('vfs_artifact_read',{digest:first.artifact.digest});assert.equal(read.content_b64,args.content_b64);
  const history=await call('vfs_binding_history',{path:args.path});assert.equal(history.history.length,1);assert.equal(history.history[0].artifact.source,args.source);
  const conflict=await client.callTool({name:'vfs_artifact_write',arguments:{...args,source:'qualification://changed'}});assert.equal(conflict.isError,true);assert.match(conflict.content[0].text,/409/);
});
test('signed runtime generation readback through pinned TLS',async()=>{
  const result=await call('runtime_generation_read',{path:'runtime/kex/core'});assert.equal(result.head.version,1);assert.ok(result.head.receipt);
});
test('TLS circuit execution preserves receipt on retry',async()=>{
  const args={job_id:'sdk-'+session,circuit};const first=await call('runtime_circuit_execute',args);
  assert.deepEqual(first.result.probabilities.map(x=>Math.round(Number(x)*2)/2),[.5,0,0,.5]);
  assert.deepEqual(await call('runtime_circuit_execute',args),first);
});
test('family tool uses existing matrix IL-LLM VFS transaction and restart readback',async()=>{
  const args={family_id:'sdk-'+session,goal:'Qualify SDK backing interfaces',shell:JSON.parse(fs.readFileSync(path.join(ROOT,'runtime/shells/tetrahedron.json'),'utf8'))};
  const first=await call('braink_family_execute',args);assert.equal(first.tensor_shell.closed_oriented_combinatorial_manifold,true);assert.equal(first.members.length,7);
  assert.deepEqual(await call('braink_family_execute',args),first);
});
test('invalid tool arguments produce protocol tool error',async()=>{
  const result=await client.callTool({name:'vfs_artifact_write',arguments:{path:'x'}});assert.equal(result.isError,true);
});
test('backend authentication and wrong certificate stay enforced',async()=>{
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'sdk-auth-'));let other;
  try{
    const wrong=path.join(temp,'wrong.token');fs.writeFileSync(wrong,'intentionally-invalid',{mode:0o600});
    const modified=structuredClone(config);modified.services.vfs.token_file=wrong;modified.services.registry.ca_file=config.services.circuits.ca_file;
    const file=path.join(temp,'config.json');fs.writeFileSync(file,JSON.stringify(modified));other=await stdio(file);
    const rejected=await other.callTool({name:'vfs_binding_history',arguments:{path:'qualification/sdk/'+session}});assert.equal(rejected.isError,true);assert.match(rejected.content[0].text,/401/);
    const cert=await other.callTool({name:'runtime_generation_read',arguments:{path:'runtime/kex/core'}});assert.equal(cert.isError,true);
  }finally{await other?.close();fs.rmSync(temp,{recursive:true,force:true});}
});
test('authenticated Streamable HTTP SDK negotiates and executes',async()=>{
  const other=new Client({name:'keddeh-http-qualification',version:'1.0.0'});
  try{
    await other.connect(new StreamableHTTPClientTransport(new URL('http://127.0.0.1:8961/mcp'),{requestInit:{headers:{Authorization:'Bearer '+fs.readFileSync(config.access_token_file,'utf8').trim()}}}));
    assert.equal((await call('services_status',{},other)).vfs.ready,true);
  }finally{await other.close();}
});
test('HTTP entrypoint rejects unauthenticated clients',async()=>{
  const response=await fetch('http://127.0.0.1:8961/health');assert.equal(response.status,401);
});
test('estate setup is repeatable and preserves running services',()=>{
  const result=spawnSync('python3',[path.join(ROOT,'scripts/setup-service-estate.py')],{encoding:'utf8',timeout:30000});assert.equal(result.status,0,result.stderr);
  const report=JSON.parse(result.stdout);assert.ok(Object.values(report.services).every(service=>service.status==='ALREADY_RUNNING'));
});

async function restartWorker(name){
  const root='/workspace/deployments/service-estate';const file=path.join(root,name+'.worker.pid');
  const before=Number(fs.readFileSync(file,'utf8'));process.kill(before,'SIGKILL');
  for(let i=0;i<100;i++){
    await new Promise(resolve=>setTimeout(resolve,100));
    const after=Number(fs.readFileSync(file,'utf8'));
    if(after!==before)return;
  }
  throw new Error('SUPERVISOR_DID_NOT_REPLACE_WORKER');
}
test('SDK worker crash preserves backing continuation receipts',async()=>{
  const args={path:'/qualification/sdk/restart/'+session,source:'qualification://mcp-sdk',content_b64:Buffer.from('SDK restart').toString('base64'),continuation_id:'restart-'+session,expected_version:0};
  const first=await call('vfs_artifact_write',args);
  await restartWorker('mcp-sdk');
  const other=new Client({name:'keddeh-recovery-qualification',version:'1.0.0'});
  try{
    let connected=false;
    for(let i=0;i<30;i++){
      try{await other.connect(new StreamableHTTPClientTransport(new URL('http://127.0.0.1:8961/mcp'),{requestInit:{headers:{Authorization:'Bearer '+fs.readFileSync(config.access_token_file,'utf8').trim()}}}));connected=true;break;}catch{await new Promise(resolve=>setTimeout(resolve,100));}
    }
    assert.equal(connected,true);
    assert.deepEqual(await call('vfs_artifact_write',args,other),first);
  }finally{await other.close();}
});
test('circuit worker crash returns the same signed job receipt through SDK',async()=>{
  const args={job_id:'sdk-failover-'+session,circuit};const first=await call('runtime_circuit_execute',args);
  await restartWorker('circuits');
  let recovered;
  for(let i=0;i<30;i++){
    const result=await client.callTool({name:'runtime_circuit_execute',arguments:args});
    if(!result.isError){recovered=result.structuredContent;break;}
    await new Promise(resolve=>setTimeout(resolve,100));
  }
  assert.deepEqual(recovered,first);
});

test('HTTP transport rejects a forged Host header',async()=>{
  const status=await new Promise((resolve,reject)=>{
    const req=http.request('http://127.0.0.1:8961/mcp',{method:'POST',headers:{Authorization:'Bearer '+fs.readFileSync(config.access_token_file,'utf8').trim(),Host:'untrusted.invalid',Accept:'application/json, text/event-stream','Content-Type':'application/json'}},res=>{res.resume();resolve(res.statusCode);});
    req.on('error',reject);req.end(JSON.stringify({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-11-25',capabilities:{},clientInfo:{name:'host-check',version:'1'}}}));
  });
  assert.equal(status,403);
});
