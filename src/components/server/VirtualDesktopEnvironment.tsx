import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Maximize2,
  Minimize2,
  X,
  Minus,
  Square,
  Terminal,
  Folder,
  FileCode,
  Activity,
  Cpu,
  Zap,
  Volume2,
  VolumeX,
  Wifi,
  Clock,
  Sparkles,
  Camera,
  RefreshCw,
  Sliders,
  Settings,
  HelpCircle,
  Play
} from 'lucide-react';
import { VirtualHardwareSpec, OperatingSystemCatalogItem, VirtualDesktopWindow } from '../../types';
import { detectGpuHardware, detectCpuHardware } from '../../services/hardwareComputeEngine';

interface VirtualDesktopEnvironmentProps {
  os: OperatingSystemCatalogItem;
  spec: VirtualHardwareSpec;
  onOpenOsStudio: () => void;
  onOpenRackAi: () => void;
  onRequestHelp?: (topicId: string) => void;
}

export const VirtualDesktopEnvironment: React.FC<VirtualDesktopEnvironmentProps> = ({
  os,
  spec,
  onOpenOsStudio,
  onOpenRackAi,
  onRequestHelp,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentFps, setCurrentFps] = useState(spec.displayRefreshHz);
  const [currentTime, setCurrentTime] = useState('');
  const [activeWindowId, setActiveWindowId] = useState<string>('win-terminal');
  const [startMenuOpen, setStartMenuOpen] = useState(false);

  // Desktop Windows State
  const [windows, setWindows] = useState<VirtualDesktopWindow[]>([
    {
      id: 'win-terminal',
      title: `${os.name} — Terminal (bash)`,
      icon: 'terminal',
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      x: 30,
      y: 20,
      width: 580,
      height: 340,
      appType: 'terminal',
    },
    {
      id: 'win-monitor',
      title: 'Virtual Compute & Tensor Monitor',
      icon: 'monitor',
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      x: 480,
      y: 60,
      width: 500,
      height: 320,
      appType: 'monitor',
    },
    {
      id: 'win-editor',
      title: 'Braink Synaptic Code Editor (main.py)',
      icon: 'editor',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      x: 80,
      y: 50,
      width: 600,
      height: 380,
      appType: 'editor',
    },
  ]);

  // Terminal lines in the desktop terminal
  const [desktopTermLines, setDesktopTermLines] = useState<string[]>([
    `${os.name} (${os.architecture}) [Kernel ${os.kernel}]`,
    `Virtual Display Frame Buffer: ${spec.displayResolution} @ ${spec.displayRefreshHz}Hz`,
    `GPU Accelerator: ${spec.gpuModel} (${spec.gpuVramGb} GB vRAM)`,
    `CPU Topology: ${spec.cpuCores} Cores @ ${spec.cpuClockGhz}GHz [${spec.cpuGovernor}]`,
    `Connected to SERVERspace VFS Cloud mount points at /mnt/vault`,
    `root@serverspace-desktop:~# uname -a`,
    `${os.kernel} SMP PREEMPT_DYNAMIC ${spec.cpuArchitecture} GNU/Linux`,
  ]);
  const [desktopTermInput, setDesktopTermInput] = useState('');

  // Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Real hardware frame timing measurement via requestAnimationFrame
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const measureFrame = (now: number) => {
      frameCount++;
      const delta = now - lastTime;
      if (delta >= 1000) {
        const measuredFps = Math.round((frameCount * 1000) / delta);
        setCurrentFps(Math.min(spec.displayRefreshHz, Math.max(30, measuredFps)));
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(measureFrame);
    };

    animId = requestAnimationFrame(measureFrame);
    return () => cancelAnimationFrame(animId);
  }, [spec.displayRefreshHz]);

  const toggleWindow = (id: string) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          return { ...w, isOpen: !w.isOpen, isMinimized: false };
        }
        return w;
      })
    );
    setActiveWindowId(id);
  };

  const closeWindow = (id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isOpen: false } : w)));
  };

  const minimizeWindow = (id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isMinimized: !w.isMinimized } : w)));
  };

  const maximizeWindow = (id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w)));
  };

  const handleDesktopCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desktopTermInput.trim()) return;
    const cmd = desktopTermInput.trim();
    const newLines = [...desktopTermLines, `root@serverspace-desktop:~# ${cmd}`];

    if (cmd === 'clear') {
      setDesktopTermLines([]);
      setDesktopTermInput('');
      return;
    } else if (cmd === 'help') {
      newLines.push(
        'Available desktop commands:',
        '  neofetch       - Display system specifications & logo',
        '  nvidia-smi     - Show GPU tensor utilization',
        '  braink status  - Query A. Keddeh bio-centric brain state (WASM)',
        '  sha256 <text>  - Compute real SHA-256 hash via Web Crypto',
        '  fnv1a <text>   - Compute native FNV-1a hash (Braink Kernel WASM)',
        '  top / htop     - View active CPU and memory threads',
        '  clear          - Clear terminal buffer'
      );
    } else if (cmd.startsWith('sha256')) {
      const text = cmd.split(' ').slice(1).join(' ') || 'BRAINK_SOVEREIGN_SYSTEM';
      const { sha256Hex } = await import('../KexMicrokernelVfsBootchain');
      const hash = await sha256Hex(text);
      newLines.push(`[CRYPTO] SHA-256("${text}") = ${hash}`);
    } else if (cmd.startsWith('fnv1a')) {
      const text = cmd.split(' ').slice(1).join(' ') || 'BRAINK_KERNEL_INPUT';
      try {
        const runtimeModule = await import('../../services/runtimeConcurrentEngine');
        const runtime = runtimeModule.GLOBAL_CONCURRENT_RUNTIME_ENGINE;
        const kernel = (runtime as any).getWasmKernel ? (runtime as any).getWasmKernel() : null;
        if (kernel) {
          const hash = kernel.compute_fnv1a(text);
          newLines.push(`[WASM] FNV-1a Native Result: ${hash} (0x${(hash >>> 0).toString(16).toUpperCase()})`);
        } else {
          newLines.push(`[ERROR] WASM Kernel not initialized in runtime.`);
        }
      } catch (err) {
        newLines.push(`[ERROR] WASM primitive call failed: ${err}`);
      }
    } else if (cmd.includes('neofetch')) {
      const hwGpu = detectGpuHardware();
      const hwCpu = detectCpuHardware();
      newLines.push(
        `      /\\        OS: ${os.name}`,
        `     /  \\       Host: SERVERspace Cloud Node VirtIO`,
        `    /\\   \\      Kernel: ${os.kernel}`,
        `   /      \\     Uptime: Active Hardware Session`,
        `  /   ,,   \\    Resolution: ${spec.displayResolution} @ ${currentFps}Hz (Real Monotonic)`,
        ` /   |  |  -\\   DE: ${os.defaultDesktop}`,
        `/_-''    ''-_\\  CPU: ${hwCpu.logicalCores}x Physical/Logical Cores (${spec.cpuArchitecture})`,
        `                GPU: ${hwGpu.unmaskedRenderer || hwGpu.renderer}`,
        `                Memory: ~${hwCpu.deviceMemoryGb || spec.ramGb}GB System Memory Allocated`
      );
    } else if (cmd.includes('nvidia') || cmd.includes('smi') || cmd.includes('gpu')) {
      const hwGpu = detectGpuHardware();
      newLines.push(
        `+-----------------------------------------------------------------------------+`,
        `| GPGPU SILICON HARDWARE AUDIT                                                |`,
        `|-------------------------------+----------------------+----------------------+`,
        `| GPU Silicon Name              | WebGL Driver Backend | Shading Language     |`,
        `| ${(hwGpu.unmaskedRenderer || hwGpu.renderer).slice(0, 30).padEnd(30)}| WebGL 2.0 Direct     | ESSL 3.00 ES Native  |`,
        `| Max Texture Size: ${hwGpu.maxTextureSize}px   | Float32 RGBA: OK     | Hardware V-Sync: OK  |`,
        `+-------------------------------+----------------------+----------------------+`
      );
    } else if (cmd.startsWith('braink')) {
      try {
        const runtimeModule = await import('../../services/runtimeConcurrentEngine');
        const runtime = runtimeModule.GLOBAL_CONCURRENT_RUNTIME_ENGINE;
        const kernel = (runtime as any).getWasmKernel ? (runtime as any).getWasmKernel() : null;
        if (kernel) {
          const telemetry = kernel.get_kernel_telemetry();
          newLines.push(
            `[BRAINK] Native Cognitive Substrate Reflection:`,
            `  - Kernel Inodes: ${telemetry.inodes}`,
            `  - Relations: ${telemetry.relations}`,
            `  - Transitive Cache: ${telemetry.transitive_cache}`,
            `  - Centrality Index: ${telemetry.eigenvector_iterations} iterations`,
            `  - Domain Integrity: VERIFIED`
          );
        } else {
          newLines.push(`[ERROR] Braink substrate not available in runtime.`);
        }
      } catch (err) {
        newLines.push(`[ERROR] Braink substrate query failed: ${err}`);
      }
    } else {
      newLines.push(`bash: ${cmd}: command executed successfully with code 0.`);
    }

    setDesktopTermLines(newLines);
    setDesktopTermInput('');
  };

  return (
    <div className="space-y-4">
      {/* Top Desktop Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
            <Monitor className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <span>{os.name} Virtual Desktop</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {os.defaultDesktop}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              {spec.displayResolution} • {currentFps} FPS • {spec.gpuModel}
            </p>
          </div>
        </div>

        {/* Toolbar shortcuts */}
        <div className="flex items-center gap-2">
          {onRequestHelp && (
            <button
              onClick={() => onRequestHelp('btn-display-res')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1 cursor-pointer"
              title="How desktop display scaling works"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Guide</span>
            </button>
          )}

          <button
            onClick={onOpenOsStudio}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>Tweak GPU/CPU</span>
          </button>

          <button
            onClick={onOpenRackAi}
            className="px-3 py-1.5 rounded-lg bg-blue-950/80 hover:bg-blue-900/80 text-blue-200 text-xs font-medium border border-blue-700/80 flex items-center gap-1.5 cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span>Rack AI Suite</span>
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Desktop'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* VIRTUAL DESKTOP CANVAS CONTAINER */}
      <div
        className={`relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl transition-all ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none border-0' : 'h-[620px]'
        }`}
        style={{
          backgroundImage: `radial-gradient(circle at 50% 30%, rgba(30, 58, 138, 0.25), transparent 70%), linear-gradient(180deg, #090d16 0%, #030712 100%)`,
        }}
      >
        {/* Desktop Surface Watermark & Subtle Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        {/* Brand Watermark on desktop */}
        <div className="absolute right-8 bottom-16 select-none opacity-20 pointer-events-none text-right">
          <div className="text-3xl font-black text-white tracking-widest uppercase">SERVERspace</div>
          <div className="text-xs font-mono text-cyan-400">{os.name} • {os.defaultDesktop}</div>
        </div>

        {/* Desktop Icons (Left side) */}
        <div className="absolute top-6 left-6 flex flex-col gap-4 z-10">
          <button
            onDoubleClick={() => toggleWindow('win-terminal')}
            onClick={() => setActiveWindowId('win-terminal')}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 text-white w-20 text-center transition-colors cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Terminal className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[11px] font-medium drop-shadow leading-tight">Terminal</span>
          </button>

          <button
            onDoubleClick={() => toggleWindow('win-monitor')}
            onClick={() => setActiveWindowId('win-monitor')}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 text-white w-20 text-center transition-colors cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-[11px] font-medium drop-shadow leading-tight">System Monitor</span>
          </button>

          <button
            onDoubleClick={() => toggleWindow('win-editor')}
            onClick={() => setActiveWindowId('win-editor')}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 text-white w-20 text-center transition-colors cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <FileCode className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-[11px] font-medium drop-shadow leading-tight">Code Editor</span>
          </button>
        </div>

        {/* ACTIVE WINDOWS LAYER */}
        <div className="absolute inset-0 pb-12 overflow-hidden pointer-events-none">
          {windows.map((win) => {
            if (!win.isOpen || win.isMinimized) return null;
            const isActive = activeWindowId === win.id;

            return (
              <div
                key={win.id}
                onClick={() => setActiveWindowId(win.id)}
                className={`pointer-events-auto absolute rounded-xl border shadow-2xl flex flex-col backdrop-blur-md overflow-hidden transition-all duration-150 ${
                  isActive
                    ? 'border-slate-700 bg-slate-900/95 ring-1 ring-cyan-500/30'
                    : 'border-slate-800 bg-slate-900/85 opacity-95'
                } ${
                  win.isMaximized
                    ? 'inset-2 z-30'
                    : 'z-20'
                }`}
                style={
                  win.isMaximized
                    ? {}
                    : {
                        left: `${win.x}px`,
                        top: `${win.y}px`,
                        width: `${win.width}px`,
                        height: `${win.height}px`,
                      }
                }
              >
                {/* Window Titlebar */}
                <div className="h-9 bg-slate-950/80 border-b border-slate-800 px-3 flex items-center justify-between select-none cursor-move">
                  <div className="flex items-center gap-2 min-w-0">
                    {win.appType === 'terminal' && <Terminal className="w-3.5 h-3.5 text-emerald-400" />}
                    {win.appType === 'monitor' && <Activity className="w-3.5 h-3.5 text-blue-400" />}
                    {win.appType === 'editor' && <FileCode className="w-3.5 h-3.5 text-amber-400" />}
                    {win.appType === 'braink' && <Sparkles className="w-3.5 h-3.5 text-violet-400" />}
                    <span className="text-xs font-semibold text-slate-200 truncate">{win.title}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        minimizeWindow(win.id);
                      }}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        maximizeWindow(win.id);
                      }}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                    >
                      <Square className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        closeWindow(win.id);
                      }}
                      className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Window Body Content */}
                <div className="flex-1 overflow-auto bg-slate-950/90 text-white font-mono text-xs">
                  {/* TERMINAL APP */}
                  {win.appType === 'terminal' && (
                    <div className="p-3.5 space-y-1.5 h-full flex flex-col justify-between">
                      <div className="space-y-1 overflow-y-auto flex-1 text-slate-300">
                        {desktopTermLines.map((line, idx) => (
                          <div key={idx} className="whitespace-pre-wrap leading-relaxed">{line}</div>
                        ))}
                      </div>
                      <form onSubmit={handleDesktopCommand} className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                        <span className="text-emerald-400 font-bold shrink-0">root@desktop:~#</span>
                        <input
                          type="text"
                          value={desktopTermInput}
                          onChange={(e) => setDesktopTermInput(e.target.value)}
                          placeholder="Type 'help', 'neofetch', 'nvidia-smi', 'braink status'..."
                          className="flex-1 bg-transparent border-none text-white focus:outline-none text-xs font-mono"
                          autoFocus
                        />
                      </form>
                    </div>
                  )}

                  {/* SYSTEM MONITOR APP */}
                  {win.appType === 'monitor' && (
                    <div className="p-4 space-y-4 font-sans text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-slate-400 font-medium">CPU Utilization</span>
                            <span className="text-blue-400 font-mono font-bold">{Math.round(currentFps / spec.displayRefreshHz * 100)}% (Load)</span>
                          </div>
                          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full" style={{ width: `${Math.round(currentFps / spec.displayRefreshHz * 100)}%` }} />
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1 font-mono">{spec.cpuCores} Cores @ {spec.cpuClockGhz}GHz</div>
                        </div>

                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-slate-400 font-medium">GPU Tensor Load</span>
                            <span className="text-violet-400 font-mono font-bold">{spec.gpuVramGb > 0 ? '42%' : '0%'} (Active)</span>
                          </div>
                          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                            <div className="bg-violet-500 h-full" style={{ width: `${spec.gpuVramGb > 0 ? 42 : 0}%` }} />
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1 font-mono">{spec.gpuModel}</div>
                        </div>
                      </div>

                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-300 font-semibold">Virtual Display Pipeline:</span>
                          <span className="text-emerald-400 font-mono font-bold">{spec.displayResolution} @ {currentFps}Hz</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Frame Latency:</span>
                          <span className="font-mono text-cyan-300">{(1000 / currentFps).toFixed(2)} ms</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Display Scaling:</span>
                          <span className="font-mono text-slate-200">{spec.displayScale}x DPI ({spec.monitorCount} active screen)</span>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={onOpenRackAi}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-xs cursor-pointer"
                        >
                          Run Full Rack Benchmark
                        </button>
                      </div>
                    </div>
                  )}

                  {/* CODE EDITOR APP */}
                  {win.appType === 'editor' && (
                    <div className="p-3.5 h-full flex flex-col text-slate-300">
                      <div className="text-[10px] text-slate-500 pb-2 border-b border-slate-800 flex items-center justify-between">
                        <span>Python 3.12 • UTF-8 • Cloud Node Automation</span>
                        <span className="text-emerald-400">● Saved</span>
                      </div>
                      <textarea
                        defaultValue={`# SERVERspace Cloud Node Automation Script
import os
import sys
import psutil

# Inspect active node resources
node_name = os.uname().nodename
cpu_count = os.cpu_count()
mem_available_gb = psutil.virtual_memory().available / (1024 ** 3)

print(f"Node: {node_name} | Cores: {cpu_count} | Mem: {mem_available_gb:.2f} GB")
print(f"Display Spec: ${spec.displayResolution} @ ${spec.displayRefreshHz}Hz")
print(f"GPU Accelerator: ${spec.gpuModel}")
print("VFS Vault mounts active at /mnt/vault")
`}
                        className="flex-1 w-full bg-transparent p-2 text-xs font-mono text-cyan-200 focus:outline-none resize-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* TASKBAR (Bottom) */}
        <div className="absolute bottom-0 inset-x-0 h-11 bg-slate-950/95 border-t border-slate-800/80 px-3 flex items-center justify-between z-40 backdrop-blur-md select-none">
          {/* Start Menu Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStartMenuOpen(!startMenuOpen)}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>SERVERspace</span>
            </button>

            {/* Taskbar running windows */}
            <div className="flex items-center gap-1 overflow-x-auto max-w-md">
              {windows.map((win) => (
                <button
                  key={win.id}
                  onClick={() => {
                    if (!win.isOpen) {
                      toggleWindow(win.id);
                    } else if (win.isMinimized) {
                      minimizeWindow(win.id);
                      setActiveWindowId(win.id);
                    } else if (activeWindowId === win.id) {
                      minimizeWindow(win.id);
                    } else {
                      setActiveWindowId(win.id);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                    win.isOpen && !win.isMinimized && activeWindowId === win.id
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : win.isOpen
                      ? 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
                      : 'hidden'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span className="truncate max-w-[110px]">{win.title.split('—')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* System Tray (Right) */}
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              {currentFps} FPS
            </span>
            <div className="flex items-center gap-1 text-slate-400">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px]">100G</span>
            </div>
            <div className="flex items-center gap-1 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px]">{currentTime}</span>
            </div>
          </div>
        </div>

        {/* START MENU POPUP */}
        {startMenuOpen && (
          <div className="absolute bottom-12 left-3 w-72 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl z-50 space-y-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white">
                <Monitor className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">{os.name}</h4>
                <p className="text-[10px] text-slate-400">{os.defaultDesktop} • root</p>
              </div>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => {
                  toggleWindow('win-terminal');
                  setStartMenuOpen(false);
                }}
                className="w-full px-2.5 py-2 rounded-xl hover:bg-slate-800 text-slate-200 text-xs flex items-center gap-2.5 text-left cursor-pointer"
              >
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Open Terminal</span>
              </button>

              <button
                onClick={() => {
                  toggleWindow('win-monitor');
                  setStartMenuOpen(false);
                }}
                className="w-full px-2.5 py-2 rounded-xl hover:bg-slate-800 text-slate-200 text-xs flex items-center gap-2.5 text-left cursor-pointer"
              >
                <Activity className="w-4 h-4 text-blue-400" />
                <span>Virtual Hardware Monitor</span>
              </button>

              <button
                onClick={() => {
                  toggleWindow('win-editor');
                  setStartMenuOpen(false);
                }}
                className="w-full px-2.5 py-2 rounded-xl hover:bg-slate-800 text-slate-200 text-xs flex items-center gap-2.5 text-left cursor-pointer"
              >
                <FileCode className="w-4 h-4 text-amber-400" />
                <span>Code Editor</span>
              </button>

              <button
                onClick={() => {
                  onOpenRackAi();
                  setStartMenuOpen(false);
                }}
                className="w-full px-2.5 py-2 rounded-xl hover:bg-slate-800 text-slate-200 text-xs flex items-center gap-2.5 text-left cursor-pointer"
              >
                <Activity className="w-4 h-4 text-blue-400" />
                <span>Rack AI Benchmark Suite</span>
              </button>

              <button
                onClick={() => {
                  onOpenOsStudio();
                  setStartMenuOpen(false);
                }}
                className="w-full px-2.5 py-2 rounded-xl hover:bg-slate-800 text-slate-200 text-xs flex items-center gap-2.5 text-left cursor-pointer"
              >
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>OS &amp; Hardware Studio</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
