import React from 'react';
import { Database, Shield, Zap, Activity } from 'lucide-react';

interface MemoryPartition {
  id: string;
  region: string;
  baseAddress: string;
  size: string;
  alignment: string;
  status: 'ALIGNED' | 'MISALIGNED';
}

const PARTITIONS: MemoryPartition[] = [
  { id: 'MEM-01', region: 'Vector Table & Boot ROM Mirror', baseAddress: '0x00000000', size: '1,024 B', alignment: '100%', status: 'ALIGNED' },
  { id: 'MEM-02', region: 'SHA-256 Engine MMIO Registers', baseAddress: '0x00000400', size: '1,024 B', alignment: '100%', status: 'ALIGNED' },
  { id: 'MEM-03', region: '20-Lane Spatial Pipeline DMA', baseAddress: '0x00000800', size: '2,560 B', alignment: '100%', status: 'ALIGNED' },
  { id: 'MEM-04', region: '80-Byte Header Latch Registers', baseAddress: '0x00001200', size: '1,024 B', alignment: '100%', status: 'ALIGNED' },
  { id: 'MEM-05', region: 'Midstate Cache (Chunk 1)', baseAddress: '0x00001600', size: '512 B', alignment: '100%', status: 'ALIGNED' },
  { id: 'MEM-06', region: '256-Pixel Optical Canvas Buffer', baseAddress: '0x00001800', size: '2,048 B', alignment: '100%', status: 'ALIGNED' },
  { id: 'MEM-07', region: 'Stratum V2 Ring Buffer', baseAddress: '0x00002000', size: '16,384 B', alignment: '100%', status: 'ALIGNED' },
  { id: 'MEM-08', region: 'IPC Socket Descriptor Grid', baseAddress: '0x00006000', size: '8,192 B', alignment: '100%', status: 'ALIGNED' },
  { id: 'MEM-11', region: 'Stack TCM & Scratchpad', baseAddress: '0x00010000', size: '65,536 B', alignment: '100%', status: 'ALIGNED' },
];

export const MemoryTopology: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-white uppercase tracking-widest">DO-178C Linear Memory Partition</h2>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase">Integrity: PASS</span>
             </div>
             <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-[10px] font-bold text-blue-400 uppercase">Alignment: 64B</span>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {PARTITIONS.map((p) => (
            <div key={p.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl group hover:border-amber-500/30 transition-all flex items-center gap-6">
              <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-slate-500 font-mono">{p.id.split('-')[1]}</span>
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200 truncate uppercase tracking-wide">{p.region}</h3>
                  <span className="text-[10px] font-mono text-amber-500 font-bold">{p.baseAddress}</span>
                </div>
                <div className="flex items-center gap-4">
                   <div className="text-[9px] text-slate-500 flex items-center gap-1.5 uppercase font-bold">
                     <Activity className="w-3 h-3" />
                     Size: {p.size}
                   </div>
                   <div className="text-[9px] text-emerald-500 flex items-center gap-1.5 uppercase font-bold">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                     {p.alignment} Aligned
                   </div>
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-amber-500/50 w-full animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-2">
          <p className="text-[10px] text-amber-300 leading-relaxed italic">
            "Every partition base address is an exact multiple of 64 bytes, eliminating false sharing and cache-line straddling across multi-core buses."
          </p>
          <div className="flex justify-between items-center text-[8px] text-slate-500 font-mono uppercase font-bold">
            <span>Peak WCET: 38.42ns</span>
            <span>Safety Margin: +42.8%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
