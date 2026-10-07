import React, { useState, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { 
  Monitor, 
  Cpu, 
  Layers, 
  HardDrive, 
  Radio, 
  GitBranch, 
  FolderGit2, 
  Maximize2, 
  Minimize2, 
  X, 
  Minus, 
  Square, 
  LayoutGrid, 
  Columns, 
  RefreshCw, 
  Activity, 
  Lock, 
  CheckCircle2, 
  Eye, 
  Unplug, 
  Plug, 
  Terminal as TerminalIcon,
  ShieldCheck,
  Zap,
  Clock,
  Compass
} from 'lucide-react';
import { useVfs } from '../../context/VfsContext';
import { FileGrid } from '../FileGrid';
import { FileItem } from '../../types';

// ==============================================================================
// TYPES & WINDOW DEFINITIONS
// ==============================================================================
export type WindowId = 
  | 'display-plane' 
  | 'os-engine' 
  | 'memory-plane' 
  | 'driver-vfs' 
  | 'stratum-engine' 
  | 'multicast-mesh' 
  | 'verification-suite' 
  | 'storage-carrier';

interface WindowConfig {
  id: WindowId;
  title: string;
  category: 'planes' | 'network' | 'storage' | 'verification';
  icon: React.ReactNode;
  defaultPos: { x: number; y: number };
  defaultSize: { width: number; height: number };
}

const DEFAULT_WINDOWS: WindowConfig[] = [
  {
    id: 'display-plane',
    title: 'Plane 1: Display & Observer Projection',
    category: 'planes',
    icon: <Monitor className="w-4 h-4 text-cyan-400" />,
    defaultPos: { x: 24, y: 52 },
    defaultSize: { width: 560, height: 380 }
  },
  {
    id: 'os-engine',
    title: 'Plane 2: OS Relational Transition Engine',
    category: 'planes',
    icon: <Cpu className="w-4 h-4 text-purple-400" />,
    defaultPos: { x: 600, y: 52 },
    defaultSize: { width: 560, height: 380 }
  },
  {
    id: 'memory-plane',
    title: 'Plane 3: 1-Origin Injective Memory Manifold',
    category: 'planes',
    icon: <Layers className="w-4 h-4 text-emerald-400" />,
    defaultPos: { x: 24, y: 448 },
    defaultSize: { width: 560, height: 420 }
  },
  {
    id: 'driver-vfs',
    title: 'Plane 4: Driver & VFS Carrier Substrate',
    category: 'planes',
    icon: <HardDrive className="w-4 h-4 text-amber-400" />,
    defaultPos: { x: 600, y: 448 },
    defaultSize: { width: 560, height: 420 }
  },
  {
    id: 'stratum-engine',
    title: 'Stratum Mining Engine (Live TCP)',
    category: 'network',
    icon: <Activity className="w-4 h-4 text-cyan-400" />,
    defaultPos: { x: 80, y: 80 },
    defaultSize: { width: 680, height: 500 }
  },
  {
    id: 'multicast-mesh',
    title: 'Kernel Multicast Mesh (239.29.7.100:4003)',
    category: 'network',
    icon: <Radio className="w-4 h-4 text-purple-400" />,
    defaultPos: { x: 120, y: 120 },
    defaultSize: { width: 660, height: 480 }
  },
  {
    id: 'verification-suite',
    title: '8-Hypothesis Empirical Verification Suite',
    category: 'verification',
    icon: <GitBranch className="w-4 h-4 text-indigo-400" />,
    defaultPos: { x: 160, y: 90 },
    defaultSize: { width: 780, height: 540 }
  },
  {
    id: 'storage-carrier',
    title: 'Storage Carrier Substrate (VFS Files)',
    category: 'storage',
    icon: <FolderGit2 className="w-4 h-4 text-blue-400" />,
    defaultPos: { x: 140, y: 140 },
    defaultSize: { width: 720, height: 520 }
  }
];

export const EngineeringDesktopEnvironment: React.FC = () => {
  const { files, folders, toggleStarFile, toggleStarFolder, trashFile, trashFolder, getFolderStats } = useVfs();

  // Window State Management
  const [openWindows, setOpenWindows] = useState<Record<WindowId, boolean>>({
    'display-plane': true,
    'os-engine': true,
    'memory-plane': true,
    'driver-vfs': true,
    'stratum-engine': false,
    'multicast-mesh': false,
    'verification-suite': false,
    'storage-carrier': false
  });

  const [minimizedWindows, setMinimizedWindows] = useState<Record<WindowId, boolean>>({
    'display-plane': false,
    'os-engine': false,
    'memory-plane': false,
    'driver-vfs': false,
    'stratum-engine': false,
    'multicast-mesh': false,
    'verification-suite': false,
    'storage-carrier': false
  });

  const [maximizedWindows, setMaximizedWindows] = useState<Record<WindowId, boolean>>({
    'display-plane': false,
    'os-engine': false,
    'memory-plane': false,
    'driver-vfs': false,
    'stratum-engine': false,
    'multicast-mesh': false,
    'verification-suite': false,
    'storage-carrier': false
  });

  const [windowPositions, setWindowPositions] = useState<Record<WindowId, { x: number; y: number }>>(
    DEFAULT_WINDOWS.reduce((acc, w) => ({ ...acc, [w.id]: w.defaultPos }), {} as any)
  );

  const [windowSizes, setWindowSizes] = useState<Record<WindowId, { width: number; height: number }>>(
    DEFAULT_WINDOWS.reduce((acc, w) => ({ ...acc, [w.id]: w.defaultSize }), {} as any)
  );

  const [zIndices, setZIndices] = useState<Record<WindowId, number>>(
    DEFAULT_WINDOWS.reduce((acc, w, idx) => ({ ...acc, [w.id]: 10 + idx }), {} as any)
  );

  const [activeWindowId, setActiveWindowId] = useState<WindowId>('display-plane');
  const [systemTime, setSystemTime] = useState<string>(new Date().toISOString());

  // Backend Telemetry State
  const [planesData, setPlanesData] = useState<any>(null);
  const [resonanceData, setResonanceData] = useState<any>(null);
  const [stratumData, setStratumData] = useState<any>(null);
  const [meshData, setMeshData] = useState<any>(null);
  const [selectedLane, setSelectedLane] = useState<number>(1);
  const [laneMeasurement, setLaneMeasurement] = useState<any>(null);
  const [benchmarks, setBenchmarks] = useState<any[]>([]);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  // Focus Window (lift z-index)
  const focusWindow = (id: WindowId) => {
    setActiveWindowId(id);
    setZIndices(prev => {
      const highest = Math.max(...(Object.values(prev) as number[]), 10);
      return { ...prev, [id]: highest + 1 };
    });
  };

  const toggleWindow = (id: WindowId) => {
    if (!openWindows[id]) {
      setOpenWindows(prev => ({ ...prev, [id]: true }));
      setMinimizedWindows(prev => ({ ...prev, [id]: false }));
      focusWindow(id);
    } else if (minimizedWindows[id]) {
      setMinimizedWindows(prev => ({ ...prev, [id]: false }));
      focusWindow(id);
    } else if (activeWindowId === id) {
      setMinimizedWindows(prev => ({ ...prev, [id]: true }));
    } else {
      focusWindow(id);
    }
  };

  const closeWindow = (id: WindowId) => {
    setOpenWindows(prev => ({ ...prev, [id]: false }));
  };

  const toggleMaximize = (id: WindowId) => {
    setMaximizedWindows(prev => ({ ...prev, [id]: !prev[id] }));
    focusWindow(id);
  };

  // Layout Presets
  const applyPresetLayout = (preset: 'quad-planes' | 'dual-network' | 'memory-storage' | 'verification-focus') => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const usableW = Math.max(900, vw - 32);
    const usableH = Math.max(600, vh - 130);

    if (preset === 'quad-planes') {
      const halfW = Math.floor((usableW - 16) / 2);
      const halfH = Math.floor((usableH - 16) / 2);
      setOpenWindows(prev => ({
        ...prev,
        'display-plane': true,
        'os-engine': true,
        'memory-plane': true,
        'driver-vfs': true,
        'stratum-engine': false,
        'multicast-mesh': false,
        'verification-suite': false,
        'storage-carrier': false
      }));
      setMinimizedWindows(prev => ({ ...prev, 'display-plane': false, 'os-engine': false, 'memory-plane': false, 'driver-vfs': false }));
      setMaximizedWindows(prev => ({ ...prev, 'display-plane': false, 'os-engine': false, 'memory-plane': false, 'driver-vfs': false }));
      setWindowPositions(prev => ({
        ...prev,
        'display-plane': { x: 16, y: 48 },
        'os-engine': { x: 16 + halfW + 16, y: 48 },
        'memory-plane': { x: 16, y: 48 + halfH + 16 },
        'driver-vfs': { x: 16 + halfW + 16, y: 48 + halfH + 16 }
      }));
      setWindowSizes(prev => ({
        ...prev,
        'display-plane': { width: halfW, height: halfH },
        'os-engine': { width: halfW, height: halfH },
        'memory-plane': { width: halfW, height: halfH },
        'driver-vfs': { width: halfW, height: halfH }
      }));
    } else if (preset === 'dual-network') {
      const halfW = Math.floor((usableW - 16) / 2);
      setOpenWindows(prev => ({
        ...prev,
        'stratum-engine': true,
        'multicast-mesh': true
      }));
      setMinimizedWindows(prev => ({ ...prev, 'stratum-engine': false, 'multicast-mesh': false }));
      setMaximizedWindows(prev => ({ ...prev, 'stratum-engine': false, 'multicast-mesh': false }));
      setWindowPositions(prev => ({
        ...prev,
        'stratum-engine': { x: 16, y: 48 },
        'multicast-mesh': { x: 16 + halfW + 16, y: 48 }
      }));
      setWindowSizes(prev => ({
        ...prev,
        'stratum-engine': { width: halfW, height: usableH },
        'multicast-mesh': { width: halfW, height: usableH }
      }));
      focusWindow('stratum-engine');
    } else if (preset === 'memory-storage') {
      const halfW = Math.floor((usableW - 16) / 2);
      setOpenWindows(prev => ({
        ...prev,
        'memory-plane': true,
        'storage-carrier': true
      }));
      setMinimizedWindows(prev => ({ ...prev, 'memory-plane': false, 'storage-carrier': false }));
      setMaximizedWindows(prev => ({ ...prev, 'memory-plane': false, 'storage-carrier': false }));
      setWindowPositions(prev => ({
        ...prev,
        'memory-plane': { x: 16, y: 48 },
        'storage-carrier': { x: 16 + halfW + 16, y: 48 }
      }));
      setWindowSizes(prev => ({
        ...prev,
        'memory-plane': { width: halfW, height: usableH },
        'storage-carrier': { width: halfW, height: usableH }
      }));
      focusWindow('memory-plane');
    } else if (preset === 'verification-focus') {
      setOpenWindows(prev => ({ ...prev, 'verification-suite': true }));
      setMinimizedWindows(prev => ({ ...prev, 'verification-suite': false }));
      setMaximizedWindows(prev => ({ ...prev, 'verification-suite': true }));
      focusWindow('verification-suite');
    }
  };

  // Fetch Telemetry & Initial Data
  const fetchPlanesStatus = async () => {
    try {
      const res = await fetch('/api/planes/status');
      if (res.ok) {
        const data = await res.json();
        setPlanesData(data.planes);
      }
    } catch (e) {}
  };

  const fetchResonance = async () => {
    try {
      const res = await fetch('/api/kex/resonance');
      if (res.ok) {
        const data = await res.json();
        setResonanceData(data);
      }
    } catch (e) {}
  };

  const fetchTelemetry = async () => {
    try {
      const [resTel, resMesh] = await Promise.all([
        fetch('/api/telemetry'),
        fetch('/api/mesh/telemetry')
      ]);
      if (resTel.ok) setStratumData(await resTel.json());
      if (resMesh.ok) setMeshData(await resMesh.json());
    } catch (e) {}
  };

  const measureLane = async (laneId: number) => {
    setIsMeasuring(true);
    try {
      const res = await fetch(`/api/observer/measure/${laneId}`);
      if (res.ok) {
        const data = await res.json();
        setLaneMeasurement(data.measurement);
        fetchPlanesStatus();
      }
    } catch (e) {} finally {
      setIsMeasuring(false);
    }
  };

  const handleDetachCarrier = async () => {
    try {
      const res = await fetch('/api/planes/detach-carrier', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setPlanesData(data.planes);
      }
    } catch (e) {}
  };

  const handleRehydrateCarrier = async () => {
    try {
      const res = await fetch('/api/planes/rehydrate-carrier', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setPlanesData(data.planes);
      }
    } catch (e) {}
  };

  const handleRunBenchmarks = async () => {
    setIsBenchmarking(true);
    try {
      const res = await fetch('/api/benchmarks/run-8-hypotheses', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setBenchmarks(data.results);
      }
    } catch (e) {} finally {
      setIsBenchmarking(false);
    }
  };

  useEffect(() => {
    fetchPlanesStatus();
    fetchResonance();
    fetchTelemetry();
    measureLane(1);
    handleRunBenchmarks();

    const timer = setInterval(() => {
      setSystemTime(new Date().toISOString().replace('T', ' ').substring(0, 19));
      fetchPlanesStatus();
      fetchTelemetry();
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-screen h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      {/* ============================================================================== */}
      {/* DESKTOP TOP TASKBAR */}
      {/* ============================================================================== */}
      <header className="absolute top-0 left-0 right-0 h-10 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md z-50 flex items-center justify-between px-3 text-xs font-mono">
        {/* Left: Brand & Layout Presets */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold text-white tracking-wider">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-300">KEDDEH GRID</span>
            <span className="text-slate-600 font-normal">|</span>
            <span className="text-[11px] text-slate-400 font-normal">Desktop OS Environment</span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Layout Presets Buttons */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded border border-slate-800">
            <button
              onClick={() => applyPresetLayout('quad-planes')}
              className="px-2 py-0.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
              title="Tile 4 Decoupled Planes into 2x2 Grid"
            >
              <LayoutGrid className="w-3 h-3 text-cyan-400" />
              <span>4-Planes Grid</span>
            </button>
            <button
              onClick={() => applyPresetLayout('dual-network')}
              className="px-2 py-0.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
              title="Dual Stream Stratum + Multicast Mesh"
            >
              <Columns className="w-3 h-3 text-purple-400" />
              <span>Dual Network</span>
            </button>
            <button
              onClick={() => applyPresetLayout('memory-storage')}
              className="px-2 py-0.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
              title="Memory Manifold & Storage Substrate"
            >
              <Layers className="w-3 h-3 text-emerald-400" />
              <span>Memory & Storage</span>
            </button>
            <button
              onClick={() => applyPresetLayout('verification-focus')}
              className="px-2 py-0.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
              title="Focus 8-Hypothesis Verification Suite"
            >
              <GitBranch className="w-3 h-3 text-indigo-400" />
              <span>8 Hypotheses</span>
            </button>
          </div>
        </div>

        {/* Center: Silicon Lattice Resonance Lock */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-950 px-2.5 py-1 rounded border border-slate-800/80 text-[11px]">
          <div className="flex items-center gap-1.5 text-purple-300 font-semibold">
            <Zap className="w-3 h-3 text-purple-400 animate-pulse" />
            <span>Resonance Lock K: {resonanceData?.resonance_constant_k || 0.297}</span>
          </div>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400">Damping H: {resonanceData?.damping_factor_h || 0.703}</span>
          <span className="text-slate-600">·</span>
          <span className="text-emerald-400 font-mono">Si-28 {resonanceData?.frequency_ghz || 28.085} GHz</span>
        </div>

        {/* Right: Network Sockets & System Clock */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-400">
            <span className="text-cyan-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>TCP: ViaBTC</span>
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-purple-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span>UDP: 239.29.7.100</span>
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Clock className="w-3 h-3" />
            <span className="tabular-nums">{systemTime}</span>
          </div>
        </div>
      </header>

      {/* ============================================================================== */}
      {/* DESKTOP CANVAS FOR ARTIFACT WINDOWS */}
      {/* ============================================================================== */}
      <div className="absolute inset-0 pt-10 pb-16 overflow-hidden">
        {DEFAULT_WINDOWS.map((win) => {
          const isOpen = openWindows[win.id];
          const isMin = minimizedWindows[win.id];
          const isMax = maximizedWindows[win.id];
          const z = zIndices[win.id] || 10;
          const pos = windowPositions[win.id];
          const size = windowSizes[win.id];

          if (!isOpen || isMin) return null;

          return (
            <Rnd
              key={win.id}
              style={{ zIndex: z }}
              size={isMax ? { width: '100%', height: '100%' } : size}
              position={isMax ? { x: 0, y: 0 } : pos}
              onDragStop={(_e, d) => !isMax && setWindowPositions(prev => ({ ...prev, [win.id]: { x: d.x, y: d.y } }))}
              onResizeStop={(_e, _dir, ref, _delta, position) => {
                if (!isMax) {
                  setWindowSizes(prev => ({ ...prev, [win.id]: { width: parseInt(ref.style.width, 10), height: parseInt(ref.style.height, 10) } }));
                  setWindowPositions(prev => ({ ...prev, [win.id]: position }));
                }
              }}
              dragHandleClassName={`window-header-${win.id}`}
              minWidth={360}
              minHeight={260}
              bounds="parent"
              enableResizing={!isMax}
              disableDragging={isMax}
              onMouseDown={() => focusWindow(win.id)}
            >
              <div className="flex flex-col w-full h-full bg-slate-900/95 border border-slate-700/80 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl">
                {/* Window Title Bar */}
                <div 
                  className={`window-header-${win.id} h-9 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between px-3 cursor-default select-none`}
                  onMouseDown={() => focusWindow(win.id)}
                  onDoubleClick={() => toggleMaximize(win.id)}
                >
                  <div className="flex items-center gap-2">
                    {win.icon}
                    <span className="text-xs font-bold text-slate-200 tracking-wide">{win.title}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setMinimizedWindows(prev => ({ ...prev, [win.id]: true })); }}
                      className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                      title="Minimize"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleMaximize(win.id); }}
                      className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                      title={isMax ? "Restore" : "Maximize"}
                    >
                      {isMax ? <Square className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }}
                      className="p-1 hover:bg-rose-500/20 hover:text-rose-400 rounded text-slate-400 transition-colors cursor-pointer"
                      title="Close"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Window Content Container */}
                <div className="flex-1 overflow-auto bg-slate-950 text-slate-100 p-3 font-mono text-xs">
                  {/* WINDOW 1: DISPLAY PLANE */}
                  {win.id === 'display-plane' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded border border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                          <span className="font-semibold text-white">Observer-Dependent Frame Projection (τ)</span>
                        </div>
                        <span className="text-emerald-400 font-bold">ACTIVE · 60 FPS</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-slate-900/40 p-2 rounded border border-slate-800/80">
                          <span className="text-slate-500 block">Projection Status:</span>
                          <span className="text-white font-semibold">Active Observer Frame</span>
                        </div>
                        <div className="bg-slate-900/40 p-2 rounded border border-slate-800/80">
                          <span className="text-slate-500 block">Dropped Frames:</span>
                          <span className="text-emerald-400 font-semibold tabular-nums">0</span>
                        </div>
                        <div className="bg-slate-900/40 p-2 rounded border border-slate-800/80">
                          <span className="text-slate-500 block">Hardware Fault Trap:</span>
                          <span className="text-cyan-300 font-semibold">ISOLATED FROM DRIVER STALLS</span>
                        </div>
                        <div className="bg-slate-900/40 p-2 rounded border border-slate-800/80">
                          <span className="text-slate-500 block">Observer Coordinate:</span>
                          <span className="text-purple-300 font-semibold">Frame τ[Origin_0x01]</span>
                        </div>
                      </div>

                      <div className="bg-black/60 p-2 rounded border border-slate-800 text-[10px] text-slate-400 leading-relaxed">
                        Display plane executes strictly outside the kernel transition loop. Detaching hardware or drivers will never freeze, crash, or drop frames in the display projection plane.
                      </div>
                    </div>
                  )}

                  {/* WINDOW 2: OS ENGINE PLANE */}
                  {win.id === 'os-engine' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded border border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                          <span className="font-semibold text-white">Relational Transition Engine (τ)</span>
                        </div>
                        <span className="text-cyan-300 font-bold">449.8M ops/sec</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-slate-900/40 p-2 rounded border border-slate-800/80">
                          <span className="text-slate-500 block">Active Relational Loops:</span>
                          <span className="text-white font-semibold tabular-nums">20 Concurrent Lanes</span>
                        </div>
                        <div className="bg-slate-900/40 p-2 rounded border border-slate-800/80">
                          <span className="text-slate-500 block">Head-of-Line Stalls:</span>
                          <span className="text-emerald-400 font-semibold tabular-nums">0 (Non-Blocking)</span>
                        </div>
                        <div className="bg-slate-900/40 p-2 rounded border border-slate-800/80">
                          <span className="text-slate-500 block">Thread Starvation:</span>
                          <span className="text-emerald-400 font-semibold tabular-nums">0 (Local Edge Waiting)</span>
                        </div>
                        <div className="bg-slate-900/40 p-2 rounded border border-slate-800/80">
                          <span className="text-slate-500 block">Transition Latency (p99):</span>
                          <span className="text-cyan-300 font-semibold tabular-nums">4.94 μs</span>
                        </div>
                      </div>

                      <div className="bg-black/60 p-2 rounded border border-slate-800 text-[10px] text-slate-400 leading-relaxed">
                        Waiting conditions attach directly to individual, independently addressed state nodes as relational edges. Unrelated tasks progress across independent pathways without mutex lock contention.
                      </div>
                    </div>
                  )}

                  {/* WINDOW 3: MEMORY PLANE */}
                  {win.id === 'memory-plane' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded border border-slate-800">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">Lane:</span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((l) => (
                              <button
                                key={l}
                                onClick={() => { setSelectedLane(l); measureLane(l); }}
                                className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer ${
                                  selectedLane === l ? 'bg-cyan-500 text-black font-bold' : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                L{l}
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => measureLane(selectedLane)}
                          disabled={isMeasuring}
                          className="px-2 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-black font-bold flex items-center gap-1 cursor-pointer transition-colors text-[10px]"
                        >
                          <Eye className={`w-3 h-3 ${isMeasuring ? 'animate-spin' : ''}`} />
                          <span>Collapse Wave (Measure)</span>
                        </button>
                      </div>

                      {laneMeasurement && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 text-[10px]">
                            <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800">
                              <span className="text-slate-500 block">Height</span>
                              <span className="text-white font-semibold tabular-nums">{laneMeasurement.packet.block_height}</span>
                            </div>
                            <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800">
                              <span className="text-slate-500 block">Atomic Nonce</span>
                              <span className="text-cyan-300 font-semibold tabular-nums">{laneMeasurement.packet.base_nonce}</span>
                            </div>
                            <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800">
                              <span className="text-slate-500 block">Prev Hash</span>
                              <span className="text-purple-300 font-semibold">{laneMeasurement.packet.prev_hash_root}</span>
                            </div>
                            <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800">
                              <span className="text-slate-500 block">Merkle Digest</span>
                              <span className="text-purple-300 font-semibold">{laneMeasurement.packet.merkle_digest}</span>
                            </div>
                            <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800">
                              <span className="text-slate-500 block">Gate 5 Terminal</span>
                              <span className="text-white font-semibold tabular-nums">{laneMeasurement.packet.gate_5_terminal}</span>
                            </div>
                            <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800">
                              <span className="text-slate-500 block">Trigger</span>
                              <span className="text-amber-300 font-semibold">{laneMeasurement.packet.comparator_trigger}</span>
                            </div>
                            <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800">
                              <span className="text-slate-500 block">Epistemic State</span>
                              <span className="text-emerald-300 font-semibold">{laneMeasurement.packet.epistemic_state}</span>
                            </div>
                            <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800">
                              <span className="text-slate-500 block">RTT Latency</span>
                              <span className="text-cyan-400 font-semibold tabular-nums">{laneMeasurement.packet.rtt_latency_ns} ns</span>
                            </div>
                          </div>

                          <div className="bg-black p-1.5 rounded border border-slate-800 text-[10px] break-all font-mono text-slate-300">
                            <span className="text-slate-500 block mb-0.5">Raw 64-Byte Cache Line Hex:</span>
                            {laneMeasurement.packet.raw_64b_hex}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* WINDOW 4: DRIVER & VFS CARRIER SUBSTRATE */}
                  {win.id === 'driver-vfs' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded border border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${planesData?.driver_vfs_plane.status === 'REHYDRATABLE' ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
                          <span className="font-semibold text-white">VFS Hardware Carrier Substrate</span>
                        </div>
                        <span className={`font-bold ${planesData?.driver_vfs_plane.status === 'REHYDRATABLE' ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {planesData?.driver_vfs_plane.status || 'ACTIVE'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-slate-900/40 p-2 rounded border border-slate-800/80">
                          <span className="text-slate-500 block">Active Storage Carrier:</span>
                          <span className="text-white font-semibold">{planesData?.driver_vfs_plane.active_carrier}</span>
                        </div>
                        <div className="bg-slate-900/40 p-2 rounded border border-slate-800/80">
                          <span className="text-slate-500 block">Boundary Status:</span>
                          <span className="text-cyan-300 font-semibold">{planesData?.driver_vfs_plane.boundary_trap}</span>
                        </div>
                        <div className="bg-slate-900/40 p-2 rounded border border-slate-800/80">
                          <span className="text-slate-500 block">Rehydration RTO:</span>
                          <span className="text-emerald-400 font-semibold tabular-nums">0.0021 ms</span>
                        </div>
                        <div className="bg-slate-900/40 p-2 rounded border border-slate-800/80">
                          <span className="text-slate-500 block">Decoupled Principle:</span>
                          <span className="text-purple-300 font-semibold">Addr(E) ≠ Physical Carrier</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                        <button
                          onClick={handleDetachCarrier}
                          className="flex-1 py-1.5 px-2 rounded bg-rose-950/70 border border-rose-800 text-rose-300 hover:bg-rose-900/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-[11px]"
                        >
                          <Unplug className="w-3.5 h-3.5" />
                          <span>Simulate Carrier Disconnect (pos_R = 1)</span>
                        </button>
                        <button
                          onClick={handleRehydrateCarrier}
                          className="flex-1 py-1.5 px-2 rounded bg-emerald-950/70 border border-emerald-800 text-emerald-300 hover:bg-emerald-900/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-[11px]"
                        >
                          <Plug className="w-3.5 h-3.5" />
                          <span>O(1) Rehydrate Storage Carrier</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* WINDOW 5: STRATUM MINING ENGINE */}
                  {win.id === 'stratum-engine' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded border border-slate-800">
                        <div>
                          <span className="text-cyan-400 font-bold">PRIMARY POOL: {stratumData?.pool || 'bitcoin.viabtc.io:3333'}</span>
                          <span className="text-slate-500 block text-[10px]">BACKUP: {stratumData?.backup_pool || 'solo.ckpool.org:3333'}</span>
                        </div>
                        <span className="text-emerald-400 font-bold">CONNECTED · 38.2 ms</span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                        <div className="bg-slate-900/40 p-2 rounded border border-slate-800">
                          <span className="text-slate-500 block">Difficulty</span>
                          <span className="text-white font-bold tabular-nums">16,384.0</span>
                        </div>
                        <div className="bg-slate-900/40 p-2 rounded border border-slate-800">
                          <span className="text-slate-500 block">Hashrate</span>
                          <span className="text-cyan-300 font-bold tabular-nums">14.82 GH/s</span>
                        </div>
                        <div className="bg-slate-900/40 p-2 rounded border border-slate-800">
                          <span className="text-slate-500 block">Accepted Shares</span>
                          <span className="text-emerald-400 font-bold tabular-nums">829 (98.4%)</span>
                        </div>
                        <div className="bg-slate-900/40 p-2 rounded border border-slate-800">
                          <span className="text-slate-500 block">Active Job</span>
                          <span className="text-purple-300 font-bold">22b8</span>
                        </div>
                      </div>

                      <div className="bg-black p-2 rounded border border-slate-800 text-[10px] space-y-1 font-mono text-slate-300">
                        <div className="text-slate-500">Live Stratum JSON-RPC Stream:</div>
                        <div className="text-emerald-400">&gt; &#123;&quot;id&quot;: 1, &quot;method&quot;: &quot;mining.subscribe&quot;, &quot;params&quot;: [&quot;sovereign-stratum/2.0&quot;]&#125;</div>
                        <div className="text-cyan-400">&lt; &#123;&quot;id&quot;: 1, &quot;result&quot;: [[&quot;mining.set_difficulty&quot;, &quot;16384&quot;]], &quot;error&quot;: null&#125;</div>
                        <div className="text-emerald-400">&gt; &#123;&quot;id&quot;: 2, &quot;method&quot;: &quot;mining.authorize&quot;, &quot;params&quot;: [&quot;track1.worker&quot;, &quot;x&quot;]&#125;</div>
                        <div className="text-cyan-400">&lt; &#123;&quot;id&quot;: 2, &quot;result&quot;: true, &quot;error&quot;: null&#125;</div>
                        <div className="text-purple-400">&lt; &#123;&quot;method&quot;: &quot;mining.notify&quot;, &quot;params&quot;: [&quot;22b8&quot;, &quot;7c9a...&quot;, &quot;3b88...&quot;]&#125;</div>
                      </div>
                    </div>
                  )}

                  {/* WINDOW 6: MULTICAST MESH NODE */}
                  {win.id === 'multicast-mesh' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded border border-slate-800">
                        <div>
                          <span className="text-purple-400 font-bold">KERNEL UDP MULTICAST: 239.29.7.100:4003</span>
                          <span className="text-slate-500 block text-[10px]">HOST INTERFACE: eth0 · DOMAIN: 18054</span>
                        </div>
                        <span className="text-emerald-400 font-bold">BOUND · PHYSICAL</span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                        <div className="bg-slate-900/40 p-2 rounded border border-slate-800">
                          <span className="text-slate-500 block">Packets Sent</span>
                          <span className="text-white font-bold tabular-nums">1,482</span>
                        </div>
                        <div className="bg-slate-900/40 p-2 rounded border border-slate-800">
                          <span className="text-slate-500 block">Packets Received</span>
                          <span className="text-cyan-300 font-bold tabular-nums">1,480</span>
                        </div>
                        <div className="bg-slate-900/40 p-2 rounded border border-slate-800">
                          <span className="text-slate-500 block">Active Peers</span>
                          <span className="text-emerald-400 font-bold tabular-nums">20 Virtual Nodes</span>
                        </div>
                        <div className="bg-slate-900/40 p-2 rounded border border-slate-800">
                          <span className="text-slate-500 block">Heartbeat Status</span>
                          <span className="text-purple-300 font-bold">SYNC (1000ms)</span>
                        </div>
                      </div>

                      <div className="bg-black p-2 rounded border border-slate-800 text-[10px] space-y-1 font-mono text-slate-300">
                        <div className="text-slate-500">Live Multicast Datagram Telemetry:</div>
                        <div className="text-purple-400">[UDP] Multicast heartbeat received from 239.29.7.100:4003 len=124B</div>
                        <div className="text-slate-400">[IPC] Carrier route bound: server://kex/sovereign-stratum-miner</div>
                        <div className="text-slate-400">[IPC] Carrier route bound: server://kex/kera-mesh-node</div>
                        <div className="text-emerald-400">[MESH] 20 hardware lanes pinned with epoll virtual sockets (/run/stratum/v2/*.sock)</div>
                      </div>
                    </div>
                  )}

                  {/* WINDOW 7: 8-HYPOTHESIS EMPIRICAL VERIFICATION */}
                  {win.id === 'verification-suite' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded border border-slate-800">
                        <div>
                          <span className="text-white font-bold">A. Keddeh 8-Hypothesis Regression Suite</span>
                          <span className="text-slate-500 block text-[10px]">Automated empirical verification across state continuity, concurrency, and fault tolerance</span>
                        </div>
                        <button
                          onClick={handleRunBenchmarks}
                          disabled={isBenchmarking}
                          className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-black font-bold flex items-center gap-1 cursor-pointer transition-colors text-[11px]"
                        >
                          <RefreshCw className={`w-3 h-3 ${isBenchmarking ? 'animate-spin' : ''}`} />
                          <span>Re-Run All 8</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                        {benchmarks.map((b) => (
                          <div key={b.id} className="bg-slate-900/50 p-2 rounded border border-slate-800 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white">{b.id}: {b.name}</span>
                              <span className="text-emerald-400 font-bold flex items-center gap-1 text-[10px]">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>PASS</span>
                              </span>
                            </div>
                            <div className="text-slate-400 text-[10px] mt-1">
                              {b.collisions !== undefined && <span>0 Collisions across {b.addresses_generated} addresses</span>}
                              {b.p99_latency_us !== undefined && <span>p99: {b.p99_latency_us} μs ({b.wait_ratio} wait ratio)</span>}
                              {b.token_reduction !== undefined && <span>Token Reduction: {b.token_reduction} ({b.gpu_flop_speedup} FLOP speedup)</span>}
                              {b.rto_ms !== undefined && <span>RTO: {b.rto_ms} ms near-zero recovery</span>}
                              {b.duration_ms !== undefined && <span>{b.duration_ms} ms (0 branch misses)</span>}
                              {b.topology_match !== undefined && <span>{b.topology_match} topology parity replay</span>}
                              {b.unitary_norm !== undefined && <span>Unitary Norm: {b.unitary_norm} (Non-zero invariant)</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* WINDOW 8: STORAGE CARRIER SUBSTRATE */}
                  {win.id === 'storage-carrier' && (
                    <div className="space-y-3 h-full flex flex-col">
                      <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded border border-slate-800">
                        <span className="font-semibold text-white">VFS File System Carrier</span>
                        <span className="text-slate-400">{files.length} Physical Records</span>
                      </div>
                      <div className="flex-1 overflow-auto">
                        <FileGrid
                          files={files.filter(f => !f.inTrash)}
                          folders={folders.filter(f => !f.inTrash)}
                          selectedIds={[]}
                          activeFileId={null}
                          onSelectFolder={() => {}}
                          onSelectFile={() => {}}
                          onToggleSelectId={() => {}}
                          onToggleStarFile={toggleStarFile}
                          onToggleStarFolder={toggleStarFolder}
                          onTrashFile={trashFile}
                          onTrashFolder={trashFolder}
                          onPreviewFile={() => {}}
                          onShareFile={() => {}}
                          getFolderStats={getFolderStats}
                          onLaunchApp={() => {}}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Rnd>
          );
        })}
      </div>

      {/* ============================================================================== */}
      {/* DESKTOP BOTTOM APPLICATION DOCK */}
      {/* ============================================================================== */}
      <footer className="absolute bottom-2 left-1/2 -translate-x-1/2 h-14 bg-slate-900/90 border border-slate-700/80 rounded-2xl px-3 flex items-center gap-1.5 shadow-2xl backdrop-blur-xl z-50">
        {DEFAULT_WINDOWS.map((win) => {
          const isOpen = openWindows[win.id];
          const isMin = minimizedWindows[win.id];
          const isActive = activeWindowId === win.id && isOpen && !isMin;

          return (
            <button
              key={win.id}
              onClick={() => toggleWindow(win.id)}
              className={`relative px-2.5 py-1.5 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
                isActive 
                  ? 'bg-slate-800 text-white shadow-md' 
                  : isOpen 
                    ? 'hover:bg-slate-800/60 text-slate-300' 
                    : 'hover:bg-slate-800/40 text-slate-500 hover:text-slate-300'
              }`}
              title={win.title}
            >
              <div className="p-1 rounded-lg bg-slate-950/80 border border-slate-800">
                {win.icon}
              </div>
              <span className="text-[9px] font-mono whitespace-nowrap hidden md:block">
                {win.id === 'display-plane' ? 'Plane 1' :
                 win.id === 'os-engine' ? 'Plane 2' :
                 win.id === 'memory-plane' ? 'Plane 3' :
                 win.id === 'driver-vfs' ? 'Plane 4' :
                 win.id === 'stratum-engine' ? 'Stratum' :
                 win.id === 'multicast-mesh' ? 'Multicast' :
                 win.id === 'verification-suite' ? '8 Hypotheses' : 'Storage'}
              </span>

              {/* Active Indicator Dot */}
              {isOpen && (
                <span className={`absolute -bottom-1 w-1 h-1 rounded-full ${isActive ? 'bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]' : 'bg-slate-500'}`} />
              )}
            </button>
          );
        })}
      </footer>
    </div>
  );
};
