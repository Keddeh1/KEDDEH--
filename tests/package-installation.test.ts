import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DependencyService } from '../src/services/DependencyService.ts';
import { VFSPrimitive } from '../src/core/vfs/vfs.ts';
import { GLOBAL_KERNEL_SERVICE } from '../src/services/KernelService.ts';
import type { SoftwarePackage } from '../src/types.ts';

function fixture() {
 const records=new Map<string,any>();let fail=false;let writes=0;
 const storage={async saveInode(record:any){if(fail)throw new Error('DISK_FAILURE');writes++;records.set(record.id,structuredClone(record));},async getInode(id:string){return records.get(id);},async deleteInode(id:string){if(fail)throw new Error('DISK_FAILURE');records.delete(id);},async getAllInodes(){return [...records.values()];}};
 const content='<!doctype html><html><body><button>Actual carrier</button></body></html>';
 const templates=new Map([['app-test',content]]);
 const service=new DependencyService({vfs:new VFSPrimitive(storage as any),kernel:GLOBAL_KERNEL_SERVICE,templates,audit:async()=>undefined});
 const pkg={id:'app-test',name:'Test carrier',version:'1',dependencies:[],sizeMb:.25} as SoftwarePackage;
 return {service,pkg,templates,records,content,writes:()=>writes,setFail:(value:boolean)=>{fail=value;},storage};
}

test('installation writes real carrier bytes, verifies kernel and SHA-256, and is repeatable',async()=>{
 const f=fixture();const logs=await f.service.resolveAndInstall(f.pkg,[f.pkg]);
 assert.equal(await f.service.getExecutable(f.pkg.id),f.content);
 const installed=f.service.getInstalledPackages()[0];assert.match(installed.integrityHash,/^sha256:[a-f0-9]{64}$/);assert.match(installed.kernelHash,/^[A-Fa-f0-9]{8}$/);
 assert.ok(logs.some(log=>log.startsWith('[INSTALLED]')));
 await f.service.resolveAndInstall(f.pkg,[f.pkg]);assert.equal(f.writes(),1);
 const records=f.service.getInstalledPackages();records[0].version='tampered';assert.equal(f.service.getInstalledPackages()[0].version,'1');
});
test('same-version changed carrier is refreshed and existing VFS state recovers installation',async()=>{
 const f=fixture();await f.service.resolveAndInstall(f.pkg,[f.pkg]);f.templates.set(f.pkg.id,f.content+'<!-- revision -->');
 await f.service.resolveAndInstall(f.pkg,[f.pkg]);assert.equal(f.writes(),2);
 const restarted=new DependencyService({vfs:new VFSPrimitive(f.storage as any),kernel:GLOBAL_KERNEL_SERVICE,templates:f.templates,audit:async()=>undefined});
 assert.equal(await restarted.getExecutable(f.pkg.id),f.templates.get(f.pkg.id));assert.equal(restarted.isInstalled(f.pkg.id),true);
});
test('failed durable writes and uninstall failures do not advertise a successful transition',async()=>{
 const f=fixture();f.setFail(true);await assert.rejects(f.service.resolveAndInstall(f.pkg,[f.pkg]),/DISK_FAILURE/);assert.equal(f.service.isInstalled(f.pkg.id),false);
 f.setFail(false);await f.service.resolveAndInstall(f.pkg,[f.pkg]);f.setFail(true);await assert.rejects(f.service.uninstall(f.pkg.id),/DISK_FAILURE/);assert.equal(f.service.isInstalled(f.pkg.id),true);
 f.setFail(false);await f.service.uninstall(f.pkg.id);assert.equal(f.service.isInstalled(f.pkg.id),false);assert.equal(f.records.size,0);
});
test('unsupported native plans never create placeholder binaries or partial dependencies',async()=>{
 const f=fixture();const native={...f.pkg,id:'native',dependencies:['app-test']};
 await assert.rejects(f.service.resolveAndInstall(native,[f.pkg,native]),/NATIVE_WORKER_INSTALLATION_REQUIRED/);assert.equal(f.writes(),0);
});
test('corrupted executable readback is rejected',async()=>{
 const f=fixture();await f.service.resolveAndInstall(f.pkg,[f.pkg]);f.records.get('file-bin-app-test').data='corrupted';
 const restarted=new DependencyService({vfs:new VFSPrimitive(f.storage as any),kernel:GLOBAL_KERNEL_SERVICE,templates:f.templates,audit:async()=>undefined});
 await assert.rejects(restarted.getExecutable(f.pkg.id),/INSTALLATION_READBACK_FAILED/);
});

test('full installed catalogue is reconstructed from verified durable records',async()=>{
 const f=fixture();await f.service.resolveAndInstall(f.pkg,[f.pkg]);
 const restarted=new DependencyService({vfs:new VFSPrimitive(f.storage as any),kernel:GLOBAL_KERNEL_SERVICE,templates:f.templates,audit:async()=>undefined});
 const records=await restarted.hydrateInstalledPackages([f.pkg]);assert.deepEqual(records.map(r=>r.pkgId),[f.pkg.id]);
 f.records.get('file-bin-app-test').data='corrupted';
 const broken=new DependencyService({vfs:new VFSPrimitive(f.storage as any),kernel:GLOBAL_KERNEL_SERVICE,templates:f.templates,audit:async()=>undefined});
 assert.deepEqual(await broken.hydrateInstalledPackages([f.pkg]),[]);
});

test('all supplied browser carriers can be installed using the real WASM kernel',async()=>{
 const {HTML5_APP_TEMPLATES}=await import('../src/data/html5Apps.ts');
 const f=fixture();const templates=new Map(HTML5_APP_TEMPLATES.map(app=>['app-'+app.id,app.code]));
 const service=new DependencyService({vfs:new VFSPrimitive(f.storage as any),kernel:GLOBAL_KERNEL_SERVICE,templates,audit:async()=>undefined});
 for(const app of HTML5_APP_TEMPLATES){
  const pkg={...f.pkg,id:'app-'+app.id};await service.resolveAndInstall(pkg,[pkg]);assert.equal(await service.getExecutable(pkg.id),app.code);
 }
 assert.equal(service.getInstalledPackages().length,HTML5_APP_TEMPLATES.length);
});
