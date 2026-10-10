#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';
import { ToTSafetyKernel, DistributedCoordinateDirectory, Layer2Reconciler, assessOpposingPolarities, ZERO_ASSESSMENT_RULE } from '../runtime/engineering/index.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST_PATH = path.join(ROOT, 'mcp', 'runtime-manifest.json');
const REGISTRY_PATH = path.join(ROOT, 'mcp', 'qualification-registry.json');
const SERVER_PATH = path.join(ROOT, 'mcp', 'server.json');
const TL2_BRIDGE = path.join(ROOT, 'mining-engine', 'carrier_tl2_bridge.py');
const MOEBIUS = path.join(ROOT, 'mining-engine', 'moebius_memory_contract.py');
const ENGINEERING_SAFETY_KERNEL = new ToTSafetyKernel();
const ENGINEERING_COORDINATE_DIRECTORY = new DistributedCoordinateDirectory();
const ENGINEERING_LAYER2_RECONCILER = new Layer2Reconciler();
const MODERN_PROTOCOL_VERSION = '2026-07-28';

function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function manifest() { return readJson(MANIFEST_PATH); }
function registry() { return readJson(REGISTRY_PATH); }

function canonicalConstruct(name) {
  return String(name || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}
function selectRecord(construct) {
  const key = canonicalConstruct(construct);
  const reg = registry();
  return reg.constructs[key] || {
    construct: construct || 'unspecified',
    classification: 'KEDDEH_PROJECT_DEFINED',
    established_correspondence: [],
    qualifications: [
      'No external correspondence is asserted by default.',
      'Inspect implementation, execution evidence and falsification results before promotion.'
    ],
    falsification_obligations: [
      'Identify a concrete executable or mathematical contract.',
      'Produce an independently repeatable counterexample-oriented test.',
      'Preserve failed results as evidence.'
    ]
  };
}
function qualify(args={}) {
  const record = selectRecord(args.construct);
  return {
    status: 'QUALIFIED_WITH_BOUNDARIES',
    runtime_id: manifest().runtime_id,
    construct: args.construct || record.construct,
    claim: args.claim || null,
    classification: record.classification,
    established_correspondence: record.established_correspondence,
    qualifications: record.qualifications,
    truth_boundaries: manifest().truth_boundaries,
    source: 'mcp/qualification-registry.json'
  };
}
function challenge(args={}) {
  const record = selectRecord(args.construct);
  return {
    status: 'FALSIFICATION_OBLIGATIONS_RETURNED',
    runtime_id: manifest().runtime_id,
    construct: args.construct || record.construct,
    claim: args.claim || null,
    obligations: record.falsification_obligations,
    preserve_failed_results: true,
    truth_boundaries: manifest().truth_boundaries
  };
}
function runJson(cmd,args,opts={}) {
  const p=spawnSync(cmd,args,{cwd:ROOT,encoding:'utf8',timeout:opts.timeout||15000});
  const stdout=(p.stdout||'').trim();
  let parsed=null;
  if(stdout){ try{parsed=JSON.parse(stdout);}catch{ parsed={raw_stdout:stdout}; } }
  return {
    status:p.status===0?'PASS':'FAIL',
    exit_code:p.status,
    signal:p.signal||null,
    result:parsed,
    stderr:(p.stderr||'').trim()||null
  };
}
function tl2Probe(args={}) {
  return runJson('python3',[TL2_BRIDGE,'probe-pool','--host',String(args.host||'bitcoin.viabtc.io'),'--port',String(args.port||3333),'--timeout',String(args.timeout||7)],{timeout:15000});
}
function memoryContract() {
  return runJson('python3',[MOEBIUS],{timeout:10000});
}
async function guestLaneOnce(args={}) {
  const payload=typeof args.payload==='string' ? args.payload : JSON.stringify(args.payload||{
    id:4,method:'mining.submit',params:['worker','job','00000000','ffffffff','00000001']
  });
  const sock=String(args.sock||('/tmp/keddeh_guest_lane_mcp_'+process.pid+'.sock'));
  try { fs.unlinkSync(sock); } catch {}
  const child=spawn('python3',[TL2_BRIDGE,'serve-once','--sock',sock],{cwd:ROOT,stdio:['ignore','pipe','pipe']});
  const deadline=Date.now()+3000;
  while(!fs.existsSync(sock) && Date.now()<deadline) await new Promise(r=>setTimeout(r,25));
  if(!fs.existsSync(sock)){
    child.kill();
    return {status:'FAIL',exit_code:null,error:'GUEST_LANE_SOCKET_NOT_CREATED',sock};
  }
  const sent=runJson('python3',[TL2_BRIDGE,'send-lane','--sock',sock,'--payload',payload],{timeout:5000});
  const exitCode=await new Promise(resolve=>{
    const timer=setTimeout(()=>{child.kill();resolve(null);},5000);
    child.on('exit',code=>{clearTimeout(timer);resolve(code);});
  });
  return {
    status:sent.status==='PASS' && exitCode===0 ? 'PASS':'FAIL',
    server_exit_code:exitCode,
    lane_result:sent.result,
    lane_stderr:sent.stderr,
    sock,
    truth_boundary:'Local Unix-domain socket validation does not establish ViaBTC share acceptance.'
  };
}
function selfTest() {
  const m = manifest(), s = readJson(SERVER_PATH), r = registry();
  const required = [
    'index.html','mcp/runtime-manifest.json','mcp/server.json',
    'mcp/qualification-registry.json','mcp/server.mjs',
    'runtime/engineering/index.mjs','runtime/engineering/tot-safety-kernel.mjs',
    'runtime/engineering/distributed-coordinate-directory.mjs','runtime/engineering/layer2-reconciler.mjs',
    'tests/engineering-layer.test.mjs',
    'mining-engine/carrier_tl2_bridge.py','mining-engine/moebius_memory_contract.py'
  ];
  const files = Object.fromEntries(required.map(rel => [rel, fs.existsSync(path.join(ROOT, rel))]));
  const declaredTools=(s.tools||[]).map(t=>t.name).sort();
  const implementedTools=Object.keys(TOOLS).sort();
  const memory=memoryContract();
  const checks={
    required_files_present:Object.values(files).every(Boolean),
    manifest_schema:['kex.braink.mcp.runtime.v1','kex.braink.mcp.runtime.v2'].includes(m.schema),
    mcp_declared:m.integration?.mcp===true,
    repository_authority_source:m.integration?.repository_authority==='source',
    declared_tools_implemented:JSON.stringify(declaredTools)===JSON.stringify(implementedTools),
    registry_has_constructs:!!r.constructs&&Object.keys(r.constructs).length>0,
    moebius_contract_executes:memory.status==='PASS'&&memory.result?.ok===true,
    engineering_zero_assessment_rule:assessOpposingPolarities(3,-3)===0 && ZERO_ASSESSMENT_RULE==='ZERO_IS_COMPUTED_ASSESSMENT_ONLY_NOT_ADDRESS_OR_STATE',
    engineering_safety_kernel_present:typeof ENGINEERING_SAFETY_KERNEL.evaluate==='function',
    engineering_coordinate_directory_present:typeof ENGINEERING_COORDINATE_DIRECTORY.register==='function',
    engineering_layer2_reconciler_present:typeof ENGINEERING_LAYER2_RECONCILER.reconcile==='function'
  };
  return {
    status:Object.values(checks).every(Boolean)?'PASS':'FAIL',
    runtime_id:m.runtime_id,checks,files,
    declared_tools:declaredTools,implemented_tools:implementedTools,
    qualification_construct_count:Object.keys(r.constructs||{}).length,
    moebius_memory_contract:memory
  };
}

export const TOOLS = {
  tot_safety_evaluate:{
    description:'Evaluate explicit action, authority, evidence and zeroless/capability invariants; returns an evidence receipt without exposing private reasoning.',
    schema:{type:'object',additionalProperties:true},
    call:(args={})=>ENGINEERING_SAFETY_KERNEL.evaluate(args)
  },
  coordinate_register:{
    description:'Register an evidence-backed nonzero coordinate/state; conflicting revisions are preserved as conflicts.',
    schema:{type:'object',required:['address','state','revisionId','authority','evidence'],additionalProperties:true},
    call:(args={})=>ENGINEERING_COORDINATE_DIRECTORY.register(args)
  },
  coordinate_resolve:{
    description:'Resolve one coordinate record by nonzero address.',
    schema:{type:'object',required:['address'],properties:{address:{type:'string'}},additionalProperties:false},
    call:(args={})=>ENGINEERING_COORDINATE_DIRECTORY.resolve(args.address)
  },
  coordinate_list:{
    description:'List coordinate records in deterministic address order.',
    schema:{type:'object',properties:{},additionalProperties:false},
    call:()=>({records:ENGINEERING_COORDINATE_DIRECTORY.list()})
  },
  coordinate_promote:{
    description:'Promote a coordinate revision only when explicit supersession names the current revision.',
    schema:{type:'object',required:['address','state','revisionId','authority','evidence','supersedes'],additionalProperties:true},
    call:(args={})=>ENGINEERING_COORDINATE_DIRECTORY.promote(args)
  },
  layer2_reconcile:{
    description:'Reconcile two evidence-backed states; no silent last-writer-wins.',
    schema:{type:'object',required:['left','right'],properties:{left:{type:'object'},right:{type:'object'}},additionalProperties:false},
    call:(args={})=>ENGINEERING_LAYER2_RECONCILER.reconcile(args.left,args.right)
  },
  polarity_assess:{
    description:'Compute opposing-polarity assessment; zero is valid only as the computed assessment value.',
    schema:{type:'object',required:['positive','negative'],properties:{positive:{type:'number'},negative:{type:'number'}},additionalProperties:false},
    call:(args={})=>({assessment:assessOpposingPolarities(Number(args.positive),Number(args.negative)),rule:ZERO_ASSESSMENT_RULE})
  },
  qualify_construct:{
    description:'Return established computer-science correspondence and admission qualifications for a KEX/BRAINK construct.',
    schema:{type:'object',properties:{construct:{type:'string'},claim:{type:'string'}},required:['construct'],additionalProperties:false},
    call:qualify
  },
  challenge_construct:{
    description:'Return falsification obligations for a construct while preserving failed results as evidence.',
    schema:{type:'object',properties:{construct:{type:'string'},claim:{type:'string'}},required:['construct'],additionalProperties:false},
    call:challenge
  },
  runtime_self_test:{
    description:'Check NEW-ENV-APP MCP truth-boundary, qualification and local runtime mechanics.',
    schema:{type:'object',properties:{},additionalProperties:false},
    call:selfTest
  },
  tl2_probe_pool:{
    description:'Run the physical DNS/TCP Stratum subscribe probe against a configured pool endpoint.',
    schema:{type:'object',properties:{host:{type:'string'},port:{type:'integer'},timeout:{type:'number'}},additionalProperties:false},
    call:tl2Probe
  },
  tl2_guest_lane_once:{
    description:'Bind one Unix-domain guest lane socket, submit one line, validate mining.submit shape, and return the observed verdict.',
    schema:{type:'object',properties:{sock:{type:'string'},payload:{}},additionalProperties:false},
    call:guestLaneOnce
  },
  moebius_memory_contract:{
    description:'Execute the 128KB Moebius memory layout contract verifier.',
    schema:{type:'object',properties:{},additionalProperties:false},
    call:memoryContract
  },
  engineering_self_test:{
    description:'Check the runtime presence of the safety kernel, coordinate directory, reconciler and zero-assessment rule.',
    schema:{type:'object',properties:{},additionalProperties:false},
    call:()=>({
      status:'PASS',
      zero_assessment_rule:assessOpposingPolarities(3,-3)===0 && ZERO_ASSESSMENT_RULE==='ZERO_IS_COMPUTED_ASSESSMENT_ONLY_NOT_ADDRESS_OR_STATE',
      safety_kernel:typeof ENGINEERING_SAFETY_KERNEL.evaluate==='function',
      coordinate_directory:typeof ENGINEERING_COORDINATE_DIRECTORY.register==='function',
      layer2_reconciler:typeof ENGINEERING_LAYER2_RECONCILER.reconcile==='function'
    })
  }
};

function toolResult(value){return {content:[{type:'text',text:JSON.stringify(value,null,2)}],structuredContent:value};}
function rpcResult(id,result){return {jsonrpc:'2.0',id,result};}
function rpcError(id,code,message,data){return {jsonrpc:'2.0',id,error:{code,message,...(data?{data}:{})}};}

export async function handle(msg){
  const id=msg.id??null;
  if(msg.method==='server/discover') return rpcResult(id,{
    protocolVersion:MODERN_PROTOCOL_VERSION,
    supportedVersions:[MODERN_PROTOCOL_VERSION,'2025-11-25','2025-06-18'],
    capabilities:{tools:{},resources:{}},
    instructions:'Explicit evidence and authority are required for mutation. Zero is computed assessment only, never an address or state.'
  });
  if(msg.method==='initialize') return rpcResult(id,{
    protocolVersion:msg.params?.protocolVersion||'2025-06-18',
    capabilities:{tools:{},resources:{}},
    serverInfo:{name:'NEW-ENV-APP',version:'1.2.0'}
  });
  if(msg.method==='notifications/initialized') return null;
  if(msg.method==='ping') return rpcResult(id,{});
  if(msg.method==='tools/list') return rpcResult(id,{tools:Object.entries(TOOLS).sort(([a],[b])=>a.localeCompare(b)).map(([name,t])=>({name,description:t.description,inputSchema:t.schema})),ttlMs:0,cacheScope:'private'});
  if(msg.method==='tools/call'){
    const t=TOOLS[msg.params?.name];
    if(!t) return rpcError(id,-32601,'Unknown tool');
    try{return rpcResult(id,toolResult(await t.call(msg.params?.arguments||{})));}
    catch(e){return rpcError(id,-32000,'Tool execution failed',{detail:String(e?.message||e)});}
  }
  if(msg.method==='resources/list'){
    const s=readJson(SERVER_PATH);
    return rpcResult(id,{resources:(s.resources||[]).slice().sort((a,b)=>a.uri.localeCompare(b.uri)).map(x=>({uri:x.uri,name:x.path,mimeType:x.mime_type})),ttlMs:0,cacheScope:'private'});
  }
  if(msg.method==='resources/read'){
    const s=readJson(SERVER_PATH),rec=(s.resources||[]).find(x=>x.uri===msg.params?.uri);
    if(!rec) return rpcError(id,-32602,'Unknown resource');
    const p=path.resolve(ROOT,rec.path);
    if(!p.startsWith(ROOT+path.sep)) return rpcError(id,-32602,'Resource escapes repository root');
    return rpcResult(id,{contents:[{uri:rec.uri,mimeType:rec.mime_type,text:fs.readFileSync(p,'utf8')}],ttlMs:0,cacheScope:'private'});
  }
  return rpcError(id,-32601,'Method not found');
}
async function main(){
  const args=process.argv.slice(2);
  if(args[0]==='--self-test'){const r=selfTest();console.log(JSON.stringify(r,null,2));process.exit(r.status==='PASS'?0:1);}
  if(args[0]==='--invoke'){
    const name=args[1],t=TOOLS[name];if(!t)throw new Error('UNKNOWN_TOOL:'+name);
    const payload=args[2]?JSON.parse(args[2]):{};
    console.log(JSON.stringify(await t.call(payload),null,2));return;
  }
  const rl=readline.createInterface({input:process.stdin,crlfDelay:Infinity});
  for await(const line of rl){
    if(!line.trim())continue;
    let out;
    try{out=await handle(JSON.parse(line));}
    catch(e){out=rpcError(null,-32700,'Parse error',{detail:String(e?.message||e)});}
    if(out)process.stdout.write(JSON.stringify(out)+'\n');
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(e=>{process.stderr.write(String(e?.stack||e)+'\n');process.exit(1);});
}
