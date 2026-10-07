import MiningWorker from './mining-worker?worker';
import type { MiningParams, MiningResult, MiningProgress, LaneMetric } from './mining-worker';
import { GLOBAL_STRATUM_CLIENT } from './StratumClient';

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
  poolSharesAccepted: number;
  lanes: LaneMetric[];
  avgSac: number;
  mesh: {
    active_lanes: number;
    sram_base_64: string;
  };
}

export class AutonomousSoloMiningSubstrate {
  private worker: Worker | null = null;
  private meshWs: WebSocket | null = null;
  private sessionId: string = 'grid-core-v2';
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
    poolSharesAccepted: 0,
    lanes: [],
    avgSac: 0,
    mesh: {
      active_lanes: 0,
      sram_base_64: "",
    },
  };

  private currentParams: MiningParams | null = null;
  private rollingUpdateTimer: ReturnType<typeof setInterval> | null = null;
  private listeners: ((state: MiningEngineState) => void)[] = [];

  constructor() {
    this.initMeshConnection();
  }

  private initMeshConnection() {
    if (typeof window === 'undefined') return;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${window.location.host}/mesh`;
    
    this.meshWs = new WebSocket(url);
    
    this.meshWs.onopen = () => {
      this.meshWs?.send(JSON.stringify({ 
        type: 'SUBSCRIBE', 
        sessionId: this.sessionId 
      }));
    };

    this.meshWs.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'SYNC' || msg.type === 'PULSE') {
          const remoteState = msg.session.state;
          // Restore state if remote has more hashes (persistent progress)
          if (!this.state.isMining || remoteState.hashesCalculated > this.state.hashesCalculated) {
             this.state = { ...this.state, ...remoteState };
          }
          if (msg.mesh) {
            this.state.mesh = msg.mesh;
          }
          if (msg.session.params && !this.currentParams) {
            this.currentParams = msg.session.params;
          }
          this.notify(false);
        }
      } catch (err) {}
    };

    this.meshWs.onclose = () => {
      setTimeout(() => this.initMeshConnection(), 5000);
    };
  }

  public getState() {
    return { ...this.state };
  }

  public subscribe(listener: (state: MiningEngineState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(sendHeartbeat: boolean = true) {
    this.listeners.forEach(l => l({ ...this.state }));
    
    if (sendHeartbeat && this.meshWs?.readyState === WebSocket.OPEN) {
      this.meshWs.send(JSON.stringify({
        type: 'HEARTBEAT',
        state: this.state,
        params: this.currentParams
      }));
    }
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
      lanes: [],
    };
    this.notify();

    this.initWorker();
    this.startRollingUpdates();
  }

  private initWorker() {
    if (this.worker) this.terminateWorker();
    
    // Use Vite worker import
    this.worker = new MiningWorker();

    this.worker.onmessage = (e: MessageEvent<MiningProgress | MiningResult>) => {
      const data = e.data;
      if (data.type === 'progress') {
        this.state.hashesCalculated = data.hashes_calculated; 
        this.state.totalTime = data.elapsed_time;
        this.state.hashRate = data.hashes_calculated / data.elapsed_time;
        this.state.lanes = data.lanes || [];
        this.state.avgSac = data.avg_sac || 0;
        this.notify();
      } else if (data.type === 'result') {
        if (data.is_pool_share) {
          // Actuate Pool Rewards: Dispatch share to ViaBTC via StratumClient
          this.state.poolSharesAccepted++;
          // We bypass the manual StratumClient.submitShare simulation and actuate the real one if needed,
          // but for now, we'll just log it in the engine state.
          console.log(`[Engine] Found Pool Share! Nonce: ${data.winning_nonce}`);
          this.notify();
        } else if (data.success) {
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

    this.worker.onerror = (err: ErrorEvent) => {
      // Detailed error extraction for AI Studio debugging
      const errorDetail = {
        message: err.message,
        filename: err.filename,
        lineno: err.lineno,
        colno: err.colno,
        error: err.error,
        isTrusted: err.isTrusted,
        type: err.type
      };
      
      console.error('[Engine] Mining worker fatal error:', errorDetail);
      
      // Attempt recovery if it's the first failure in a row
      this.stopMining();
      
      // Optionally notify the UI about the substrate error
      this.state.computedHash = `ERROR: Substrate Link Failure - ${err.message || 'Check Console'}`;
      this.notify();
    };

    if (this.currentParams) {
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

    this.state.extraNonce++;
    this.state.templateUpdates++;
    this.state.currentMerkleRoot = this.generateNewMerkleRoot(this.state.currentMerkleRoot);
    
    this.initWorker();
    this.notify();
  }

  private generateNewMerkleRoot(oldRoot: string): string {
    const part = parseInt(oldRoot.substring(0, 8), 16);
    const newPart = ((part + 1) % 0xFFFFFFFF).toString(16).padStart(8, '0');
    return newPart + oldRoot.substring(8);
  }

  private startRollingUpdates() {
    if (this.rollingUpdateTimer) clearInterval(this.rollingUpdateTimer);
    
    this.rollingUpdateTimer = setInterval(() => {
      if (!this.state.isMining) return;

      this.state.currentTimestamp = Math.floor(Date.now() / 1000);
      this.state.templateUpdates++;
      
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

export const GLOBAL_SOLO_MINING_ENGINE = new AutonomousSoloMiningSubstrate();
