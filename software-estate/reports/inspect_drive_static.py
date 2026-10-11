import pathlib,re,json,subprocess,tempfile,datetime
from html.parser import HTMLParser
class Parse(HTMLParser):
 def __init__(self): super().__init__(convert_charrefs=False);self.tags=[];self.scripts=[];self.active=None;self.title='';self.in_title=False
 def handle_starttag(self,t,a):
  d=dict(a);self.tags.append((t,d))
  if t=='script':self.active=[d,'']
  if t=='title':self.in_title=True
 def handle_endtag(self,t):
  if t=='script' and self.active is not None:self.scripts.append(self.active);self.active=None
  if t=='title':self.in_title=False
 def handle_data(self,d):
  if self.active is not None:self.active[1]+=d
  if self.in_title:self.title+=d
root=pathlib.Path('software-estate');out=[]
for p in sorted((root/'originals/drive').glob('*.html')):
 s=p.read_text();h=Parse();h.feed(s)
 rec={'filename':p.name,'title':h.title,'scripts':len(h.scripts),'script_sources':[a['src'] for a,b in h.scripts if a.get('src')],'style_sources':[a['href'] for t,a in h.tags if t=='link' and a.get('href')],'iframe_sources':[a['src'] for t,a in h.tags if t=='iframe' and a.get('src')],'forms':[a for t,a in h.tags if t=='form'],'inline_handlers':list(dict.fromkeys(str(v)[:220] for t,a in h.tags for k,v in a.items() if k.startswith('on'))),'api_markers':{k:len(re.findall(r'\b'+re.escape(k)+r'\b',s)) for k in ['fetch','XMLHttpRequest','WebSocket','localStorage','sessionStorage','indexedDB','Worker','serviceWorker','eval','Function','showOpenFilePicker','showSaveFilePicker','postMessage']},'events':list(dict.fromkeys(re.findall(r'''addEventListener\(\s*['"]([^'"]+)''',s)))[:70],'boot_functions':list(dict.fromkeys(re.findall(r'function\s+((?:boot|init|start|mount|render|load|restore|hydrate|run)[A-Za-z0-9_$]*)\s*\(',s,re.I)))[:100],'syntax_checks':[]}
 for i,(a,b) in enumerate(h.scripts):
  if a.get('src') or a.get('type','').lower() not in ('','text/javascript','application/javascript','module'):continue
  ext='.mjs' if a.get('type')=='module' else '.js'
  with tempfile.NamedTemporaryFile(mode='w',suffix=ext) as tmp:
   tmp.write(b);tmp.flush();r=subprocess.run(['node','--check',tmp.name],capture_output=True,text=True)
  rec['syntax_checks'].append({'script_index':i,'bytes':len(b.encode()),'passed':r.returncode==0,'error':r.stderr[:1500] if r.returncode else None})
 out.append(rec)
(root/'reports/drive-static-inventory.json').write_text(json.dumps(out,indent=2)+'\n')
for r in out:
 print(r['filename']);print('Title:',r['title']);print('Scripts:',r['scripts'],'sources:',r['script_sources']); print('Styles:',r['style_sources']);print('Frames:',[x[:250] for x in r['iframe_sources']]); print('API:',r['api_markers']); print('Events:',r['events']);print('Boots:',r['boot_functions'][:30]);print('Syntax:',[(c['script_index'],c['passed'],c['error']) for c in r['syntax_checks'] if not c['passed']]); print()
