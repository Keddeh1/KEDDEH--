#!/usr/bin/env python3
"""Aggregate independent family-control observations without accepting app PASS labels."""
import hashlib,json,pathlib,datetime
root=pathlib.Path(__file__).resolve().parents[1]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
apps=[]
for family in ('drive','html5','github'):
 directory=root/'evidence'/('r2-family-'+family)
 records=[]
 for path in sorted(directory.glob('*.runtime.json')):
  d=json.loads(path.read_text());checks=d.get('controlChecks',[])
  row={'file':'working/'+family+'/'+d['file'],'sha256':d['sha256'],'sourceUnchangedDuringRun':d.get('originalUnchanged'),'harnessIncomplete':bool(d.get('harnessError')) or not bool(checks),'evidence':str(path.relative_to(root)),'assertionsPassed':sum(c['passed'] for c in checks),'assertionsFailed':sum(not c['passed'] for c in checks),'runtimeErrors':[{'name':e['name'],'message':e['message']} for e in d['runtimeErrors']],'limitations':d['limitations']}
  apps.append(row);records.append(row)
 (directory/'summary.json').write_text(json.dumps({'schemaVersion':1,'apps':records},indent=2)+'\n')
identities=[]
for p in sorted(root.glob('working/github/**/*.html')):
 h=sha(p);identities.append({'rawPath':str(p.relative_to(root)),'sha256':h,'identicalStandalonePaths':[str(q.relative_to(root)) for q in root.glob('working/html5/*.html') if sha(q)==h],'relationship':'Byte-identical copies; both source identities retained and each independently loaded in a fresh browser context.'})
out={'schemaVersion':1,'generatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Safe non-priority family controls and read-only host-dependent surfaces. Not full browser qualification.','browser':'/usr/bin/chromium headless; Playwright','assertionsPassed':sum(a['assertionsPassed'] for a in apps),'assertionsFailed':sum(a['assertionsFailed'] for a in apps),'appsWithRuntimeErrors':sum(bool(a['runtimeErrors']) for a in apps),'apps':apps,'rawGitHubIdentities':identities,'harnessFiles':[{'path':str(p.relative_to(root)),'sha256':sha(p)} for p in [root/'tests/r2-family-controls.cjs',root/'tests/r2-family-actions.cjs',pathlib.Path(__file__).resolve()]],'initialHarnessFailures':'evidence/r2-family-harness-initial-failures/ retains five superseded reports: wrong CLI output selector (two), out-of-range slider value (one), text-only assertion on canvas shell (two). Corrected reruns are the current evidence. No application files changed for those five harness corrections; subsequent source repairs are traced in development/r2-family/changes.json.'}
(root/'evidence/r2-family-controls.json').write_text(json.dumps(out,indent=2)+'\n')
print(json.dumps({k:out[k] for k in ('assertionsPassed','assertionsFailed','appsWithRuntimeErrors')},indent=2));print('HTML identities:',len(apps))

if out['assertionsFailed'] or out['appsWithRuntimeErrors'] or any(a['harnessIncomplete'] for a in apps): raise SystemExit(1)
