import React, { useState, useEffect, useMemo } from 'react';
import {
  Download,
  CheckCircle2,
  Play,
  Square,
  RotateCw,
  Search,
  Layers,
  Database,
  Globe,
  Cpu,
  Activity,
  Shield,
  Trash2,
  FileCode,
  Terminal,
  Zap,
  Brain,
  X,
  AlertTriangle,
  Server,
  Fingerprint
} from 'lucide-react';
import { NetworkRegistryPanel } from './NetworkRegistryPanel';
import { SoftwarePackage, VirtualPortRule } from '../../types';
import { INITIAL_SOFTWARE_PACKAGES } from '../../data/softwareCenterData';
import { HTML5_APP_TEMPLATES } from '../../data/html5Apps';
import { PROVENANCE_SERVICE } from '../../services/ProvenanceService';
import { GLOBAL_DEPENDENCY_SERVICE } from '../../services/DependencyService';
import { useVfs } from '../../context/VfsContext';
import { GLOBAL_KERNEL_SERVICE } from '../../services/KernelService';

interface SoftwareCenterStudioProps {
  onOpenTerminalWithCmd?: (cmd: string) => void;
  onOpenPortRule?: (rule: VirtualPortRule) => void;
  onDaemonSync?: (pkg: SoftwarePackage, action: 'start' | 'stop' | 'install' | 'remove') => void;
}

export const RegistrySubstrate: React.FC<SoftwareCenterStudioProps> = ({
  onOpenTerminalWithCmd,
  onOpenPortRule,
  onDaemonSync,
}) => {
  const { files, addFiles } = useVfs();
  const [activeCategory, setActiveCategory] = useState<'all' | 'ai' | 'database' | 'web' | 'dev' | 'monitoring' | 'security' | 'infrastructure'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [installingPkgId, setInstallingPkgId] = useState<string | null>(null);
  const [installProgress, setInstallProgress] = useState<number>(0);
  const [installLogs, setInstallLogs] = useState<string[]>([]);
  const [installedList, setInstalledList] = useState<string[]>(() => GLOBAL_DEPENDENCY_SERVICE.getInstalledPackages().map(p => p.pkgId));

  const filteredPackages = useMemo(() => {
    return INITIAL_SOFTWARE_PACKAGES.filter((pkg) => {
      const matchesCat = activeCategory === 'all' || pkg.category === activeCategory;
      const matchesSearch =
        pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleInstall = async (pkg: SoftwarePackage) => {
    setInstallingPkgId(pkg.id);
    setInstallProgress(5);
    setInstallLogs([`[RESOLVE] Initiating dependency resolution for ${pkg.id}...`]);

    try {
      const logs = await GLOBAL_DEPENDENCY_SERVICE.resolveAndInstall(pkg, INITIAL_SOFTWARE_PACKAGES);
      
      // Update VFS with the new binary
      const binPath = pkg.id.startsWith('app-') ? `${pkg.id.replace('app-', '')}.html` : pkg.id;
      const binParentId = pkg.id.startsWith('app-') ? 'folder-bin' : 'folder-usr-bin';
      
      const content = pkg.id.startsWith('app-') 
        ? (HTML5_APP_TEMPLATES.find(t => t.id === pkg.id.replace('app-', ''))?.code || '<!-- BINARY_PLACEHOLDER -->')
        : `/* KEX_BINARY:${pkg.id} */`;

      await addFiles([{
        id: `file-bin-${pkg.id}`,
        name: binPath,
        parentId: binParentId,
        type: pkg.id.startsWith('app-') ? 'html' : 'exe',
        size: `${pkg.sizeMb} MB`,
        updatedAt: new Date().toISOString(),
        content: content,
        rawContent: content,
        isSystem: true
      }]);

      setInstallLogs(prev => [...prev, ...logs]);
      setInstallProgress(100);
      setInstalledList(prev => [...prev, pkg.id]);

      if (onDaemonSync) onDaemonSync(pkg, 'install');
      
      setTimeout(() => {
        setInstallingPkgId(null);
        setInstallProgress(0);
        setInstallLogs([]);
      }, 1500);

    } catch (err: any) {
      setInstallLogs(prev => [...prev, `[ERROR] ${err.message}`]);
      setInstallProgress(0);
      setTimeout(() => setInstallingPkgId(null), 3000);
    }
  };

  const handleUninstall = (pkg: SoftwarePackage) => {
    GLOBAL_DEPENDENCY_SERVICE.uninstall(pkg.id);
    setInstalledList(prev => prev.filter(id => id !== pkg.id));
    if (onDaemonSync) onDaemonSync(pkg, 'remove');
  };

  const isInstalled = (id: string) => installedList.includes(id);

  return (
    <div className="space-y-6">
      {/* Telemetry Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/10 via-violet-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Registry Substrate</span>
              <span aria-hidden="true">/</span>
              <span>Authoritative Ingestion</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Production Software & Microservices</h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl leading-relaxed">
              Deploy, configure, and monitor industrial runtimes, vector databases, and grid intelligence directly into the KEX master substrate.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 shrink-0 text-[10px] font-mono">
             <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
              <div className="text-slate-500 uppercase font-bold mb-1">Installed</div>
              <div className="text-sm font-bold text-blue-400">{installedList.length}</div>
            </div>
            <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
              <div className="text-slate-500 uppercase font-bold mb-1">Kernel Status</div>
              <div className="text-sm font-bold text-emerald-400">OPTIMIZED</div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All', icon: Layers },
            { id: 'ai', label: 'AI', icon: Brain },
            { id: 'database', label: 'DB', icon: Database },
            { id: 'web', label: 'Web', icon: Globe },
            { id: 'infrastructure', label: 'Infrastructure', icon: Server },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeCategory === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
          <div className="flex-1" />
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Filter packages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 w-48"
            />
          </div>
        </div>
      </div>

      {/* Install Overlay */}
      {installingPkgId && (
        <div className="bg-slate-900 border border-blue-500/40 rounded-xl p-5 shadow-2xl animate-fade-in relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <RotateCw className="w-4 h-4 text-blue-400 animate-spin" />
              <span className="text-sm font-semibold text-white">Installing Package...</span>
            </div>
            <span className="text-xs font-mono text-blue-400 font-bold">{installProgress}%</span>
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${installProgress}%` }} />
          </div>
          <div className="bg-black/50 rounded-lg p-3 font-mono text-[10px] text-emerald-400 space-y-1 max-h-32 overflow-y-auto border border-slate-800">
            {installLogs.map((log, i) => <div key={i}>{log}</div>)}
          </div>
        </div>
      )}

      {/* Package Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPackages.map((pkg) => (
            <div key={pkg.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all group">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                      {pkg.category === 'ai' ? <Brain className="w-5 h-5 text-violet-400" /> : <Layers className="w-5 h-5 text-slate-400" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{pkg.name}</h3>
                      <p className="text-[10px] font-mono text-slate-500">v{pkg.version}</p>
                    </div>
                  </div>
                  {isInstalled(pkg.id) && (
                    <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 font-mono">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                      INSTALLED
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-400 mb-4 line-clamp-2">{pkg.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-800">
                {isInstalled(pkg.id) ? (
                  <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                    <Play className="w-3 h-3" /> ACTIVE
                  </button>
                ) : (
                  <button
                    disabled={installingPkgId !== null}
                    onClick={() => handleInstall(pkg)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> INSTALL
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="lg:col-span-1">
          <NetworkRegistryPanel />
        </div>
      </div>
    </div>
  );
};
