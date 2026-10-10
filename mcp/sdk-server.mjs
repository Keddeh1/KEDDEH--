#!/usr/bin/env node
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {timingSafeEqual} from 'node:crypto';
import Ajv from 'ajv';
import {Server} from '@modelcontextprotocol/sdk/server/index.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {StreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {CallToolRequestSchema,ListToolsRequestSchema,ListResourcesRequestSchema,ReadResourceRequestSchema} from '@modelcontextprotocol/sdk/types.js';
import {TOOLS,handle} from './server.mjs';
import {backingTools} from './service-adapters.mjs';
export function createSdkServer(config){
  const tools={...TOOLS,...backingTools(config)};
  const ajv=new Ajv({strict:false});const validators=Object.fromEntries(Object.entries(tools).map(([name,tool])=>[name,ajv.compile(tool.schema)]));
  const server=new Server({name:'NEW-ENV-APP',version:'1.3.0'},{capabilities:{tools:{},resources:{}}});
  server.setRequestHandler(ListToolsRequestSchema,async()=>({tools:Object.entries(tools).sort(([a],[b])=>a.localeCompare(b)).map(([name,tool])=>({name,description:tool.description,inputSchema:tool.schema}))}));
  server.setRequestHandler(CallToolRequestSchema,async request=>{
    const name=request.params.name,args=request.params.arguments??{};
    if(!tools[name]||!validators[name](args))return {isError:true,content:[{type:'text',text:'UNKNOWN_TOOL_OR_INVALID_ARGUMENTS'}]};
    try{const result=await tools[name].call(args);return {content:[{type:'text',text:JSON.stringify(result)}],structuredContent:result};}
    catch(error){return {isError:true,content:[{type:'text',text:error.message}]};}
  });
  server.setRequestHandler(ListResourcesRequestSchema,async()=>{const reply=await handle({id:1,method:'resources/list'});return {resources:reply.result.resources};});
  server.setRequestHandler(ReadResourceRequestSchema,async request=>{const reply=await handle({id:1,method:'resources/read',params:request.params});if(reply.error)throw new Error(reply.error.message);return {contents:reply.result.contents};});
  return server;
}
export async function startHttp(config,port){
  const expected=Buffer.from('Bearer '+fs.readFileSync(config.access_token_file,'utf8').trim());
  if(expected.length<16)throw new Error('MCP_ACCESS_TOKEN_REQUIRED');
  const app=http.createServer(async(req,res)=>{
    const boundPort=app.address().port;
    const allowedHosts=['127.0.0.1:'+boundPort,'localhost:'+boundPort];
    if(!allowedHosts.includes(req.headers.host) || (req.headers.origin && !(config.allowed_origins??[]).includes(req.headers.origin))){res.writeHead(403);res.end();return;}
    const actual=Buffer.from(req.headers.authorization??'');
    if(actual.length!==expected.length||!timingSafeEqual(actual,expected)){res.writeHead(401);res.end();return;}
    if(req.url==='/health'&&req.method==='GET'){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({status:'ok',service:'mcp-sdk'}));return;}
    if(req.url!=='/mcp'){res.writeHead(404);res.end();return;}
    const server=createSdkServer(config);
    const transport=new StreamableHTTPServerTransport({sessionIdGenerator:undefined,enableJsonResponse:true,enableDnsRebindingProtection:true,allowedHosts:['127.0.0.1:'+boundPort,'localhost:'+boundPort],allowedOrigins:[]});
    res.on('close',()=>{transport.close();server.close();});
    try{await server.connect(transport);await transport.handleRequest(req,res);}catch{if(!res.headersSent){res.writeHead(500);res.end();}else res.destroy();}
  });
  app.requestTimeout=35000;app.headersTimeout=10000;
  await new Promise(resolve=>app.listen(port,'127.0.0.1',resolve));return app;
}
async function main(){
  const args=process.argv.slice(2),index=args.indexOf('--config');
  if(index<0||!args[index+1])throw new Error('--config is required');
  const config=JSON.parse(fs.readFileSync(args[index+1],'utf8'));
  if(args.includes('--http')){const portIndex=args.indexOf('--port');const app=await startHttp(config,portIndex<0?8961:Number(args[portIndex+1]));const stop=()=>app.close(()=>process.exit(0));process.on('SIGTERM',stop);process.on('SIGINT',stop);}
  else await createSdkServer(config).connect(new StdioServerTransport());
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(error=>{process.stderr.write(error.message+'\n');process.exit(1);});
