import React, { useMemo } from 'react';
import { Cpu, Activity, Database, Shield } from 'lucide-react';

interface MeshFabricVisualizerProps {
  activeLanes: number;
  sramSnapshot: string; // Hex string of the first 1024 bytes
}

interface MemoryPartition {
  id: string;
  name: string;
  offset: string;
  size: string;
  desc: string;
}

const PARTITIONS: MemoryPartition[] = [
  { id: 'MEM-01', name: 'Vector Table & Boot ROM', offset: '0x00000', size: '1KB', desc: 'Hardware boot vector & entry points' },
  { id: 'MEM-02', name: 'SHA MMIO Registers', offset: '0x00400', size: '1KB', desc: 'Clock, WCET, VDD Droop control' },
  { id: 'MEM-03', name: 'Midstate Cache', offset: '0x00800', size: '2KB', desc: 'Precomputed Chunk 1 (608-bit) latches' },
  { id: 'MEM-04', name: 'Target Threshold Mask', offset: '0x01000', size: '1KB', desc: 'nBits Comparator Hardwired Mask' },
  { id: 'MEM-05', name: 'Lane Execution Matrix', offset: '0x01400', size: '16KB', desc: '20-lane nonce pocket isolation' },
  { id: 'MEM-06', name: 'Scratchpad Compression TCM', offset: '0x05400', size: '8KB', desc: 'Tightly Coupled RAM (Instruction)' },
  { id: 'MEM-07', name: 'Dual Port SRAM (IPC)', offset: '0x07400', size: '16KB', desc: 'Cross-lane IPC and Signal Matrix' },
  { id: 'MEM-08', name: 'Execution Receipt Log', offset: '0x0B400', size: '8KB', desc: 'Chained cryptographic audit trail' },
  { id: 'MEM-09', name: 'Moebius Ring Buffer', offset: '0x0D400', size: '64KB', desc: 'Lock-free wire packets (Atomic)' },
  { id: 'MEM-10', name: 'Deterministic Call Stack', offset: '0x1D400', size: '8KB', desc: 'WCET boundary stack mirrors' },
  { id: 'MEM-11', name: 'Safe State Trap Vector', offset: '0x1F400', size: '3KB', desc: 'DO-254 Safe Trap Core' },
];

export const MeshFabricVisualizer: React.FC<MeshFabricVisualizerProps> = ({ activeLanes, sramSnapshot }) => {
  const bytes = useMemo(() => {
    const arr = [];
    for (let i = 0; i < sramSnapshot.length; i += 2) {
      arr.push(sramSnapshot.substring(i, i + 2).toUpperCase());
    }
    return arr;
  }, [sramSnapshot]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-bold text-white uppercase tracking-widest font-heading">SRAM Holding Fabric Substrate</h2>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
             <Shield className="w-3.5 h-3.5 text-emerald-500" />
             <span className="text-[10px] font-bold text-emerald-400 uppercase">DO-178C DAL-A</span>
           </div>
           <div className="flex items-center gap-2">
             <Activity className="w-3.5 h-3.5 text-blue-500" />
             <span className="text-[10px] font-bold text-blue-400 uppercase">{activeLanes} ACTIVE LANES</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Memory Map Column */}
        <div className="lg:col-span-1 space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 mb-2">Memory Partitions (128 KB)</h3>
          {PARTITIONS.map(p => (
            <div key={p.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl group hover:border-amber-500/30 transition-all">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-bold text-amber-500 font-mono">{p.id}</span>
                <span className="text-[9px] font-bold text-slate-600 font-mono">{p.offset}</span>
              </div>
              <div className="text-[10px] font-bold text-slate-200 uppercase">{p.name}</div>
              <div className="text-[9px] text-slate-500 mt-1 leading-tight">{p.desc}</div>
              <div className="w-full h-1 bg-slate-900 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-amber-500/20 w-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Raw Byte Stream Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[9px]">
            <div className="flex items-center justify-between mb-3">
               <span className="text-slate-500 font-bold uppercase tracking-wider">Holding Canvas Snapshot (0x000..0x3FF)</span>
               <span className="text-emerald-500 font-bold">ALIGNED: 64B</span>
            </div>
            <div className="grid grid-cols-16 gap-x-1 gap-y-1">
              {bytes.slice(0, 256).map((b, i) => (
                <div 
                  key={i} 
                  className={`text-center py-0.5 rounded ${b !== '00' ? 'bg-blue-500/20 text-blue-400 font-bold' : 'text-slate-700'}`}
                  title={`Offset: 0x${i.toString(16).padStart(3, '0')}`}
                >
                  {b}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
             <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Hardware Dispatch Invariant</span>
             </div>
             <p className="text-[10px] text-slate-400 leading-relaxed italic">
                "Workers do not run as decoupled processes; they are coordinate actors pinned to specific SRAM holding slots. The mesh supervisor executes hashing state transitions directly over the linear memory fabric, eliminating context switches and heap decay."
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
