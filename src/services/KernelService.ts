import { BRAINK_WASM_BYTES } from './wasm/brainkWasmBytes';

export interface KernelTelemetry {
  activeNodes: number;
  activeEdges: number;
  memoryPages: number;
  epochHz: number;
  cpuLoad: number;
  hashesComputed: number;
}

export interface MoebiusHeader {
  view: bigint;
  seq: bigint;
  timestamp: bigint;
  sk_x: bigint;
  sk_y: bigint;
  sk_z: bigint;
}

class KernelService {
  private instance: WebAssembly.Instance | null = null;
  private memory: WebAssembly.Memory | null = null;
  private isLoaded = false;
  private hashesComputed = 0;

  async init() {
    if (this.isLoaded) return;

    try {
      const { instance } = await WebAssembly.instantiate(BRAINK_WASM_BYTES, {
        env: {
          memory: new WebAssembly.Memory({ initial: 2, maximum: 16 }),
          abort: () => console.error('WASM Kernel Abort'),
        }
      });
      this.instance = instance;
      this.memory = (instance.exports.memory as WebAssembly.Memory);
      
      if (instance.exports.init_kernel) {
        (instance.exports.init_kernel as Function)();
      }

      this.isLoaded = true;
      console.log('BRAINK Microkernel Substrate (WASM) Online');
    } catch (err) {
      console.error('Failed to initialize BRAINK Kernel:', err);
    }
  }

  private ensureMemory(requiredBytes: number) {
    if (!this.memory) return;
    const currentSize = this.memory.buffer.byteLength;
    if (requiredBytes > currentSize) {
      const pagesNeeded = Math.ceil((requiredBytes - currentSize) / 65536);
      this.memory.grow(pagesNeeded);
      console.log(`[Kernel] Expanded substrate memory by ${pagesNeeded} pages to meet demand.`);
    }
  }

  // --- INTEGRITY & CRYPTO ---

  async verifyIntegrity(content: string): Promise<string> {
    if (!this.isLoaded || !this.instance) return 'UNVERIFIED';

    const encoder = new TextEncoder();
    const bytes = encoder.encode(content);
    const scratchPtr = 36864; // 1x9000 (Unit Boundary Admitted)
    
    // Ensure buffer can hold the data
    this.ensureMemory(scratchPtr + bytes.length);
    
    const view = new Uint8Array(this.memory!.buffer);
    view.set(bytes, scratchPtr);

    if (this.instance.exports.compute_fnv1a) {
      const hash = (this.instance.exports.compute_fnv1a as Function)(scratchPtr, bytes.length);
      this.hashesComputed++;
      return (hash >>> 0).toString(16).padStart(8, '0').toUpperCase();
    }

    return 'HASH_ERR';
  }

  // --- MOEBIUS WIRE PROTOCOL ---

  async generateMoebiusProof(header: MoebiusHeader): Promise<string> {
    if (!this.isLoaded || !this.instance) return '';

    const outPtr = 36864; // 1x9000 (Unit Boundary Admitted)
    const packFn = this.instance.exports.pack_moebius_header as Function;
    
    packFn(
      outPtr,
      header.view,
      header.seq,
      header.timestamp,
      header.sk_x,
      header.sk_y,
      header.sk_z
    );

    // Read the 72-byte header + 96 bytes for other fields (total 168 bytes per .wat)
    const view = new Uint8Array(this.memory!.buffer);
    const packet = view.slice(outPtr, outPtr + 168);
    
    return Array.from(packet).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async validateProof(hexProof: string): Promise<boolean> {
    if (!this.isLoaded || !this.instance) return false;

    const bytes = new Uint8Array(hexProof.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const ptr = 36864; // 1x9000 (Unit Boundary Admitted)
    
    this.ensureMemory(ptr + bytes.length);
    
    const view = new Uint8Array(this.memory!.buffer);
    view.set(bytes, ptr);

    const validateFn = this.instance.exports.validate_moebius_packet as Function;
    return !!validateFn(ptr, bytes.length);
  }

  // --- SEMANTIC SUBSTRATE ---

  bindRelation(u: number, v: number, weight: number): number {
    if (!this.isLoaded || !this.instance) return 0;
    const bindFn = this.instance.exports.bind_relation as Function;
    return bindFn(u, v, weight);
  }

  getTransitiveWeight(u: number, v: number): number {
    if (!this.isLoaded || !this.instance) return 0;
    const getFn = this.instance.exports.get_transitive_weight as Function;
    return getFn(u, v);
  }

  computeClosure(maxHops: number = 4): number {
    if (!this.isLoaded || !this.instance) return 0;
    const computeFn = this.instance.exports.compute_transitive_closure as Function;
    return computeFn(maxHops);
  }

  getCentrality(node: number): number {
    if (!this.isLoaded || !this.instance) return 0;
    const getFn = this.instance.exports.get_centrality as Function;
    return getFn(node);
  }

  getTelemetry(): KernelTelemetry {
    if (!this.isLoaded || !this.instance) {
      return { activeNodes: 0, activeEdges: 0, memoryPages: 0, epochHz: 0, cpuLoad: 0, hashesComputed: 0 };
    }

    const outPtr = 34048; // 1x8500 (Unit Boundary Admitted)
    const telFn = this.instance.exports.get_kernel_telemetry as Function;
    telFn(outPtr);

    const view = new DataView(this.memory!.buffer);
    return {
      activeNodes: view.getUint32(outPtr, true),
      activeEdges: view.getUint32(outPtr + 4, true),
      memoryPages: view.getUint32(outPtr + 8, true),
      epochHz: view.getUint32(outPtr + 12, true),
      cpuLoad: (view.getUint32(outPtr + 4, true) / 4096) * 100,
      hashesComputed: this.hashesComputed,
    };
  }
}

export const GLOBAL_KERNEL_SERVICE = new KernelService();
