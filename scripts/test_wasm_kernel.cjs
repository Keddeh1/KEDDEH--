const fs = require('fs');
const path = require('path');

async function testWasm() {
  const wasmPath = path.join(__dirname, '../src/services/wasm/brainkKernel.wasm');
  const wasmBuffer = fs.readFileSync(wasmPath);
  
  const { instance } = await WebAssembly.instantiate(wasmBuffer, {
    env: {
      memory: new WebAssembly.Memory({ initial: 2, maximum: 16 })
    }
  });

  const { calc_sk_norm } = instance.exports;
  
  // Test Case 1: Standard Norm (3, 4, 0) -> 5
  const result1 = calc_sk_norm(3.0, 4.0, 0.0);
  console.log(`Test 1 (3.0, 4.0, 0.0): Expected 5.0, Got ${result1}`);
  
  // Test Case 2: Zero Vector
  const result2 = calc_sk_norm(0.0, 0.0, 0.0);
  console.log(`Test 2 (0.0, 0.0, 0.0): Expected 0.0, Got ${result2}`);

  // Test Case 3: Unit Vector
  const result3 = calc_sk_norm(1.0, 0.0, 0.0);
  console.log(`Test 3 (1.0, 0.0, 0.0): Expected 1.0, Got ${result3}`);

  if (Math.abs(result1 - 5.0) < 0.0001 && result2 === 0.0 && result3 === 1.0) {
    console.log("WASM VERIFICATION: PASSED");
    process.exit(0);
  } else {
    console.log("WASM VERIFICATION: FAILED");
    process.exit(1);
  }
}

testWasm().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
