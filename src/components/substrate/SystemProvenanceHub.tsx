import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Zap, 
  HardDrive, 
  Activity, 
  Fingerprint,
  Box,
  FileCode,
  Globe
} from 'lucide-react';
import { PROVENANCE_SERVICE, SystemEvent } from '../../services/ProvenanceService';
import { GLOBAL_KERNEL_SERVICE, KernelTelemetry } from '../../services/KernelService';

export const SystemProvenanceHub: React.FC = () => {
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [telemetry, setTelemetry] = useState<KernelTelemetry>(GLOBAL_KERNEL_SERVICE.getTelemetry());

  useEffect(() => {
    const updateState = () => {
      setEvents([...PROVENANCE_SERVICE.getEvents()]);
      setTelemetry(GLOBAL_KERNEL_SERVICE.getTelemetry());
    };
    
    updateState();
    const interval = setInterval(updateState, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3 text-xs text-blue-400 font-medium">
            <span>ISO/IEC 29119-3 Compliance</span>
            <span aria-hidden="true">·</span>
            <span>Formal Verification Level 4</span>
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            System Provenance Ledger
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
            Direct execution evidence stream. Every entry is cryptographically anchored in the KEX Microkernel substrate 
            using the Moebius Wire Protocol. No narrative claims; only verifiable state transitions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Substrate Inodes</div>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-white">{telemetry.activeNodes} Active</span>
            <span className="text-emerald-500 text-xs font-bold">Ring-0</span>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Semantic Edges</div>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-white">{telemetry.activeEdges} Linked</span>
            <span className="text-blue-400 text-xs font-bold">Substrate</span>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Kernel Epoch</div>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-white">{telemetry.epochHz} Hz</span>
            <span className="text-violet-400 text-xs font-bold">Gamma</span>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Signed Packets</div>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-white">{events.length}</span>
            <span className="text-cyan-400 text-xs font-bold">Moebius</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            Live Provenance Stream
          </h3>
          <div className="text-[10px] font-mono text-slate-500">
            STRAT_IDENT: KEX-SOVEREIGN-AUDIT
          </div>
        </div>

        <div className="divide-y divide-slate-800">
          {events.map((ev) => (
            <div key={ev.id} className="p-4 hover:bg-slate-800/50 transition-colors group">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`mt-1 p-2 rounded-lg ${
                    ev.verified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {ev.type === 'VFS_WRITE' && <HardDrive className="w-4 h-4" />}
                    {ev.type === 'OS_INSTALL' && <Box className="w-4 h-4" />}
                    {ev.type === 'LICENSE_ACTIVATE' && <Fingerprint className="w-4 h-4" />}
                    {ev.type === 'MINING_START' && <Zap className="w-4 h-4" />}
                    {ev.type === 'COMPLIANCE_CHECK' && <ShieldCheck className="w-4 h-4" />}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-white">{ev.description}</span>
                      {ev.verified && (
                        <span className="text-[9px] font-bold text-emerald-400 tracking-tighter">VERIFIED PROOF</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-500">
                      <span>{ev.timestamp}</span>
                      <span>ID: {ev.id}</span>
                      <span className="font-mono text-blue-400">S_K({ev.skCoordinate.join(',')})</span>
                    </div>
                    <div className="mt-3 p-3 bg-black/40 rounded-lg border border-slate-800/50">
                      <div className="text-[9px] font-bold text-slate-600 mb-1 uppercase tracking-widest">Moebius Wire Proof (Hex)</div>
                      <div className="text-[10px] font-mono text-slate-400 break-all leading-relaxed bg-slate-900/50 p-2 rounded border border-slate-800 select-all">
                        {ev.proof}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold transition-all border border-slate-700 whitespace-nowrap">
                    Trace Parent Root
                  </button>
                  <button className="px-3 py-1.5 rounded border border-slate-800 hover:bg-slate-800 text-slate-400 text-[10px] font-bold transition-all whitespace-nowrap">
                    Download Affidavit
                  </button>
                </div>
              </div>
            </div>
          ))}

          {events.length === 0 && (
            <div className="p-16 text-center">
              <Activity className="w-8 h-8 text-slate-800 mx-auto mb-4 animate-pulse" />
              <p className="text-sm text-slate-500 font-medium">Awaiting first verifiable system event...</p>
              <p className="text-xs text-slate-600 mt-1">Booting microkernel and binding substrate.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
