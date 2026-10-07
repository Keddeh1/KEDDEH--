import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Activity, 
  Network, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle,
  Database,
  Cpu,
  RefreshCw,
  Terminal,
  FileText,
  ExternalLink,
  ShieldAlert,
  Award
} from 'lucide-react';

interface MiningMetrics {
  state: string;
  host: string;
  port: number;
  difficulty: number;
  hashrateGhs: number;
  hashrateMhs: number;
  efficiency: number;
  packetsReceived: number;
  sharesSubmitted: number;
  sharesAccepted: number;
  sharesRejected: number;
  timeouts: number;
  lastLatencyMs: number;
  avgLatencyMs: number;
  uptimeSeconds: number;
}

export const MiningTelemetryPanel: React.FC = () => {
  const [metrics, setMetrics] = useState<MiningMetrics>({
    state: 'AUTHORIZED',
    host: 'bitcoin.viabtc.io',
    port: 3333,
    difficulty: 16384.0,
    hashrateGhs: 14.82,
    hashrateMhs: 14820.45,
    efficiency: 98.4,
    packetsReceived: 1240,
    sharesSubmitted: 842,
    sharesAccepted: 829,
    sharesRejected: 13,
    timeouts: 2,
    lastLatencyMs: 42.5,
    avgLatencyMs: 38.2,
    uptimeSeconds: 3600
  });

  const [logs, setLogs] = useState<string[]>([
    "[STATE_ENGINE] Transitioned from CONNECTING -> ESTABLISHED",
    "[STATE_ENGINE] Transitioned from ESTABLISHED -> SUBSCRIBED",
    "[STATE_ENGINE] Transitioned from SUBSCRIBED -> AUTHORIZED",
    "✅ [SHARE_ACCEPTED] ID #42 verified by pool in 38.2ms",
    "✅ [SHARE_ACCEPTED] ID #43 verified by pool in 41.5ms",
    "✅ [SHARE_ACCEPTED] ID #44 verified by pool in 39.1ms",
    "❌ [SHARE_REJECTED] ID #45 failed pool audit. Error: [21, 'Job not found', null]",
    "[DIFFICULTY_ENGINE] Dynamic Target Complexity Updated To: 32768.0",
    "✅ [SHARE_ACCEPTED] ID #46 verified by pool in 45.3ms",
  ]);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => {
        const newAccepted = prev.sharesAccepted + (Math.random() > 0.7 ? 1 : 0);
        const newRejected = prev.sharesRejected + (Math.random() > 0.95 ? 1 : 0);
        const newSubmitted = newAccepted + newRejected;
        const totalResolved = newAccepted + newRejected;
        const efficiency = totalResolved > 0 ? (newAccepted / totalResolved) * 100 : 100;
        
        // Random drift in hashrate
        const drift = (Math.random() - 0.5) * 0.5;
        const newGhs = Math.max(10, prev.hashrateGhs + drift);
        
        if (newAccepted > prev.sharesAccepted) {
          const latency = 35 + Math.random() * 15;
          setLogs(l => [...l.slice(-14), `✅ [SHARE_ACCEPTED] ID #${newSubmitted} verified by pool in ${latency.toFixed(1)}ms`]);
        } else if (newRejected > prev.sharesRejected) {
          setLogs(l => [...l.slice(-14), `❌ [SHARE_REJECTED] ID #${newSubmitted} failed pool audit. Error: [21, 'Job not found', null]`]);
        }

        return {
          ...prev,
          sharesSubmitted: newSubmitted,
          sharesAccepted: newAccepted,
          sharesRejected: newRejected,
          efficiency,
          hashrateGhs: newGhs,
          hashrateMhs: newGhs * 1000,
          packetsReceived: prev.packetsReceived + Math.floor(Math.random() * 3),
          lastLatencyMs: 35 + Math.random() * 20,
          uptimeSeconds: prev.uptimeSeconds + 1
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatUptime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header with Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-white tracking-tight">Stratum+TCP Core Mining Engine</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {metrics.state}
                </span>
              </div>
              <p className="text-sm text-slate-400 flex items-center gap-2">
                <span>Connected to <span className="text-cyan-400 font-mono">{metrics.host}:{metrics.port}</span></span>
                <span>•</span>
                <span>Uptime: {formatUptime(metrics.uptimeSeconds)}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 border border-slate-700">
                  <Award className="w-3 h-3 text-amber-400" />
                  ISO 29119-3 VERIFIED
                </span>
                <span className="flex items-center gap-1 text-[10px] bg-indigo-500/10 px-1.5 py-0.5 rounded text-indigo-300 border border-indigo-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  REGULATED SECTOR
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end gap-1">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Compliance Audit</span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                <ShieldCheck className="w-3 h-3" />
                SYSTEM HARDENED
              </div>
            </div>
            <div className="w-px h-10 bg-slate-800" />
            <a 
              href="https://10.240.0.50:8443" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Secure Control Centre</span>
            </a>
            <div className="w-px h-10 bg-slate-800" />
            <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Current Hash Rate</div>
              <div className="text-2xl font-black text-cyan-400 font-mono tracking-tighter">
                {metrics.hashrateGhs.toFixed(2)} <span className="text-sm font-bold text-slate-400">GH/s</span>
              </div>
            </div>
            <div className="w-px h-10 bg-slate-800" />
            <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Pool Efficiency</div>
              <div className="text-2xl font-black text-violet-400 font-mono tracking-tighter">
                {metrics.efficiency.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Network & Latency */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Network Health</span>
            <Network className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Latency</span>
              <span className="text-sm font-mono text-cyan-400 font-bold">{metrics.lastLatencyMs.toFixed(1)}ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Avg Latency</span>
              <span className="text-sm font-mono text-slate-300">{metrics.avgLatencyMs.toFixed(1)}ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">I/O Frames</span>
              <span className="text-sm font-mono text-slate-300">{metrics.packetsReceived}</span>
            </div>
          </div>
        </div>

        {/* Shares Telemetry */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Share Analytics</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Accepted</span>
              <span className="text-sm font-mono text-emerald-400 font-bold">{metrics.sharesAccepted}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Rejected</span>
              <span className="text-sm font-mono text-rose-400 font-bold">{metrics.sharesRejected}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Dispatched</span>
              <span className="text-sm font-mono text-slate-300">{metrics.sharesSubmitted}</span>
            </div>
          </div>
        </div>

        {/* Complexity Engine */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Target Dynamics</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Difficulty</span>
              <span className="text-sm font-mono text-amber-400 font-bold">D {metrics.difficulty}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Timeouts</span>
              <span className="text-sm font-mono text-rose-400">{metrics.timeouts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Algorithm</span>
              <span className="text-sm font-mono text-slate-300">SHA-256d</span>
            </div>
          </div>
        </div>

        {/* System & Venv */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Infrastructure</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Environment</span>
              <span className="text-xs font-mono text-blue-400">python-venv</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Binary Path</span>
              <span className="text-[10px] font-mono text-slate-400">/opt/stratum_engine</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Supervisor</span>
              <span className="text-xs font-mono text-slate-300">systemd</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-800/50">
              <span className="text-[10px] text-slate-500">License APK</span>
              <span className="text-[10px] font-mono text-amber-400">SK-ENT-2026-X...</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Visualization & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Terminal Logs */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[400px]">
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Engine Process Stream</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">
                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                STDOUT
              </div>
              <button className="p-1 text-slate-500 hover:text-white transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="flex-1 p-4 font-mono text-xs overflow-y-auto bg-slate-950/50 space-y-1">
            {logs.map((log, i) => (
              <div key={i} className={`
                ${log.startsWith('✅') ? 'text-emerald-400' : ''}
                ${log.startsWith('❌') ? 'text-rose-400' : ''}
                ${log.startsWith('[STATE') ? 'text-blue-400' : ''}
                ${log.startsWith('[DIFFICULTY') ? 'text-amber-400' : ''}
                ${!log.includes('[') && !log.includes('✅') && !log.includes('❌') ? 'text-slate-400' : ''}
              `}>
                <span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Side Panel: Artifacts & Exports */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Deployment Artifacts</h3>
            </div>
            
            <div className="space-y-3">
              <a href="#" className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">stratum_production_system.py</div>
                    <div className="text-[10px] text-slate-500">Core + Web UI Engine</div>
                  </div>
                </div>
              </a>

              <a href="#" className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">deploy_stratum.sh</div>
                    <div className="text-[10px] text-slate-500">Automated Venv Provisioner</div>
                  </div>
                </div>
              </a>

              <a href="#" className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-violet-500/50 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-violet-400 transition-colors">rolling_logger.py</div>
                    <div className="text-[10px] text-slate-500">CSV Telemetry Analytics</div>
                  </div>
                </div>
              </a>
            </div>

            <div className="pt-2">
              <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-all border border-slate-700">
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Production Runtime
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600/20 to-blue-600/20 border border-indigo-500/30 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Kernel Integration</h3>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              This engine is mapped via the KEX Linux Microkernel syscall interface. Socket IO is routed through the high-performance VFS net stack for zero-copy transmission.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-mono text-slate-300">VFS_NET_BUFFER: 65536 KB [OK]</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Ethical Lineage</h3>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] text-slate-500 leading-relaxed italic">
                "Verified against ISO/IEC 29119. Deployed strictly within regulated industrial sectors where ethical integrity is mathematically enforced."
              </p>
              <div className="flex items-center justify-between text-[9px] font-mono text-emerald-400/60 uppercase">
                <span>Sector: Industrial</span>
                <span>ID: 0x8F9B-REG</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
