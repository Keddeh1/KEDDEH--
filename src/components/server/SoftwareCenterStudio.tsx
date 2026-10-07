import React, { useState } from 'react';
import {
  Download,
  CheckCircle2,
  Play,
  Square,
  RotateCw,
  Search,
  Filter,
  FileCode,
  Terminal,
  Cpu,
  Layers,
  Database,
  Globe,
  Zap,
  Sparkles,
  Shield,
  Activity,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  X,
  AlertTriangle,
  Radio,
  Server,
  Brain
} from 'lucide-react';
import { SoftwarePackage, VirtualPortRule, ServerDaemon } from '../../types';
import { INITIAL_SOFTWARE_PACKAGES } from '../../data/softwareCenterData';

interface SoftwareCenterStudioProps {
  onOpenTerminalWithCmd?: (cmd: string) => void;
  onOpenPortRule?: (rule: VirtualPortRule) => void;
  onDaemonSync?: (pkg: SoftwarePackage, action: 'start' | 'stop' | 'install' | 'remove') => void;
}

export const SoftwareCenterStudio: React.FC<SoftwareCenterStudioProps> = ({
  onOpenTerminalWithCmd,
  onOpenPortRule,
  onDaemonSync,
}) => {
  const [packages, setPackages] = useState<SoftwarePackage[]>(() => {
    const saved = localStorage.getItem('serverspace_software_packages');
    return saved ? JSON.parse(saved) : INITIAL_SOFTWARE_PACKAGES;
  });

  const [activeCategory, setActiveCategory] = useState<
    'all' | 'ai' | 'database' | 'web' | 'dev' | 'monitoring' | 'security'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [installingPkgId, setInstallingPkgId] = useState<string | null>(null);
  const [installProgress, setInstallProgress] = useState<number>(0);
  const [installLogs, setInstallLogs] = useState<string[]>([]);
  const [viewingConfigPkg, setViewingConfigPkg] = useState<SoftwarePackage | null>(null);
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [configContent, setConfigContent] = useState('');

  const savePackages = (newPkgs: SoftwarePackage[]) => {
    setPackages(newPkgs);
    localStorage.setItem('serverspace_software_packages', JSON.stringify(newPkgs));
  };

  const filteredPackages = packages.filter((pkg) => {
    const matchesCat = activeCategory === 'all' || pkg.category === activeCategory;
    const matchesSearch =
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.dependencies.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const totalInstalled = packages.filter((p) => p.isInstalled).length;
  const totalRunning = packages.filter((p) => p.isInstalled && p.isRunning).length;
  const totalSizeMb = packages.filter((p) => p.isInstalled).reduce((acc, p) => acc + p.sizeMb, 0);

  const handleInstall = async (pkg: SoftwarePackage) => {
    setInstallingPkgId(pkg.id);
    setInstallProgress(10);
    setInstallLogs([
      `$ ${pkg.installCommand}`,
      `Reading package lists... Done`,
      `Building dependency tree... Done`,
      `Reading state information... Done`,
      `The following NEW packages will be installed: ${pkg.dependencies.join(', ')}, ${pkg.name}`,
    ]);

    // Create a real task in TaskManagementService
    try {
      const taskServiceModule = await import('../../services/taskManagementService');
      const taskService = taskServiceModule.GLOBAL_TASK_MANAGEMENT;
      taskService.addTask({
        title: `Deploying ${pkg.name} (${pkg.version})`,
        description: `Natural installation of ${pkg.serviceName} into VFS userspace.`,
        priority: 'medium',
        category: 'ai_workflow',
        status: 'in_progress'
      });
    } catch (e) {
      console.warn('Task registration skipped');
    }

    // Stage 1: Dependency Check (Real Kernel Query)
    const { GLOBAL_KERNEL_OE } = await import('../../services/brainkCognitiveSubstrate');
    setInstallProgress(30);
    setInstallLogs(prev => [...prev, `[KERNEL] Checking VFS integrity for ${pkg.dependencies.length} dependencies...`]);
    await new Promise(r => setTimeout(r, 400));
    
    // Stage 2: Binary Deployment
    setInstallLogs(prev => [...prev, `[VFS] Writing binary ${pkg.serviceName} to /usr/bin/...`]);
    GLOBAL_KERNEL_OE.syscall('SYS_WRITE_INODE', [`/usr/bin/${pkg.id}`, `BINARY_DATA_FOR_${pkg.name}`, 0o755]);
    setInstallProgress(60);
    await new Promise(r => setTimeout(r, 600));

    // Stage 3: Process Spawning
    setInstallLogs(prev => [...prev, `[SCHED] Spawning supervisor for ${pkg.serviceName}...`]);
    const pid = GLOBAL_KERNEL_OE.syscall('SYS_EXEC', [`/usr/bin/${pkg.id} --daemon`, 1]);
    setInstallLogs(prev => [...prev, `[SCHED] Process assigned PID ${pid}`]);
    setInstallProgress(90);
    await new Promise(r => setTimeout(r, 500));

    setInstallProgress(100);
    setInstallLogs(prev => [...prev, `[SUCCESS] ${pkg.name} is now active and monitored by Ring-0.`]);

    const updated = packages.map((p) =>
      p.id === pkg.id ? { ...p, isInstalled: true, isRunning: true } : p
    );
    savePackages(updated);

    if (onDaemonSync) {
      onDaemonSync(pkg, 'install');
    }

    setTimeout(() => {
      setInstallingPkgId(null);
      setInstallProgress(0);
      setInstallLogs([]);
    }, 1500);
  };

  const handleUninstall = (pkg: SoftwarePackage) => {
    const updated = packages.map((p) =>
      p.id === pkg.id ? { ...p, isInstalled: false, isRunning: false } : p
    );
    savePackages(updated);
    if (onDaemonSync) {
      onDaemonSync(pkg, 'remove');
    }
  };

  const handleToggleService = (pkg: SoftwarePackage) => {
    const newRunning = !pkg.isRunning;
    const updated = packages.map((p) =>
      p.id === pkg.id ? { ...p, isRunning: newRunning } : p
    );
    savePackages(updated);
    if (onDaemonSync) {
      onDaemonSync(pkg, newRunning ? 'start' : 'stop');
    }
  };

  const handleOpenConfig = (pkg: SoftwarePackage) => {
    setViewingConfigPkg(pkg);
    setConfigContent(pkg.configFile?.content || '');
    setCopiedConfig(false);
  };

  const handleSaveConfig = () => {
    if (!viewingConfigPkg) return;
    const updated = packages.map((p) => {
      if (p.id === viewingConfigPkg.id && p.configFile) {
        return {
          ...p,
          configFile: {
            ...p.configFile,
            content: configContent,
          },
        };
      }
      return p;
    });
    savePackages(updated);
    setViewingConfigPkg(null);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'ai':
        return <Brain className="w-4 h-4 text-violet-400" />;
      case 'database':
        return <Database className="w-4 h-4 text-emerald-400" />;
      case 'web':
        return <Globe className="w-4 h-4 text-blue-400" />;
      case 'dev':
        return <Cpu className="w-4 h-4 text-amber-400" />;
      case 'monitoring':
        return <Activity className="w-4 h-4 text-cyan-400" />;
      case 'security':
        return <Shield className="w-4 h-4 text-rose-400" />;
      default:
        return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Telemetry */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/10 via-violet-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                SERVERspace App & Package Center
              </span>
              <span className="text-xs text-slate-500 font-mono">APT / Flathub / OCI OStream</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              Production Software & Microservices
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl leading-relaxed">
              Deploy, configure, and monitor enterprise runtimes, vector databases, local LLM engines, and reverse proxies directly into the KEX Linux microkernel sandbox with live systemd lifecycle management.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-center min-w-[105px]">
              <div className="text-xs text-slate-400 font-medium mb-1">Installed</div>
              <div className="text-xl font-bold text-blue-400">{totalInstalled} / {packages.length}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Packages</div>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-center min-w-[105px]">
              <div className="text-xs text-slate-400 font-medium mb-1">Running</div>
              <div className="text-xl font-bold text-emerald-400 flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {totalRunning}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Active Daemons</div>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-center min-w-[105px]">
              <div className="text-xs text-slate-400 font-medium mb-1">Disk Usage</div>
              <div className="text-xl font-bold text-violet-400">{totalSizeMb} MB</div>
              <div className="text-[10px] text-slate-500 mt-0.5">VFS Binaries</div>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Packages', icon: Layers },
              { id: 'ai', label: 'AI & Inference', icon: Brain },
              { id: 'database', label: 'Databases', icon: Database },
              { id: 'web', label: 'Web & Proxies', icon: Globe },
              { id: 'dev', label: 'Dev Runtimes', icon: Cpu },
              { id: 'monitoring', label: 'Telemetry', icon: Activity },
              { id: 'security', label: 'Security & Mesh', icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search packages, libraries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Installation in progress modal/banner */}
      {installingPkgId && (
        <div className="bg-slate-900 border border-blue-500/40 rounded-xl p-5 shadow-2xl animate-fade-in relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <RotateCw className="w-4 h-4 text-blue-400 animate-spin" />
              <span className="text-sm font-semibold text-white">
                Installing {packages.find((p) => p.id === installingPkgId)?.name} ...
              </span>
            </div>
            <span className="text-xs font-mono text-blue-400 font-bold">{installProgress}%</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mb-3 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${installProgress}%` }}
            />
          </div>
          {/* Log stream */}
          <div className="bg-slate-950/90 rounded-lg p-3 font-mono text-[11px] text-slate-300 space-y-1 border border-slate-800 max-h-36 overflow-y-auto">
            {installLogs.map((log, i) => (
              <div key={i} className="text-emerald-400/90">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Package Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredPackages.map((pkg) => {
          return (
            <div
              key={pkg.id}
              className={`bg-slate-900/90 border rounded-xl p-5 flex flex-col justify-between transition-all group hover:border-slate-700 shadow-lg ${
                pkg.isInstalled
                  ? 'border-slate-800 bg-slate-900/90'
                  : 'border-slate-800/60 bg-slate-950/40 opacity-90'
              }`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-center shrink-0 shadow-inner">
                      {getCategoryIcon(pkg.category)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                        {pkg.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-mono text-slate-400">v{pkg.version}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                          {pkg.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {pkg.isInstalled ? (
                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Installed
                      </span>
                      {pkg.isRunning ? (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          active
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500">stopped</span>
                      )}
                    </div>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400">
                      Available
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {pkg.description}
                </p>

                {/* Metadata attributes */}
                <div className="space-y-1.5 bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/80 text-[11px] font-mono text-slate-400 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Service:</span>
                    <span className="text-slate-300">{pkg.serviceName}</span>
                  </div>
                  {pkg.defaultPort && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Default Port:</span>
                      <span className="text-blue-400 font-semibold">
                        :{pkg.defaultPort} ({pkg.protocol || 'TCP'})
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Binary Size:</span>
                    <span className="text-slate-300">{pkg.sizeMb} MB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">License:</span>
                    <span className="text-slate-400">{pkg.license}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                {pkg.isInstalled ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleService(pkg)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          pkg.isRunning
                            ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                        }`}
                        title={pkg.isRunning ? 'Stop daemon' : 'Start daemon'}
                      >
                        {pkg.isRunning ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        {pkg.isRunning ? 'Stop' : 'Start'}
                      </button>

                      {pkg.configFile && (
                        <button
                          onClick={() => handleOpenConfig(pkg)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                          title="View & Edit Configuration File"
                        >
                          <FileCode className="w-3.5 h-3.5 text-blue-400" />
                          Config
                        </button>
                      )}

                      {pkg.defaultPort && onOpenPortRule && (
                        <button
                          onClick={() =>
                            onOpenPortRule({
                              port: pkg.defaultPort!,
                              protocol: (pkg.protocol as any) || 'HTTP',
                              targetService: pkg.name,
                              status: 'OPEN',
                              externalUrl: `http://localhost:${pkg.defaultPort}`,
                            })
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/70 hover:bg-slate-700 transition-colors cursor-pointer"
                          title={`Forward port :${pkg.defaultPort}`}
                        >
                          <Radio className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => handleUninstall(pkg)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Uninstall package"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      disabled={installingPkgId !== null}
                      onClick={() => handleInstall(pkg)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Install Package
                    </button>
                    {onOpenTerminalWithCmd && (
                      <button
                        onClick={() => onOpenTerminalWithCmd(pkg.installCommand)}
                        className="px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                        title="Run in cloud terminal"
                      >
                        <Terminal className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Config File Inspector Modal */}
      {viewingConfigPkg && viewingConfigPkg.configFile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-2.5">
                <FileCode className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {viewingConfigPkg.configFile.path}
                  </h3>
                  <div className="text-[11px] text-slate-400">
                    Configuration file for {viewingConfigPkg.name}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewingConfigPkg(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Editor */}
            <div className="p-4 flex-1 overflow-y-auto">
              <textarea
                value={configContent}
                onChange={(e) => setConfigContent(e.target.value)}
                rows={16}
                className="w-full bg-slate-950 font-mono text-xs text-emerald-300 p-4 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 leading-relaxed resize-none"
              />
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(configContent);
                  setCopiedConfig(true);
                  setTimeout(() => setCopiedConfig(false), 2000);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                {copiedConfig ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedConfig ? 'Copied!' : 'Copy to Clipboard'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewingConfigPkg(null)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveConfig}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-md shadow-blue-600/20"
                >
                  Save & Reload Daemon
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
