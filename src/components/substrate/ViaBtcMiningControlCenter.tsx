import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Radio, 
  Zap, 
  ShieldCheck, 
  Activity, 
  ExternalLink, 
  RefreshCw, 
  Layers, 
  CheckCircle2, 
  Copy, 
  Check, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Server,
  DollarSign,
  Clock,
  Coins,
  Sliders,
  Settings,
  Shield,
  HelpCircle
} from 'lucide-react';

interface MinerPreset {
  id: string;
  brand: 'Antminer' | 'Whatsminer' | 'Avalon';
  model: string;
  hashrateTh: number;
  powerWatts: number;
  efficiency: number; // J/TH
}

const HARDWARE_PRESETS: MinerPreset[] = [
  { id: 'antminer-s19-pro', brand: 'Antminer', model: 'S19 Pro', hashrateTh: 110, powerWatts: 3250, efficiency: 29.5 },
  { id: 'antminer-s19', brand: 'Antminer', model: 'S19', hashrateTh: 95, powerWatts: 3100, efficiency: 32.5 },
  { id: 'antminer-s17e', brand: 'Antminer', model: 'S17e', hashrateTh: 64, powerWatts: 2880, efficiency: 45.0 },
  { id: 'whatsminer-m30s', brand: 'Whatsminer', model: 'M30S', hashrateTh: 88, powerWatts: 3344, efficiency: 38.0 },
  { id: 'whatsminer-m20s', brand: 'Whatsminer', model: 'M20S', hashrateTh: 68, powerWatts: 3360, efficiency: 48.0 },
  { id: 'avalon-a1166', brand: 'Avalon', model: 'A1166', hashrateTh: 68, powerWatts: 3196, efficiency: 47.0 }
];

export const ViaBtcMiningControlCenter: React.FC = () => {
  // Mining mode: BTC Mining vs Smart Mining (One-Click Switch)
  const [miningMode, setMiningMode] = useState<'btc' | 'smart'>('smart');
  
  // Payment method: PPS+, PPLNS, SOLO
  const [paymentMethod, setPaymentMethod] = useState<'PPS+' | 'PPLNS' | 'SOLO'>('PPS+');

  // Worker Config
  const [userId, setUserId] = useState('viabtc');
  const [workerId, setWorkerId] = useState('001');
  const [password, setPassword] = useState('123');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Selected hardware profile
  const [selectedHardware, setSelectedHardware] = useState<MinerPreset>(HARDWARE_PRESETS[0]);

  // Port failover simulation
  const [activePort, setActivePort] = useState<3333 | 443>(3333);
  const [isSimulatingFailover, setIsSimulatingFailover] = useState(false);
  const [failoverLog, setFailoverLog] = useState<string[]>([]);
  const [latencyMs, setLatencyMs] = useState(38.4);

  // Calculated URLs
  const primaryHost = miningMode === 'btc' ? 'btc.viabtc.io' : 'bitcoin.viabtc.io';
  const primaryUrl = `stratum+tcp://${primaryHost}:3333`;
  const backupUrl = `stratum+tcp://${primaryHost}:443`;
  const fullWorkerName = `${userId}.${workerId}`;

  // Copy helper
  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Simulate port failover test
  const handleTriggerFailoverTest = () => {
    setIsSimulatingFailover(true);
    setFailoverLog(prev => [
      `[${new Date().toLocaleTimeString()}] Testing connection to primary ${primaryHost}:3333...`,
      ...prev.slice(0, 8)
    ]);

    setTimeout(() => {
      setFailoverLog(prev => [
        `[${new Date().toLocaleTimeString()}] SIMULATED INACTIVITY: Primary port 3333 unreachable`,
        `[${new Date().toLocaleTimeString()}] FAILOVER TRIGGERED: Auto-switching to backup port 443...`,
        ...prev.slice(0, 8)
      ]);
      setActivePort(443);
      setLatencyMs(41.2);

      setTimeout(() => {
        setFailoverLog(prev => [
          `[${new Date().toLocaleTimeString()}] SUCCESS: Authenticated on ${primaryHost}:443. Worker: ${fullWorkerName} active.`,
          ...prev.slice(0, 8)
        ]);
        setIsSimulatingFailover(false);
      }, 1200);
    }, 1500);
  };

  const handleResetToPrimary = () => {
    setActivePort(3333);
    setLatencyMs(38.4);
    setFailoverLog(prev => [
      `[${new Date().toLocaleTimeString()}] Re-established connection to primary port 3333.`,
      ...prev.slice(0, 8)
    ]);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 text-slate-200 font-sans select-text">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 flex items-center justify-center text-black font-black text-lg shadow-lg shadow-orange-500/20 shrink-0">
              ₿
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">ViaBTC BTC Mining Center</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  OFFICIAL PROTOCOL
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  MERGED MINING (NMC, SYS, ELA)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Multi-port auto-failover, Smart Mining one-click switch, and Antminer/Whatsminer/Avalon ASIC configurations.
              </p>
            </div>
          </div>

          {/* Quick Stats Banner */}
          <div className="flex items-center gap-3 text-xs font-mono bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Active Stratum Port</div>
              <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>Port {activePort}</span>
                <span className="text-[10px] text-slate-400 font-normal">({latencyMs}ms)</span>
              </div>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Daily Auto Payout</div>
              <div className="font-bold text-emerald-400">10:00 - 18:00 UTC+8</div>
            </div>
          </div>
        </div>

        {/* Mode Selector: Standard BTC Mining vs Smart Mining */}
        <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-800/80">
          <span className="text-xs font-semibold text-slate-400 mr-2">Mining Mode:</span>
          <button
            onClick={() => setMiningMode('btc')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              miningMode === 'btc'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>BTC Mining (Dedicated Pool)</span>
            <span className="font-mono text-[10px] opacity-75">btc.viabtc.io</span>
          </button>
          <button
            onClick={() => setMiningMode('smart')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              miningMode === 'smart'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>Smart Mining [One-Click Switch]</span>
            <span className="font-mono text-[10px] opacity-75">bitcoin.viabtc.io</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stratum URL & Worker Configuration (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stratum URLs with Multi-Port Failover */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">1. Configure Stratum URLs (Multi-Port Redundancy)</h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded">
                FAILOVER READY
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              ViaBTC recommends configuring both primary and backup ports. When one port encounters an ISP interruption, the ASIC miner automatically switches to the secondary port without losing hashing shares.
            </p>

            <div className="space-y-3">
              {/* Primary Port 3333 */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                activePort === 3333 ? 'bg-cyan-950/30 border-cyan-500/40 ring-1 ring-cyan-500/20' : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${activePort === 3333 ? 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]' : 'bg-slate-600'}`} />
                    <span className="font-bold text-white">Primary Stratum URL (Port 3333)</span>
                    {activePort === 3333 && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-500 text-black">ACTIVE</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleCopy(primaryUrl, 'primary-url')}
                    className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 cursor-pointer"
                  >
                    {copiedField === 'primary-url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'primary-url' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="font-mono text-xs text-cyan-300 bg-black/60 p-2.5 rounded-lg border border-slate-800/80 select-all">
                  {primaryUrl}
                </div>
              </div>

              {/* Backup Port 443 */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                activePort === 443 ? 'bg-amber-950/30 border-amber-500/40 ring-1 ring-amber-500/20' : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${activePort === 443 ? 'bg-amber-400 shadow-[0_0_6px_#f59e0b]' : 'bg-slate-600'}`} />
                    <span className="font-bold text-white">Backup Stratum URL (Port 443 - SSL/TLS Bypass)</span>
                    {activePort === 443 && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500 text-black">FAILOVER ACTIVE</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleCopy(backupUrl, 'backup-url')}
                    className="flex items-center gap-1 text-[11px] font-mono text-amber-400 hover:text-amber-300 cursor-pointer"
                  >
                    {copiedField === 'backup-url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'backup-url' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="font-mono text-xs text-amber-300 bg-black/60 p-2.5 rounded-lg border border-slate-800/80 select-all">
                  {backupUrl}
                </div>
              </div>
            </div>

            {/* Failover Test Action Bar */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-800">
              <div className="flex items-center gap-2 text-slate-400">
                <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>Simulate network dropout to verify auto-failover to Port 443</span>
              </div>
              <div className="flex items-center gap-2">
                {activePort === 443 ? (
                  <button
                    onClick={handleResetToPrimary}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
                  >
                    Restore Primary (Port 3333)
                  </button>
                ) : (
                  <button
                    onClick={handleTriggerFailoverTest}
                    disabled={isSimulatingFailover}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingFailover ? 'animate-spin' : ''}`} />
                    <span>Test Port Failover</span>
                  </button>
                )}
              </div>
            </div>

            {/* Failover logs */}
            {failoverLog.length > 0 && (
              <div className="p-3 rounded-lg bg-black border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1 max-h-32 overflow-y-auto">
                {failoverLog.map((log, idx) => (
                  <div key={idx} className={log.includes('FAILOVER') ? 'text-amber-400 font-bold' : log.includes('SUCCESS') ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Worker Creation & Management */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">2. Create Worker (userID.workerID)</h3>
              </div>
              <span className="text-[10px] font-mono text-purple-300 bg-purple-950 border border-purple-800 px-2 py-0.5 rounded">
                MAX 64 CHARACTERS
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Worker format follows <code className="text-purple-300 font-mono">userID.workerID</code>. WorkerID must consist of numbers and lowercase letters within 64 characters. Password is optional (e.g. <code className="text-slate-300 font-mono">123</code> or blank).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 text-[11px] font-mono mb-1">User ID</label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:border-cyan-500 focus:outline-none"
                  placeholder="viabtc"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] font-mono mb-1">Worker ID</label>
                <input
                  type="text"
                  value={workerId}
                  onChange={(e) => setWorkerId(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:border-cyan-500 focus:outline-none"
                  placeholder="001"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] font-mono mb-1">Worker Password (Optional)</label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:border-cyan-500 focus:outline-none"
                  placeholder="123"
                />
              </div>
            </div>

            {/* Generated Miner Config String */}
            <div className="p-4 rounded-xl bg-slate-950 border border-purple-900/40 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-purple-300">Antminer / Whatsminer / Avalon Input Strings</span>
                <button
                  onClick={() => handleCopy(fullWorkerName, 'worker-name')}
                  className="flex items-center gap-1 text-[11px] font-mono text-purple-400 hover:text-purple-300 cursor-pointer"
                >
                  {copiedField === 'worker-name' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'worker-name' ? 'Copied' : 'Copy Worker'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded bg-black border border-slate-800">
                  <div className="text-[10px] text-slate-500">URL 1:</div>
                  <div className="text-cyan-300 truncate">{primaryUrl}</div>
                </div>
                <div className="p-2.5 rounded bg-black border border-slate-800">
                  <div className="text-[10px] text-slate-500">URL 2 (Backup):</div>
                  <div className="text-amber-300 truncate">{backupUrl}</div>
                </div>
                <div className="p-2.5 rounded bg-black border border-slate-800">
                  <div className="text-[10px] text-slate-500">Worker:</div>
                  <div className="text-purple-300 font-bold">{fullWorkerName}</div>
                </div>
                <div className="p-2.5 rounded bg-black border border-slate-800">
                  <div className="text-[10px] text-slate-500">Password:</div>
                  <div className="text-slate-300">{password || 'x'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Applicable Hardware Profiles */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">3. Applicable Miners & ASIC Profiles</h3>
              </div>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-950 border border-amber-800 px-2 py-0.5 rounded">
                SHA-256 ASIC
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {HARDWARE_PRESETS.map((hw) => {
                const isSelected = selectedHardware.id === hw.id;
                return (
                  <div
                    key={hw.id}
                    onClick={() => setSelectedHardware(hw)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white">{hw.brand} {hw.model}</span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
                      )}
                    </div>
                    <div className="space-y-1 text-[11px] font-mono text-slate-400">
                      <div>Hashrate: <span className="text-cyan-400 font-bold">{hw.hashrateTh} TH/s</span></div>
                      <div>Power: <span className="text-slate-300">{hw.powerWatts} W</span></div>
                      <div>Efficiency: <span className="text-emerald-400">{hw.efficiency} J/TH</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Payment Modes, Merged Mining, Payouts */}
        <div className="space-y-6">
          {/* Payment Methods (PPS+, PPLNS, SOLO) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Payment Methods</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
                VIABTC SETTLEMENT
              </span>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  id: 'PPS+' as const,
                  title: 'PPS+ (Pay Per Share + TX)',
                  fee: '4% PPS + 2% TX Fee',
                  desc: 'Stable guaranteed payout per valid share submitted, plus transaction fee dividend. Minimal luck variance.'
                },
                {
                  id: 'PPLNS' as const,
                  title: 'PPLNS (Pay Per Last N Shares)',
                  fee: '2% Fee',
                  desc: 'Allocates block reward based on shares in past luck rounds. Ideal for 24/7 continuous mining rigs.'
                },
                {
                  id: 'SOLO' as const,
                  title: 'SOLO Mining',
                  fee: '1% Fee',
                  desc: 'Full 100% block reward + tx fees to the finding miner. Zero sharing. Requires massive hashrate.'
                }
              ].map((m) => (
                <div
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === m.id
                      ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/30'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{m.title}</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400">{m.fee}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Merged Mining Bonuses (NMC, SYS, ELA) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-yellow-400" />
                <h3 className="text-sm font-bold text-white">Merged Mining Bonuses</h3>
              </div>
              <span className="text-[10px] font-mono text-yellow-300 bg-yellow-950 border border-yellow-800 px-2 py-0.5 rounded">
                AuxPoW 100% FREE
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              ViaBTC automatically allocates parent Bitcoin proof-of-work hashes to auxiliary blockchains at zero extra electricity cost:
            </p>

            <div className="space-y-2 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-blue-900/80 text-blue-300 font-bold flex items-center justify-center text-[10px]">
                    NMC
                  </span>
                  <div>
                    <div className="font-bold text-white">Namecoin (NMC)</div>
                    <div className="text-[10px] text-slate-500">Decentralized DNS</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-bold">+1.4% Bonus</div>
                  <div className="text-[10px] text-slate-400">AuxPoW Active</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-cyan-900/80 text-cyan-300 font-bold flex items-center justify-center text-[10px]">
                    SYS
                  </span>
                  <div>
                    <div className="font-bold text-white">Syscoin (SYS)</div>
                    <div className="text-[10px] text-slate-500">Rollup Layer 1</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-bold">+0.8% Bonus</div>
                  <div className="text-[10px] text-slate-400">AuxPoW Active</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-purple-900/80 text-purple-300 font-bold flex items-center justify-center text-[10px]">
                    ELA
                  </span>
                  <div>
                    <div className="font-bold text-white">Elastos (ELA)</div>
                    <div className="text-[10px] text-slate-500">SmartWeb Substrate</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-bold">+1.9% Bonus</div>
                  <div className="text-[10px] text-slate-400">AuxPoW Active</div>
                </div>
              </div>
            </div>
          </div>

          {/* Payout Options */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Payout Schedules</h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded">
                DAILY SETTLEMENT
              </span>
            </div>

            <ul className="space-y-2 text-xs text-slate-300">
              <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="font-bold text-emerald-400 block">1. Auto Withdrawal (ZERO Fee)</span>
                <span className="text-[11px] text-slate-400">Unified automated payment every day between 10:00 and 18:00 UTC+8 to your registered wallet.</span>
              </li>
              <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="font-bold text-blue-400 block">2. Normal Transfer</span>
                <span className="text-[11px] text-slate-400">On-demand withdrawal anytime subject to standard Bitcoin network mining fee.</span>
              </li>
              <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="font-bold text-purple-400 block">3. Inter-user Transfer (ZERO Fee & Confirmation)</span>
                <span className="text-[11px] text-slate-400">Instant internal ledger transfer between ViaBTC account holders with zero blockchain fees.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
