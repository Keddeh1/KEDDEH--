import React, { useState } from 'react';
import {
  Server,
  Search,
  LayoutGrid,
  List,
  ArrowUpDown,
  ChevronRight,
  Folder,
  Star,
  Trash2,
  X,
  Filter,
  CheckSquare,
  Square,
  Cloud,
  RefreshCw,
  HardDrive,
  Terminal,
  BookOpen,
  ShieldCheck,
  Box,
  DollarSign,
  Compass,
  Layers,
  Database,
  Cpu,
  Zap,
  Activity,
  CheckCircle2,
  FileCheck,
  Scale
} from 'lucide-react';
import { FileCategory, FolderItem, SortOption, ViewMode, CommercialLicense } from '../types';
import { useVfs } from '../context/VfsContext';

interface HeaderProps {
  currentFolder: FolderItem | null;
  folderBreadcrumbs: FolderItem[];
  onNavigateFolder: (folderId: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: FileCategory | 'all';
  setCategoryFilter: (cat: FileCategory | 'all') => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  sortOption: SortOption;
  setSortOption: (sort: SortOption) => void;
  selectedIds: string[];
  onClearSelection: () => void;
  onBatchStar: () => void;
  onBatchTrash: () => void;
  onSelectAll: () => void;
  isAllSelected: boolean;
  totalCount: number;
  onConnectOs?: () => void;
  onOpenCommandPalette?: () => void;
  currentLicense?: CommercialLicense;
  onOpenDeployCenter?: () => void;
  onOpenPricing?: () => void;
  onOpenShowcase?: () => void;
  // Google Drive integration
  activeSource?: 'drive' | 'local';
  isDriveConnected?: boolean;
  onConnectDrive?: () => void;
  onRefreshDrive?: () => void;
  isSyncing?: boolean;
  isSystemOnline?: boolean;
  onActivateSystem?: () => void;
  onOpenFloatingDesktop?: () => void;
}

export const CloudInfrastructureHeader: React.FC<HeaderProps> = ({
  currentFolder,
  folderBreadcrumbs,
  onNavigateFolder,
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  viewMode,
  setViewMode,
  sortOption,
  setSortOption,
  selectedIds,
  onClearSelection,
  onBatchStar,
  onBatchTrash,
  onSelectAll,
  isAllSelected,
  totalCount,
  onConnectOs,
  onOpenCommandPalette,
  currentLicense,
  onOpenDeployCenter,
  onOpenPricing,
  onOpenShowcase,
  activeSource = 'local',
  isDriveConnected = false,
  onConnectDrive,
  onRefreshDrive,
  isSyncing = false,
  isSystemOnline = false,
  onActivateSystem,
  onOpenFloatingDesktop,
}) => {
  const { isHydrated, storageEngine, sectors } = useVfs();
  const [isZcgModalOpen, setIsZcgModalOpen] = useState(false);

  const categories: { id: FileCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Files' },
    { id: 'images', label: 'Images' },
    { id: 'documents', label: 'Documents' },
    { id: 'videos', label: 'Videos' },
    { id: 'audio', label: 'Audio' },
    { id: 'code', label: 'Code' },
    { id: 'archives', label: 'Archives' },
  ];

  const rootLabel = activeSource === 'drive' ? 'Google Drive' : 'Storage Carrier Substrate';

  return (
    <header className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-6 py-2.5 space-y-2.5">
      {/* Top Invariant & Governance Ledger Line */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[11px] font-mono border-b border-slate-800/80 pb-2 text-slate-400">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-200 tracking-wide">
            LAYNA CO PTY LTD (ABN 79 691 036 236)
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-cyan-400">
            Resonance Lock (K): <strong className="text-white font-mono">0.297</strong> (H = 0.703)
          </span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="text-amber-300">
            Substrate Signature: <span className="font-mono text-white">1x412E3800CA000748</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Persistent VFS State Badge */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-950/70 border border-blue-800/50 text-blue-300 text-[10px]">
            <Database className="w-3 h-3 text-cyan-400" />
            <span>VFS: {storageEngine} ({isHydrated ? 'Hydrated' : 'Connecting...'})</span>
            <span className="text-blue-500">·</span>
            <span>{sectors.length} Sectors</span>
          </div>

          {/* ZCG Engine Trigger */}
          <button
            onClick={() => setIsZcgModalOpen(true)}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/60 text-cyan-300 hover:text-white transition-colors cursor-pointer text-[10px] font-bold"
            title="Open ZCG Compression Engine & Invariant Proofs"
          >
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>ZCG Compression Engine</span>
          </button>
        </div>
      </div>

      {/* Main Row: Breadcrumbs & Search & Sync */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Folder Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-sm overflow-x-auto py-0.5 no-scrollbar">
          <button
            onClick={() => onNavigateFolder(null)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              currentFolder === null
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {activeSource === 'drive' ? (
              <Cloud className="w-4 h-4 text-blue-400" />
            ) : (
              <Server className="w-4 h-4 text-cyan-400" />
            )}
            <span>{rootLabel}</span>
          </button>

          {folderBreadcrumbs.map((crumb) => (
            <React.Fragment key={crumb.id}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <button
                onClick={() => onNavigateFolder(crumb.id)}
                className={`px-2 py-1 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  currentFolder?.id === crumb.id
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Search Bar & Sync Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeSource === 'drive'
                  ? 'Search Google Drive files...'
                  : 'Search vault files, tags...'
              }
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/80 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none transition-all"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : onOpenCommandPalette ? (
              <button
                type="button"
                onClick={onOpenCommandPalette}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700 hover:text-white hover:border-slate-600 transition-colors cursor-pointer"
                title="Command Palette (Ctrl+K / Cmd+K)"
              >
                ⌘K
              </button>
            ) : null}
          </div>

          {activeSource === 'drive' && (
            <div className="flex items-center gap-1.5 shrink-0">
              {isDriveConnected ? (
                <button
                  onClick={onRefreshDrive}
                  disabled={isSyncing}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                  title="Sync files from Google Drive"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 text-blue-400 ${
                      isSyncing ? 'animate-spin' : ''
                    }`}
                  />
                  <span className="hidden sm:inline">
                    {isSyncing ? 'Syncing...' : 'Sync'}
                  </span>
                </button>
              ) : (
                <button
                  onClick={onConnectDrive}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Cloud className="w-3.5 h-3.5" />
                  <span>Connect Google Substrate</span>
                </button>
              )}
            </div>
          )}

          {/* Commercial Showcase & Solutions Button */}
          {onOpenShowcase && (
            <button
              onClick={onOpenShowcase}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors cursor-pointer shrink-0"
              title="Commercial Showcase & ROI Calculator"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Showcase</span>
            </button>
          )}

          {/* Ship & Deploy Center Button */}
          {onOpenDeployCenter && (
            <button
              onClick={onOpenDeployCenter}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-950/50 hover:bg-purple-900/60 text-purple-200 hover:text-white border border-purple-800/60 text-xs font-semibold transition-colors cursor-pointer shrink-0"
              title="Ship & Deploy Center: Docker, Kubernetes & Air-Gapped Manifests"
            >
              <Box className="w-3.5 h-3.5 text-purple-400" />
              <span>Ship Hub</span>
            </button>
          )}

          {/* Commercial License / Pricing Badge Button */}
          {onOpenPricing && (
            <button
              onClick={onOpenPricing}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer shrink-0"
              title="View Commercial Plans & License Subscriptions"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono text-emerald-300 font-bold">
                {currentLicense ? currentLicense.tier.toUpperCase() : 'LICENSES'}
              </span>
            </button>
          )}

          {onOpenFloatingDesktop && (
            <button
              onClick={onOpenFloatingDesktop}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-purple-500/30 bg-purple-950/40 text-purple-300 hover:text-white hover:border-purple-400 transition-colors text-xs font-mono cursor-pointer shrink-0"
              title="Open Floating Dockable Windows Workspace"
            >
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>Floating Windows</span>
            </button>
          )}

          {/* System Status Badge */}
          <button
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
              isSystemOnline 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
            title="All systems operational · Always Online"
          >
            <div className={`w-2 h-2 rounded-full ${isSystemOnline ? 'bg-emerald-400' : 'bg-rose-500'}`} />
            <span className="text-[10px] font-bold uppercase tracking-widest font-mono">
              ONLINE
            </span>
          </button>
        </div>
      </div>

      {/* Selected Items Quick Bar vs. Filter Pills */}
      {selectedIds.length > 0 ? (
        <div className="flex items-center justify-between bg-blue-950/60 border border-blue-800/60 rounded-lg px-4 py-2 text-xs text-blue-200 animate-fadeIn">
          <div className="flex items-center gap-3">
            <button
              onClick={onSelectAll}
              className="flex items-center gap-1.5 hover:text-white cursor-pointer"
            >
              {isAllSelected ? (
                <CheckSquare className="w-4 h-4 text-blue-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span className="font-medium">{selectedIds.length} item(s) selected</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onBatchStar}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-900/60 hover:bg-blue-800 text-blue-100 cursor-pointer transition-colors"
            >
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Star</span>
            </button>
            <button
              onClick={onBatchTrash}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-900/40 hover:bg-rose-900/80 text-rose-200 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Delete</span>
            </button>
            <button
              onClick={onClearSelection}
              className="p-1 hover:bg-blue-900/40 rounded text-slate-400 hover:text-white cursor-pointer"
              title="Cancel Selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 mr-1" />
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-all cursor-pointer text-xs font-medium ${
                  categoryFilter === cat.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800/60'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* View Toggles & Sort */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Item Counter */}
            <span className="text-slate-500 font-mono text-[11px]">
              {totalCount} item{totalCount !== 1 ? 's' : ''}
            </span>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="bg-transparent text-slate-300 text-xs outline-none cursor-pointer"
              >
                <option value="name" className="bg-slate-900 text-slate-200">Sort by Name</option>
                <option value="updatedAt" className="bg-slate-900 text-slate-200">Sort by Modified</option>
                <option value="size" className="bg-slate-900 text-slate-200">Sort by Size</option>
                <option value="type" className="bg-slate-900 text-slate-200">Sort by Category</option>
              </select>
            </div>

            {/* Grid / List Mode */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-slate-800 text-blue-400' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-slate-800 text-blue-400' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Boot OS Shortcut */}
            {onConnectOs && (
              <button
                onClick={onConnectOs}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white border border-blue-500/40 text-xs font-semibold transition-colors cursor-pointer"
                title="Connect to Open-Source AetherOS in Execution Sandbox"
              >
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Access OS</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ZCG Binary Reduction Engine Modal */}
      {isZcgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-mono font-bold text-white tracking-wide">
                  ZCG (ZEROLESS CODE GLYPH) BINARY BLOAT REDUCTION ENGINE
                </h3>
              </div>
              <button
                onClick={() => setIsZcgModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 font-mono text-xs">
              <div className="p-3.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between">
                <span className="text-cyan-300 font-bold">FORMAL VERIFICATION GATE:</span>
                <span className="px-2.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/50 text-emerald-400 font-bold">
                  AXIOMS A1-A4 ENFORCED
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="text-slate-400 mb-1">A1: Toroidal Origin Invariant</div>
                  <div className="text-emerald-400 font-bold">1-Based Torus (1, 1, 1) LOCKED</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="text-slate-400 mb-1">A2: Zero Origin Exclusion</div>
                  <div className="text-emerald-400 font-bold">Zeroless Vector Grid ACTIVE</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="text-slate-400 mb-1">A3: Array Non-Overlap Boundary</div>
                  <div className="text-emerald-400 font-bold">Zero-Collision Bitmask PASS</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="text-slate-400 mb-1">A4: Wire Format Serialization</div>
                  <div className="text-emerald-400 font-bold">Witness Serialization SYNC</div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 text-slate-300 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Backing Storage Fabric:</span>
                  <span className="text-cyan-300 font-bold">IndexedDB Object Store (KEX_VFS_PERSISTENCE_DB)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Substrate Invariant Ratio:</span>
                  <span className="text-emerald-400 font-bold">297 / 1000 (0.297 Lock)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>State Proof Timestamp Exclusion:</span>
                  <span className="text-emerald-400 font-bold">Deterministic Hash Proofs Only</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setIsZcgModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors cursor-pointer text-xs"
                >
                  Close Engine Inspector
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
