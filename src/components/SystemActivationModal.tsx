import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Cpu, 
  Terminal, 
  ShieldCheck, 
  Layers, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  Play,
  Loader2,
  RefreshCw,
  Server,
  Network
} from 'lucide-react';

interface ActivationStep {
  id: string;
  label: string;
  status: 'idle' | 'running' | 'success' | 'error';
  progress: number;
  logs: string[];
}

interface SystemActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const SystemActivationModal: React.FC<SystemActivationModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [steps, setSteps] = useState<ActivationStep[]>([
    {
      id: 'kex',
      label: 'KEX Microkernel & VFS Substrate',
      status: 'idle',
      progress: 0,
      logs: []
    },
    {
      id: 'aether',
      label: 'AetherOS Kernel & Dom Rigour',
      status: 'idle',
      progress: 0,
      logs: []
    },
    {
      id: 'stratum',
      label: 'Stratum Mining Core & Telemetry',
      status: 'idle',
      progress: 0,
      logs: []
    }
  ]);

  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (isOpen && activeStepIdx < steps.length && !isFinished) {
      runStep(activeStepIdx);
    }
  }, [isOpen, activeStepIdx, isFinished]);

  const addLog = (stepIdx: number, log: string) => {
    setSteps(prev => prev.map((s, i) => i === stepIdx ? { ...s, logs: [...s.logs, log] } : s));
  };

  const updateProgress = (stepIdx: number, progress: number) => {
    setSteps(prev => prev.map((s, i) => i === stepIdx ? { ...s, progress } : s));
  };

  const updateStatus = (stepIdx: number, status: ActivationStep['status']) => {
    setSteps(prev => prev.map((s, i) => i === stepIdx ? { ...s, status } : s));
  };

  const runStep = async (idx: number) => {
    const step = steps[idx];
    updateStatus(idx, 'running');
    
    if (step.id === 'kex') {
      addLog(idx, 'Initializing Ring-0 Carrier...');
      updateProgress(idx, 100);
      addLog(idx, 'KEX Microkernel v6.8.4-vfs: [ONLINE]');
      updateStatus(idx, 'success');
      setActiveStepIdx(idx + 1);
    } 
    else if (step.id === 'aether') {
      addLog(idx, 'Loading Operating System Template...');
      updateProgress(idx, 100);
      addLog(idx, 'AetherOS Bootchain: [READY]');
      updateStatus(idx, 'success');
      setActiveStepIdx(idx + 1);
    }
    else if (step.id === 'stratum') {
      addLog(idx, 'Connecting to Mining Core...');
      updateProgress(idx, 100);
      addLog(idx, 'Double-SHA256 Scan Loop: [ACTIVE]');
      updateStatus(idx, 'success');
      setIsFinished(true);
      onComplete();
    }
  };

  const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Zap className={`w-5 h-5 ${!isFinished ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">System Activation Sequence</h2>
              <p className="text-xs text-slate-400">Bringing KEX, AetherOS, and Stratum online as a cohesive unit.</p>
            </div>
          </div>
          {isFinished && (
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center gap-1.5 animate-bounce">
              <CheckCircle2 className="w-3 h-3" />
              <span>ACTIVATION COMPLETE</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[60vh] no-scrollbar">
          {steps.map((step, idx) => (
            <div key={step.id} className={`space-y-3 transition-opacity duration-500 ${idx > activeStepIdx ? 'opacity-30' : 'opacity-100'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                    step.status === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                    step.status === 'running' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                    'bg-slate-800 border-slate-700 text-slate-500'
                  }`}>
                    {step.id === 'kex' && <Cpu className="w-4 h-4" />}
                    {step.id === 'aether' && <Terminal className="w-4 h-4" />}
                    {step.id === 'stratum' && <Zap className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">{step.label}</h3>
                    {step.status === 'running' && (
                      <p className="text-[10px] text-blue-400 font-mono animate-pulse">Processing Syscalls...</p>
                    )}
                  </div>
                </div>
                {step.status === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : step.status === 'running' ? (
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                ) : null}
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 rounded-full ${
                    step.status === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${step.progress}%` }}
                />
              </div>

              {/* Step Logs */}
              {step.logs.length > 0 && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[10px] space-y-1 overflow-hidden">
                  {step.logs.map((log, lIdx) => (
                    <div key={lIdx} className="flex gap-2">
                      <span className="text-slate-600">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                      <span className={log.includes('[ONLINE]') || log.includes('[ACTIVE]') || log.includes('[READY]') ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                        {log}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-400" />
              <div className="text-[10px] space-y-0.5">
                <p className="text-slate-500 font-bold uppercase tracking-widest">Cluster Health</p>
                <p className="text-slate-200 font-mono">Elastic</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-cyan-400" />
              <div className="text-[10px] space-y-0.5">
                <p className="text-slate-500 font-bold uppercase tracking-widest">Subnet Mask</p>
                <p className="text-slate-200 font-mono">10.240.0.0/24</p>
              </div>
            </div>
          </div>
          
          {isFinished ? (
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/20"
            >
              Enter Workspace
            </button>
          ) : (
            <div className="text-[10px] text-slate-500 font-mono animate-pulse">
              Executing Protocol Sequence...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
