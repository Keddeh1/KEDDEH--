#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
const base=path.resolve(__dirname,'..');
const walk=d=>fs.existsSync(d)?fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isSymbolicLink()?[]:e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]):[];
const roots=process.argv.slice(2).length?process.argv.slice(2):['originals/drive','working/drive','tests/github-baseline-html5','working/html5'];
const apps=[];
for(const root of roots){for(const file of walk(path.resolve(base,root)).filter(f=>/\.html?$/i.test(f))){const source=fs.readFileSync(file,'utf8'),scripts=[],re=/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;let m;while((m=re.exec(source))){const attrs=m[1],code=m[2],type=(attrs.match(/\btype\s*=\s*["']([^"']+)/i)||[])[1]||'classic',id=(attrs.match(/\bid\s*=\s*["']([^"']+)/i)||[])[1]||null;const item={index:scripts.length,id,type,line:source.slice(0,m.index).split('\n').length,bytes:Buffer.byteLength(code)};if(/\bsrc\s*=/.test(attrs))item.status='external-not-compiled';else if(!['classic','text/javascript','application/javascript','module'].includes(type))item.status='data-not-executable';else if(type==='module')item.status='module-not-compiled';else{try{new vm.Script(code,{filename:path.basename(file)+':script'+item.index});item.status='parsed'}catch(e){item.status='syntax-error';item.message=e.message;item.stack=e.stack?.split('\n').slice(0,5).join('\n')}}scripts.push(item)}apps.push({file:path.relative(base,file),sha256:crypto.createHash('sha256').update(source).digest('hex'),scripts,executable:scripts.filter(s=>s.status==='parsed'||s.status==='syntax-error').length,syntaxErrors:scripts.filter(s=>s.status==='syntax-error')})}}
const result={generatedAt:new Date().toISOString(),verification:'Static compilation only; no browser DOM, controls, persistence or integrations executed.',apps};fs.mkdirSync(path.join(base,'evidence'),{recursive:true});fs.writeFileSync(path.join(base,'evidence/independent-static-verification.json'),JSON.stringify(result,null,2));for(const a of apps)console.log(a.file+': '+a.executable+' executable scripts, '+a.syntaxErrors.length+' syntax errors');

// Explicit selected roots are CI assertions; default mixed original/baseline inventory remains descriptive.
if(process.argv.slice(2).length && apps.some(a=>a.syntaxErrors.length)) process.exitCode=1;
