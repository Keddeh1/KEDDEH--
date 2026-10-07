import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Server,
  Monitor,
  Terminal,
  Brain,
  Zap,
  Activity,
  Layers,
  Folder,
  FileCode,
  HardDrive,
  Shield,
  RotateCw,
  Plus,
  Play,
  Square,
  Sparkles,
  Command,
  ArrowRight,
  X,
  Volume2,
  ShieldCheck,
  Box,
  DollarSign,
  Compass
} from 'lucide-react';
import { NavTab, FileItem, ServerSubTab } from '../../types';

interface CommandPaletteItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Server Actions' | 'Files & Apps' | 'System' | 'Commercial & Shipping';
  description: string;
  icon: React.ReactNode;
  shortcut?: string;
  onSelect: () => void;
}

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: NavTab) => void;
  onNavigateServerSubTab: (subTab: ServerSubTab) => void;
  onLaunchFile?: (file: FileItem) => void;
  files?: FileItem[];
  onTriggerAction?: (actionId: string) => void;
  onOpenDeployCenter?: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onNavigateServerSubTab,
  onLaunchFile,
  files = [],
  onTriggerAction,
  onOpenDeployCenter,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const items: CommandPaletteItem[] = [
    // Commercial & Shipping
    {
      id: 'nav-showcase',
      title: 'Commercial Product Showcase & ROI Calculator',
      category: 'Commercial & Shipping',
      description: 'Explore full value proposition, hardware benchmarks, and cloud savings calculator',
      icon: <Compass className="w-4 h-4 text-cyan-400" />,
      shortcut: 'G S',
      onSelect: () => {
        onNavigateTab('showcase');
        onClose();
      },
    },
    {
      id: 'nav-pricing',
      title: 'Commercial Pricing & Enterprise Licenses',
      category: 'Commercial & Shipping',
      description: 'Community, Pro VPS, Enterprise Bio-Cloud, and Sovereign Cloud subscriptions',
      icon: <DollarSign className="w-4 h-4 text-emerald-400" />,
      shortcut: 'G $',
      onSelect: () => {
        onNavigateTab('pricing');
        onClose();
      },
    },
    {
      id: 'nav-deploy',
      title: 'Ship & Deploy Hub: Docker, Kubernetes & Air-Gap',
      category: 'Commercial & Shipping',
      description: 'Export production Dockerfile, K8s manifests, and offline sovereign release packages',
      icon: <Box className="w-4 h-4 text-purple-400" />,
      shortcut: 'G D',
      onSelect: () => {
        onClose();
        if (onOpenDeployCenter) onOpenDeployCenter();
      },
    },
    // Navigation
    {
      id: 'nav-nodes',
      title: 'Cluster Nodes & Hardware Topology',
      category: 'Navigation',
      description: 'Manage virtual server nodes, vCPU/RAM allocation, and cluster status',
      icon: <Server className="w-4 h-4 text-blue-400" />,
      shortcut: 'G N',
      onSelect: () => {
        onNavigateTab('server');
        onNavigateServerSubTab('nodes');
        onClose();
      },
    },
    {
      id: 'nav-software',
      title: 'Software Center & Package Manager',
      category: 'Navigation',
      description: 'Install NGINX, Docker, PostgreSQL, PyTorch, Redis, Ollama, and Qdrant',
      icon: <Layers className="w-4 h-4 text-emerald-400" />,
      shortcut: 'G P',
      onSelect: () => {
        onNavigateTab('server');
        onNavigateServerSubTab('software');
        onClose();
      },
    },
    {
      id: 'nav-desktop',
      title: 'Virtual Desktop Environment (Windowed OS)',
      category: 'Navigation',
      description: 'Launch the interactive in-browser windowed desktop with monitor & shell',
      icon: <Monitor className="w-4 h-4 text-cyan-400" />,
      shortcut: 'G D',
      onSelect: () => {
        onNavigateTab('server');
        onNavigateServerSubTab('desktop');
        onClose();
      },
    },
    {
      id: 'nav-os-studio',
      title: 'OS Installation Studio & ISO Customizer',
      category: 'Navigation',
      description: 'Configure natural open-source OS kernels, disk layout, and GPU acceleration',
      icon: <Layers className="w-4 h-4 text-indigo-400" />,
      shortcut: 'G O',
      onSelect: () => {
        onNavigateTab('server');
        onNavigateServerSubTab('os-studio');
        onClose();
      },
    },
    {
      id: 'nav-rack-ai',
      title: 'Server Rack AI Suite & Stress Benchmarks',
      category: 'Navigation',
      description: 'Run synthetic high-peak stress workloads and thermal rack load testing',
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      shortcut: 'G R',
      onSelect: () => {
        onNavigateTab('server');
        onNavigateServerSubTab('rack-ai');
        onClose();
      },
    },
    {
      id: 'nav-terminal',
      title: 'Cloud Shell & KEX Microkernel Terminal',
      category: 'Navigation',
      description: 'Open in-browser root bash session with full Unix utilities and VFS paths',
      icon: <Terminal className="w-4 h-4 text-emerald-400" />,
      shortcut: 'G T',
      onSelect: () => {
        onNavigateTab('server');
        onNavigateServerSubTab('terminal');
        onClose();
      },
    },
    {
      id: 'nav-system-logs',
      title: 'System Logs & Diagnostics',
      category: 'Navigation',
      description: 'Stream live virtual server logs, system events, and diagnostic telemetry',
      icon: <Activity className="w-4 h-4 text-cyan-400" />,
      shortcut: 'G L',
      onSelect: () => {
        onNavigateTab('server');
        onNavigateServerSubTab('logs');
        onClose();
      },
    },
    {
      id: 'nav-ports',
      title: 'Virtual Port Router & Reverse Proxy',
      category: 'Navigation',
      description: 'Configure HTTP, HTTPS, TCP port forwarding and SSL termination',
      icon: <Activity className="w-4 h-4 text-blue-400" />,
      onSelect: () => {
        onNavigateTab('server');
        onNavigateServerSubTab('ports');
        onClose();
      },
    },
    {
      id: 'nav-storage',
      title: 'Storage Space Vault & File Browser',
      category: 'Navigation',
      description: 'Browse local VFS storage files, cloud assets, and documents',
      icon: <Folder className="w-4 h-4 text-blue-400" />,
      shortcut: 'G F',
      onSelect: () => {
        onNavigateTab('files');
        onClose();
      },
    },
    // Server Actions
    {
      id: 'action-reboot-node',
      title: 'Reboot Primary Cluster Master Node',
      category: 'Server Actions',
      description: 'Gracefully restart srv-kex-master-01 and reload systemd units',
      icon: <RotateCw className="w-4 h-4 text-amber-400" />,
      onSelect: () => {
        if (onTriggerAction) onTriggerAction('reboot-master');
        onNavigateTab('server');
        onNavigateServerSubTab('nodes');
        onClose();
      },
    },
    {
      id: 'action-snapshot',
      title: 'Create Instant Server Snapshot',
      category: 'Server Actions',
      description: 'Capture point-in-time state of microkernel memory & disk layout',
      icon: <HardDrive className="w-4 h-4 text-emerald-400" />,
      onSelect: () => {
        onNavigateTab('server');
        onNavigateServerSubTab('snapshots');
        onClose();
      },
    },
    // Files & Apps
    ...files.slice(0, 8).map((f) => ({
      id: `file-${f.id}`,
      title: f.name,
      category: 'Files & Apps' as const,
      description: `${(f.size / 1024).toFixed(1)} KB • ${f.category}`,
      icon: <FileCode className="w-4 h-4 text-slate-400" />,
      onSelect: () => {
        if (onLaunchFile) onLaunchFile(f);
        onClose();
      },
    })),
  ];

  const filteredItems = items.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].onSelect();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-20 px-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="relative border-b border-slate-800 bg-slate-950/80 px-4 py-3 flex items-center gap-3">
          <Search className="w-5 h-5 text-blue-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, tool name, server, or file... (e.g. 'nodes', 'terminal', 'files')"
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
              ESC
            </kbd>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-sm">
              No matching commands or tools found for &quot;{query}&quot;.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => item.onSelect()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-3 py-2.5 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-600/20 border border-blue-500/40 text-white'
                      : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-blue-500 text-white shadow-md' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold flex items-center gap-2 truncate">
                        <span>{item.title}</span>
                        <span className="text-[10px] font-mono text-slate-500 uppercase px-1.5 py-0.2 rounded bg-slate-800/80">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {item.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.shortcut && (
                      <kbd className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {item.shortcut}
                      </kbd>
                    )}
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-blue-400" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono bg-slate-800 px-1 rounded text-slate-400">↑↓</kbd> to navigate
            </span>
            <span>
              <kbd className="font-mono bg-slate-800 px-1 rounded text-slate-400">↵</kbd> to select
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">SERVERspace Quick Launcher</span>
        </div>
      </div>
    </div>
  );
};
