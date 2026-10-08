import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
const root = path.resolve(import.meta.dirname, '..');
const names = execFileSync('git', ['ls-files', '-z'], { cwd: root }).toString().split('\0').filter(Boolean);
const files = names.filter(name => !name.startsWith('reports/') && !name.startsWith('evidence/') && !name.startsWith('runtime/inventory/')).map(name => {
 const data = fs.readFileSync(path.join(root, name));
 const source = /\.(tsx?|m?js|cjs|c|py|wat|sh)$/.test(name);
 const text = source ? data.toString() : '';
 return { path: name, bytes: data.length, sha256: crypto.createHash('sha256').update(data).digest('hex'), sector: name.split('/')[0], source,
  review_signals: source ? [...new Set(text.match(/\b(?:TODO|FIXME|placeholder|dummyContent|Math\.random|Simulate)\b/g) ?? [])] : [],
  review_status: ['src/core/types.ts','src/core/input/input.ts','src/core/process/process.ts','src/core/telemetry/telemetry.ts','src/core/vfs/vfs.ts','src/core/kex/kex.ts','src/services/DependencyService.ts','src/components/substrate/RegistrySubstrate.tsx'].includes(name) ? 'EVOLVED_VALIDATED' : 'PENDING_FILE_REVIEW' };
});
fs.mkdirSync(path.join(root, 'runtime/inventory'), { recursive: true });
fs.writeFileSync(path.join(root, 'runtime/inventory/source-files.json'), JSON.stringify({ schema: 'kex.source_inventory.v1', files }, null, 2) + '\n');
console.log(`Inventoried ${files.length} files; ${files.filter(f => f.source).length} source files.`);
