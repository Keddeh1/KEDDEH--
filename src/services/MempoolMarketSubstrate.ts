import { PROVENANCE_SERVICE } from './ProvenanceService';

export interface MarketData {
  priceUsd: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  lastUpdate: string;
}

export interface MempoolBlock {
  height: number;
  hash: string;
  timestamp: number;
  txCount: number;
  size: number;
  weight: number;
  feeRange: [number, number];
}

export interface GlobalVector {
  location: string;
  timestamp: string;
  offset: number;
}

export interface TelemetryState {
  market: MarketData;
  mempool: {
    blocks: MempoolBlock[];
    suggestedFees: {
      fastest: number;
      halfHour: number;
      hour: number;
      economy: number;
      minimum: number;
    };
  };
  vectors: GlobalVector[];
  isSynced: boolean;
}

type Subscriber = (state: TelemetryState) => void;

class MempoolMarketSubstrate {
  private state: TelemetryState = {
    market: { priceUsd: 0, change24h: 0, marketCap: 0, volume24h: 0, lastUpdate: '' },
    mempool: {
      blocks: [],
      suggestedFees: { fastest: 0, halfHour: 0, hour: 0, economy: 0, minimum: 0 }
    },
    vectors: [],
    isSynced: false
  };

  private subscribers: Set<Subscriber> = new Set();
  private interval: ReturnType<typeof setInterval> | null = null;
  private pulseInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.initVectors();
    this.startPulse();
    this.startSync();
  }

  private initVectors() {
    this.state.vectors = [
      { location: 'UTC (Core)', timestamp: '', offset: 0 },
      { location: 'Tokyo (Vector-East)', timestamp: '', offset: 9 },
      { location: 'New York (Vector-West)', timestamp: '', offset: -4 },
      { location: 'London (Substrate-Node)', timestamp: '', offset: 1 }
    ];
  }

  private startPulse() {
    this.pulseInterval = setInterval(() => {
      const now = new Date();
      this.state.vectors = this.state.vectors.map(v => {
        const d = new Date(now.getTime() + v.offset * 3600000);
        return { ...v, timestamp: d.toLocaleTimeString([], { hour12: false }) };
      });
      this.notify();
    }, 1000);
  }

  private async startSync() {
    // Initial fetch
    this.syncAll();
    // Regular sync every 30 seconds
    this.interval = setInterval(() => this.syncAll(), 30000);
  }

  private async syncAll() {
    try {
      const fetchJson = async (url: string) => {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Received non-JSON response from server');
        }
        return response.json();
      };

      const [priceData, mempoolBlocks, fees] = await Promise.allSettled([
        fetchJson('/api/market'),
        fetchJson('/api/mempool/blocks'),
        fetchJson('/api/mempool/fees')
      ]);

      if (priceData.status === 'fulfilled' && priceData.value.bitcoin) {
        const btc = priceData.value.bitcoin;
        this.state.market = {
          priceUsd: btc.usd || 0,
          change24h: btc.usd_24h_change || 0,
          marketCap: btc.usd_market_cap || 0,
          volume24h: btc.usd_24h_vol || 0,
          lastUpdate: new Date().toISOString()
        };
      }

      if (mempoolBlocks.status === 'fulfilled' && Array.isArray(mempoolBlocks.value)) {
        this.state.mempool.blocks = mempoolBlocks.value.slice(0, 10).map((b: any) => ({
          height: b.height,
          hash: b.id || b.hash,
          timestamp: b.timestamp,
          txCount: b.tx_count || 0,
          size: b.size || 0,
          weight: b.weight || 0,
          feeRange: [b.extras?.minFee || 1, b.extras?.maxFee || 100]
        }));
      }

      if (fees.status === 'fulfilled' && fees.value) {
        const f = fees.value;
        this.state.mempool.suggestedFees = {
          fastest: f.fastestFee || 0,
          halfHour: f.halfHourFee || 0,
          hour: f.hourFee || 0,
          economy: f.economyFee || 0,
          minimum: f.minimumFee || 0
        };
      }

      this.state.isSynced = true;
      this.notify();
      
      // Log to provenance for transparency
      if (this.state.market.priceUsd > 0) {
        await PROVENANCE_SERVICE.logEvent('COMPLIANCE_CHECK', `Synchronized BTC Market & Mempool Substrate`, [
          BigInt(Math.floor(this.state.market.priceUsd)), 
          BigInt(this.state.mempool.blocks[0]?.height || 0), 
          1n
        ]);
      }

    } catch (err) {
      console.error('[Telemetry] Sync failed:', err.message);
    }
  }

  private notify() {
    const copy = JSON.parse(JSON.stringify(this.state));
    this.subscribers.forEach(sub => sub(copy));
  }

  public subscribe(sub: Subscriber) {
    this.subscribers.add(sub);
    sub(JSON.parse(JSON.stringify(this.state)));
    return () => this.subscribers.delete(sub);
  }

  public getState() {
    return JSON.parse(JSON.stringify(this.state));
  }
}

export const GLOBAL_MARKET_TELEMETRY = new MempoolMarketSubstrate();
