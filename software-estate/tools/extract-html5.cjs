const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.resolve(__dirname, '../working/github');
const out = path.resolve(__dirname, '../working/html5');
fs.mkdirSync(out, {recursive:true});
const values = {}, report = [];
for (const filename of fs.readdirSync(path.join(root,'src/data'))) {
  const text = fs.readFileSync(path.join(root,'src/data',filename),'utf8');
  const match = text.match(/^export const (\w+) = (`[\s\S]*`);\s*$/);
  if (!match) continue;
  const literal = match[2];
  // Permit a single literal only, with no live interpolation or additional code.
  for (let i=1;i<literal.length-1;i++) {
    if (literal[i]==='\\') {i++; continue;}
    if (literal[i]==='`' || (literal[i]==='$' && literal[i+1]==='{')) throw Error('Unexpected executable template in '+filename);
  }
  values[match[1]]=vm.runInNewContext(literal, Object.create(null), {timeout:1000});
}
const assets = {OPEN_SOURCE_OS_HTML:'os/AetherOS.html', MINING_OS_HTML:'os/MiningOS.html',KERA_MESH_OS_HTML:'os/KeraMeshOS.html',HTML5_CHROME_BROWSER_HTML:'workstations/Chrome.html'};
for (const [key,rel] of Object.entries(assets)) values[key]=fs.readFileSync(path.join(root,'src/assets',rel),'utf8');
const catalog=fs.readFileSync(path.join(root,'src/data/html5Apps.ts'),'utf8');
const entries=[...catalog.matchAll(/id: '([^']+)',\s+name: '([^']+)',[\s\S]*?code: (\w+),/g)];
for (const [,id,filename,key] of entries) {
  const html=values[key]; if (!html) throw Error('Missing '+key);
  fs.writeFileSync(path.join(out,filename),html);
  const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
  const errors=[];
  for (let i=0;i<scripts.length;i++) {try {new vm.Script(scripts[i][1],{filename:filename+':script'+i});}catch(e){errors.push(e.stack);}}
  report.push({id,filename,bytes:Buffer.byteLength(html),scripts:scripts.length,syntax_errors:errors});
}
fs.copyFileSync(path.join(root,'src/assets/os/KexLinux.html'),path.join(out,'KexLinux.html'));
fs.writeFileSync(path.resolve(__dirname,'../reports/html5-static-checks.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report.map(({id,scripts,syntax_errors})=>({id,scripts,syntax_errors})),null,2));
