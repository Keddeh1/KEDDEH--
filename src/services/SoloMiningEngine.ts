import type { MiningParams, MiningResult, MiningProgress } from './mining-worker';

export interface MiningEngineState {
  isMining: boolean;
  hashesCalculated: number;
  hashRate: number;
  totalTime: number;
  success: boolean;
  winningNonce: number;
  computedHash: string;
  extraNonce: number;
  templateUpdates: number;
  currentMerkleRoot: string;
  currentTimestamp: number;
}

export class SoloMiningEngine {
  private worker: Worker | null = null;
  private state: MiningEngineState = {
    isMining: false,
    hashesCalculated: 0,
    hashRate: 0,
    totalTime: 0,
    success: false,
    winningNonce: 0,
    computedHash: "",
    extraNonce: 0,
    templateUpdates: 0,
    currentMerkleRoot: "",
    currentTimestamp: 0,
  };

  private currentParams: MiningParams | null = null;
  private rollingUpdateTimer: ReturnType<typeof setInterval> | null = null;
  private listeners: ((state: MiningEngineState) => void)[] = [];

  public getState() {
    return { ...this.state };
  }

  public subscribe(listener: (state: MiningEngineState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l({ ...this.state }));
  }

  public async startMining(params: MiningParams) {
    if (this.state.isMining) return;

    this.currentParams = { ...params };
    this.state = {
      ...this.state,
      isMining: true,
      hashesCalculated: 0,
      hashRate: 0,
      totalTime: 0,
      success: false,
      winningNonce: 0,
      computedHash: "",
      extraNonce: 0,
      templateUpdates: 1,
      currentMerkleRoot: params.merkle_root,
      currentTimestamp: params.timestamp,
    };
    this.notify();

    this.initWorker();
    this.startRollingUpdates();
  }

  private initWorker() {
    if (this.worker) this.terminateWorker();
    
    this.worker = new Worker(new URL('./mining-worker.ts', import.meta.url), { type: 'module' });

    this.worker.onmessage = (e: MessageEvent<MiningProgress | MiningResult>) => {
      const data = e.data;
      if (data.type === 'progress') {
        this.state.hashesCalculated += data.hashes_calculated - (this.state.hashesCalculated % data.hashes_calculated); // Approximate for UI
        this.state.totalTime += data.elapsed_time; // Cumulative
        this.state.hashRate = data.hashes_calculated / data.elapsed_time;
        this.notify();
      } else if (data.type === 'result') {
        if (data.success) {
          this.state.isMining = false;
          this.state.success = true;
          this.state.winningNonce = data.winning_nonce;
          this.state.computedHash = data.computed_hash;
          this.notify();
          this.stopMining();
        } else {
          // Range exhausted! Trigger the Continuous Adjustment Loop
          this.triggerTemplateAdjustment();
        }
      }
    };

    this.worker.onerror = (err) => {
      console.error('Mining worker error:', err);
      this.stopMining();
    };

    if (this.currentParams) {
      // Apply current rolling state to params before sending
      const dynamicParams: MiningParams = {
        ...this.currentParams,
        merkle_root: this.state.currentMerkleRoot,
        timestamp: this.state.currentTimestamp,
      };
      this.worker.postMessage(dynamicParams);
    }
  }

  private triggerTemplateAdjustment() {
    if (!this.state.isMining) return;

    // 1. Increment ExtraNonce
    this.state.extraNonce++;
    this.state.templateUpdates++;

    // 2. Tweak Merkle Root (Simulated: in real mining, we'd rebuild Coinbase and propagate up)
    // We'll mutate the Merkle Root slightly to create a fresh search space
    this.state.currentMerkleRoot = this.generateNewMerkleRoot(this.state.currentMerkleRoot);
    
    // 3. Reset Worker with new template
    this.initWorker();
    this.notify();
  }

  private generateNewMerkleRoot(oldRoot: string): string {
    // For the simulation, we'll just increment a part of the hex or append/hash it
    // In a real ASIC miner, changing ExtraNonce changes the Merkle Root completely.
    const part = parseInt(oldRoot.substring(0, 8), 16);
    const newPart = ((part + 1) % 0xFFFFFFFF).toString(16).padStart(8, '0');
    return newPart + oldRoot.substring(8);
  }

  private startRollingUpdates() {
    if (this.rollingUpdateTimer) clearInterval(this.rollingUpdateTimer);
    
    this.rollingUpdateTimer = setInterval(() => {
      if (!this.state.isMining) return;

      // Update Timestamp every 10 seconds to reflect real-time network conditions
      this.state.currentTimestamp = Math.floor(Date.now() / 1000);
      this.state.templateUpdates++;
      
      // Re-init worker with updated timestamp template
      this.initWorker();
      this.notify();
    }, 10000);
  }

  public stopMining() {
    this.terminateWorker();
    if (this.rollingUpdateTimer) {
      clearInterval(this.rollingUpdateTimer);
      this.rollingUpdateTimer = null;
    }
    this.state.isMining = false;
    this.notify();
  }

  private terminateWorker() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

export const GLOBAL_SOLO_MINING_ENGINE = new SoloMiningEngine();


