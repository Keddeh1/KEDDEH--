import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Cpu,
  Terminal,
  Activity,
  Zap,
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
  ExternalLink
} from 'lucide-react';
import { FileItem } from '../../types';
import { GLOBAL_SOLO_MINING_ENGINE, MiningEngineState } from '../../services/SoloMiningEngine';
import { ComplianceVerifier } from './ComplianceVerifier';

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

  const [activeTab, setActiveTab] = useState<'console' | 'lab' | 'stratum' | 'repo' | 'compliance'>('console');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<any[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Bitcoin Engineering Console v2.0. Ready for protocol-level analysis.',
      timestamp: 'SYSTEM'
    }
  ]);
  const [miningState, setMiningState] = useState<MiningEngineState>(GLOBAL_SOLO_MINING_ENGINE.getState());
  const [isParamsExpanded, setIsParamsExpanded] = useState(true);

  useEffect(() => {
    const unsub = GLOBAL_SOLO_MINING_ENGINE.subscribe((state) => {
      setMiningState(state);
    });
    return () => unsub();
  }, []);

  // Auto-start mining when system comes online
  useEffect(() => {
    if (isSystemOnline && !miningState.isMining && miningState.hashesCalculated === 0) {
      setTimeout(() => {
        GLOBAL_SOLO_MINING_ENGINE.startMining(params);
        setMessages(prev => [...prev, {
          id: 'auto-start',
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
    } else if (cmd === 'stop') {
      GLOBAL_SOLO_MINING_ENGINE.stopMining();
      response = 'Engine: Termination signal broadcasted.';
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

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden rounded-2xl border border-slate-800 shadow-2xl">
      {/* Header telemetry strip */}
      <div className="h-12 border-b border-slate-800 bg-slate-900/80 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${miningState.isMining ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Core Status</span>
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-mono text-slate-300">{(miningState.hashRate / 1000).toFixed(2)} KH/s</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] font-mono text-slate-300">{miningState.hashesCalculated.toLocaleString()} nonces</span>
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
            Stratum Log
          </button>
          <button 
            onClick={() => setActiveTab('repo')}
            className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'repo' ? 'text-blue-400 border-b border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Repository
          </button>
          <button 
            onClick={() => setActiveTab('compliance')}
            className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTab === 'compliance' ? 'text-blue-400 border-b border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Compliance
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
                          <div className="text-slate-200 font-mono">{(params.start_nonce + miningState.hashesCalculated).toLocaleString()}</div>
                        </div>
                        <div className="space-y-1 text-right">
                          <div className="text-slate-500 font-bold">H_CALC</div>
                          <div className="text-slate-200 font-mono">{miningState.hashesCalculated.toLocaleString()}</div>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        <p className="text-slate-500 leading-relaxed italic">
                            The engine constructs this 80-byte header by serializing static fields (Version to Bits) and then appending the mutating 4-byte Nonce in the Web Worker loop.
                        </p>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
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
                            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-left hover:border-blue-500/50 transition-all flex items-center justify-between"
                        >
                            <div className="space-y-0.5">
                                <div className="text-[10px] font-bold text-white">Article Block #286819</div>
                                <div className="text-[9px] text-slate-500">Difficulty: 0x19015f53</div>
                            </div>
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
                            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-left hover:border-blue-500/50 transition-all flex items-center justify-between"
                        >
                            <div className="space-y-0.5">
                                <div className="text-[10px] font-bold text-white">Test Vector (Low Diff)</div>
                                <div className="text-[9px] text-slate-500">6 Leading Zeros</div>
                            </div>
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
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                            Configure parameters above then initialize the double-SHA256 scan range. Web Worker handles execution to prevent UI thread blocking.
                        </p>
                    </div>
                    <div className="space-y-2 mt-4">
                        <button 
                            disabled={miningState.isMining}
                            onClick={() => handleSendCommand('mine')}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[10px] font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                        >
                            <Play className="w-4 h-4 fill-white" />
                            INITIALIZE MINER
                        </button>
                        <button 
                            disabled={!miningState.isMining}
                            onClick={() => handleSendCommand('stop')}
                            className="w-full py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-rose-400 text-[10px] font-bold rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition-all"
                        >
                            <Square className="w-4 h-4 fill-rose-400" />
                            STOP ENGINE
                        </button>
                    </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stratum' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-[11px]">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                            <Server className="w-4 h-4 text-emerald-400" />
                            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest">Stratum v1.0 Protocol Session</span>
                        </div>
                        <span className="text-[9px] text-slate-500">CONNECTED: us1.ghash.io:3333</span>
                    </div>

                    <div className="space-y-3">
                        <div className="flex gap-3">
                            <div className="text-blue-500 shrink-0 font-bold">SEND:</div>
                            <div className="text-slate-300 break-all">{`{"id": 1, "method": "mining.subscribe", "params": []}`}</div>
                        </div>
                        <div className="flex gap-3">
                            <div className="text-emerald-500 shrink-0 font-bold">RECV:</div>
                            <div className="text-slate-400 break-all">{`{"id":1,"result":[[["mining.set_difficulty","b4b669..."],["mining.notify","ae68..."]],"4bc6af58",4],"error":null}`}</div>
                        </div>
                        <div className="flex gap-3">
                            <div className="text-blue-500 shrink-0 font-bold">SEND:</div>
                            <div className="text-slate-300 break-all">{`{"params": ["kens_1", "password"], "id": 2, "method": "mining.authorize"}`}</div>
                        </div>
                        <div className="flex gap-3">
                            <div className="text-emerald-500 shrink-0 font-bold">RECV:</div>
                            <div className="text-slate-400 break-all">{`{"id":null,"params":[16],"method":"mining.set_difficulty"}`}</div>
                        </div>
                        <div className="flex gap-3">
                            <div className="text-emerald-500 shrink-0 font-bold">RECV:</div>
                            <div className="text-slate-400 break-all">{`{"id":null,"params":["58af8d8c","975b97...","0100...","2e52...",["ea9d..."],"00000002","19015f53","53058b41",false],"method":"mining.notify"}`}</div>
                        </div>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                        <div className="text-[9px] text-slate-500 uppercase font-bold">Protocol Breakdown</div>
                        <p className="text-[10px] text-slate-500 leading-relaxed italic border-t border-slate-800 pt-2 mt-2">
                            The "Continuous Adjustment Loop" implemented in the Lab mimics V2 behavior by autonomously rebuilding the Merkle Root when nonces are exhausted or timestamps roll over.
                        </p>
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

          {activeTab === 'compliance' && (
            <div className="flex-1 flex items-center justify-center p-6 bg-slate-950/50">
              <ComplianceVerifier 
                onVerified={(key) => {
                  setMessages(prev => [...prev, {
                    id: 'verified-' + Date.now(),
                    sender: 'ai',
                    text: `TECHNICAL_VERIFICATION_PASS: Production license ${key} verified by hardware HSM. System hardened.`,
                    timestamp: new Date().toLocaleTimeString()
                  }]);
                  setActiveTab('console');
                }}
                onCancel={() => setActiveTab('console')}
              />
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="w-80 bg-slate-900/30 flex flex-col hidden xl:flex">
            <div className="p-6 space-y-6">
                <div className="space-y-2">
                    <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5" />
                        Stack Overview
                    </h2>
                    <div className="space-y-2">
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                            <div className="text-[10px] font-bold text-slate-200">SHA-256 Engine</div>
                            <div className="text-[9px] text-slate-500">Pure JS / Uint32Array</div>
                        </div>
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                            <div className="text-[10px] font-bold text-slate-200">Execution Layer</div>
                            <div className="text-[9px] text-slate-500">Web Worker (Non-blocking)</div>
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
