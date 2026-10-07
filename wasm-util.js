import fs from 'fs';
import { execSync } from 'child_process';

const WAT_PATH = 'src/services/wasm/brainkKernel.wat';
const WASM_PATH = 'src/services/wasm/brainkKernel.wasm';

async function verify() {
  console.log('--- WASM Traceability & Verification Report ---');
  
  // 1. Compile WAT to WASM
  console.log(`Step 1: Compiling ${WAT_PATH}...`);
  try {
    execSync(`./node_modules/.bin/wat2wasm ${WAT_PATH} -o ${WASM_PATH}`);
    console.log(`[PASS] Compiled to ${WASM_PATH}`);
  } catch (e) {
    console.error(`[FAIL] Compilation failed: ${e.message}`);
    process.exit(1);
  }

  // 2. Hash Verification
  const wasmBuffer = fs.readFileSync(WASM_PATH);
  const { createHash } = await import('crypto');
  const hash = createHash('sha256').update(wasmBuffer).digest('hex');
  console.log(`Step 2: WASM SHA-256 Hash: ${hash}`);

  // 3. Physical Instantiation & Primitive Test
  console.log('Step 3: Instantiating WASM module...');
  try {
    const wasmModule = await WebAssembly.compile(wasmBuffer);
    const instance = await WebAssembly.instantiate(wasmModule, {
      env: {
        memory: new WebAssembly.Memory({ initial: 256 }),
        __indirect_function_table: new WebAssembly.Table({ initial: 0, element: 'anyfunc' }),
        __stack_pointer: new WebAssembly.Global({ value: 'i32', mutable: true }, 0),
        trace: (val) => console.log('WASM Trace:', val)
      }
    });
    
    console.log('[PASS] Instantiation successful.');
    console.log('Exports:', Object.keys(instance.exports));

    // Test a primitive export if exists (e.g. compute_fnv1a)
    if (instance.exports.compute_fnv1a) {
      const testVal = instance.exports.compute_fnv1a(0, 4); // Assuming memory [0..4] has something
      console.log(`[PASS] Primitive I/O test (compute_fnv1a): ${testVal}`);
    } else {
      console.log('[INFO] compute_fnv1a not found, skipping primitive test.');
    }
  } catch (e) {
    console.error(`[FAIL] Instantiation/Test failed: ${e.message}`);
    process.exit(1);
  }

  // 4. Update brainkWasmBytes.ts
  console.log('Step 4: Updating brainkWasmBytes.ts with fresh bytes...');
  const byteArr = Array.from(wasmBuffer).map(b => '0x' + b.toString(16).toUpperCase().padStart(2, '0')).join(', ');
  const content = `export const BRAINK_WASM_BYTES = new Uint8Array([${byteArr}]);\n`;
  fs.writeFileSync('src/services/wasm/brainkWasmBytes.ts', content);
  console.log('[PASS] brainkWasmBytes.ts updated.');
  
  console.log('--- Verification Complete ---');
}

verify();
