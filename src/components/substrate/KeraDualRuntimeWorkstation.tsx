import React, { useState } from 'react';
import { 
  Columns, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Radio, 
  Cpu, 
  Activity, 
  ShieldCheck, 
  Terminal, 
  Layout, 
  SlidersHorizontal,
  Eye,
  LayoutDashboard,
  Layers
} from 'lucide-react';
import { MINING_OS_HTML, KERA_MESH_OS_HTML } from '../../data/openSourceOsTemplate';
import { DualRuntimeHealthVisualizer } from './DualRuntimeHealthVisualizer';
import { ObserverMeasurementConsole } from './ObserverMeasurementConsole';

interface KeraDualRuntimeWorkstationProps {
  onSwitchToOverview?: () => void;
}

export const KeraDualRuntimeWorkstation: React.FC<KeraDualRuntimeWorkstationProps> = ({
  onSwitchToOverview
}) => {
  // Default to full-screen stratum miner or split with robust layout
  const [viewMode, setViewMode] = useState<'split' | 'stratum' | 'mesh' | 'observer'>('stratum');
  const [isHealthDrawerOpen, setIsHealthDrawerOpen] = useState(false);
  const [stratumKey, setStratumKey] = useState(0);
  const [meshKey, setMeshKey] = useState(0);

  const handleReloadAll = () => {
    setStratumKey(k => k + 1);
    setMeshKey(k => k + 1);
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Automated Health Daemon Telemetry Ribbon */}
      <DualRuntimeHealthVisualizer 
        isDrawerOpen={isHealthDrawerOpen}
        onToggleDrawer={() => setIsHealthDrawerOpen(prev => !prev)}
      />

      {/* Control Action Bar */}
      <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/70 backdrop-blur flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Workspace Home Projection</span>
          </span>
          <span className="text-slate-600 hidden sm:inline" aria-hidden="true">|</span>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">239.29.7.100:4003</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Segmented Controls */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('stratum')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'stratum' ? 'bg-cyan-600 text-black font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Full Width Stratum Mining OS"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Stratum Miner (Full)</span>
            </button>
            <button
              onClick={() => setViewMode('mesh')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'mesh' ? 'bg-purple-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Full Width KERA Sovereign Mesh OS"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>KERA Mesh (Full)</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'split' ? 'bg-slate-800 text-cyan-400 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Side-by-Side Dual Projection"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Dual Split</span>
            </button>
            <button
              onClick={() => setViewMode('observer')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'observer' ? 'bg-slate-800 text-emerald-400 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Observer Theorem Console"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Observer Console</span>
            </button>
          </div>

          <button
            onClick={handleReloadAll}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs transition-colors cursor-pointer shrink-0"
            title="Reload runtime viewports"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reload</span>
          </button>

          {onSwitchToOverview && (
            <button
              onClick={onSwitchToOverview}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-600 text-blue-400 flex items-center gap-1.5 text-xs transition-colors cursor-pointer shrink-0"
              title="Switch to File & Storage Overview"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Dual Projection Viewport */}
      <div className={`flex-1 min-h-0 relative bg-black ${
        viewMode === 'split' 
          ? 'flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-800 overflow-auto' 
          : 'flex flex-col overflow-hidden'
      }`}>
        {/* Left Pane: Stratum Mining Core Runtime */}
        {(viewMode === 'split' || viewMode === 'stratum') && (
          <div className={`flex flex-col min-h-0 relative ${
            viewMode === 'split' ? 'flex-1 min-w-[500px] lg:min-w-0' : 'flex-1 w-full h-full'
          }`}>
            <div className="px-3 py-1.5 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                <span className="text-slate-200 font-semibold text-[11px]">server://kex/sovereign-stratum-miner</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-[10px]">
                <span className="hidden sm:inline">bitcoin.viabtc.io:3333 · Stratum V2 / IPC</span>
                {viewMode === 'split' ? (
                  <button
                    onClick={() => setViewMode('stratum')}
                    className="p-1 hover:text-cyan-400 transition-colors"
                    title="Maximize Stratum Miner"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setViewMode('split')}
                    className="p-1 hover:text-cyan-400 transition-colors"
                    title="Restore Dual Split"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            <iframe
              key={`stratum-${stratumKey}`}
              srcDoc={MINING_OS_HTML}
              className="flex-1 w-full h-full min-h-0 border-0 bg-black block"
              title="Stratum Mining Core Runtime"
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          </div>
        )}

        {/* Right Pane: KERA Sovereign Mesh Node Runtime */}
        {(viewMode === 'split' || viewMode === 'mesh') && (
          <div className={`flex flex-col min-h-0 relative ${
            viewMode === 'split' ? 'flex-1 min-w-[500px] lg:min-w-0' : 'flex-1 w-full h-full'
          }`}>
            <div className="px-3 py-1.5 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                <span className="text-slate-200 font-semibold text-[11px]">server://kex/kera-mesh-node</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-[10px]">
                <span className="hidden sm:inline">UDP 239.29.7.100:4003 · IPC Sectors</span>
                {viewMode === 'split' ? (
                  <button
                    onClick={() => setViewMode('mesh')}
                    className="p-1 hover:text-purple-400 transition-colors"
                    title="Maximize KERA Mesh Node"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setViewMode('split')}
                    className="p-1 hover:text-purple-400 transition-colors"
                    title="Restore Dual Split"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            <iframe
              key={`mesh-${meshKey}`}
              srcDoc={KERA_MESH_OS_HTML}
              className="flex-1 w-full h-full min-h-0 border-0 bg-black block"
              title="KERA Sovereign Mesh Node Runtime"
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          </div>
        )}

        {/* Observer Measurement Console Viewport */}
        {viewMode === 'observer' && (
          <div className="flex-1 flex flex-col min-h-0 min-w-0 relative bg-slate-950 overflow-y-auto">
            <ObserverMeasurementConsole />
          </div>
        )}
      </div>
    </div>
  );
};
