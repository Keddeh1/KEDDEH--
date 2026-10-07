/** Deterministic dependency-first ordering; package identity remains unchanged. */
export function dependencyOrder<T extends { id: string; dependencies: string[]; version: string }>(root: T, catalog: T[]): T[] {
 const byId = new Map<string,T>();
 for (const pkg of catalog) {
  if (byId.has(pkg.id)) throw new Error(`DUPLICATE_PACKAGE:${pkg.id}`);
  byId.set(pkg.id,pkg);
 }
 const existing=byId.get(root.id);
 if (existing && existing.version!==root.version) throw new Error(`PACKAGE_VERSION_CONFLICT:${root.id}`);
 byId.set(root.id,root);
 const complete=new Set<string>();const active=new Set<string>();const ordered:T[]=[];
 const visit=(pkg:T,chain:string[])=>{
  if(complete.has(pkg.id))return;
  if(active.has(pkg.id))throw new Error(`DEPENDENCY_CYCLE:${[...chain,pkg.id].join('->')}`);
  active.add(pkg.id);
  for(const id of pkg.dependencies){
   const dependency=byId.get(id);if(!dependency)throw new Error(`DEPENDENCY_NOT_FOUND:${pkg.id}->${id}`);
   visit(dependency,[...chain,pkg.id]);
  }
  active.delete(pkg.id);complete.add(pkg.id);ordered.push(pkg);
 };
 visit(root,[]);return ordered;
}
