import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {unboundCapability} from '../runtime/deployment_gate.mjs';
test('unbound domain and ingestion services refuse real HTTP requests without success claims',async()=>{
 const server=createServer((req,res)=>{const result=unboundCapability(req.url==='/domain'?'public-domain-registration':'remote-software-ingestion');res.writeHead(result.statusCode,{'Content-Type':'application/json'});res.end(JSON.stringify(result.body));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 try{for(const path of ['/domain','/ingest']){const response=await fetch('http://127.0.0.1:'+server.address().port+path,{method:'POST',body:'{}'});assert.equal(response.status,503);const body=await response.json();assert.equal(body.status,'BLOCKED');assert.equal(body.registered,false);assert.equal(body.connected,false);assert.equal(body.ok,false);}}
 finally{await new Promise(r=>server.close(r));}
});
