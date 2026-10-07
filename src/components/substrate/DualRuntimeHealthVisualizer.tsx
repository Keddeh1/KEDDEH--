import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  Radio, 
  Cpu, 
  Terminal,
  CheckCircle2,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { GLOBAL_HEALTH_DAEMON, HealthAuditSnapshot, HealthCheckItem } from '../../services/AutomatedHealthDaemon';

interface DualRuntimeHealthVisualizerProps {
  isDrawerOpen?: boolean;
  onToggleDrawer?: () => void;
}

export const DualRuntimeHealthVisualizer: React.FC<DualRuntimeHealthVisualizerProps> = ({
  isDrawerOpen = false,
  onToggleDrawer
}) => {
  const [snapshot, setSnapshot] = useState<HealthAuditSnapshot | null>(GLOBAL_HEALTH_DAEMON.getSnapshot());
  const [isAuditing, setIsAuditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    GLOBAL_HEALTH_DAEMON.init(3000);
    const unsubscribe = GLOBAL_HEALTH_DAEMON.onAudit((s) => setSnapshot(s));
    return () => unsubscribe();
  }, []);

  const handleManualAudit = async () => {
    setIsAuditing(true);
    await GLOBAL_HEALTH_DAEMON.runAuditCycle();
    setIsAuditing(false);
  };

  const handleInjectFault = async () => {
    setIsAuditing(true);
    await GLOBAL_HEALTH_DAEMON.injectFault('VFS_CARRIER_DETACH_SIMULATION');
    setIsAuditing(false);
  };

  const filteredChecks = snapshot?.checks.filter(c => 
    selectedCategory === 'ALL' || c.category === selectedCategory
  ) || [];

  return (
    <div className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      {/* Top Telemetry Summary Ribbon */}
      <div className="px-4 py-2.5 flex items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="font-semibold text-white tracking-tight">KERA/STRATUM RUNTIME</span>
            <span className="text-slate-500" aria-hidden="true">·</span>
            <span className="text-slate-400">VFS Hypervisor Multicast 239.29.7.100:4003</span>
          </div>

          <span className="text-slate-600 hidden md:inline" aria-hidden="true">/</span>

          {/* Unboxed Metadata with Typographic Separators */}
          <div className="hidden lg:flex items-center gap-2 text-slate-400">
            <span>Pool: bitcoin.viabtc.io:3333</span>
            <span aria-hidden="true">·</span>
            <span>Domain: 18054</span>
            <span aria-hidden="true">·</span>
            <span>WASM: 128KB Aligned</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              snapshot?.overallStatus === 'OPTIMAL' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' :
              snapshot?.overallStatus === 'DEGRADED' ? 'bg-amber-400' : 'bg-rose-500'
            }`} />
            <span className="text-slate-300 font-medium">
              {snapshot?.checksPassed ?? 0}/{snapshot?.checksTotal ?? 6} Checks Pass
            </span>
            <span className="text-slate-500" aria-hidden="true">·</span>
            <span className="text-slate-400 tabular-nums">
              {snapshot?.avgLatencyMs ?? 0}ms avg
            </span>
          </div>

          <button
            onClick={handleManualAudit}
            disabled={isAuditing}
            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            title="Execute immediate live health audit"
          >
            <RefreshCw className={`w-3 h-3 ${isAuditing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Audit</span>
          </button>

          <button
            onClick={onToggleDrawer}
            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            title="Toggle Detailed Health Drawer"
          >
            <span>Inspector</span>
            {isDrawerOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
          </button>
        </div>
      </div>

      {/* Expandable Audit Drawer */}
      {isDrawerOpen && (
        <div className="border-t border-slate-800/80 bg-slate-950 p-4 space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
              {['ALL', 'NETWORK', 'STRATUM', 'MULTICAST', 'GOVERNANCE', 'MEMORY'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-[11px] font-mono rounded transition-colors ${
                    selectedCategory === cat 
                      ? 'bg-slate-800 text-cyan-400 font-semibold shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleInjectFault}
                disabled={isAuditing}
                className="px-3 py-1 text-xs font-mono rounded bg-rose-950/40 border border-rose-800/60 hover:bg-rose-900/40 text-rose-300 hover:text-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Simulate Fault Injection</span>
              </button>
            </div>
          </div>

          {/* Checks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredChecks.map((chk) => (
              <div 
                key={chk.id} 
                className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 truncate">{chk.name}</span>
                    {chk.passed ? (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>PASS</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] text-rose-400 font-mono">
                        <XCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>FAIL</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-1 truncate">{chk.target}</p>
                  <p className="text-[11px] text-slate-300 mt-1">{chk.details}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>{chk.category}</span>
                  <span className="tabular-nums">{chk.latencyMs}ms latency</span>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Audit Log Stream */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-3 font-mono text-xs">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold text-slate-300">Live Health Verification Log Stream</span>
            </div>
            <div className="max-h-28 overflow-y-auto space-y-1 text-[11px] text-slate-400">
              {snapshot?.recentLogs.slice(0, 8).map((log, i) => (
                <div key={i} className="leading-relaxed truncate">{log}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
