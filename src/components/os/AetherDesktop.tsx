import React, { useState, useEffect, useRef } from 'react';
import { AetherWindow } from './AetherWindow';
import { SystemTerminal } from './SystemTerminal';
import { BitcoinMiningLab } from '../substrate/BitcoinMiningLab';
import { OllamaChat } from './OllamaChat';
import { QualificationWorkbench } from './QualificationWorkbench';
import { UniversalAppRunner } from './UniversalAppRunner';
import { DesktopIcons } from './DesktopIcons';
import { NotificationSidebar } from './NotificationSidebar';
import { useVfs } from '../../context/VfsContext';
import { FileList } from '../FileList';
import { FileItem } from '../../types';
import { 
  Terminal, 
  Cpu, 
  Layout, 
  Settings, 
  Shield, 
  ShieldCheck, 
  Search, 
  Monitor,
  Menu,
  Activity,
  Zap,
  Sparkles,
  Folder,
  Globe,
  UploadCloud,
  Play,
  FileUp,
  FileCode,
  Bell,
  Wifi,
  Battery,
  HardDrive
} from 'lucide-react';

interface WindowState {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  icon: React.ReactNode;
  content: React.ReactNode;
  defaultSize?: { width: number | string; height: number | string };
  defaultPosition?: { x: number; y: number };
}

export const AetherDesktop: React.FC = () => {
  const {
    files, folders,
    toggleStarFile, toggleStarFolder,
    trashFile, trashFolder,
    createFolder, addFiles,
    getFolderStats
  } = useVfs();

  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [topZIndex, setTopZIndex] = useState(10);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [activeEnvironment, setActiveEnvironment] = useState<'keddeh' | 'aether' | 'kexlinux'>('keddeh');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [substrateTelemetry, setSubstrateTelemetry] = useState<{ cycles: string, state: string } | null>(null);
  const [isNotificationSidebarOpen, setIsNotificationSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchSubstrate = async () => {
      try {
        const res = await fetch('/api/system/status');
        const data = await res.json();
        if (data.ok) setSubstrateTelemetry({ cycles: data.cycles, state: data.state });
      } catch (e) {}
    };
    fetchSubstrate();
    const interval = setInterval(fetchSubstrate, 2000);
    return () => clearInterval(interval);
  }, []);

  const launchUniversalApp = (file: FileItem | { name: string; bytes?: Uint8Array; content?: string; directJmpTarget?: string; vfsSubstrates?: string[] }) => {
    const windowId = `run-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const isHtml = file.name.endsWith('.html') || file.name.endsWith('.htm');
    
    let iconColor = 'text-emerald-400';
    if (file.directJmpTarget) iconColor = 'text-indigo-400';

    const jmpExecution = file.directJmpTarget ? (
      <div className="flex flex-col items-center justify-center h-full space-y-4 bg-slate-950 font-mono">
        <div className="text-indigo-400 animate-pulse">{">>>"} EXECUTING DIRECT JMP TO {file.directJmpTarget}...</div>
        <div className="text-[10px] text-slate-500">Injective Substrate: {file.vfsSubstrates?.join(' + ')}</div>
        <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 animate-progress-fast" style={{ width: '100%' }} />
        </div>
        <div className="text-emerald-500 font-bold">JMP SUCCESS · ZERO INTERRUPT</div>
      </div>
    ) : null;

    let bytes: Uint8Array | undefined = (file as any).bytes;
    let contentText: string | undefined = file.content;

    // Decode base64 if it's a binary sample file
    if (!bytes && contentText && !isHtml && !contentText.startsWith('#!') && !contentText.startsWith('@echo') && !contentText.startsWith('<!DOCTYPE')) {
      try {
        const binaryString = atob(contentText);
        const len = binaryString.length;
        bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
      } catch {
        // fallback to text
      }
    }

    openWindow(
      windowId,
      file.name,
      <Play className={`w-4 h-4 ${iconColor}`} />,
      jmpExecution || (
        <UniversalAppRunner
          fileName={file.name}
          fileBytes={bytes}
          fileContentText={contentText}
          onClose={() => closeWindow(windowId)}
        />
      ),
      { width: 960, height: 640 }
    );
  };

  const handleIncomingFile = async (rawFile: File) => {
    const arrayBuffer = await rawFile.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let textContent = '';
    try {
      textContent = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    } catch {}

    const newFileItem: FileItem = {
      id: `file-dropped-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: rawFile.name,
      folderId: 'folder-home',
      parentId: 'folder-home',
      category: 'code',
      mimeType: rawFile.type || 'application/octet-stream',
      size: rawFile.size,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      content: textContent,
      rawContent: textContent,
      starred: true,
      inTrash: false,
      tags: ['Dropped Executable', 'Universal Runtime'],
      isSystem: false
    };

    addFiles([newFileItem]);
    launchUniversalApp({ name: rawFile.name, bytes, content: textContent });
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        await handleIncomingFile(e.dataTransfer.files[i]);
      }
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      for (let i = 0; i < e.target.files.length; i++) {
        await handleIncomingFile(e.target.files[i]);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    // Initial Access: Show authoritative Kernel Substrate immediately
    openWindow('kernel', 'Kernel Substrate', <Activity className="w-4 h-4 text-blue-400" />, <BitcoinMiningLab files={[]} onOpenFilePreview={() => {}} isSystemOnline={true} />, { width: 1000, height: 700 });
  }, []);

  const handleEnvironmentSwitch = (env: 'keddeh' | 'aether' | 'kexlinux') => {
    setWindows([]);
    setActiveEnvironment(env);
    setIsStartMenuOpen(false);
    // Instant switch for Always Online environments
    openWindow('terminal', `${env.toUpperCase()} Console`, <Terminal className="w-4 h-4 text-emerald-400" />, <SystemTerminal bootSequence={false} />, { width: 800, height: 500 });
  };

  const openWindow = (id: string, title: string, icon: React.ReactNode, content: React.ReactNode, size?: { width: number | string; height: number | string }) => {
    if (windows.find(w => w.id === id)) {
      focusWindow(id);
      return;
    }

    const nextZ = topZIndex + 1;
    const newWindow: WindowState = {
      id,
      title,
      icon,
      isOpen: true,
      isMinimized: false,
      zIndex: nextZ,
      content,
      defaultSize: size,
      defaultPosition: { x: 50 + (windows.length * 40), y: 50 + (windows.length * 40) }
    };

    setWindows([...windows, newWindow]);
    setTopZIndex(nextZ);
    setActiveWindowId(id);
    setIsStartMenuOpen(false);
  };

  const closeWindow = (id: string) => {
    setWindows(windows.filter(w => w.id !== id));
    if (activeWindowId === id) setActiveWindowId(null);
  };

  const minimizeWindow = (id: string) => {
    setWindows(windows.map(w => w.id === id ? { ...w, isMinimized: true } : w));
    if (activeWindowId === id) setActiveWindowId(null);
  };

  const focusWindow = (id: string) => {
    const nextZ = topZIndex + 1;
    setWindows(windows.map(w => w.id === id ? { ...w, zIndex: nextZ, isMinimized: false } : w));
    setTopZIndex(nextZ);
    setActiveWindowId(id);
  };


  return (
    <div
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingOver(true); }}
      onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingOver(true); }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget === e.target) setIsDraggingOver(false);
      }}
      onDrop={handleDrop}
      className="h-screen w-screen bg-[#07090E] overflow-hidden relative select-none"
    >
      <header className="absolute top-0 left-0 right-0 h-10 bg-slate-950/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 z-[10000]">
        <div className="flex items-center gap-3">
          <span className="text-sm font-black tracking-tighter text-white uppercase italic">KEDDEH GRID</span>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Master Substrate v2.4</span>
        </div>
        <nav className="hidden lg:flex items-center gap-8">
          {['Monitor', 'Registry', 'Lab', 'Terminal', 'VFS'].map(link => (
            <button key={link} className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors">
              {link}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[9px] font-mono text-emerald-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>AUTHORITATIVE</span>
          </div>
          <button className="text-slate-500 hover:text-white transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="absolute inset-0 pt-10">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        className="hidden"
        multiple
      />

      {/* Holographic Drag & Drop Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md border-4 border-dashed border-blue-500 flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-200">
          <div className="w-20 h-20 rounded-2xl bg-blue-600/20 border border-blue-500/50 flex items-center justify-center text-blue-400 mb-4 animate-bounce shadow-[0_0_40px_rgba(59,130,246,0.5)]">
            <UploadCloud className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold tracking-[0.2em] text-white uppercase mb-2">
            DROP TO RUN INSTANTLY
          </h2>
          <div className="flex items-center gap-3 mb-2 text-[10px] font-mono font-bold uppercase tracking-tighter">
            <span className="text-emerald-400">HTML5</span>
            <span aria-hidden="true" className="text-slate-700">/</span>
            <span className="text-purple-400">MACH-O</span>
            <span aria-hidden="true" className="text-slate-700">/</span>
            <span className="text-amber-400">ELF</span>
            <span aria-hidden="true" className="text-slate-700">/</span>
            <span className="text-blue-400">PE</span>
            <span aria-hidden="true" className="text-slate-700">/</span>
            <span className="text-cyan-400">WASM</span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono tracking-wider">
            Deterministic Binary Sniffer & Multi-Platform Runtime Container Substrate
          </p>
        </div>
      )}

      {/* Dynamic Background Manifold */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.1),transparent_70%)]" />
         <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Desktop Content Grid */}
      <div className="absolute inset-0 pb-12 overflow-y-auto pointer-events-none custom-scrollbar">
         <DesktopIcons onOpenApp={(id) => {
           if (id === 'kernel') openWindow('kernel', 'Kernel Substrate', <Activity className="w-4 h-4 text-blue-400" />, <BitcoinMiningLab files={[]} onOpenFilePreview={() => {}} isSystemOnline={true} />, { width: 1000, height: 700 });
           else if (id === 'terminal') openWindow('terminal', 'KEDDEH Console', <Terminal className="w-4 h-4 text-emerald-400" />, <SystemTerminal bootSequence={false} />, { width: 800, height: 500 });
           else if (id === 'ollama') openWindow('ollama', 'Ollama AI', <Sparkles className="w-4 h-4 text-purple-400" />, <OllamaChat />, { width: 600, height: 600 });
           else if (id === 'vfs') openWindow('vfs', 'VFS Explorer', <Folder className="w-4 h-4 text-amber-400" />, (
            <div className="w-full h-full overflow-y-auto bg-slate-950">
               <FileList 
                 files={files.filter(f => !f.inTrash && f.folderId === currentFolderId)}
                 folders={folders.filter(f => !f.inTrash && f.parentId === currentFolderId)}
                 selectedIds={[]}
                 activeFileId={null}
                 onSelectFolder={setCurrentFolderId}
                 onSelectFile={() => {}}
                 onToggleSelectId={() => {}}
                 onToggleStarFile={toggleStarFile}
                 onToggleStarFolder={toggleStarFolder}
                 onTrashFile={trashFile}
                 onTrashFolder={trashFolder}
                 onPreviewFile={launchUniversalApp}
                 onShareFile={() => {}}
                 getFolderStats={getFolderStats}
                 onLaunchApp={launchUniversalApp}
               />
            </div>
          ), { width: 900, height: 600 });
          else if (id === 'qualification') openWindow('qualification', 'Mastery Workbench', <ShieldCheck className="w-4 h-4 text-blue-400" />, <QualificationWorkbench />, { width: 850, height: 640 });
          else if (id === 'monitor') openWindow('monitor', 'Hardware Monitor', <Cpu className="w-4 h-4 text-cyan-400" />, (
            <div className="p-8 bg-slate-950 h-full overflow-y-auto space-y-8">
               <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-600 flex items-center justify-center">
                     <Cpu className="w-10 h-10 text-white" />
                  </div>
                  <div>
                     <h2 className="text-2xl font-bold text-white uppercase tracking-tight">System Infrastructure</h2>
                     <p className="text-cyan-400 font-mono text-xs">ASIC Core Grid // [STABLE]</p>
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { label: 'Voltage (VDD)', value: '0.842V', color: 'text-emerald-400' },
                    { label: 'Clock Freq', value: '850.0 MHz', color: 'text-blue-400' },
                    { label: 'Die Temp', value: '62.4 °C', color: 'text-amber-400' },
                    { label: 'SRAM Load', value: '18%', color: 'text-cyan-400' },
                    { label: 'Tau State', value: 'SYNC', color: 'text-emerald-400' },
                    { label: 'I/O Throttle', value: '0%', color: 'text-slate-400' }
                  ].map(stat => (
                    <div key={stat.label} className="p-5 bg-white/5 border border-white/5 rounded-2xl space-y-2">
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                       <p className={`text-xl font-mono font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
               </div>
            </div>
          ), { width: 800, height: 500 });
         }} />
      </div>

      {/* Windows Layer */}
      <div className="absolute inset-0 pb-12">
        {windows.map(w => (
          <AetherWindow
            key={w.id}
            id={w.id}
            title={w.title}
            icon={w.icon}
            onClose={closeWindow}
            onMinimize={minimizeWindow}
            isMinimized={w.isMinimized}
            zIndex={w.zIndex}
            onFocus={focusWindow}
            defaultSize={w.defaultSize}
            defaultPosition={w.defaultPosition}
          >
            {w.content}
          </AetherWindow>
        ))}
      </div>

      {/* Taskbar */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-slate-900/80 backdrop-blur-2xl border-t border-white/10 flex items-center justify-between px-2 z-[9999]">
        <div className="flex items-center gap-1 h-full">
          <button 
            onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${isStartMenuOpen ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'hover:bg-white/10 text-slate-400'}`}
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="h-6 w-px bg-white/10 mx-1" />

          {/* Running Apps */}
          <div className="flex items-center gap-1">
            {windows.map(w => (
              <button
                key={w.id}
                onClick={() => focusWindow(w.id)}
                className={`flex items-center gap-3 px-3 h-10 rounded-lg transition-all border ${
                  activeWindowId === w.id 
                  ? 'bg-white/10 border-white/10 shadow-lg text-white' 
                  : 'border-transparent text-slate-500 hover:bg-white/5'
                }`}
              >
                {w.icon}
                <span className="text-[10px] font-bold uppercase tracking-wider hidden lg:block">{w.title}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 h-8 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 text-[10px] font-bold uppercase tracking-wider transition-colors ml-1"
            title="Drop or select any HTML, Mac, Linux, or Windows program to execute instantly"
          >
            <FileUp className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Run / Drop Program</span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-2 h-full">
           {/* System Status Indicators */}
           <div className="hidden md:flex items-center gap-4 px-3 border-r border-white/5 h-6">
              <div className="flex items-center gap-1.5" title="Network Grid: STABLE">
                 <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                 <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Grid 1x</span>
              </div>
              <div className="flex items-center gap-1.5" title="Storage Interface: READY">
                 <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                 <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">VFS</span>
              </div>
              <div className="flex items-center gap-1.5" title="Power Substrate: EXTERNAL">
                 <Battery className="w-3.5 h-3.5 text-emerald-500" />
                 <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">PWR</span>
              </div>
           </div>

           <div className="flex items-center gap-3 ml-2">
              <div className="flex flex-col items-end">
                 <span className="text-[10px] font-bold text-slate-300 tabular-nums leading-none mb-0.5">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                 <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest leading-none">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase()}</span>
              </div>
              
              <button 
                onClick={() => setIsNotificationSidebarOpen(true)}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 transition-all relative group"
              >
                <Bell className="w-4.5 h-4.5 group-hover:text-white transition-colors" />
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-blue-500 rounded-full border border-slate-900 animate-pulse" />
              </button>
           </div>
        </div>
      </div>

      <NotificationSidebar 
        isOpen={isNotificationSidebarOpen} 
        onClose={() => setIsNotificationSidebarOpen(false)} 
      />

      {/* Start Menu */}
      {isStartMenuOpen && (
        <div className="absolute bottom-14 left-2 w-80 bg-slate-900/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[9999] animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-4 bg-blue-600 flex items-center gap-4 border-b border-white/10">
             <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shadow-inner">
                <Cpu className="w-6 h-6 text-white" />
             </div>
             <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Administrator</h3>
                <p className="text-[9px] text-blue-200 font-mono">RING_0 // AUTHORITY: MAX</p>
             </div>
          </div>
          
          <div className="p-4 grid grid-cols-1 gap-2">
             <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 px-3">Applications</div>
             <button 
               onClick={() => openWindow('terminal', 'KEDDEH Console', <Terminal className="w-4 h-4 text-emerald-400" />, <SystemTerminal bootSequence={false} />, { width: 800, height: 500 })}
               className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors group"
             >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <Terminal className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="text-left">
                   <div className="text-[11px] font-bold text-slate-200 uppercase tracking-widest">System Terminal</div>
                   <div className="text-[9px] text-slate-500 font-mono">/bin/bash --ollama</div>
                </div>
             </button>

             <button 
               onClick={() => openWindow('kernel', 'Kernel Substrate', <Activity className="w-4 h-4 text-blue-400" />, <BitcoinMiningLab files={[]} onOpenFilePreview={() => {}} />, { width: 1000, height: 700 })}
               className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors group"
             >
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <Activity className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-left">
                   <div className="text-[11px] font-bold text-slate-200 uppercase tracking-widest">Mining Lab</div>
                   <div className="text-[9px] text-slate-500 font-mono">KEDDEH_SPATIAL_V2</div>
                </div>
             </button>

             <button 
               onClick={() => openWindow('ollama', 'Ollama AI', <Sparkles className="w-4 h-4 text-purple-400" />, <OllamaChat />, { width: 600, height: 600 })}
               className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors group"
             >
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <Sparkles className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-left">
                   <div className="text-[11px] font-bold text-slate-200 uppercase tracking-widest">Ollama AI</div>
                   <div className="text-[9px] text-slate-500 font-mono">llama3-8b // INF_DMA</div>
                </div>
             </button>

             <button 
               onClick={() => openWindow('qualification', 'Qualification Workbench', <ShieldCheck className="w-4 h-4 text-blue-400" />, <QualificationWorkbench />, { width: 850, height: 640 })}
               className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors group"
             >
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-left">
                   <div className="text-[11px] font-bold text-slate-200 uppercase tracking-widest">Qualification Workbench</div>
                   <div className="text-[9px] text-slate-500 font-mono">KEX/BRAINK // TRUTH_GATES</div>
                </div>
             </button>

             <button 
               onClick={() => {
                 setIsStartMenuOpen(false);
                 fileInputRef.current?.click();
               }}
               className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors group"
             >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <FileUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-left">
                   <div className="text-[11px] font-bold text-slate-200 uppercase tracking-widest">Run / Drop Program...</div>
                   <div className="text-[9px] text-slate-500 font-mono">HTML · ELF · EXE · MACH-O · WASM</div>
                </div>
             </button>

             <button 
               onClick={() => openWindow('vfs', 'VFS Explorer', <Folder className="w-4 h-4 text-amber-400" />, (
                 <div className="w-full h-full overflow-y-auto">
                    <FileList 
                      files={files.filter(f => !f.inTrash && f.folderId === currentFolderId)}
                      folders={folders.filter(f => !f.inTrash && f.parentId === currentFolderId)}
                      selectedIds={[]}
                      activeFileId={null}
                      onSelectFolder={setCurrentFolderId}
                      onSelectFile={() => {}}
                      onToggleSelectId={() => {}}
                      onToggleStarFile={toggleStarFile}
                      onToggleStarFolder={toggleStarFolder}
                      onTrashFile={trashFile}
                      onTrashFolder={trashFolder}
                      onPreviewFile={launchUniversalApp}
                      onShareFile={() => {}}
                      getFolderStats={getFolderStats}
                      onLaunchApp={launchUniversalApp}
                    />
                 </div>
               ), { width: 900, height: 600 })}
               className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors group"
             >
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                   <Folder className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-left">
                   <div className="text-[11px] font-bold text-slate-200 uppercase tracking-widest">VFS Explorer</div>
                   <div className="text-[9px] text-slate-500 font-mono">KEX_VFS_SUBSTRATE</div>
                </div>
             </button>

             <div className="h-px bg-white/5 my-2" />
             <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 px-3">Hypervisor Control</div>
             
             <div className="grid grid-cols-3 gap-2 px-3">
                <button onClick={() => handleEnvironmentSwitch('keddeh')} className={`flex flex-col items-center gap-2 p-2 rounded-lg border ${activeEnvironment === 'keddeh' ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}>
                   <Monitor className="w-4 h-4" />
                   <span className="text-[7px] font-bold uppercase">KEDDEH</span>
                </button>
                <button onClick={() => handleEnvironmentSwitch('aether')} className={`flex flex-col items-center gap-2 p-2 rounded-lg border ${activeEnvironment === 'aether' ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}>
                   <Layout className="w-4 h-4" />
                   <span className="text-[7px] font-bold uppercase">AETHER</span>
                </button>
                <button onClick={() => handleEnvironmentSwitch('kexlinux')} className={`flex flex-col items-center gap-2 p-2 rounded-lg border ${activeEnvironment === 'kexlinux' ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}>
                   <Settings className="w-4 h-4" />
                   <span className="text-[7px] font-bold uppercase">KEXLINUX</span>
                </button>
             </div>
          </div>

          <div className="p-4 bg-slate-950/50 border-t border-white/5 flex items-center justify-between">
             <button className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-amber-500/20 text-[9px] font-bold text-slate-400 hover:text-amber-400 transition-colors uppercase">Suspend</button>
             <span className="text-[8px] font-mono text-slate-600">UPTIME: 0D 00H 12M 42S</span>
          </div>
        </div>
      )}
      {/* Substrate HUD Overlay */}
      <div className="absolute top-4 right-4 z-[9999] pointer-events-none">
        <div className="bg-slate-900/40 backdrop-blur-md border border-blue-500/20 rounded-xl p-3 space-y-1.5 shadow-2xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span className="text-[10px] font-bold text-white tracking-widest uppercase">1x Substrate</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-emerald-400 tracking-tighter">
              <span>SUBSTRATE ACTIVE</span>
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">ASIC Cycle Pulse</p>
            <p className="text-xs font-mono text-cyan-400 font-bold tracking-tighter">
              {substrateTelemetry?.cycles || '0'}
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
