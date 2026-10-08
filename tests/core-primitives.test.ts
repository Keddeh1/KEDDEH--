import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TelemetryPrimitive } from '../src/core/telemetry/telemetry.ts';
import { InputPrimitive } from '../src/core/input/input.ts';
import { ProcessPrimitive } from '../src/core/process/process.ts';
import { brandPid } from '../src/core/types.ts';
test('telemetry remains unknown until a measured sample is supplied', () => {
 const t = new TelemetryPrimitive(); assert.equal(t.getStatus(), 'UNKNOWN');
 const view=t.getMetrics();assert.ok(Number.isNaN(view[0]));
 t.update({cpu:.5,memory:.25});assert.equal(t.getStatus(),'CURRENT');assert.equal(t.getMetrics(),view);
 assert.deepEqual(Array.from(view),[.5,.25]);assert.throws(()=>t.update({cpu:NaN,memory:0}),/INVALID_TELEMETRY_SAMPLE/);
});
test('input supports multiple handlers and explicit detachment', () => {
 const input=new InputPrimitive();const calls:string[]=[];
 const off=input.on('key',()=>calls.push('a'));input.on('key',()=>calls.push('b'));
 input.handleEvent({type:'key'});off();input.handleEvent({type:'key'});
 assert.deepEqual(calls,['a','b','b']);assert.throws(()=>input.handleEvent(null as any),/INVALID_INPUT_EVENT/);
});
test('process IDs retain one-origin identity and reject duplicate active processes', () => {
 const p=new ProcessPrimitive();assert.throws(()=>brandPid(0),/INVALID_PROCESS_ID/);
 p.spawn(1);assert.throws(()=>p.spawn(1),/PROCESS_ALREADY_RUNNING/);
 let terminated=0;p.on('terminated',()=>terminated++);p.terminate(1,'SIGTERM');p.terminate(1,'SIGTERM');
 assert.equal(terminated,1);assert.equal(p.getProcessStatus(1),'terminated');p.spawn(1);assert.equal(p.getProcessStatus(1),'running');
});

test('sourced KEX component preserves its address and relation contracts', async () => {
 const { makeKexAddress, hexTimesHex } = await import('../src/core/kex/kex.ts');
 assert.equal(makeKexAddress('folder','GCurve3D'),'kex://folder/gcurve3d');
 const relation=hexTimesHex({hexId:'HEX-01',name:'A',role:'r',payloadHash:'aaaaaaaabbbb'},{hexId:'HEX-02',name:'B',role:'r',payloadHash:'ccccccdddddd'},'depends_on');
 assert.equal(relation.kexId,'KEX-aaaaaaaa-ccccccdd');assert.equal(relation.relation,'depends_on');
});

test('VFS persistence failures do not publish incomplete memory state', async () => {
 const { VFSPrimitive } = await import('../src/core/vfs/vfs.ts');
 const records=new Map();let fail=false;
 const storage={async saveInode(record:any){if(fail)throw new Error('DISK_FAILURE');records.set(record.id,record);},async getInode(id:string){return records.get(id);},async deleteInode(id:string){if(fail)throw new Error('DISK_FAILURE');records.delete(id);},async getAllInodes(){return [...records.values()];}};
 const vfs=new VFSPrimitive(storage as any);await vfs.create('inode-1',{},'first');
 fail=true;await assert.rejects(vfs.update('inode-1',{},'lost'),/DISK_FAILURE/);assert.equal((await vfs.read('inode-1')).data,'first');
 await assert.rejects(vfs.delete('inode-1'),/DISK_FAILURE/);assert.equal((await vfs.read('inode-1')).data,'first');
 fail=false;await vfs.update('inode-1',{},'second');assert.equal((await vfs.read('inode-1')).data,'second');
 await vfs.delete('inode-1');await assert.rejects(vfs.read('inode-1'),/Inode not found/);
});

test('dependency ordering handles shared dependencies, cycles and missing identities', async()=>{
 const {dependencyOrder}=await import('../src/core/kex/dependencyOrder.ts');
 const base={id:'base',version:'1',dependencies:[]};
 const a={id:'a',version:'1',dependencies:['base']};const b={id:'b',version:'1',dependencies:['base']};
 const root={id:'root',version:'1',dependencies:['a','b']};
 assert.deepEqual(dependencyOrder(root,[base,a,b,root]).map(p=>p.id),['base','a','b','root']);
 assert.throws(()=>dependencyOrder(root,[a,b,root]),/DEPENDENCY_NOT_FOUND/);
 assert.throws(()=>dependencyOrder(a,[a,{...base,dependencies:['a']}]),/DEPENDENCY_CYCLE/);
 assert.throws(()=>dependencyOrder(a,[a,a]),/DUPLICATE_PACKAGE/);
});

test('VFS queues concurrent writes in invocation order and releases a failed operation', async()=>{
 const {VFSPrimitive}=await import('../src/core/vfs/vfs.ts');
 const records=new Map();const writes:string[]=[];let release:()=>void=()=>{};
 let blocked=false;
 const storage={async saveInode(record:any){if(blocked){await new Promise<void>(resolve=>{release=resolve;});blocked=false;}writes.push(record.data);if(record.data==='fail')throw new Error('DISK_FAILURE');records.set(record.id,record);},async getInode(id:string){return records.get(id);},async deleteInode(id:string){records.delete(id);},async getAllInodes(){return [...records.values()];}};
 const vfs=new VFSPrimitive(storage as any);await vfs.create('one',{},'initial');blocked=true;
 const first=vfs.update('one',{},'first');const failed=vfs.update('one',{},'fail');const rejected=assert.rejects(failed,/DISK_FAILURE/);const last=vfs.update('one',{},'last');
 await new Promise(resolve=>setImmediate(resolve));release();await first;await rejected;await last;
 assert.deepEqual(writes,['initial','first','fail','last']);assert.equal((await vfs.read('one')).data,'last');
});

test('VFS hydration cannot resurrect a record deleted after its initial snapshot',async()=>{
 const {VFSPrimitive}=await import('../src/core/vfs/vfs.ts');const records=new Map<string,any>();
 let resume:()=>void=()=>{};let snapshotReady:()=>void=()=>{};
 const ready=new Promise<void>(resolve=>{snapshotReady=resolve;});
 const storage={async saveInode(record:any){records.set(record.id,record);},async getInode(id:string){return records.get(id);},async deleteInode(id:string){records.delete(id);},async getAllInodes(){const snapshot=[...records.values()];snapshotReady();await new Promise<void>(resolve=>{resume=resolve;});return snapshot;}};
 const vfs=new VFSPrimitive(storage as any);await vfs.create('one',{},'value');const hydrate=vfs.hydrateFromIndexedDb();await ready;await vfs.delete('one');resume();await hydrate;
 await assert.rejects(vfs.read('one'),/Inode not found/);
});
