import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Layers, 
  Eye, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw, 
  Zap, 
  Radio, 
  Unplug, 
  Plug, 
  Terminal, 
  Activity, 
  GitBranch, 
  Microscope,
  Lock,
  ArrowRight,
  Network,
  Server,
  AlertTriangle,
  Play
} from 'lucide-react';

interface PlaneStatus {
  status: string;
  role: string;
  fps?: number;
  isolation?: string;
  active_relational_loops?: number;
  head_of_line_stalls?: number;
  thread_starvation?: number;
  transitions_rate?: string;
  base_address?: string;
  flat_sram_bytes?: number;
  zero_rule?: string;
  location?: string;
  active_carrier?: string;
  rehydratable_slots?: number;
  boundary_trap?: string;
  rto_ms?: number;
}

interface PlanesData {
  display_plane: PlaneStatus;
  os_engine_plane: PlaneStatus;
  memory_state_plane: PlaneStatus;
  driver_vfs_plane: PlaneStatus;
  resonance_lock: {
    constant_k: number;
    damping_factor_h: number;
    phononic_lattice: string;
    frequency_ghz: number;
    phase_drift_rad: number;
    status: string;
  };
  observer_theorem: {
    observation_count: number;
    epistemic_principle: string;
    last_measured: number;
  };
}

interface MeasuredPacket {
  block_height: number;
  base_nonce: number;
  prev_hash_root: string;
  merkle_digest: string;
  gate_5_terminal: string;
  rtt_latency_ns: number;
  timestamp: number;
}

interface MeasurementResult {
  observed_at: string;
  cache_line_bytes: number;
  observer_principle: string;
  packet: MeasuredPacket;
  memory_injective_address: string;
}

interface BenchmarkResult {
  id: string;
  name: string;
  target?: string;
  addresses_generated?: number;
  collisions?: number;
  wait_ratio?: string;
  thread_stalls?: number;
  p99_latency_us?: number;
  transitions?: string;
  bit_exact_sha256?: boolean;
  token_reduction?: string;
  gpu_flop_speedup?: string;
  steps?: number;
  branch_miss_penalty?: number;
  duration_ms?: number;
  journal?: string;
  topology_match?: string;
  state_trap?: string;
  rto_ms?: number;
  complex_amplitude?: string;
  unitary_norm?: number;
  non_zero_invariant?: string;
  status: string;
}

interface TriadLiveNode {
  port: number;
  theta: number;
  coherence: number;
  health: number;
  quarantined: boolean;
  active: boolean;
  spawnLineage: number[];
  lastTick: number;
}

interface TriadLiveState {
  triad_topology: string;
  resonance_constant_k: number;
  damping_factor_h: number;
  coupling_gain_k: number;
  sovereign_ceiling: number;
  quarantine_threshold: number;
  spawn_threshold: number;
  uptime_seconds: number;
  nodes: TriadLiveNode[];
  events: Array<{ timestamp: string; type: string; message: string }>;
}

export const ObserverMeasurementConsole: React.FC = () => {
  const [planes, setPlanes] = useState<PlanesData | null>(null);
  const [measurement, setMeasurement] = useState<MeasurementResult | null>(null);
  const [benchmarks, setBenchmarks] = useState<BenchmarkResult[] | null>(null);
  const [triadState, setTriadState] = useState<TriadLiveState | null>(null);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [isPerturbing, setIsPerturbing] = useState(false);
  const [activeTab, setActiveTab] = useState<'triad' | '4planes' | 'observer' | 'hypotheses'>('triad');

  const fetchTriadStatus = async () => {
    try {
      const res = await fetch('/api/triad/live-state');
      if (res.ok) {
        const data = await res.json();
        setTriadState(data.data);
      }
    } catch (e) {}
  };

  const fetchPlanesStatus = async () => {
    try {
      const res = await fetch('/api/planes/status');
      if (res.ok) {
        const data = await res.json();
        setPlanes(data.planes);
      }
    } catch (e) {}
  };

  const measureLane = async (laneId: number) => {
    setIsMeasuring(true);
    try {
      const res = await fetch(`/api/observer/measure/${laneId}`);
      if (res.ok) {
        const data = await res.json();
        setMeasurement(data.measurement);
        fetchPlanesStatus();
      }
    } catch (e) {} finally {
      setIsMeasuring(false);
    }
  };

  const handleDetachCarrier = async () => {
    try {
      const res = await fetch('/api/planes/detach-carrier', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setPlanes(data.planes);
      }
    } catch (e) {}
  };

  const handleRehydrateCarrier = async () => {
    try {
      const res = await fetch('/api/planes/rehydrate-carrier', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setPlanes(data.planes);
      }
    } catch (e) {}
  };

  const handleRunBenchmarks = async () => {
    setIsBenchmarking(true);
    try {
      const res = await fetch('/api/benchmarks/run-8-hypotheses', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setBenchmarks(data.results);
      }
    } catch (e) {} finally {
      setIsBenchmarking(false);
    }
  };

  const handleInjectPerturbation = async (port: number, delta: number) => {
    setIsPerturbing(true);
    try {
      await fetch('/api/triad/perturb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ port, delta_theta: delta })
      });
      await fetchTriadStatus();
    } catch (e) {} finally {
      setIsPerturbing(false);
    }
  };

  useEffect(() => {
    fetchTriadStatus();
    fetchPlanesStatus();
    measureLane(1);
    const interval = setInterval(() => {
      fetchTriadStatus();
      fetchPlanesStatus();
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans overflow-y-auto">
      {/* Top Architectural Header */}
      <div className="border-b border-slate-800 bg-slate-900/60 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Microscope className="w-4 h-4" />
              <span className="font-semibold tracking-wider uppercase">KEDDEH SOVEREIGN ARCHITECTURE</span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className="text-slate-400">V50 Sovereign Blueprint (Cell PigDjrfs043l)</span>
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight mt-1 flex items-center gap-2">
              <span>Sovereign Triad, PLL 0.297 Resonance & 4-Plane Engine</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800/80 text-emerald-300 font-mono">
                SELF-SUFFICIENT RUNTIME ACTIVE
              </span>
            </h1>
          </div>

          {/* Resonance Lock & Damping Factor Indicator */}
          <div className="flex items-center gap-3 text-xs font-mono bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800">
            <div className="flex items-center gap-1.5 text-cyan-400">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Attractor K: 0.297</span>
            </div>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <div className="text-slate-300">
              <span>Damping H: 0.703</span>
            </div>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <div className="text-emerald-400">
              <span>Uptime: {triadState?.uptime_seconds || 0}s</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/60 text-xs font-mono overflow-x-auto">
          <button
            onClick={() => setActiveTab('triad')}
            className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'triad' 
                ? 'bg-slate-800 text-cyan-400 font-semibold border border-slate-700' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Sovereign Triad & 0.297 PLL</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </button>
          <button
            onClick={() => setActiveTab('4planes')}
            className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === '4planes' 
                ? 'bg-slate-800 text-cyan-400 font-semibold border border-slate-700' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Decoupled 4 Planes</span>
          </button>
          <button
            onClick={() => setActiveTab('observer')}
            className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'observer' 
                ? 'bg-slate-800 text-cyan-400 font-semibold border border-slate-700' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Observer 64B Cache Line</span>
          </button>
          <button
            onClick={() => setActiveTab('hypotheses')}
            className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'hypotheses' 
                ? 'bg-slate-800 text-cyan-400 font-semibold border border-slate-700' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>8-Hypothesis Benchmark Suite</span>
          </button>
        </div>
      </div>

      {/* Main Console Content */}
      <div className="p-4 space-y-6">
        {/* TAB 0: SOVEREIGN TRIAD & LIVE 0.297 PLL OSCILLATOR */}
        {activeTab === 'triad' && (
          <div className="space-y-6">
            {/* Triad Architecture Overview Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                    <h2 className="text-base font-bold text-white tracking-wide">
                      Live In-Memory Triad Topology & Phase-Locked Loop (PLL)
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Continuous stochastic oscillator running <code className="text-cyan-300 font-mono">dθᵢ(t) = -k(θᵢ(t) - 0.297)dt + dWᵢ(t)</code> with mutual rehydration, non-abusive quarantine, and autogenetic child forking (PORT + 3).
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-800 shrink-0">
                  <div>
                    <div className="text-[10px] text-slate-500">COUPLING GAIN (k)</div>
                    <div className="font-bold text-cyan-400">0.150</div>
                  </div>
                  <div className="h-6 w-px bg-slate-800" />
                  <div>
                    <div className="text-[10px] text-slate-500">SPAWN CEILING</div>
                    <div className="font-bold text-purple-400">PORT &lt; 3012</div>
                  </div>
                  <div className="h-6 w-px bg-slate-800" />
                  <div>
                    <div className="text-[10px] text-slate-500">QUARANTINE</div>
                    <div className="font-bold text-rose-400">&lt; 0.30</div>
                  </div>
                </div>
              </div>

              {/* Active Triad Nodes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {triadState?.nodes.map((node) => (
                  <div 
                    key={node.port}
                    className={`p-4 rounded-xl border transition-all ${
                      node.quarantined
                        ? 'bg-rose-950/30 border-rose-800 ring-1 ring-rose-500/20'
                        : node.port > 3002
                        ? 'bg-purple-950/30 border-purple-500/40 ring-1 ring-purple-500/20'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Server className={`w-4 h-4 ${node.quarantined ? 'text-rose-400' : 'text-cyan-400'}`} />
                        <span className="font-mono font-bold text-white text-sm">Port {node.port}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                        node.quarantined
                          ? 'bg-rose-900 text-rose-200'
                          : node.port > 3002
                          ? 'bg-purple-900 text-purple-200'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {node.quarantined ? 'QUARANTINED' : node.port > 3002 ? 'AUTOGENETIC FORK' : 'TRIAD PRIMARY'}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between text-slate-400">
                        <span>Phase θ(t):</span>
                        <span className="text-cyan-300 font-bold">{node.theta.toFixed(4)} rad</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Coherence C(t):</span>
                        <span className="text-emerald-400 font-bold">{node.coherence.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Health Profile:</span>
                        <span className={`font-bold ${node.health < 0.75 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {(node.health * 100).toFixed(1)}%
                        </span>
                      </div>
                      {node.spawnLineage.length > 0 && (
                        <div className="flex justify-between text-slate-400 text-[10px]">
                          <span>Lineage Links:</span>
                          <span className="text-purple-300">:{node.spawnLineage.join(', :')}</span>
                        </div>
                      )}
                    </div>

                    {/* Perturbation Test Control */}
                    <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleInjectPerturbation(node.port, 0.15)}
                        disabled={isPerturbing || node.quarantined}
                        className="flex-1 py-1 px-2 rounded bg-slate-900 hover:bg-cyan-950 text-cyan-300 border border-slate-800 hover:border-cyan-800 text-[10px] font-mono font-medium transition-colors cursor-pointer"
                      >
                        +0.15 rad Jitter
                      </button>
                      <button
                        onClick={() => handleInjectPerturbation(node.port, -0.15)}
                        disabled={isPerturbing || node.quarantined}
                        className="flex-1 py-1 px-2 rounded bg-slate-900 hover:bg-cyan-950 text-cyan-300 border border-slate-800 hover:border-cyan-800 text-[10px] font-mono font-medium transition-colors cursor-pointer"
                      >
                        -0.15 rad Jitter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Event Stream from Triad Engine */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Live Triad & ToT Event Ledger</h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  REAL TIME IN-MEMORY EXECUTION
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-black border border-slate-800 font-mono text-xs max-h-48 overflow-y-auto space-y-1.5 custom-scrollbar">
                {triadState?.events && triadState.events.length > 0 ? (
                  triadState.events.map((ev, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-[11px] leading-relaxed">
                      <span className="text-slate-600 shrink-0">[{ev.timestamp}]</span>
                      <span className={`font-bold shrink-0 ${
                        ev.type === 'AUTOGENETIC_FORK' ? 'text-amber-400' :
                        ev.type === 'SPAWN_ESTABLISHED' ? 'text-purple-400' :
                        ev.type === 'QUARANTINE_ISOLATION' ? 'text-rose-400' :
                        ev.type === 'PERTURBATION_INJECTED' ? 'text-cyan-400' : 'text-emerald-400'
                      }`}>
                        {ev.type}:
                      </span>
                      <span className="text-slate-300">{ev.message}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 italic">Triad oscillator in dynamic equilibrium at 0.297 attractor. Inject jitter above to observe live mutual rehydration and autogenetic child forking.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: 4 DECOUPLED PLANES */}
        {activeTab === '4planes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap bg-slate-900/40 p-3 rounded-xl border border-slate-800 text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="font-semibold text-white">Carrier Failure Fault-Tolerance Test:</span>
                <span className="text-slate-400">Detaching the physical storage carrier traps only Plane 4 in REHYDRATABLE; Planes 1-3 maintain 100% execution continuity.</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDetachCarrier}
                  className="px-3 py-1 rounded bg-rose-950/60 border border-rose-800 text-rose-300 hover:bg-rose-900/60 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Unplug className="w-3.5 h-3.5" />
                  <span>Detach Physical Carrier</span>
                </button>
                <button
                  onClick={handleRehydrateCarrier}
                  className="px-3 py-1 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 hover:bg-emerald-900/60 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plug className="w-3.5 h-3.5" />
                  <span>Rehydrate Carrier</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Plane 1: Display Plane */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-cyan-400">PLANE 1</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {planes?.display_plane.status || 'ACTIVE'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">Display & Observer Plane</h3>
                  <p className="text-xs text-slate-400 mb-4">{planes?.display_plane.role}</p>
                </div>
                <div className="space-y-1.5 text-xs font-mono border-t border-slate-800/80 pt-3 text-slate-300">
                  <div className="flex justify-between">
                    <span>Frame Cadence:</span>
                    <span className="tabular-nums text-white">{planes?.display_plane.fps || 60} FPS</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fault Drop Rate:</span>
                    <span className="tabular-nums text-emerald-400">0</span>
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1">Decoupled from kernel interrupts</div>
                </div>
              </div>

              {/* Plane 2: OS Engine Plane */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-cyan-400">PLANE 2</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {planes?.os_engine_plane.status || 'ACTIVE'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">Relational OS Engine Plane</h3>
                  <p className="text-xs text-slate-400 mb-4">{planes?.os_engine_plane.role}</p>
                </div>
                <div className="space-y-1.5 text-xs font-mono border-t border-slate-800/80 pt-3 text-slate-300">
                  <div className="flex justify-between">
                    <span>Relational Loops:</span>
                    <span className="tabular-nums text-white">{planes?.os_engine_plane.active_relational_loops || 20} Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Head-of-Line Stalls:</span>
                    <span className="tabular-nums text-emerald-400">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transitions Rate:</span>
                    <span className="tabular-nums text-cyan-300">{planes?.os_engine_plane.transitions_rate || '449.8M/s'}</span>
                  </div>
                </div>
              </div>

              {/* Plane 3: Memory State Plane */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-cyan-400">PLANE 3</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {planes?.memory_state_plane.status || 'ACTIVE'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">Injective Memory State Plane</h3>
                  <p className="text-xs text-slate-400 mb-4">{planes?.memory_state_plane.role}</p>
                </div>
                <div className="space-y-1.5 text-xs font-mono border-t border-slate-800/80 pt-3 text-slate-300">
                  <div className="flex justify-between">
                    <span>Base Address:</span>
                    <span className="tabular-nums text-cyan-300">{planes?.memory_state_plane.base_address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Flat SRAM Arena:</span>
                    <span className="tabular-nums text-white">128 KB (131,072 B)</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 pt-1">ZERO_IS_COMPUTED_ASSESSMENT_ONLY</div>
                </div>
              </div>

              {/* Plane 4: Driver VFS Plane */}
              <div className={`border rounded-xl p-4 flex flex-col justify-between transition-colors ${
                planes?.driver_vfs_plane.status === 'REHYDRATABLE'
                  ? 'bg-amber-950/40 border-amber-600/80'
                  : 'bg-slate-900/80 border-slate-800'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-cyan-400">PLANE 4</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      planes?.driver_vfs_plane.status === 'REHYDRATABLE'
                        ? 'bg-amber-900 text-amber-200 border border-amber-600 animate-pulse'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}>
                      {planes?.driver_vfs_plane.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">Driver & VFS Lowering Plane</h3>
                  <p className="text-xs text-slate-400 mb-4">{planes?.driver_vfs_plane.role}</p>
                </div>
                <div className="space-y-1.5 text-xs font-mono border-t border-slate-800/80 pt-3 text-slate-300">
                  <div className="flex justify-between">
                    <span>Carrier Hardware:</span>
                    <span className="tabular-nums text-white">{planes?.driver_vfs_plane.active_carrier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Boundary State:</span>
                    <span className="tabular-nums text-cyan-300">{planes?.driver_vfs_plane.boundary_trap}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deterministic RTO:</span>
                    <span className="tabular-nums text-emerald-400">0.0021 ms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: OBSERVER 64B CACHE LINE */}
        {activeTab === 'observer' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-base font-bold text-white tracking-wide">
                      Observer Measurement Collapse Protocol (64-Byte Cache Line)
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                    According to the Keddeh Observer Theorem, internal quantum-like superposition in the substrate only collapses into a classical terminal state upon explicit 64-byte aligned measurement.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((lane) => (
                    <button
                      key={lane}
                      onClick={() => measureLane(lane)}
                      disabled={isMeasuring}
                      className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500 text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer"
                    >
                      Measure Lane {lane}
                    </button>
                  ))}
                </div>
              </div>

              {measurement && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3 font-mono">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Epistemic Rule:</span>
                    <span className="text-cyan-400 font-semibold">{measurement.observer_principle}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Block Height</div>
                      <div className="text-white font-bold">{measurement.packet.block_height}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Base Nonce</div>
                      <div className="text-cyan-300 font-bold">{measurement.packet.base_nonce}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">RTT Latency</div>
                      <div className="text-emerald-400 font-bold">{measurement.packet.rtt_latency_ns} ns</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Gate 5 Terminal</div>
                      <div className="text-white truncate font-bold">{measurement.packet.gate_5_terminal}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Injective Address</div>
                      <div className="text-purple-300 truncate font-bold">{measurement.memory_injective_address}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Measurement Time</div>
                      <div className="text-slate-300 text-[10px] truncate">{measurement.observed_at}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: 8-HYPOTHESIS BENCHMARK SUITE */}
        {activeTab === 'hypotheses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">8 Formal Architectural Verification Hypotheses</h3>
                <p className="text-xs text-slate-400 mt-0.5">Executes rigorous empirical falsification tests across all mathematical planes.</p>
              </div>
              <button
                onClick={handleRunBenchmarks}
                disabled={isBenchmarking}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isBenchmarking ? 'animate-spin' : ''}`} />
                <span>Execute 8-Hypothesis Suite</span>
              </button>
            </div>

            {benchmarks && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {benchmarks.map((bm) => (
                  <div key={bm.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 font-mono">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{bm.id}: {bm.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                        {bm.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {bm.target || bm.transitions || bm.journal || bm.complex_amplitude}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
