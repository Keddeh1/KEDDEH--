import React, { useState, useRef } from 'react';
import {
  BarChart3,
  HardDrive,
  Sparkles,
  Trash2,
  Copy,
  AlertTriangle,
  Zap,
  CheckCircle2,
  PieChart,
  Layers,
  ArrowRight,
  Database,
  Download,
  Upload,
  RefreshCw,
  Server,
  Activity,
  Cpu,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { FileCategory, FileItem, StoragePlan } from '../types';
import { CATEGORY_CONFIG, formatBytes } from '../data/VfsInitialSubstrate';
import { AssetCategoryVisualizer } from './AssetCategoryVisualizer';
import { useVfs } from '../context/VfsContext';

interface StorageAnalyzerProps {
  files: FileItem[];
  usedBytes: number;
  currentPlan: StoragePlan;
  onDeleteFile: (fileId: string) => void;
  onEmptyTrash: () => void;
  trashCount: number;
  trashBytes: number;
  onOpenUpgrade: () => void;
}

export const StorageAnalyzer: React.FC<StorageAnalyzerProps> = ({
  files,
  usedBytes,
  currentPlan,
  onDeleteFile,
  onEmptyTrash,
  trashCount,
  trashBytes,
  onOpenUpgrade,
}) => {
  const {
    folders,
    sectors,
    isHydrated,
    storageEngine,
    lastPersistedAt,
    resetVfsToDefaults,
    exportVfsSnapshot,
    importVfsSnapshot,
    updateSector
  } = useVfs();

  const [selectedCleanupIds, setSelectedCleanupIds] = useState<string[]>([]);
  const [activeCleanTab, setActiveCleanTab] = useState<'large' | 'duplicates' | 'old'>('large');
  const [isExporting, setIsExporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [operationMsg, setOperationMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter non-trashed files for category calculation
  const activeFiles = files.filter((f) => !f.inTrash);

  // Group size by category
  const categoryStats = (Object.keys(CATEGORY_CONFIG) as FileCategory[]).map((cat) => {
    const catFiles = activeFiles.filter((f) => f.category === cat);
    const totalCatBytes = catFiles.reduce((acc, f) => {
      const sizeVal = typeof f.size === 'number' ? f.size : parseInt(f.size) || 0;
      return acc + sizeVal;
    }, 0);
    const percent = usedBytes > 0 ? (totalCatBytes / usedBytes) * 100 : 0;
    return {
      category: cat,
      info: CATEGORY_CONFIG[cat],
      count: catFiles.length,
      bytes: totalCatBytes,
      percentage: percent,
    };
  });

  // Large files (> 100 MB or large string representations)
  const largeFiles = activeFiles.filter((f) => {
    const sizeVal = typeof f.size === 'number' ? f.size : parseInt(f.size) || 0;
    return sizeVal > 50 * 1024 * 1024;
  });

  // Duplicates
  const duplicateFiles = activeFiles.filter((f) => f.isDuplicate);

  // Old files (simulated)
  const oldFiles = activeFiles.filter((f) => {
    const date = new Date(f.updatedAt);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 2);
    return date < sixMonthsAgo;
  });

  const handleToggleSelectClean = (id: string) => {
    if (selectedCleanupIds.includes(id)) {
      setSelectedCleanupIds(selectedCleanupIds.filter((i) => i !== id));
    } else {
      setSelectedCleanupIds([...selectedCleanupIds, id]);
    }
  };

  const handleBulkCleanup = () => {
    selectedCleanupIds.forEach((id) => onDeleteFile(id));
    setSelectedCleanupIds([]);
  };

  const handleExportSnapshot = async () => {
    try {
      setIsExporting(true);
      const snapshot = await exportVfsSnapshot();
      const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `KEX_VFS_SNAPSHOT_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setOperationMsg('Snapshot exported successfully.');
      setTimeout(() => setOperationMsg(null), 4000);
    } catch (err) {
      console.error(err);
      setOperationMsg('Export failed.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importVfsSnapshot(data);
      setOperationMsg('VFS restored from snapshot.');
      setTimeout(() => setOperationMsg(null), 4000);
    } catch (err) {
      console.error(err);
      setOperationMsg('Failed to parse snapshot JSON.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleResetVfs = async () => {
    if (!window.confirm('Reset VFS to initial pristine state? All current changes will be reverted to factory baseline.')) {
      return;
    }
    try {
      setIsResetting(true);
      await resetVfsToDefaults();
      setOperationMsg('VFS reset to baseline defaults.');
      setTimeout(() => setOperationMsg(null), 4000);
    } catch (err) {
      console.error(err);
      setOperationMsg('Reset failed.');
    } finally {
      setIsResetting(false);
    }
  };

  const overallPercentage = Math.min(100, Math.round((usedBytes / currentPlan.limitBytes) * 100));

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950/60 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider">
              <PieChart className="w-4 h-4" />
              <span>Storage Intelligence & Usage</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {formatBytes(usedBytes)} <span className="text-slate-400 font-normal text-lg md:text-xl">used of {formatBytes(currentPlan.limitBytes)}</span>
            </h1>
            <p className="text-slate-400 text-xs md:text-sm max-w-xl">
              Backed by persistent IndexedDB object stores. Retains all OS sectors, custom code, and files across browser sessions.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenUpgrade}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs md:text-sm font-semibold shadow-lg shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Manage Plan</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 relative z-10">
          <div className="h-3.5 bg-slate-950/80 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${Math.max(2, overallPercentage)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 font-mono">
            <span>{overallPercentage}% Capacity Utilized</span>
            <span>{formatBytes(currentPlan.limitBytes - usedBytes)} Available</span>
          </div>
        </div>
      </div>

      {/* Persistent VFS & OS Sectors Invariant Substrate Card */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white tracking-wide">
                Persistent VFS Substrate & OS Sector Storage
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Low-level IndexedDB backing store (<code className="text-cyan-300 font-mono">KEX_VFS_PERSISTENCE_DB</code>). State changes persist across reloads and tab closures.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileImport}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={handleExportSnapshot}
              disabled={isExporting}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download full VFS backup as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Snapshot</span>
            </button>

            <button
              onClick={handleImportClick}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Restore VFS from JSON backup"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Snapshot</span>
            </button>

            <button
              onClick={handleResetVfs}
              disabled={isResetting}
              className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-100 border border-rose-800/50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset VFS to initial baseline"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>Reset Baseline</span>
            </button>
          </div>
        </div>

        {operationMsg && (
          <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono animate-fadeIn flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{operationMsg}</span>
          </div>
        )}

        {/* Engine Status Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-slate-500 text-[11px] mb-1">Backing Storage</div>
            <div className="text-cyan-400 font-bold flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              <span>{storageEngine}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-slate-500 text-[11px] mb-1">Hydration Status</div>
            <div className={`font-bold flex items-center gap-1.5 ${isHydrated ? 'text-emerald-400' : 'text-amber-400'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isHydrated ? 'Active & Synced' : 'Hydrating...'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-slate-500 text-[11px] mb-1">Persisted Inodes & Items</div>
            <div className="text-white font-bold">
              {files.length} Files / {folders.length} Folders
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-slate-500 text-[11px] mb-1">Last Persist Sync</div>
            <div className="text-slate-300 truncate text-[11px]">
              {lastPersistedAt ? new Date(lastPersistedAt).toLocaleTimeString() : 'Just now'}
            </div>
          </div>
        </div>

        {/* OS Sectors Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              <span>Persisted OS & Mining Sectors ({sectors.length})</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-500">Toroidal 1-Based Origin (1,1,1)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sectors.map((sector) => (
              <div
                key={sector.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2 text-xs font-mono"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-300">{sector.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    sector.status === 'ONLINE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' :
                    sector.status === 'STANDBY' ? 'bg-amber-950 text-amber-400 border border-amber-800/50' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {sector.status}
                  </span>
                </div>

                <div className="text-slate-300 text-[11px] truncate">
                  Worker: <span className="text-white">{sector.worker_name}</span>
                </div>

                <div className="text-slate-400 text-[10px] truncate">
                  Protocol: {sector.protocol}
                </div>

                {sector.hashrateTh !== undefined && (
                  <div className="flex justify-between text-[11px] pt-1 border-t border-slate-900 text-slate-400">
                    <span>Hashrate: <strong className="text-emerald-400">{sector.hashrateTh} TH/s</strong></span>
                    <span>Temp: <strong className="text-amber-300">{sector.temperatureC}°C</strong></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Storage Breakdown by Categories */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white tracking-wide">Category Distribution</h2>
            <p className="text-xs text-slate-400">Space consumption grouped by media MIME types.</p>
          </div>
          <BarChart3 className="w-5 h-5 text-slate-500" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoryStats.map((item) => (
            <div
              key={item.category}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AssetCategoryVisualizer category={item.category} className="w-4 h-4" />
                  <span className="text-xs font-semibold text-slate-200">{item.info.label}</span>
                </div>
                <span className="text-xs font-mono text-slate-400">{item.count} items</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-white font-mono">{formatBytes(item.bytes)}</span>
                  <span className="text-slate-500 font-mono">{Math.round(item.percentage)}%</span>
                </div>
                <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.info.color,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Storage Cleanup Assistant */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white tracking-wide">Cleanup Assistant</h2>
            <p className="text-xs text-slate-400">Identify large binaries, duplicate assets, and stale files.</p>
          </div>

          {selectedCleanupIds.length > 0 && (
            <button
              onClick={handleBulkCleanup}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20 transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clean {selectedCleanupIds.length} Selected Items</span>
            </button>
          )}
        </div>

        {/* Clean Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveCleanTab('large')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeCleanTab === 'large'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>Large Files</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/60 font-mono">
              {largeFiles.length}
            </span>
          </button>

          <button
            onClick={() => setActiveCleanTab('duplicates')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeCleanTab === 'duplicates'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>Duplicate Files</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/60 font-mono">
              {duplicateFiles.length}
            </span>
          </button>

          <button
            onClick={() => setActiveCleanTab('old')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeCleanTab === 'old'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>Stale Files</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900/60 font-mono">
              {oldFiles.length}
            </span>
          </button>
        </div>

        {/* Clean Tab Contents */}
        <div className="space-y-3">
          {activeCleanTab === 'large' && (
            largeFiles.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No large files found over threshold.</p>
            ) : (
              largeFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <input
                      type="checkbox"
                      checked={selectedCleanupIds.includes(file.id)}
                      onChange={() => handleToggleSelectClean(file.id)}
                      className="rounded border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                    <AssetCategoryVisualizer category={file.category} className="w-4 h-4 shrink-0" />
                    <div className="truncate">
                      <p className="font-semibold text-slate-200 truncate">{file.name}</p>
                      <p className="text-[11px] font-mono text-slate-400">
                        {typeof file.size === 'number' ? formatBytes(file.size) : file.size}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteFile(file.id)}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )
          )}

          {activeCleanTab === 'duplicates' && (
            duplicateFiles.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No duplicate files detected in your vault.</p>
            ) : (
              duplicateFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <input
                      type="checkbox"
                      checked={selectedCleanupIds.includes(file.id)}
                      onChange={() => handleToggleSelectClean(file.id)}
                      className="rounded border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                    <Copy className="w-4 h-4 text-amber-400 shrink-0" />
                    <div className="truncate">
                      <p className="font-semibold text-slate-200 truncate">{file.name}</p>
                      <p className="text-[11px] font-mono text-slate-400">
                        {typeof file.size === 'number' ? formatBytes(file.size) : file.size} • Duplicate copy
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteFile(file.id)}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )
          )}

          {activeCleanTab === 'old' && (
            oldFiles.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No old or stale files found.</p>
            ) : (
              oldFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <input
                      type="checkbox"
                      checked={selectedCleanupIds.includes(file.id)}
                      onChange={() => handleToggleSelectClean(file.id)}
                      className="rounded border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                    <AssetCategoryVisualizer category={file.category} className="w-4 h-4 shrink-0" />
                    <div className="truncate">
                      <p className="font-semibold text-slate-200 truncate">{file.name}</p>
                      <p className="text-[11px] font-mono text-slate-400">
                        {typeof file.size === 'number' ? formatBytes(file.size) : file.size} • Modified months ago
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteFile(file.id)}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )
          )}
        </div>
      </section>
    </div>
  );
};
