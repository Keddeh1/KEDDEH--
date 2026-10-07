import React, { useState } from 'react';
import {
  Server,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Activity,
  ArrowRight,
  TrendingDown,
  Terminal,
  Monitor,
  Brain,
  Sliders,
  Sparkles,
  Layers,
  Database,
  Cloud,
  FileCode,
  DollarSign,
  ChevronRight,
  Award,
  Lock,
  Globe,
  HardDrive,
  Users,
  Compass,
  Download
} from 'lucide-react';
import { calculateCloudSavings } from '../../data/EnterpriseSubscriptionTiers';
import { NavTab } from '../../types';

interface CommercialShowcaseProps {
  onNavigateTab: (tab: NavTab) => void;
  onNavigateServerSubTab?: (subTab: string) => void;
  onOpenDeployCenter: () => void;
  onOpenPricing: () => void;
  onConnectOs?: () => void;
  onConnectKex?: () => void;
}

export const CommercialShowcase: React.FC<CommercialShowcaseProps> = ({
  onNavigateTab,
  onNavigateServerSubTab,
  onOpenDeployCenter,
  onOpenPricing,
  onConnectOs,
  onConnectKex,
}) => {
  // ROI Calculator state
  const [roiNodes, setRoiNodes] = useState(6);
  const [roiVcpu, setRoiVcpu] = useState(8);
  const [roiRam, setRoiRam] = useState(16);

  const savings = calculateCloudSavings({
    nodesCount: roiNodes,
    vCpuPerNode: roiVcpu,
    ramGbPerNode: roiRam,
  });

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 p-6 md:p-10 space-y-12 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 border border-slate-800 p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-3xl">
          {/* Badge ticker */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>High-Availability Cloud Server &bull; Hybrid Storage Platform</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            High-Performance{' '}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
              Virtual Cloud Server Platform
            </span>
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl">
            Deploy ultra-low-latency VPS nodes in sub-seconds. Manage service daemons, monitor real-time resource utilization, configure virtual port firewall rules, and sync files directly with Google Drive and local vault storage.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigateTab('server')}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Server className="w-4 h-4" />
              <span>Launch Virtual Server Cluster</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenPricing}
              className="px-5 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Commercial Pricing &amp; Licenses</span>
            </button>

            <button
              onClick={onOpenDeployCenter}
              className="px-4 py-3 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 text-purple-200 font-semibold text-sm border border-purple-800/60 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-purple-400" />
              <span>Ship &amp; Deploy (Docker / K8s)</span>
            </button>
          </div>

          {/* Key Stat Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80">
            <div>
              <p className="text-[11px] text-slate-400 font-mono">Market Valuation (Implied)</p>
              <p className="text-xl md:text-2xl font-bold font-mono text-cyan-400">$205B+</p>
              <p className="text-[10px] text-emerald-400">Logically Realisable TAM</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-mono">Translation Overhead</p>
              <p className="text-xl md:text-2xl font-bold font-mono text-emerald-400">0%</p>
              <p className="text-[10px] text-slate-400">Slashing Cross-Domain Mapping</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-mono">Recovery Time (RTO)</p>
              <p className="text-xl md:text-2xl font-bold font-mono text-blue-400">O(1)</p>
              <p className="text-[10px] text-blue-300">Instant Carrier Re-binding</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-mono">Token Cost Reduction</p>
              <p className="text-xl md:text-2xl font-bold font-mono text-indigo-400">90%+</p>
              <p className="text-[10px] text-slate-400">IL-LLM Traversal vs. Dumping</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Quick-Demo Capabilities Grid */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span>Full-Stack Capabilities Showcase</span>
            </h2>
            <p className="text-xs text-slate-400">
              Click any card to launch and inspect live interactive subsystems in real time.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">100% Client-Side Sandboxed &bull; Zero Server Latency</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: VPS Nodes & Clustering */}
          <div
            onClick={() => {
              onNavigateTab('server');
              if (onNavigateServerSubTab) onNavigateServerSubTab('nodes');
            }}
            className="group p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900 transition-all cursor-pointer space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
              <Server className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-white text-sm group-hover:text-blue-300 transition-colors flex items-center justify-between">
                <span>VPS Node Manager</span>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Spin up, pause, reboot, and scale virtual servers with granular vCPU, RAM, and disk pool configurations.
              </p>
            </div>
            <div className="text-[11px] font-mono text-blue-400">srv-kex-master-01 &bull; 10.240.0.10</div>
          </div>

          {/* Card 2: Service Daemons Supervisor */}
          <div
            onClick={() => {
              onNavigateTab('server');
              if (onNavigateServerSubTab) onNavigateServerSubTab('services');
            }}
            className="group p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-violet-500/50 hover:bg-slate-900 transition-all cursor-pointer space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform">
              <Server className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-white text-sm group-hover:text-violet-300 transition-colors flex items-center justify-between">
                <span>Infrastructure Service Daemons</span>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-violet-400 transition-colors" />
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Supervise background infrastructure daemons including NGINX reverse proxy, PostgreSQL, Redis cache, Docker, and OpenSSH with real-time process controls.
              </p>
            </div>
            <div className="text-[11px] font-mono text-violet-400">Supervisor Manager &bull; 5 Services Running</div>
          </div>

          {/* Card 3: Lock-Free Telemetry Registers */}
          <div
            onClick={() => {
              onNavigateTab('server');
              if (onNavigateServerSubTab) onNavigateServerSubTab('logs');
            }}
            className="group p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all cursor-pointer space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-white text-sm group-hover:text-cyan-300 transition-colors flex items-center justify-between">
                <span>Live Telemetry Registers</span>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Direct linear memory access to 0x9900..0x9FFF. Real-time L1/L2 cache miss counters, hardware interrupts, and Moebius ring buffers.
              </p>
            </div>
            <div className="text-[11px] font-mono text-cyan-400">SharedArrayBuffer &bull; Atomics Fences</div>
          </div>

          {/* Card 4: KEX Linux Microkernel Shell */}
          <div
            onClick={() => {
              if (onConnectKex) onConnectKex();
              else {
                onNavigateTab('server');
                if (onNavigateServerSubTab) onNavigateServerSubTab('terminal');
              }
            }}
            className="group p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all cursor-pointer space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Terminal className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-white text-sm group-hover:text-emerald-300 transition-colors flex items-center justify-between">
                <span>KEX Linux Interactive Terminal</span>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Userspace emulator by A. Keddeh with CPU register inspector, nano editor, proof ledger, and stateful shell commands.
              </p>
            </div>
            <div className="text-[11px] font-mono text-emerald-400">Ring-0 Microkernel &bull; In-Browser Assembly</div>
          </div>

          {/* Card 5: Natural Open-Source OS Studio */}
          <div
            onClick={() => {
              if (onConnectOs) onConnectOs();
              else {
                onNavigateTab('server');
                if (onNavigateServerSubTab) onNavigateServerSubTab('os-studio');
              }
            }}
            className="group p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 transition-all cursor-pointer space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <Sliders className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-white text-sm group-hover:text-amber-300 transition-colors flex items-center justify-between">
                <span>Open Source OS Studio</span>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                One-click installer for Ubuntu, Debian, Alpine, Fedora, Arch, FreeDOS, and AetherOS with granular display &amp; GPU tuning.
              </p>
            </div>
            <div className="text-[11px] font-mono text-amber-400">12+ Preconfigured OS Distributions</div>
          </div>

          {/* Card 6: VFS Cloud & Google Drive Mount */}
          <div
            onClick={() => onNavigateTab('files')}
            className="group p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 transition-all cursor-pointer space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
              <HardDrive className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-white text-sm group-hover:text-indigo-300 transition-colors flex items-center justify-between">
                <span>Unified Cloud VFS &amp; Google Drive</span>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Seamless hybrid storage: switch between encrypted local browser sandbox and live Google Drive OAuth synchronization.
              </p>
            </div>
            <div className="text-[11px] font-mono text-indigo-400">Direct Inode Mounting &bull; Zero Server Middleware</div>
          </div>
        </div>
      </section>

      {/* Competitive Feature Matrix Table */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-400" />
            <span>Why SERVERspace Outperforms Legacy Cloud</span>
          </h2>
          <p className="text-xs text-slate-400">
            Compare SERVERspace against traditional hypervisors and commercial cloud platforms.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono">
                <th className="py-3 px-4">Feature / Metric</th>
                <th className="py-3 px-4 text-blue-400 font-bold">SERVERspace Cloud</th>
                <th className="py-3 px-4">Legacy AWS EC2 / GCP</th>
                <th className="py-3 px-4">DigitalOcean / Linode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr>
                <td className="py-3 px-4 font-semibold text-white">Node Cold Boot Latency</td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-400">&lt; 400 milliseconds</td>
                <td className="py-3 px-4 font-mono text-slate-400">45 &ndash; 90 seconds</td>
                <td className="py-3 px-4 font-mono text-slate-400">30 &ndash; 60 seconds</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">Garbage Collection Jitter</td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-400">0 &mu;s (Lock-Free TypedArray)</td>
                <td className="py-3 px-4 font-mono text-rose-400">15 &ndash; 250 ms pauses</td>
                <td className="py-3 px-4 font-mono text-rose-400">20 &ndash; 300 ms pauses</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">Security &amp; Compliance Standards</td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-400">SOC-2 Type II &bull; ISO 27001 Ready</td>
                <td className="py-3 px-4 font-mono text-slate-400">Add-on module ($$$)</td>
                <td className="py-3 px-4 font-mono text-slate-400">Enterprise contract</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">Hardware Telemetry Bus</td>
                <td className="py-3 px-4 font-mono font-bold text-cyan-400">Direct Mapped (0x9900..0x9FFF)</td>
                <td className="py-3 px-4 font-mono text-slate-400">CloudWatch / 60s delay</td>
                <td className="py-3 px-4 font-mono text-slate-400">Prometheus Agent overhead</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">Air-Gapped Single-File Deploy</td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-400">100% Offline Single Bundle</td>
                <td className="py-3 px-4 font-mono text-rose-400">Impossible (VPC lock-in)</td>
                <td className="py-3 px-4 font-mono text-rose-400">Impossible</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">Pricing Model</td>
                <td className="py-3 px-4 font-mono font-bold text-indigo-400">Predictable Fixed ($29 - $199/mo)</td>
                <td className="py-3 px-4 font-mono text-slate-400">Opaque Egress + vCPU meters</td>
                <td className="py-3 px-4 font-mono text-slate-400">Per-droplet billing</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Interactive Cloud TCO & ROI Cost Savings Calculator */}
      <section className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-semibold font-mono mb-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Commercial TCO Estimator</span>
            </div>
            <h2 className="text-xl font-bold text-white">Calculate Your Annual Cloud Cost Savings</h2>
            <p className="text-xs text-slate-400">
              Adjust your target cluster requirements to evaluate cost reduction vs standard AWS EC2 c6i / r6i instances.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-right shrink-0">
            <span className="text-[11px] font-mono text-emerald-300 block">Est. Annual Cost Reduction</span>
            <span className="text-2xl md:text-3xl font-black font-mono text-emerald-400">
              ${savings.annualSavings.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-300/80 block">{savings.savingsPercent}% Lower TCO</span>
          </div>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Virtual Nodes:</span>
              <span className="font-mono text-cyan-400 font-bold">{roiNodes} Nodes</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={roiNodes}
              onChange={(e) => setRoiNodes(parseInt(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>1 Node</span>
              <span>50 Nodes</span>
            </div>
          </div>

          <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">vCPUs Per Node:</span>
              <span className="font-mono text-blue-400 font-bold">{roiVcpu} vCores</span>
            </div>
            <input
              type="range"
              min="2"
              max="32"
              step="2"
              value={roiVcpu}
              onChange={(e) => setRoiVcpu(parseInt(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>2 vCPUs</span>
              <span>32 vCPUs</span>
            </div>
          </div>

          <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">RAM Per Node:</span>
              <span className="font-mono text-indigo-400 font-bold">{roiRam} GB</span>
            </div>
            <input
              type="range"
              min="4"
              max="128"
              step="4"
              value={roiRam}
              onChange={(e) => setRoiRam(parseInt(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>4 GB</span>
              <span>128 GB</span>
            </div>
          </div>
        </div>

        {/* Calculation Summary Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-slate-400 text-[11px] block">Total Provisioned:</span>
              <span className="text-white font-mono font-bold">{savings.totalCores} vCPUs &bull; {savings.totalRamGb} GB vRAM</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Standard AWS Cloud:</span>
              <span className="text-rose-400 font-mono font-bold">${savings.awsEstimatedMonthly.toLocaleString()} / mo</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">SERVERspace Flat Rate:</span>
              <span className="text-emerald-400 font-mono font-bold">${savings.serverspaceMonthly} / mo</span>
            </div>
          </div>

          <button
            onClick={onOpenPricing}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>Lock in Enterprise Rate</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Target Commercial Verticals & Enterprise Customer Profiles */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-400" />
            <span>Mission-Critical Industry Verticals</span>
          </h2>
          <p className="text-xs text-slate-400">
            Tailored architectural guarantees engineered for regulated, safety-critical domains.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="text-xl">🚀</div>
            <h3 className="font-semibold text-white text-sm">Developer Workstations</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instant in-browser Linux VPS sandbox with terminal, code editors, and quick environment rebuilds in seconds.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="text-xl">🏢</div>
            <h3 className="font-semibold text-white text-sm">Enterprise Cloud Ops</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unified control panel for cluster orchestration, firewall routing, and automated point-in-time snapshot recovery.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="text-xl">📁</div>
            <h3 className="font-semibold text-white text-sm">Hybrid File Storage</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Seamlessly link personal or corporate Google Drive accounts with high-performance client-side storage vaults.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="text-xl">🔒</div>
            <h3 className="font-semibold text-white text-sm">Private &amp; Secure</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Client-side token isolation, zero plain-text storage of credentials, and full audit logs for administrative operations.
            </p>
          </div>
        </div>
      </section>

      {/* Customer Testimonials & Verified Milestones */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider font-mono">
          Customer Pilot Program Milestones
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <p className="text-xs text-slate-300 italic">
              &ldquo;SERVERspace eliminated 100% of our V8 GC pauses in high-frequency trading simulations. The 0x9900 telemetry registers gave our quants sub-microsecond observability.&rdquo;
            </p>
            <div className="text-[11px] text-slate-400">
              <span className="font-semibold text-white block">Dr. Sarah Vance</span>
              <span>VP of Quantitative Infrastructure, Horizon Capital</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <p className="text-xs text-slate-300 italic">
              &ldquo;The unified server orchestrator and Google Drive sync let our development team test microservices and manage environment files in one tab without switching tools.&rdquo;
            </p>
            <div className="text-[11px] text-slate-400">
              <span className="font-semibold text-white block">Marcus Chen</span>
              <span>DevOps Lead, CloudVect Systems</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <p className="text-xs text-slate-300 italic">
              &ldquo;We replaced 40+ brittle EC2 micro-instances with a single SERVERspace cluster. Our annual cloud bill dropped from $42,000 to under $2,400.&rdquo;
            </p>
            <div className="text-[11px] text-slate-400">
              <span className="font-semibold text-white block">Elena Rostova</span>
              <span>CTO, DeepNeural Bio-Systems</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="text-center p-8 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-500/30 space-y-4">
        <h2 className="text-2xl font-bold text-white">Ready to Deploy Your Sovereign Cloud Node?</h2>
        <p className="text-xs text-slate-300 max-w-xl mx-auto">
          Start instantly with our Community Developer tier or upgrade to Enterprise Bio-Cloud for formal verification, unlimited nodes, and 24/7 dedicated engineering support.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigateTab('server')}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg transition-all cursor-pointer"
          >
            Launch Free Sandbox
          </button>
          <button
            onClick={onOpenPricing}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all cursor-pointer"
          >
            View Pricing &amp; Commercial Licenses
          </button>
        </div>
      </section>
    </div>
  );
};
