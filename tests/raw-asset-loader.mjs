import { readFile } from 'node:fs/promises';
// Match Vite's ?raw handling when exercising browser modules under Node.
export async function load(url, context, nextLoad) {
 if (new URL(url).pathname.endsWith('.html')) {
  return {format:'module',shortCircuit:true,source:'export default '+JSON.stringify(await readFile(new URL(url),'utf8'))+';'};
 }
 return nextLoad(url,context);
}
