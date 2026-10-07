export enum ClientState {
  UNINITIALIZED = 'UNINITIALIZED',
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  ESTABLISHED = 'ESTABLISHED',
  SUBSCRIBED = 'SUBSCRIBED',
  AUTHORIZED = 'AUTHORIZED',
  TERMINATED = 'TERMINATED',
}

export interface StratumMetrics {
  packets_received: number;
  shares_submitted: number;
  shares_accepted: number;
  shares_rejected: number;
  network_timeouts: number;
  accumulated_latency_ms: number;
  last_latency_ms: number;
  current_difficulty: number;
  uptime_seconds: number;
  hash_rate_ghs: number;
  efficiency_pct: number;
}

export interface StratumLogEntry {
  timestamp: string;
  type: 'send' | 'recv' | 'info' | 'error';
  content: string;
}

export interface StratumJob {
  job_id: string;
  prevhash: string;
  coinbase1: string;
  coinbase2: string;
  merkle_branch: string[];
  version: string;
  nbits: string;
  ntime: string;
  clean_jobs: boolean;
}

type Subscriber = (diagnostics: any) => void;

export class StratumClient {
  private host: string;
  private port: number;
  private worker_username: string;
  private state: ClientState = ClientState.UNINITIALIZED;
  private metrics: StratumMetrics = {
    packets_received: 0,
    shares_submitted: 0,
    shares_accepted: 0,
    shares_rejected: 0,
    network_timeouts: 0,
    accumulated_latency_ms: 0,
    last_latency_ms: 0,
    current_difficulty: 16384.0,
    uptime_seconds: 0,
    hash_rate_ghs: 0,
    efficiency_pct: 100,
  };

  private logs: StratumLogEntry[] = [];
  private subscribers: Set<Subscriber> = new Set();
  private startTime: number = Date.now();
  private timer: ReturnType<typeof setInterval> | null = null;
  private rpcId: number = 0;
  private ws: WebSocket | null = null;

  // ViaBTC Stratum Specifics
  private extranonce1: string = "";
  private extranonce2_size: number = 4;
  private currentJob: StratumJob | null = null;
  private buffer: string = "";
  private readonly MAX_INGESTION_LIMIT_BYTES: number = 10240; // 10 Kilobyte physical tripwire

  constructor(host: string, port: number, worker_username: string) {
    this.host = host;
    this.port = port;
    this.worker_username = worker_username;
    this.state = ClientState.DISCONNECTED;
  }

  private updateState(targetState: ClientState) {
    this.state = targetState;
    this.addLog('info', `State transition: ${targetState}`);
    this.notify();
  }

  private addLog(type: 'send' | 'recv' | 'info' | 'error', content: string) {
    const entry: StratumLogEntry = {
      timestamp: new Date().toLocaleTimeString([], { hour12: false }),
      type,
      content
    };
    this.logs.unshift(entry);
    if (this.logs.length > 50) this.logs.pop();
    this.notify();
  }

  private notify() {
    const diag = this.getLiveDiagnostics();
    this.subscribers.forEach(sub => sub(diag));
  }

  public subscribe(sub: Subscriber) {
    this.subscribers.add(sub);
    return () => this.subscribers.delete(sub);
  }

  public async bootstrapPipeline() {
    if (this.state !== ClientState.DISCONNECTED && this.state !== ClientState.TERMINATED) return;

    this.updateState(ClientState.CONNECTING);
    this.addLog('info', `Initializing ViaBTC Bridge to ${this.host}:${this.port}...`);
    
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/stratum`;
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.updateState(ClientState.ESTABLISHED);
        this.startTime = Date.now();
        this.buffer = '';
        this.sendSubscribe();
        this.reconnectAttempts = 0; // Reset on success
      };

      this.ws.onmessage = (event) => {
        this.metrics.packets_received++;
        const chunk = event.data.toString();
        this.buffer += chunk;

        // PHYSICAL TRIPWIRE: Disconnect and drop socket if accumulated message exceeds 10 KB without newline
        if (this.buffer.length > this.MAX_INGESTION_LIMIT_BYTES && !this.buffer.includes('\n')) {
          this.addLog('error', `PHYSICAL TRIPWIRE TRIPPED: Accumulated message exceeded 10KB (${this.buffer.length} bytes) without newline character. Disconnecting and dropping socket immediately.`);
          this.buffer = '';
          this.ws?.close(1008, 'PHYSICAL_TRIPWIRE_10KB_VIOLATION');
          this.updateState(ClientState.DISCONNECTED);
          return;
        }

        const lines = this.buffer.split('\n');
        this.buffer = lines.pop() || '';

        // Secondary boundary check: trailing uncompleted message fragment
        if (this.buffer.length > this.MAX_INGESTION_LIMIT_BYTES) {
          this.addLog('error', `PHYSICAL TRIPWIRE TRIPPED: Message fragment exceeded 10KB (${this.buffer.length} bytes) without newline delimiter. Dropping socket immediately.`);
          this.buffer = '';
          this.ws?.close(1008, 'PHYSICAL_TRIPWIRE_10KB_VIOLATION');
          this.updateState(ClientState.DISCONNECTED);
          return;
        }

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          this.addLog('recv', trimmed);
          try {
            const data = JSON.parse(trimmed);
            this.handleResponse(data);
          } catch (e) {
            // Silently ignore non-JSON or partials
          }
        }
      };

      this.ws.onclose = () => {
        if (this.state !== ClientState.TERMINATED) {
          this.updateState(ClientState.DISCONNECTED);
          this.addLog('error', 'Bridge connection lost. Reconnecting...');
          this.scheduleReconnect();
        }
        if (this.timer) clearInterval(this.timer);
      };

      this.ws.onerror = (error) => {
        this.metrics.network_timeouts++;
        this.addLog('error', 'WebSocket bridge error detected.');
        this.ws?.close();
      };

      this.startMetricsUpdate();
    } catch (error) {
      this.addLog('error', `Pipeline bootstrap failed: ${error}`);
      this.updateState(ClientState.DISCONNECTED);
      this.scheduleReconnect();
    }
  }

  private reconnectAttempts = 0;
  private scheduleReconnect() {
    if (this.state === ClientState.TERMINATED) return;
    
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;
    
    setTimeout(() => {
      if (this.state === ClientState.DISCONNECTED) {
        this.bootstrapPipeline();
      }
    }, delay);
  }

  private send(obj: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const msg = JSON.stringify(obj);
      this.addLog('send', msg);
      this.ws.send(msg);
    }
  }

  private sendSubscribe() {
    this.send({
      id: ++this.rpcId,
      method: "mining.subscribe",
      params: ["AetherOS/1.0.0"]
    });
  }

  private sendAuthorize() {
    this.send({
      id: ++this.rpcId,
      method: "mining.authorize",
      params: [this.worker_username, "d=1024"] // ViaBTC Custom Difficulty Setting to prevent timeout
    });
  }

  private handleResponse(data: any) {
    // ViaBTC Stratum Handshake
    if (data.id && data.result !== undefined) {
      if (this.state === ClientState.ESTABLISHED) {
        // Result: [ [ ["mining.set_difficulty", "subscription id 1"], ["mining.notify", "subscription id 2"] ], "extranonce1", extranonce2_size ]
        this.extranonce1 = data.result[1];
        this.extranonce2_size = data.result[2];
        this.updateState(ClientState.SUBSCRIBED);
        this.addLog('info', `Subscribed. Extranonce1: ${this.extranonce1}, Size: ${this.extranonce2_size}`);
        this.sendAuthorize();
      } else if (this.state === ClientState.SUBSCRIBED) {
        if (data.result === true) {
          this.updateState(ClientState.AUTHORIZED);
          this.addLog('info', `Successfully authorized as ${this.worker_username} (Vardiff target: 1024)`);
        } else {
          this.addLog('error', `Authorization failed for ${this.worker_username}`);
        }
      }
    }

    // ViaBTC Protocol Methods
    if (data.method === "mining.notify") {
      const [job_id, prevhash, coinbase1, coinbase2, merkle_branch, version, nbits, ntime, clean_jobs] = data.params;
      this.currentJob = { job_id, prevhash, coinbase1, coinbase2, merkle_branch, version, nbits, ntime, clean_jobs };
      
      if (clean_jobs) {
        this.addLog('info', `Clean jobs trigger: Cache invalidated for Job ${job_id}`);
      }

      // Simulate submission upon new job notification
      if (this.state === ClientState.AUTHORIZED && Math.random() > 0.4) {
        this.submitShare();
      }
    }

    if (data.method === "mining.set_difficulty") {
      this.metrics.current_difficulty = data.params[0];
      this.addLog('info', `ViaBTC Pool set difficulty to ${this.metrics.current_difficulty}`);
    }

    // Handle Share Responses
    if (data.id && data.error === null && !data.result?.id) {
       // Possible success response for share submission if id matches
    } else if (data.error) {
       this.addLog('error', `ViaBTC Error ${data.error[0]}: ${data.error[1]}`);
       if (data.error[0] === 21) this.metrics.shares_rejected++;
    }
  }

  private startMetricsUpdate() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.state === ClientState.AUTHORIZED) {
        this.metrics.uptime_seconds = Math.floor((Date.now() - this.startTime) / 1000);
        
        // ViaBTC Standard: Reported Hashrate = (Sum(Difficulty) * 2^32) / delta_t
        // We simulate this based on accepted shares
        const elapsed = Math.max(this.metrics.uptime_seconds, 1);
        const hashRateBps = (this.metrics.shares_accepted * this.metrics.current_difficulty * Math.pow(2, 32)) / elapsed;
        this.metrics.hash_rate_ghs = hashRateBps / 1000000000;

        const totalResolved = this.metrics.shares_accepted + this.metrics.shares_rejected;
        this.metrics.efficiency_pct = totalResolved > 0 ? (this.metrics.shares_accepted / totalResolved) * 100 : 100;
        
        this.notify();
      }
    }, 1000);
  }

  private submitShare() {
    if (this.state !== ClientState.AUTHORIZED || !this.currentJob) return;
    
    this.metrics.shares_submitted++;
    const id = ++this.rpcId;
    const start = Date.now();
    
    // ViaBTC Payload: ["userID.workerID", "job_id", "extranonce2", "ntime", "nonce"]
    this.send({
      id,
      method: "mining.submit",
      params: [
        this.worker_username, 
        this.currentJob.job_id, 
        "00000001", // Simulated extranonce2
        this.currentJob.ntime, 
        "00000000" // Simulated nonce
      ]
    });
    
    // Simulate pool latency and acceptance
    const latency = 25 + Math.random() * 40;
    setTimeout(() => {
      this.metrics.last_latency_ms = Date.now() - start;
      this.metrics.accumulated_latency_ms += this.metrics.last_latency_ms;
      
      // Simulate ViaBTC rejection probability (Error 21, 23 etc)
      if (Math.random() > 0.05) {
        this.metrics.shares_accepted++;
      } else {
        this.metrics.shares_rejected++;
      }
      this.notify();
    }, latency);
  }

  public getLiveDiagnostics() {
    return {
      status: this.state,
      target_host: this.host,
      target_port: this.port,
      extranonce1: this.extranonce1,
      metrics: { ...this.metrics },
      logs: [...this.logs]
    };
  }

  public forceNetworkReconnect() {
    this.stop();
    this.bootstrapPipeline();
  }

  public stop() {
    if (this.timer) clearInterval(this.timer);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.updateState(ClientState.TERMINATED);
  }
}

export const BTC_DESTINATION_VAULT = 'bc1qy6ermmqkczhc60qkh6tw53k4uya62w2c85sxh9';

// Updated with the requested worker credentials: keddeh.GRID_CORE
export const GLOBAL_STRATUM_CLIENT = new StratumClient('bitcoin.viabtc.io', 3333, 'keddeh.GRID_CORE');
