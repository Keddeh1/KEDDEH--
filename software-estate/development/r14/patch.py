from pathlib import Path
import re,json,hashlib
p=next(Path('software-estate/working/drive').glob('*R14*'))
s=p.read_text()
def change_script(id,fn):
 global s
 rx=re.compile(r'(<script id="'+re.escape(id)+r'"[^>]*>)(.*?)(</script>)',re.S)
 m=rx.search(s); assert m,id
 old=m[2];new=fn(old);assert new!=old
 s=s[:m.start(2)]+new+s[m.end(2):]
 Path('software-estate/development/r14/'+id+'.js').write_text(new)
def p19(b):
 # Precisely repair the malformed encoding in this one script only.
 assert b.count('\\n')==31 and b.count('\n')==0
 b=b.replace('\\n','\n').replace(r'^wss?:\\/\\/',r'^wss?:\/\/')
 b=b.replace("constructor(key='keddeh://braink/s30/p19'){this.key=key;this.backend='UNPROBED';this.db=null}","constructor(key='keddeh://braink/s30/p19'){this.key=key;this.backend='UNPROBED';this.db=null;this.ready=null}\n probe(){return this.ready||(this.ready=this._probe())}")
 b=b.replace('async probe(){','async _probe(){',1)
 b=b.replace("if(typeof localStorage!=='undefined'){try{", "try{if(typeof localStorage!=='undefined'){")
 b=b.replace("backend:this.backend})}catch(e){receipt('persistence.probe','DEGRADED',{backend:'LOCALSTORAGE',error:String(e)})}}", "backend:this.backend})}}catch(e){receipt('persistence.probe','DEGRADED',{backend:'LOCALSTORAGE',error:String(e)})}")
 b=b.replace('async put(name,value){const body=JSON.stringify(value);','async put(name,value){await this.probe();const body=JSON.stringify(value);if(body===undefined)throw Error(\'E_PERSISTENCE_VALUE\');')
 b=b.replace('async get(name){let body=null;','async get(name){await this.probe();let body=null;')
 b=b.replace('tx.onerror=()=>no(tx.error)',"tx.onabort=()=>no(tx.error||Error('E_PERSISTENCE_ABORT'));tx.onerror=()=>no(tx.error)")
 b=b.replace('q.onsuccess=()=>ok(q.result??null);q.onerror=()=>no(q.error)',"q.onsuccess=()=>ok(q.result??null);tx.onabort=()=>no(tx.error||Error('E_PERSISTENCE_ABORT'));q.onerror=()=>no(q.error)")
 b=b.replace("constructor(){this.worker=null;this.pending=new Map();this.next=1}","constructor(){this.worker=null;this.pending=new Map();this.next=1}\n failPending(error){for(const p of this.pending.values())p.reject(error);this.pending.clear()}")
 b=b.replace("this.worker=new Worker(url);URL.revokeObjectURL(url);this.worker.onmessage", "try{this.worker=new Worker(url)}catch(e){this.worker=null;return receipt('worker.start','BLOCKED',{reason:'WORKER_START_FAILED',error:String(e)})}finally{URL.revokeObjectURL(url)}this.worker.onerror=e=>{const error=Error(e.message||'E_WORKER_FAILURE');this.failPending(error);this.worker?.terminate();this.worker=null;receipt('worker.runtime','FAIL',{error:String(error)});e.preventDefault?.()};this.worker.onmessageerror=()=>{this.failPending(Error('E_WORKER_MESSAGE'));receipt('worker.message','FAIL')};this.worker.onmessage")
 b=b.replace('this.worker.postMessage({id,op,payload})',"try{this.worker.postMessage({id,op,payload})}catch(e){this.pending.delete(id);reject(e)}")
 b=b.replace("stop(){if(this.worker)this.worker.terminate();this.worker=null;return", "stop(){if(this.worker)this.worker.terminate();this.worker=null;this.failPending(Error('E_WORKER_STOPPED'));return")
 b=b.replace("async function boot(){", "let bootPromise=null;\nfunction boot(){return bootPromise||(bootPromise=bootOnce())}\nasync function bootOnce(){")
 b=b.replace("if(probes.worker.state==='PASS')worker.start();receipt('host-adapter.boot','PASS',", "if(probes.worker.state==='PASS')probes.worker=worker.start();receipt('host-adapter.boot',Object.values(probes).every(x=>x.state==='PASS')?'PASS':'DEGRADED',")
 return b
change_script('p19-host-adapter-runtime',p19)
def r14(b):
 b=b.replace("const VERSION='KEDDEH_BRAINK_RUNTIME_R14_CONVERGED';","const VERSION='KEDDEH_BRAINK_RUNTIME_R14_CONVERGED_LOCAL_FIX_1';")
 # Host get/put now await their idempotent probe, retaining existing fallback behavior.
 return b
change_script('keddeh-r14-converged-runtime',r14)
manifest={'schema':'keddeh.local-development.r14.v1','version':'R14_CONVERGED_LOCAL_FIX_1','parent_sha256':'b9295524288f1981b4b673c4f47a729cd0253733563ffb8e24a4e7433c9f32e9','scope':['p19 script encoding','persistence readiness','worker failure containment'],'verification':'REQUIRES_INDEPENDENT_VERIFICATION','external_effects':'NOT_TESTED'}
s=s.replace('</body></html>','<script id="keddeh-r14-local-fix-1-manifest" type="application/json">'+json.dumps(manifest)+'</script>\n</body></html>')
p.write_text(s)
print(p,hashlib.sha256(p.read_bytes()).hexdigest())
