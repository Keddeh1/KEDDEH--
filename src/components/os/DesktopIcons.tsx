import React from 'react';
import { 
  Terminal, 
  Activity, 
  ShieldCheck, 
  Folder, 
  Sparkles, 
  Cpu, 
  Globe,
  Database,
  Layers
} from 'lucide-react';

interface DesktopIconProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

const DesktopIcon: React.FC<DesktopIconProps> = ({ label, icon, color, onClick }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/10 transition-all group w-24"
  >
    <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
      {React.cloneElement(icon as React.ReactElement, { className: 'w-7 h-7 text-white' })}
    </div>
    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center leading-tight drop-shadow-md">
      {label}
    </span>
  </button>
);

interface DesktopIconsProps {
  onOpenApp: (appId: string) => void;
}

export const DesktopIcons: React.FC<DesktopIconsProps> = ({ onOpenApp }) => {
  return (
    <div className="p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 pointer-events-auto">
      <DesktopIcon 
        id="kernel"
        label="Kernel Substrate"
        icon={<Activity />}
        color="bg-blue-600 shadow-blue-600/30"
        onClick={() => onOpenApp('kernel')}
      />
      <DesktopIcon 
        id="terminal"
        label="System Console"
        icon={<Terminal />}
        color="bg-emerald-600 shadow-emerald-600/30"
        onClick={() => onOpenApp('terminal')}
      />
      <DesktopIcon 
        id="ollama"
        label="Ollama AI"
        icon={<Sparkles />}
        color="bg-purple-600 shadow-purple-600/30"
        onClick={() => onOpenApp('ollama')}
      />
      <DesktopIcon 
        id="vfs"
        label="VFS Explorer"
        icon={<Folder />}
        color="bg-amber-600 shadow-amber-600/30"
        onClick={() => onOpenApp('vfs')}
      />
      <DesktopIcon 
        id="qualification"
        label="Mastery Workbench"
        icon={<ShieldCheck />}
        color="bg-indigo-600 shadow-indigo-600/30"
        onClick={() => onOpenApp('qualification')}
      />
      <DesktopIcon 
        id="server"
        label="Mesh Node Grid"
        icon={<Database />}
        color="bg-rose-600 shadow-rose-600/30"
        onClick={() => onOpenApp('server')}
      />
      <DesktopIcon 
        id="monitor"
        label="Hardware Status"
        icon={<Cpu />}
        color="bg-cyan-600 shadow-cyan-600/30"
        onClick={() => onOpenApp('monitor')}
      />
      <DesktopIcon 
        id="apps"
        label="App Ingestion"
        icon={<Layers />}
        color="bg-slate-600 shadow-slate-600/30"
        onClick={() => onOpenApp('apps')}
      />
    </div>
  );
};
