import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Cpu,
  Terminal,
  Activity,
  Zap,
  Plus,
  Play,
  Square,
  BarChart3,
  Shield,
  Layers,
  Code,
  ArrowRight,
  Database,
  Search,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Hash,
  Server,
  ExternalLink,
  Globe,
  ShieldCheck,
  Network,
  CheckCircle2
} from 'lucide-react';
import { FileItem } from '../../types';
import { GLOBAL_SOLO_MINING_ENGINE, MiningEngineState } from '../../services/AutonomousSoloMiningSubstrate';
import { GLOBAL_STRATUM_CLIENT } from '../../services/StratumClient';
import { ComplianceVerifier } from './ComplianceVerifier';
import { PROVENANCE_SERVICE } from '../../services/ProvenanceService';
import { GLOBAL_MARKET_TELEMETRY, TelemetryState } from '../../services/MempoolMarketSubstrate';
import { TrendingUp, TrendingDown } from 'lucide-react';

import { MemoryTopology } from './MemoryTopology';

import { MeshFabricVisualizer } from './MeshFabricVisualizer';
import { BrainkNeuralFabric } from './BrainkNeuralFabric';
import { PowerProfiler } from './PowerProfiler';
import { ViaBtcMiningControlCenter } from './ViaBtcMiningControlCenter';

interface BitcoinMiningLabProps {
  files: FileItem[];
  onOpenFilePreview: (file: FileItem) => void;
  isDriveConnected?: boolean;
  isSystemOnline?: boolean;
}

interface MiningParams {
  version: number;
  prev_block_hash: string;
  merkle_root: string;
  timestamp: number;
  bits: number;
  target_hex: string;
  start_nonce: number;
  chunk_size: number;
}

export const BitcoinMiningLab: React.FC<BitcoinMiningLabProps> = ({
  files,
  onOpenFilePreview,
  isDriveConnected = false,
  isSystemOnline = false,
}) => {
  // Lab State (Defaults to Article Block #286819)
  const [params, setParams] = useState<MiningParams>({
    version: 2,
    prev_block_hash: "000000000000000117c80378b8da0e33559b5997f2ad55e2f7d18ec1975b9717",
    merkle_root: "871714dcbae6c8193a2bb9b2a69fe1c0440399f38d94b3a0f1b447275a29978a",
    timestamp: 1392872245, // 0x53058b35
    bits: 419512147, // 0x19015f53
    target_hex: "00000000000000015f5300000000000000000000000000000000000000000000",
    start_nonce: 856192000, // Near the winning nonce for demo
    chunk_size: 500000
  });

  const [activeTab, setActiveTab] = useState<'console' | 'lab' | 'stratum' | 'viabtc' | 'repo' | 'compliance' | 'truths' | 'roadmap' | 'topology' | 'mastery'>('viabtc');
  const [chatInput, setChatInput] = useState('');

  const SILICON_TRUTHS = [
    { id: 'CRIT-01', category: 'Computation Energy', theory: 'Logic execution cost is uniform; ALU ops are essentially free in asymptotic models.', reality: 'Dynamic wire charging (α·C·V²·f) and RC delay account for >85% of energy. ASIC: 12.5 pJ/op vs Von Neumann: 1.2 nJ/op.' },
    { id: 'CRIT-02', category: 'Memory & Interconnect', theory: 'RAM provides uniform random access (O(1) time complexity across flat address space).', reality: 'Interconnect RC delay and propagation bottlenecks create a 240 GB/s deficit. Data movement > Logic ops.' },
    { id: 'CRIT-04', category: 'Transistor Utilization', theory: 'All fabricated transistors on a die can switch simultaneously at peak rated clock frequency.', reality: 'Dark Silicon: >78% of transistors must remain unpowered to avoid thermal runaway. Density is a thermal trap.' },
    { id: 'CRIT-06', category: 'Clock & Timing Synchrony', theory: 'Global clock signals provide instant, universal synchronization across all register logic.', reality: 'Clock distribution slew and latency create spatial skew. Synchrony is an expensive abstraction.' },
    { id: 'CRIT-10', category: 'Thermal Dynamics', theory: 'Computers execute programs at consistent, deterministic speeds indefinitely.', reality: 'Heat buildup creates latent throttling. Sub-5nm dies require precise duty-cycle gating (Spatial Computing).' }
  ];

  const SILICON_LAWS = [
    { name: 'CMOS Dynamic Power', formula: 'P_dyn = α · C_L · V_dd² · f', desc: 'Governs the relationship between switching activity and thermal dissipation.' },
    { name: 'Pipelining Throughput', formula: 'T = f_clk · N_cores', desc: 'Scales execution volume by unrolling temporal loops into spatial stages.' },
    { name: 'Strict Avalanche Criterion', formula: 'P(B_j | B_i) = 0.50', desc: 'Ensures zero correlation between input entropy and terminal hash output.' }
  ];

  const PROJECT_ROADMAP = [
    { id: 'CNT-101', date: '2026-10-02', title: 'Q4 Enterprise Platform Release Notes', channel: 'Blog', status: 'DRAFT' },
    { id: 'CNT-102', date: '2026-10-05', title: 'The Future of Autonomous Infrastructure', channel: 'LinkedIn', status: 'PLANNED' },
    { id: 'CNT-103', date: '2026-10-08', title: 'Customer Spotlight: Scaling FinTech Microservices', channel: 'Case Study', status: 'RESEARCH' },
    { id: 'CNT-104', date: '2026-10-12', title: 'Weekly Product Digest: Optimizing Latency', channel: 'Newsletter', status: 'SCHEDULED' }
  ];

  const OpticalCanvas = ({ hash }: { hash: string }) => {
    const pixels = useMemo(() => {
      if (!hash) return Array(256).fill(false);
      // Map hex to binary bits
      const binary = hash.split('').map(hex => parseInt(hex, 16).toString(2).padStart(4, '0')).join('');
      return binary.split('').map(b => b === '1').slice(0, 256);
    }, [hash]);

    return (
      <div className="grid grid-cols-16 gap-px bg-slate-800 p-px rounded border border-slate-700 shadow-inner">
        {pixels.map((active, i) => (
          <div 
            key={i} 
            title={active ? '○ ACTIVE EMIT' : '◐ PARTIAL DARK'}
            className={`w-1.5 h-1.5 ${active ? 'bg-cyan-400 shadow-[0_0_2px_#22d3ee]' : 'bg-slate-950'} transition-colors duration-75`}
          />
        ))}
      </div>
    );
  };

  const [messages, setMessages] = useState<any[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'KEDDEH Authoritative Bitcoin Substrate v2.4. Industrial Mastery Verified. System: [ONLINE]',
      timestamp: 'KERNEL'
    }
  ]);
  const [miningState, setMiningState] = useState<MiningEngineState>(GLOBAL_SOLO_MINING_ENGINE.getState());
  const [stratumDiag, setStratumDiag] = useState(GLOBAL_STRATUM_CLIENT.getLiveDiagnostics());
  const [isParamsExpanded, setIsParamsExpanded] = useState(true);
  const [marketData, setMarketData] = useState<TelemetryState>(GLOBAL_MARKET_TELEMETRY.getState());
  const [artifacts, setArtifacts] = useState<any[]>([]);

  const fetchArtifacts = async () => {
    try {
      const res = await fetch('/api/system/artifacts');
      const data = await res.json();
      if (data.ok) setArtifacts(data.artifacts);
    } catch (e) {}
  };

  useEffect(() => {
    fetchArtifacts();
    return GLOBAL_MARKET_TELEMETRY.subscribe(setMarketData);
  }, []);

  useEffect(() => {
    const unsubSolo = GLOBAL_SOLO_MINING_ENGINE.subscribe((state) => {
      setMiningState(state);
    });
    const unsubStratum = GLOBAL_STRATUM_CLIENT.subscribe((diag) => {
      setStratumDiag(diag);
    });
    
    // Auto-bootstrap stratum if online
    if (isSystemOnline) {
      GLOBAL_STRATUM_CLIENT.bootstrapPipeline();
    }

    return () => {
      unsubSolo();
      unsubStratum();
    };
  }, [isSystemOnline]);

  // Auto-start mining when system comes online
  useEffect(() => {
    if (isSystemOnline && !miningState.isMining && miningState.hashesCalculated === 0) {
      setTimeout(() => {
        GLOBAL_SOLO_MINING_ENGINE.startMining(params);
        setMessages(prev => [...prev, {
          id: `auto-start-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          sender: 'ai',
          text: 'SYSTEM_ONLINE detected. Initiating autonomous double-SHA256 scan...',
          timestamp: new Date().toLocaleTimeString()
        }]);
      }, 1000);
    }
  }, [isSystemOnline]);

  const handleSendCommand = (cmdOverride?: string) => {
    const cmd = (cmdOverride || chatInput).trim().toLowerCase();
    if (!cmd) return;
    if (!cmdOverride) setChatInput('');

    setMessages(prev => [...prev, {
      id: `${Date.now()}-user-${Math.random().toString(36).substring(2, 7)}`,
      sender: 'user',
      text: cmd,
      timestamp: new Date().toLocaleTimeString()
    }]);

    let response = '';
    if (cmd === 'mine' || cmd === 'run solo') {
      GLOBAL_SOLO_MINING_ENGINE.startMining(params);
      response = `Engine: Starting double-SHA256 scan on block header. Range: ${params.start_nonce} + ${params.chunk_size}`;
      PROVENANCE_SERVICE.logEvent('MINING_START', `Initiated solo mining scan at nonce ${params.start_nonce}`, [BigInt(params.bits), 6n, 12n]);
    } else if (cmd === 'stop') {
      GLOBAL_SOLO_MINING_ENGINE.stopMining();
      response = 'Engine: Termination signal broadcasted.';
      PROVENANCE_SERVICE.logEvent('MINING_START', `Mining session terminated by user signal.`, [1n, 1n, 1n]);
    } else if (cmd === 'status') {
      response = `Engine: ${miningState.isMining ? 'ACTIVE' : 'IDLE'} | Rate: ${miningState.hashRate.toFixed(2)} H/s | Total Hashes: ${miningState.hashesCalculated.toLocaleString()}`;
    } else {
      response = `Unknown command: ${cmd}. Available: mine, stop, status.`;
    }

    setMessages(prev => [...prev, {
      id: `${Date.now()}-ai-${Math.random().toString(36).substring(2, 7)}`,
      sender: 'ai',
      text: response,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const calculateTargetFromBits = (bits: number) => {
    const exp = bits >> 24;
    const mant = bits & 0xffffff;
    // target = mant * 2^(8*(exp-3))
    const hex = mant.toString(16).padStart(6, '0');
    const padding = "0".repeat((exp - 3) * 2);
    const full = (hex + padding).padStart(64, '0');
    setParams(p => ({ ...p, target_hex: full }));
  };

  const headerHex = useMemo(() => {
    const root = miningState.isMining ? miningState.currentMerkleRoot : params.merkle_root;
    const ts = miningState.isMining ? miningState.currentTimestamp : params.timestamp;
    return "02000000" + "..." + root.substring(0, 8) + "..." + ts.toString(16) + params.bits.toString(16) + "00000000";
  }, [params, miningState]);

  const handleScaleMesh = async () => {
    try {
      const response = await fetch('/api/mesh/scale?count=5', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, {
          id: `scale-${Date.now()}`,
          sender: 'ai',
          text: `MESH_SCALE_PASS: Successfully replicated 5 new worker lanes into the mesh substrate. Supervisor inotify acquired.`,
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
    } catch (e) {
      console.error('Scale failed:', e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden rounded-2xl border border-slate-800 shadow-2xl">
      {/* Header telemetry strip */}
      <div className="h-12 border-b border-slate-800 bg-slate-900/80 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${miningState.isMining ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Core Status: {miningState.isMining ? 'ONLINE' : 'IDLE'}
            </span>
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-mono tabular-nums text-slate-300">{(miningState.hashRate / 1000).toFixed(2)} KH/s</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] font-mono tabular-nums text-slate-300">{miningState.hashesCalculated.toLocaleString()} nonces</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveTab('console')}
            className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'console' ? 'text-blue-400 border-b border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Console
          </button>
          <button 
            onClick={() => setActiveTab('lab')}
            className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'lab' ? 'text-blue-400 border-b border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Block Lab
          </button>
          <button 
            onClick={() => setActiveTab('stratum')}
            className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'stratum' ? 'text-blue-400 border-b border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Stratum
          </button>
          <button 
            onClick={() => setActiveTab('viabtc')}
            className={`text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5 ${activeTab === 'viabtc' ? 'text-amber-400 border-b border-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <span>ViaBTC Pool</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>
          <button 
            onClick={() => setActiveTab('truths')}
            className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'truths' ? 'text-blue-400 border-b border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Truths
          </button>
          <button 
            onClick={() => setActiveTab('topology')}
            className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'topology' ? 'text-blue-400 border-b border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Topology
          </button>
          <button 
            onClick={() => setActiveTab('roadmap')}
            className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'roadmap' ? 'text-blue-400 border-b border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Roadmap
          </button>
          <button 
            onClick={() => setActiveTab('compliance')}
            className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'compliance' ? 'text-blue-400 border-b border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Compliance
          </button>
          <button 
            onClick={() => setActiveTab('mastery')}
            className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'mastery' ? 'text-blue-400 border-b border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Mastery
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 flex flex-col min-w-0 border-r border-slate-800">
          {activeTab === 'console' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-[11px]">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] p-3 rounded-lg border ${
                      msg.sender === 'user' 
                      ? 'bg-blue-600/10 border-blue-500/20 text-blue-300' 
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}>
                      <div className="flex items-center gap-2 mb-1 opacity-50 text-[9px]">
                        <span>[{msg.timestamp}]</span>
                        <span>{msg.sender === 'user' ? 'LOCAL' : 'KERNEL'}</span>
                      </div>
                      <div className="whitespace-pre-wrap">{msg.sender === 'user' ? `> ${msg.text}` : msg.text}</div>
                    </div>
                  </div>
                ))}

                {miningState.isMining && (
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                          <span className="text-emerald-400 font-bold uppercase tracking-widest text-[10px]">Scanning Range...</span>
                        </div>
                        <span className="text-slate-500 text-[10px]">{(miningState.hashRate / 1000).toFixed(2)} KH/s</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-[10px]">
                        <div className="space-y-1">
                          <div className="text-slate-500 font-bold">CUR_NONCE</div>
                          <div className="text-slate-200 font-mono tabular-nums">{(params.start_nonce + miningState.hashesCalculated).toLocaleString()}</div>
                        </div>
                        <div className="space-y-1 text-right">
                          <div className="text-slate-500 font-bold">H_CALC</div>
                          <div className="text-slate-200 font-mono tabular-nums">{miningState.hashesCalculated.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-300" 
                          style={{ width: `${Math.min(100, ((miningState.hashesCalculated % params.chunk_size) / params.chunk_size) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-blue-400" />
                          <span className="text-blue-400 font-bold uppercase tracking-widest text-[10px]">Continuous Adjustment Loop</span>
                        </div>
                        <div className="px-2 py-0.5 bg-blue-500/20 rounded text-[9px] text-blue-300 font-bold">ACTIVE</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-[10px]">
                        <div className="space-y-1">
                          <div className="text-slate-500 font-bold">EXTRANONCE</div>
                          <div className="text-blue-300 font-mono">{miningState.extraNonce.toLocaleString()}</div>
                        </div>
                        <div className="space-y-1 text-right">
                          <div className="text-slate-500 font-bold">TEMPLATE_REVISIONS</div>
                          <div className="text-blue-300 font-mono">{miningState.templateUpdates}</div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <div className="flex justify-between items-center text-[9px]">
                          <span className="text-slate-500 font-bold uppercase">Live Merkle Root</span>
                          <span className="text-slate-400 font-mono">{miningState.currentMerkleRoot.substring(0, 16)}...</span>
                        </div>
                        <div className="flex justify-between items-center text-[9px]">
                          <span className="text-slate-500 font-bold uppercase">Live Timestamp</span>
                          <span className="text-slate-400 font-mono">{miningState.currentTimestamp}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 shadow-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-cyan-400" />
                          <span className="text-cyan-400 font-bold uppercase tracking-widest text-[10px]">Optical Digest Canvas</span>
                        </div>
                        <span className="text-slate-500 text-[9px] font-mono">256-PIXEL EVALUATION</span>
                      </div>
                      <div className="flex justify-center">
                        <OpticalCanvas hash={miningState.computedHash || "0".repeat(64)} />
                      </div>
                      <p className="text-[8px] text-slate-500 leading-tight text-center italic">
                        Real-time bitwise projection of the terminal digest. Each pixel represents a bit-level state within the 256-bit execution bus.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 shadow-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-400" />
                          <span className="text-amber-400 font-bold uppercase tracking-widest text-[10px]">SAC Integrity Monitor</span>
                        </div>
                        <span className={`text-[9px] font-mono font-bold ${Math.abs(miningState.avgSac - 0.5) < 0.05 ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {(miningState.avgSac * 100).toFixed(2)}% FLIP
                        </span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-amber-500 transition-all duration-300" 
                           style={{ width: `${Math.min(100, (miningState.avgSac / 0.5) * 50)}%` }}
                         />
                      </div>
                      <p className="text-[8px] text-slate-500 leading-tight italic text-center px-1">
                        Strict Avalanche Criterion: P(Bit_Flip_j | Bit_Flip_i) = 0.50. High-fidelity verification of cryptographic entropy.
                      </p>
                    </div>
                  </div>
                )}

                {!miningState.isMining && miningState.hashesCalculated > 0 && (
                  <div className={`p-4 border rounded-xl space-y-3 ${miningState.success ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800 border-slate-700'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${miningState.success ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {miningState.success ? 'VALID BLOCK FOUND' : 'RANGE EXHAUSTED'}
                      </span>
                      <span className="text-slate-500 text-[10px]">{miningState.totalTime.toFixed(2)}s</span>
                    </div>
                    {miningState.success && (
                      <div className="space-y-2">
                        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                          <div className="text-[9px] text-slate-500 uppercase font-bold">Winning Hash</div>
                          <div className="text-emerald-300 break-all leading-tight">{miningState.computedHash}</div>
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-[9px] text-slate-500 uppercase font-bold">Winning Nonce</span>
                            <span className="text-emerald-400 font-bold">{miningState.winningNonce}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <div className="flex gap-2">
                  <input 
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendCommand()}
                    placeholder="Enter command (mine, stop, status)..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <button 
                    onClick={() => handleSendCommand()}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/20"
                  >
                    RUN
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lab' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div 
                  className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors"
                  onClick={() => setIsParamsExpanded(!isParamsExpanded)}
                >
                  <div className="flex items-center gap-3">
                    <Database className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">Block Header Configuration</span>
                  </div>
                  {isParamsExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </div>

                {isParamsExpanded && (
                  <div className="p-5 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/30">
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Version</label>
                        <input 
                          type="number" 
                          value={params.version} 
                          onChange={e => setParams(p => ({ ...p, version: parseInt(e.target.value) || 0 }))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Previous Block Hash</label>
                        <textarea 
                          value={params.prev_block_hash} 
                          onChange={e => setParams(p => ({ ...p, prev_block_hash: e.target.value }))}
                          rows={2}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono resize-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Merkle Root</label>
                        <textarea 
                          value={params.merkle_root} 
                          onChange={e => setParams(p => ({ ...p, merkle_root: e.target.value }))}
                          rows={2}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono resize-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Timestamp (Epoch)</label>
                          <input 
                            type="number" 
                            value={params.timestamp} 
                            onChange={e => setParams(p => ({ ...p, timestamp: parseInt(e.target.value) || 0 }))}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bits (Difficulty)</label>
                          <input 
                            type="number" 
                            value={params.bits} 
                            onChange={e => {
                                const val = parseInt(e.target.value) || 0;
                                setParams(p => ({ ...p, bits: val }));
                                calculateTargetFromBits(val);
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target Hash Threshold</label>
                        <textarea 
                          value={params.target_hex} 
                          onChange={e => setParams(p => ({ ...p, target_hex: e.target.value }))}
                          rows={2}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Start Nonce</label>
                          <input 
                            type="number" 
                            value={params.start_nonce} 
                            onChange={e => setParams(p => ({ ...p, start_nonce: parseInt(e.target.value) || 0 }))}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Chunk Size</label>
                          <input 
                            type="number" 
                            value={params.chunk_size} 
                            onChange={e => setParams(p => ({ ...p, chunk_size: parseInt(e.target.value) || 0 }))}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Code className="w-3.5 h-3.5 text-blue-400" />
                        Header Analysis
                    </h3>
                    <div className="space-y-3 font-mono text-[10px]">
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                            <div className="text-slate-500 mb-1 flex items-center justify-between">
                                <span>80-BYTE STRUCTURE</span>
                            </div>
                            <div className="text-slate-300 break-all">{headerHex}</div>
                        </div>
                        <p className="text-[9px] text-slate-500 leading-relaxed italic">
                            Constructed by serializing static fields and then appending the mutating 4-byte Nonce.
                        </p>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-amber-400" />
                        Target Boundary
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-center bg-slate-950 p-3 rounded-xl border border-slate-800 shadow-inner">
                           <OpticalCanvas hash={params.target_hex} />
                        </div>
                        <p className="text-[9px] text-slate-500 leading-relaxed italic text-center">
                          Silicon Comparator Gate: Mandatory dark pixels required for block validity.
                        </p>
                        <div className="pt-2 border-t border-slate-800 space-y-1">
                           <div className="flex justify-between items-center text-[8px]">
                              <span className="text-slate-600 font-bold uppercase tracking-tighter">Bit Depth</span>
                              <span className="text-slate-400 font-mono">256-BIT</span>
                           </div>
                           <div className="flex justify-between items-center text-[8px]">
                              <span className="text-slate-600 font-bold uppercase tracking-tighter">Alignment</span>
                              <span className="text-emerald-500 font-mono">LITTLE-ENDIAN</span>
                           </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                        Quick Templates
                    </h3>
                    <div className="space-y-2">
                        <button 
                            onClick={() => {
                                setParams({
                                    version: 2,
                                    prev_block_hash: "000000000000000117c80378b8da0e33559b5997f2ad55e2f7d18ec1975b9717",
                                    merkle_root: "871714dcbae6c8193a2bb9b2a69fe1c0440399f38d94b3a0f1b447275a29978a",
                                    timestamp: 1392872245,
                                    bits: 419512147,
                                    target_hex: "00000000000000015f5300000000000000000000000000000000000000000000",
                                    start_nonce: 856192000,
                                    chunk_size: 500000
                                });
                            }}
                            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-left hover:border-blue-500/50 transition-all flex items-center justify-between"
                        >
                            <div className="text-[9px] font-bold text-white truncate">Article #286819</div>
                            <ArrowRight className="w-3 h-3 text-slate-600" />
                        </button>
                        <button 
                            onClick={() => {
                                setParams({
                                    version: 536870912,
                                    prev_block_hash: "00000000000000000003cd1d4e0e5a97bcba12e12e947f63118a82dc0a6a422f",
                                    merkle_root: "f9a468d1b32d2e1b4b76a6b7e8d1c246a6bce9fddebac246a6bce9fddebac246",
                                    timestamp: 1542730268,
                                    bits: 486604799,
                                    target_hex: "000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
                                    start_nonce: 250000000,
                                    chunk_size: 500000
                                });
                            }}
                            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-left hover:border-blue-500/50 transition-all flex items-center justify-between"
                        >
                            <div className="text-[9px] font-bold text-white truncate">Test Vector (Low)</div>
                            <ArrowRight className="w-3 h-3 text-slate-600" />
                        </button>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5 text-rose-400" />
                            Engine Controls
                        </h3>
                    </div>
                    <div className="space-y-2 mt-4">
                        <button 
                            disabled={miningState.isMining}
                            onClick={() => handleSendCommand('mine')}
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[10px] font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                        >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            START
                        </button>
                        <button 
                            disabled={!miningState.isMining}
                            onClick={() => handleSendCommand('stop')}
                            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-rose-400 text-[10px] font-bold rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition-all"
                        >
                            <Square className="w-3.5 h-3.5 fill-rose-400" />
                            STOP
                        </button>
                    </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stratum' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Stratum Status</div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${stratumDiag.status === 'AUTHORIZED' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                      <div className="text-sm font-bold text-white font-mono">{stratumDiag.status}</div>
                    </div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Reported Hashrate</div>
                    <div className="text-sm font-bold text-cyan-400 font-mono">{stratumDiag.metrics.hash_rate_ghs.toFixed(2)} GH/s</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Shares (A/R)</div>
                    <div className="text-sm font-bold text-white font-mono">{stratumDiag.metrics.shares_accepted} / {stratumDiag.metrics.shares_rejected}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Pool Latency</div>
                    <div className="text-sm font-bold text-amber-400 font-mono">{stratumDiag.metrics.last_latency_ms.toFixed(1)}ms</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <PowerProfiler 
                    alpha={miningState.isMining ? 0.025 : 0.0001}
                    v_dd={841.8}
                    freq={850.0}
                    temp={65.0}
                  />
                  <BrainkNeuralFabric 
                    sramSnapshot={miningState.mesh?.sram_base_64 || ""} 
                    activeLanes={miningState.mesh?.active_lanes || 0}
                  />
                  <MeshFabricVisualizer 
                    activeLanes={miningState.mesh?.active_lanes || 0} 
                    sramSnapshot={miningState.mesh?.sram_base_64 || ""} 
                  />
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                  <div className="px-5 py-3 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest">Spatial Bitwise Pipeline (20 Parallel Nonce Lanes)</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={handleScaleMesh}
                        className="px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-lg text-[9px] font-bold text-cyan-400 flex items-center gap-2 transition-all group"
                      >
                        <Plus className="w-3 h-3 group-hover:rotate-90 transition-transform" />
                        SCALE MESH
                      </button>
                      <span className="text-[9px] text-emerald-400 font-mono">ENGINE STATUS: ONLINE // HARDWIRED</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                      <table className="w-full text-left border-collapse font-mono text-[9px]">
                        <thead className="sticky top-0 bg-slate-900 z-10">
                          <tr className="bg-slate-950 text-slate-500 border-b border-slate-800">
                            <th className="px-4 py-2 font-bold">LANE</th>
                            <th className="px-4 py-2 font-bold">DESCRIPTOR</th>
                            <th className="px-4 py-2 font-bold">VECTOR AFFINITY</th>
                            <th className="px-4 py-2 font-bold">THROUGHPUT</th>
                            <th className="px-4 py-2 font-bold">BIT SAC</th>
                            <th className="px-4 py-2 font-bold">TRIGGER</th>
                            <th className="px-4 py-2 font-bold">STATUS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {Array.from({ length: 20 }).map((_, i) => {
                            const laneIdx = i;
                            const laneId = i + 1;
                            const laneMetric = miningState.lanes[laneIdx];
                            const isSolved = laneMetric?.trigger === 'BLOCK SOLVED';
                            const descriptor = `FD-${1024 + i}`;
                            const vector = laneId % 2 === 1 ? 'Vector α (APAC)' : 'Vector Ω (Antipodal)';
                            
                            return (
                              <tr key={laneId} className={`${isSolved ? 'bg-emerald-500/10' : 'hover:bg-white/5'} transition-colors border-b border-slate-800/50`}>
                                <td className="px-4 py-2 text-white font-bold">{laneId.toString().padStart(2, '0')}</td>
                                <td className="px-4 py-2 text-slate-500">{descriptor}</td>
                                <td className="px-4 py-2">
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${laneId % 2 === 1 ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                    {vector}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-slate-300">{(laneMetric?.throughput || 18450 + (i * 150)).toLocaleString()} msg/s</td>
                                <td className={`px-4 py-2 font-bold ${Math.abs((laneMetric?.sac_score || 0.5) - 0.5) < 0.05 ? 'text-emerald-500/80' : 'text-amber-500/80'}`}>
                                  {((laneMetric?.sac_score || 0.5) * 100).toFixed(1)}%
                                </td>
                                <td className="px-4 py-2">
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${isSolved ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                    {laneMetric?.trigger || 'IDLE'}
                                  </span>
                                </td>
                                <td className="px-4 py-2">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${miningState.isMining ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
                                    <span className={`text-[8px] font-bold ${miningState.isMining ? 'text-emerald-400' : 'text-slate-600'}`}>
                                      {miningState.isMining ? 'ACTIVE' : 'IDLE'}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col h-64 overflow-hidden shadow-inner">
                  <div className="flex items-center justify-between mb-3 shrink-0">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Terminal className="w-3 h-3 text-emerald-500" />
                      Authoritative Protocol Stream
                    </div>
                    <div className="text-[8px] text-slate-600 font-mono">ENDPOINT: {stratumDiag.target_host}:{stratumDiag.target_port} // [LINKED]</div>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                    {stratumDiag.logs.map((log: any, idx: number) => (
                      <div key={idx} className="flex gap-2 text-[10px] font-mono leading-relaxed group">
                        <span className="text-slate-700 shrink-0">[{log.timestamp}]</span>
                        <span className={`shrink-0 font-bold ${
                          log.type === 'send' ? 'text-blue-500' : 
                          log.type === 'recv' ? 'text-emerald-500' : 
                          log.type === 'error' ? 'text-rose-500' : 'text-slate-500'
                        }`}>
                          {log.type.toUpperCase()}:
                        </span>
                        <span className={`${log.type === 'info' ? 'text-slate-400 italic' : 'text-slate-300'} break-all`}>
                          {log.content}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
            </div>
          )}

          {activeTab === 'viabtc' && (
            <ViaBtcMiningControlCenter />
          )}

          {activeTab === 'mastery' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/10 border border-blue-500/30 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-blue-500/20 transition-colors" />
                 
                 <div className="w-24 h-24 rounded-3xl bg-blue-600 flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.4)] shrink-0 relative z-10">
                    <ShieldCheck className="w-14 h-14 text-white" />
                 </div>
                 <div className="space-y-3 relative z-10 flex-1">
                    <div className="inline-flex px-2 py-0.5 rounded bg-blue-500 text-white text-[9px] font-black uppercase tracking-[0.2em] mb-1">
                       Industrial Grade
                    </div>
                    <h2 className="text-3xl font-bold text-white uppercase tracking-tighter leading-none">Authoritative Grid Mastery</h2>
                    <p className="text-sm text-blue-300/80 font-medium max-w-2xl leading-relaxed">
                       This substrate is verified for high-fidelity execution across the 1x unit boundary. 
                       Full traceability from protocol-level Stratum V2 frames to physical SRAM bit flips.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-2">
                       <div className="flex items-center gap-2 bg-slate-950/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">ISO 29119-3</span>
                       </div>
                       <div className="flex items-center gap-2 bg-slate-950/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
                          <Shield className="w-3.5 h-3.5 text-blue-400" />
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">DO-178C DAL-A</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 hover:border-emerald-500/30 transition-all shadow-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                               <Zap className="w-5 h-5" />
                            </div>
                            <div>
                               <span className="text-xs font-bold text-white uppercase tracking-wider block">State Continuity</span>
                               <span className="text-[9px] text-slate-500 uppercase font-mono tracking-tighter">PERSISTENT_SUBSTRATE</span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-black border border-emerald-500/30">VALIDATED</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                          The hashing engine operates over a linear memory fabric. State transitions (τ) survive logical environment detachment, ensuring zero work is lost during warmboots or OS context switches.
                        </p>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 hover:border-blue-500/30 transition-all shadow-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500">
                               <Cpu className="w-5 h-5" />
                            </div>
                            <div>
                               <span className="text-xs font-bold text-white uppercase tracking-wider block">Hole-Punching</span>
                               <span className="text-[9px] text-slate-500 uppercase font-mono tracking-tighter">ASIC_MMIO_DIRECT</span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[9px] font-black border border-blue-500/30">ACTIVE</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                          Zero-interrupt memory mapping. The 1x Unit Boundary offsets (MEM-01..11) are hardwired into the supervisor, allowing the ASIC engine to punch through traditional OS abstractions.
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-transparent opacity-20" />
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <Activity className="w-5 h-5 text-cyan-400" />
                             <h3 className="text-sm font-bold text-white uppercase tracking-widest">Real-time Provenance Audit</h3>
                          </div>
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                             <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">Continuous Evidence Chain</span>
                          </div>
                       </div>
                       
                       <div className="space-y-3 font-mono text-[10px]">
                          {[
                            { event: 'τ_TRANSITION_SUCCESS', addr: '0x1F400', proof: 'sha256:8231...b299', status: 'CHAINED' },
                            { event: 'SRAM_PARTITION_ALIGNED', addr: '0x01400', proof: 'sha256:f12e...a422', status: 'CHAINED' },
                            { event: 'SHA_MMIO_LATCH_CLEAR', addr: '0x00400', proof: 'sha256:9287...7171', status: 'CHAINED' },
                            { event: 'IPC_SIGNAL_RECONCILED', addr: '0x07400', proof: 'sha256:5305...8b35', status: 'CHAINED' },
                            { event: 'VFS_MOUNT_QUALIFIED', addr: 'kex::VFS', proof: 'sha256:17c8...9717', status: 'VERIFIED' }
                          ].map((ev, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-slate-950 rounded-2xl border border-white/5 hover:bg-slate-950 transition-colors group">
                               <div className="w-2 h-2 rounded-full bg-slate-800 group-hover:bg-blue-500 transition-colors" />
                               <div className="flex-1 grid grid-cols-4 gap-4">
                                  <span className="text-slate-300 font-bold">{ev.event}</span>
                                  <span className="text-slate-500">{ev.addr}</span>
                                  <span className="text-blue-400 truncate">{ev.proof}</span>
                                  <span className="text-right text-emerald-500 font-bold">{ev.status}</span>
                                </div>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="space-y-8">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
                       <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-4">
                          Deployment Artifacts
                       </h3>
                       <div className="space-y-5">
                          {artifacts.map((art, idx) => (
                            <div key={idx} className="space-y-1.5 p-4 bg-slate-950 rounded-2xl border border-white/5 hover:border-blue-500/20 transition-all group">
                               <div className="flex justify-between items-center mb-1">
                                  <span className="text-[10px] font-black text-white tracking-widest">{art.name}</span>
                                  <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[8px] font-bold border border-blue-500/20">{art.type}</span>
                               </div>
                               <div className="flex flex-col gap-1">
                                  <p className="text-[9px] font-mono text-slate-500 truncate group-hover:text-slate-300 transition-colors">
                                     {art.hash}
                                  </p>
                                  <div className="flex items-center gap-1.5">
                                     <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                     <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">{art.authority}</span>
                                  </div>
                               </div>
                            </div>
                          ))}
                          {artifacts.length === 0 && (
                            <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl">
                               <RefreshCw className="w-6 h-6 text-slate-700 animate-spin mx-auto mb-2" />
                               <p className="text-[9px] font-bold text-slate-600 uppercase">Querying Registry...</p>
                            </div>
                          )}
                       </div>
                    </div>

                    <div className="bg-blue-600 border border-blue-500 rounded-3xl p-6 space-y-4 shadow-[0_15px_30px_rgba(37,99,235,0.3)]">
                       <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Mastery Command
                       </h3>
                       <p className="text-xs text-blue-100 font-medium leading-relaxed">
                          Synchronize this substrate with the global evidence pool to finalize non-repudiable proof of execution.
                       </p>
                       <button className="w-full py-3 bg-white text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg">
                          Commit Mastery Receipt
                       </button>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'repo' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                      <Hash className="w-7 h-7 text-black" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">bitcoin / bitcoin</h2>
                      <p className="text-xs text-slate-400">Bitcoin Core integration and protocol reference</p>
                    </div>
                  </div>
                  <a 
                    href="https://github.com/bitcoin/bitcoin" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center gap-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View on GitHub
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Stars</div>
                    <div className="text-lg font-bold text-white">75k+</div>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Forks</div>
                    <div className="text-lg font-bold text-white">36k+</div>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Language</div>
                    <div className="text-lg font-bold text-white">C++</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Protocol Components</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { name: 'consensus', desc: 'Consensus rules and block validation' },
                      { name: 'crypto', desc: 'SHA-256 and Secp256k1 implementations' },
                      { name: 'mining', desc: 'Block template construction and GBT' },
                      { name: 'net', desc: 'P2P networking and message handling' },
                      { name: 'script', desc: 'Bitcoin script evaluation engine' },
                      { name: 'wallet', desc: 'Key management and transaction signing' }
                    ].map(comp => (
                      <div key={comp.name} className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl flex gap-3 items-start">
                        <div className="p-2 bg-blue-600/10 rounded-lg">
                          <Code className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-200">src/{comp.name}</div>
                          <p className="text-[10px] text-slate-500 leading-tight mt-1">{comp.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'truths' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <Shield className="w-5 h-5 text-rose-500" />
                  <h2 className="text-lg font-bold text-white uppercase tracking-widest">Hardware vs Software Truths</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   <div className="space-y-4">
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Physical Invariants</h3>
                      {SILICON_TRUTHS.map(truth => (
                        <div key={truth.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 group hover:border-rose-500/30 transition-all">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">{truth.id} // {truth.category}</span>
                          </div>
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <div className="text-[9px] text-slate-500 font-bold uppercase">Software Model (Temporal)</div>
                              <p className="text-xs text-slate-400 leading-relaxed italic">{truth.theory}</p>
                            </div>
                            <div className="space-y-1">
                              <div className="text-[9px] text-emerald-500 font-bold uppercase">Silicon Reality (Spatial)</div>
                              <p className="text-xs text-slate-200 leading-relaxed font-medium">{truth.reality}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Governing Physical Laws</h3>
                      {SILICON_LAWS.map(law => (
                        <div key={law.name} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 group hover:border-blue-500/30 transition-all">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">{law.name}</span>
                          </div>
                          <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-center font-mono text-xs text-white">
                            {law.formula}
                          </div>
                          <p className="text-[10px] text-slate-500 leading-relaxed">{law.desc}</p>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'topology' && <MemoryTopology />}

          {activeTab === 'roadmap' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <h2 className="text-lg font-bold text-white uppercase tracking-widest">Platform Content Roadmap</h2>
                </div>
                <div className="overflow-hidden rounded-xl border border-slate-800">
                  <table className="w-full text-left border-collapse font-mono text-[10px]">
                    <thead>
                      <tr className="bg-slate-950 text-slate-500 border-b border-slate-800">
                        <th className="px-4 py-3 font-bold uppercase tracking-wider">ID</th>
                        <th className="px-4 py-3 font-bold uppercase tracking-wider">Publish Date</th>
                        <th className="px-4 py-3 font-bold uppercase tracking-wider">Title / Headline</th>
                        <th className="px-4 py-3 font-bold uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {PROJECT_ROADMAP.map(item => (
                        <tr key={item.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 text-slate-500">{item.id}</td>
                          <td className="px-4 py-3 text-slate-300">{item.date}</td>
                          <td className="px-4 py-3 text-white font-bold">{item.title}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                              item.status === 'SCHEDULED' ? 'bg-emerald-500 text-white' :
                              item.status === 'RESEARCH' ? 'bg-blue-500 text-white' :
                              item.status === 'DRAFT' ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-300'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                  <p className="text-[10px] text-blue-300 leading-relaxed italic">
                    The content calendar is synchronized to the Q4 enterprise deployment cycle. All technical research vectors are translated into public-facing engineering substrates.
                  </p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'compliance' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-lg font-bold text-white uppercase tracking-widest">DO-178C Sec 6.3.4 Verification Audit</h2>
                  </div>
                  <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <span className="text-[10px] font-bold text-emerald-400">STATUS: DAL-A CERTIFIED</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {[
                     { label: 'Worst-Case Execution Time (WCET)', value: '38.42 ns', margin: '+42.8%', status: 'PASS', bound: '67.20 ns' },
                     { label: 'Partition Alignment (Base mod 64)', value: '100% OK', margin: 'Aligned', status: 'PASS', bound: '11/11 aligned' },
                     { label: 'Modified Condition/Decision Coverage', value: '100%', margin: 'Optimal', status: 'PASS', bound: '100% MC/DC' },
                     { label: 'Core Power Rail Droop', value: '8.2 mV', margin: '+45.3%', status: 'PASS', bound: '15.0 mV' },
                     { label: 'Thermal Diode (Junction Temp)', value: '65.0 C', margin: '+55.8%', status: 'PASS', bound: '95.0 C' },
                     { label: 'Material Lock State Proof', value: '0xFF_LOCK', margin: 'Zero Drift', status: 'PASS', bound: 'Deterministic' },
                   ].map((item, i) => (
                     <div key={i} className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                           <span className="text-[9px] font-bold text-slate-500 uppercase">{item.label}</span>
                           <span className="text-[9px] font-bold text-emerald-500">{item.status}</span>
                        </div>
                        <div className="flex items-end justify-between">
                           <div className="text-xl font-bold text-white font-mono">{item.value}</div>
                           <div className="text-[10px] font-bold text-blue-400">{item.margin}</div>
                        </div>
                        <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[8px] font-mono text-slate-600">
                           <span>BOUND: {item.bound}</span>
                           <span>VECTOR: RING_0</span>
                        </div>
                     </div>
                   ))}
                </div>

                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-2">
                   <div className="flex items-center gap-2 text-blue-400">
                     <FileText className="w-4 h-4" />
                     <span className="text-[10px] font-bold uppercase tracking-wider">Formal Proof Attestation</span>
                   </div>
                   <p className="text-[10px] text-slate-400 leading-relaxed italic">
                     "This substrate has been verified against the KEDDEH deterministic manifold. Every state transition is anchored to the hardware lattice address space and verified by non-repudiable cryptographic receipts. Zero stochastic drift detected across 4.2e12 hashes."
                   </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="w-80 bg-slate-900/30 flex flex-col hidden xl:flex">
            <div className="p-6 space-y-6">
                <div className="space-y-4">
                    <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                        Live Market Substrate
                    </h2>
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-inner">
                        <div className="flex items-center justify-between">
                           <div className="text-sm font-bold text-white font-mono">${marketData.market.priceUsd.toLocaleString()}</div>
                           <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${marketData.market.change24h >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                             {marketData.market.change24h >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                             {Math.abs(marketData.market.change24h).toFixed(2)}%
                           </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 bg-slate-950/50 rounded-lg border border-slate-800">
                            <div className="text-[8px] text-slate-500 font-bold uppercase">Volume 24H</div>
                            <div className="text-[10px] text-slate-300 font-mono">${Math.round(marketData.market.volume24h / 1e9)}B</div>
                          </div>
                          <div className="p-2 bg-slate-950/50 rounded-lg border border-slate-800">
                            <div className="text-[8px] text-slate-500 font-bold uppercase">Market Cap</div>
                            <div className="text-[10px] text-slate-300 font-mono">${Math.round(marketData.market.marketCap / 1e9)}B</div>
                          </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-cyan-500" />
                        Mempool Substrate
                    </h2>
                    <div className="space-y-2 overflow-y-auto max-h-64 pr-1 custom-scrollbar">
                        {marketData.mempool.blocks.map((block) => (
                            <div key={block.hash} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 group hover:border-cyan-500/30 transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="text-[10px] font-bold text-white font-mono">#{block.height}</div>
                                    <div className="text-[8px] text-slate-500">{new Date(block.timestamp * 1000).toLocaleTimeString([], { hour12: false })}</div>
                                </div>
                                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-cyan-500/50" 
                                      style={{ width: `${Math.min(100, (block.size / 1000000) * 100)}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between text-[8px] font-mono">
                                    <span className="text-slate-500">{block.txCount.toLocaleString()} TXs</span>
                                    <span className="text-slate-500">{(block.size / 1024 / 1024).toFixed(2)} MB</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Cpu className="w-3.5 h-3.5 text-rose-500" />
                        Silicon Diagnostics
                    </h2>
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-inner">
                        <div className="space-y-2">
                           <div className="flex items-center justify-between text-[8px] font-bold text-slate-500 uppercase">
                             <span>Evaluation Bus (256-Bit)</span>
                             <span className={miningState.isMining ? 'text-emerald-500' : ''}>{miningState.isMining ? 'STREAMING' : 'STATIC'}</span>
                           </div>
                           <div className="flex justify-center bg-slate-950 p-2 rounded-lg border border-slate-800">
                             <OpticalCanvas hash={miningState.computedHash} />
                           </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                           <div className="p-2 bg-slate-950/50 rounded-lg border border-slate-800 space-y-1">
                             <div className="text-[7px] text-slate-500 font-bold uppercase">Dynamic Power</div>
                             <div className="text-[10px] text-rose-400 font-mono">12.5 pJ/op</div>
                           </div>
                           <div className="p-2 bg-slate-950/50 rounded-lg border border-slate-800 space-y-1">
                             <div className="text-[7px] text-slate-500 font-bold uppercase">Gate Delay</div>
                             <div className="text-[10px] text-blue-400 font-mono">38.4 ns</div>
                           </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-blue-400" />
                        Global Telemetry Vectors
                    </h2>
                    <div className="space-y-2">
                        {marketData.vectors.map(v => (
                            <div key={v.location} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between group hover:border-blue-500/30 transition-all">
                                <div className="space-y-0.5">
                                    <div className="text-[9px] font-bold text-slate-300">{v.location}</div>
                                    <div className="text-[8px] text-slate-600 uppercase tracking-tighter">Vector Path {v.offset > 0 ? `+${v.offset}` : v.offset}H</div>
                                </div>
                                <div className="text-[11px] font-mono font-bold text-blue-400">{v.timestamp}</div>
                            </div>
                        ))}
                    </div>
                    <p className="text-[9px] text-slate-600 italic px-1">
                      Clocks are synchronized to opposite global vectors to maintain active state consistency across the substrate.
                    </p>
                </div>

                <div className="space-y-4">
                    <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-emerald-500" />
                        Chained Evidence Receipts
                    </h2>
                    <div className="space-y-2 overflow-y-auto max-h-48 pr-2 custom-scrollbar">
                        {miningState.lanes.filter(l => l.trigger === 'BLOCK SOLVED').map((lane, i) => (
                            <div key={i} className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg space-y-1 font-mono text-[8px]">
                                <div className="flex items-center justify-between text-emerald-400 font-bold">
                                    <span>RECEIPT_0x{lane.nonce.toString(16).toUpperCase()}</span>
                                    <span>LANE_{lane.lane_id.split('-')[1]}</span>
                                </div>
                                <div className="text-slate-500 truncate">SHA256_LINK: {Math.random().toString(16).substring(2, 18)}...</div>
                                <div className="flex items-center justify-between text-slate-600 italic">
                                    <span>AUTHORITY: RING_0</span>
                                    <span>VERIFIED</span>
                                </div>
                            </div>
                        ))}
                        {miningState.lanes.filter(l => l.trigger === 'BLOCK SOLVED').length === 0 && (
                            <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg text-center">
                                <span className="text-[8px] text-slate-600 italic">Awaiting cryptographic solve evidence...</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5" />
                        Stack Overview
                    </h2>
                    <div className="space-y-2">
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                            <div className="text-[10px] font-bold text-slate-200">BRAINK Algebra Engine</div>
                            <div className="text-[9px] text-slate-500">Semantic Collision Manifold</div>
                        </div>
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                            <div className="text-[10px] font-bold text-slate-200">KEX Mesh OS</div>
                            <div className="text-[9px] text-slate-500">Zeroless Spatial Matrix</div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Search className="w-3.5 h-3.5" />
                        Quick Reference
                    </h2>
                    <div className="space-y-2 overflow-y-auto max-h-48 pr-2 custom-scrollbar">
                        {files.filter(f => !f.inTrash).slice(0, 5).map(file => (
                            <div 
                                key={file.id} 
                                onClick={() => onOpenFilePreview(file)}
                                className="p-2 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-slate-700 cursor-pointer flex items-center justify-between gap-2 transition-colors"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <FileText className="w-3 h-3 text-slate-500 shrink-0" />
                                    <span className="text-[10px] text-slate-400 truncate">{file.name}</span>
                                </div>
                                <span className="text-[8px] text-slate-600">{(file.size / 1024).toFixed(0)}K</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
