import pathlib,hashlib,json,re,base64,datetime,subprocess
from html.parser import HTMLParser
base=pathlib.Path(__file__).resolve().parents[1];d=base/'originals/hcf-recovery';manifest=json.loads((base/'evidence/hcf-recovery.json').read_text());tests=[]
def check(name,value,detail=None):
 tests.append({'name':name,'passed':bool(value),'detail':detail})
for f in manifest['files']:
 b=(d/f['file']).read_bytes();check('Custody: '+f['file'],len(b)==f['bytes'] and hashlib.sha256(b).hexdigest()==f['sha256'])
js=(d/'index.served.js').read_text();encoded=re.search(r'sourceMappingURL=data:application/json[^,]*;base64,([^\s]+)',js).group(1);sm=json.loads(base64.b64decode(encoded));source=sm['sourcesContent'][0].encode();check('Source-map derivative exactly matches preserved TypeScript',source==(d/'index.recovered-0.ts').read_bytes());check('Working TypeScript matches source-map derivative',source==(base/'working/hcf-recovered/index.ts').read_bytes());check('Source-map source identity',sm['file']=='/app/applet/index.ts' and sm['sources']==['index.ts'],{'file':sm['file'],'sources':sm['sources']})
local=sorted(set(re.findall(r'\bfrom\s+[\'"](\.[^\'"]+)[\'"]',source.decode())));check('Exactly 11 declared local dependencies',len(local)==11 and local==sorted(manifest['missing_local_imports']),local)
root=base/'working/hcf-recovered';missing=[]
for p in local:
 f=root/p
 if not any(pathlib.Path(str(f)+suffix).exists() for suffix in ['', '.ts','.tsx','.js','.json','/index.ts','/index.tsx']):missing.append(p)
check('All 11 local imports remain absent',len(missing)==11,missing)
class IDs(HTMLParser):
 def __init__(self):super().__init__();self.ids=set()
 def handle_starttag(self,tag,attrs):
  for k,v in attrs:
   if k=='id':self.ids.add(v)
a=IDs();a.feed((base/'originals/drive/hcf_workstation.html').read_text());b=IDs();b.feed((d/'saved_resource.html').read_text());check('DOM overlap supports lineage only',len(a.ids)==96 and len(b.ids)==80 and len(a.ids&b.ids)==65,{'standalone':len(a.ids),'capture':len(b.ids),'common':len(a.ids&b.ids)})
old=(d/'hcf_workstation.entrypoint.html').read_bytes();current=(base/'originals/drive/hcf_workstation.html').read_bytes();check('Standalone custody unchanged',hashlib.sha256(current).hexdigest()==manifest['original_sha256']);check('Older standalone differs by entrypoint line only',old.replace(b'<script type="module" src="/index.tsx"></script>\n',b'')==current)
p=subprocess.run(['node','--input-type=module','--check'],input=js,text=True,capture_output=True);check('Served module parses without executing',p.returncode==0,p.stderr or None)
r={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'verdict':'Partial lineage recovery, not runnable, exact-version identity unverified.','separateFromCoreCounts':True,'documentationCorrection':'HTMLParser finds 80 actual capture DOM IDs; initial source-regex count of 89 included non-DOM strings. Common IDs remain 65 of standalone 96.','checks':tests,'allPassed':all(t['passed'] for t in tests),'applicationExecuted':False}
(base/'evidence/independent-hcf-recovery-verdict.json').write_text(json.dumps(r,indent=2));print(json.dumps(r,indent=2));raise SystemExit(0 if r['allPassed'] else 1)
