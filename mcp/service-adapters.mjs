import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import {spawn} from 'node:child_process';
const LIMIT=90*1024*1024;
export function requestService(service,method,route,body){
  const target=new URL(route,service.url);
  if(target.origin!==new URL(service.url).origin)throw new Error('SERVICE_ORIGIN_MISMATCH');
  const data=body===undefined?undefined:JSON.stringify(body);
  if(data && Buffer.byteLength(data)>LIMIT)throw new Error('REQUEST_TOO_LARGE');
  const headers={'Content-Type':'application/json'};
  if(service.token_file)headers.Authorization='Bearer '+fs.readFileSync(service.token_file,'utf8').trim();
  if(data)headers['Content-Length']=Buffer.byteLength(data);
  return new Promise((resolve,reject)=>{
    const req=(target.protocol==='https:'?https:http).request(target,{method,headers,timeout:30000,...(target.protocol==='https:'?{ca:fs.readFileSync(service.ca_file),rejectUnauthorized:true}:{})},res=>{
      let bytes=0;const chunks=[];
      res.on('data',chunk=>{bytes+=chunk.length;if(bytes>LIMIT){res.destroy(new Error('RESPONSE_TOO_LARGE'));return;}chunks.push(chunk);});
      res.on('error',reject);
      res.on('end',()=>{
        try{const result=JSON.parse(Buffer.concat(chunks).toString());if(res.statusCode<200||res.statusCode>=300){const error=new Error('BACKEND_HTTP_'+res.statusCode);error.status=res.statusCode;reject(error);}else resolve(result);}catch(error){reject(error);}
      });
    });
    req.on('timeout',()=>req.destroy(new Error('BACKEND_TIMEOUT')));req.on('error',reject);req.end(data);
  });
}
export function runFamily(binding,request){
  return new Promise((resolve,reject)=>{
    const child=spawn(binding.python,[binding.bridge,'--state',binding.state],{stdio:['pipe','pipe','pipe']});
    let output='',errors='',bytes=0,done=false;
    const timer=setTimeout(()=>{child.kill('SIGKILL');reject(new Error('FAMILY_TIMEOUT_RECONCILE_ID'));},30000);
    child.on('error',error=>{clearTimeout(timer);reject(error);});
    child.stdout.on('data',chunk=>{bytes+=chunk.length;if(bytes>LIMIT){child.kill('SIGKILL');return;}output+=chunk;});
    child.stderr.on('data',chunk=>{if(errors.length<10000)errors+=chunk;});
    child.stdin.on('error',()=>{});
    child.on('close',code=>{clearTimeout(timer);if(done)return;done=true;if(code!==0){reject(new Error('FAMILY_EXECUTION_FAILED_RECONCILE_ID'));return;}try{resolve(JSON.parse(output));}catch(error){reject(error);}});
    child.stdin.end(JSON.stringify(request));
  });
}
const object=(properties={},required=[])=>({type:'object',properties,required,additionalProperties:false});
export function backingTools(config){
  const services=config.services;
  return {
    services_status:{description:'Read actual readiness from configured resident backing services.',schema:object(),call:async()=>Object.fromEntries(await Promise.all(Object.entries(services).map(async([name,service])=>[name,await requestService(service,'GET',service.health)])))},
    vfs_artifact_write:{description:'Commit bytes and contextual binding using the existing VFS continuation/version contract.',schema:object({path:{type:'string'},source:{type:'string'},content_b64:{type:'string'},predecessor:{type:['string','null']},media_type:{type:'string'},continuation_id:{type:['string','null'],minLength:1,maxLength:128},expected_version:{type:['integer','null'],minimum:0}},['path','source','content_b64']),call:args=>requestService(services.vfs,'POST','/artifacts',args)},
    vfs_binding_history:{description:'Read receipt-linked contextual versions from the existing VFS.',schema:object({path:{type:'string'}},['path']),call:args=>requestService(services.vfs,'GET','/bindings/'+args.path.replace(/^\/+/, '').split('/').map(encodeURIComponent).join('/'))},
    vfs_artifact_read:{description:'Read immutable bytes and digest metadata from the existing VFS.',schema:object({digest:{type:'string',pattern:'^[0-9a-f]{64}$'}},['digest']),call:args=>requestService(services.vfs,'GET','/artifacts/'+args.digest)},
    runtime_generation_read:{description:'Read signed generations from the resident TLS registry.',schema:object({path:{type:'string'}},['path']),call:args=>requestService(services.registry,'GET','/generations?path='+encodeURIComponent(args.path))},
    runtime_circuit_execute:{description:'Execute a bounded classical circuit through the existing signed TLS service.',schema:object({job_id:{type:'string'},circuit:{type:'object'}},['job_id','circuit']),call:args=>requestService(services.circuits,'POST','/circuits',args)},
    braink_family_execute:{description:'Execute or resume the resident BRAINK family transaction, including optional circuits and tensor shells.',schema:object({family_id:{type:'string',minLength:1},goal:{type:'string',minLength:1},learning_preferences:{type:'object'},circuit:{type:'object'},shell:{type:'object'}},['family_id','goal']),call:args=>runFamily(config.family,args)}
  };
}
