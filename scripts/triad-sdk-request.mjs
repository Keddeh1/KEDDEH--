// Typed Triad requests use the existing official MCP service and its backing contracts.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
const config=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
let input='';for await(const chunk of process.stdin){input+=chunk;if(Buffer.byteLength(input)>16384)throw new Error('REQUEST_TOO_LARGE');}
const request=JSON.parse(input);
function canonical(value){
  if(Array.isArray(value))return value.map(canonical);
  if(value!==null&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])]));
  return value;
}
class ObservedTransport extends StreamableHTTPClientTransport {
  setProtocolVersion(version){this.negotiatedVersion=version;super.setProtocolVersion(version);}
}
const transport=new ObservedTransport(new URL('http://127.0.0.1:8961/mcp'),{requestInit:{headers:{Authorization:'Bearer '+fs.readFileSync(config.access_token_file,'utf8').trim()}}});
const client=new Client({name:'keddeh-triad-bridge',version:'1.0.0'});
const timer=setTimeout(()=>process.exit(2),45000);
async function call(name,args={}){
  const result=await client.callTool({name,arguments:args});
  if(result.isError||!result.structuredContent)throw new Error('BACKING_TOOL_REJECTED:'+name);
  return result.structuredContent;
}
try{
  await client.connect(transport);
  const status=await call('services_status');
  if(status.registry.status!=='ok'||status.vfs.ready!==true||status.workstation.ok!==true||status['serverspace-canary-mining-api']?.readiness_mask!==7)throw new Error('BACKING_READINESS_REJECTED');
  if(request.operation==='health'){
    console.log(JSON.stringify({status:'ok',readiness_mask:7,protocol_version:transport.negotiatedVersion}));
  }else if(request.operation==='commit'){
    const family=await call('braink_family_execute',{family_id:request.family_id,goal:request.goal});
    const retry=await call('braink_family_execute',{family_id:request.family_id,goal:request.goal});
    if(JSON.stringify(canonical(family))!==JSON.stringify(canonical(retry))||!family.receipt_digests?.length)throw new Error('FAMILY_RETRY_READBACK_MISMATCH');
    const bytes=Buffer.from(JSON.stringify(canonical(family)));const digest=createHash('sha256').update(bytes).digest('hex');
    const path='/triad/requests/'+request.family_id;
    const args={path,source:'git://Keddeh1/KEDDEH--/'+request.revision,content_b64:bytes.toString('base64'),continuation_id:request.family_id,expected_version:0};
    const write=await call('vfs_artifact_write',args);
    const read=await call('vfs_artifact_read',{digest:write.artifact.digest});
    if(write.artifact.digest!==digest||read.content_b64!==args.content_b64)throw new Error('VFS_DIGEST_READBACK_MISMATCH');
    const history=await call('vfs_binding_history',{path});
    if(history.history.length!==1||history.history[0].artifact.source!==args.source)throw new Error('VFS_BINDING_HISTORY_MISMATCH');
    console.log(JSON.stringify({family,artifact:write.artifact,receipt:write.actor_receipt,protocol_version:transport.negotiatedVersion,readiness_mask:7}));
  }else throw new Error('UNKNOWN_OPERATION');
}finally{clearTimeout(timer);await client.close();}
