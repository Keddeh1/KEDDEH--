import React, { useState, useEffect } from 'react';
import { Globe, ShieldCheck, Database, RefreshCw, Activity, Cpu } from 'lucide-react';
import { KEDDEH_AUTHORITATIVE_DNS } from '../../data/dnsRecords';

export const NetworkRegistryPanel: React.FC = () => {
  const [meshStatus, setMeshStatus] = useState<any>(null);

  useEffect(() => {
    const fetchMesh = async () => {
      try {
        const res = await fetch('/api/mesh/telemetry');
        const data = await res.json();
        if (data.ok) setMeshStatus(data);
      } catch (e) {}
    };
    fetchMesh();
    const interval = setInterval(fetchMesh, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-8">
      {/* DNS Registry Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-widest">
            <Globe className="w-4 h-4 text-cyan-400" />
            DNS Registry
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[9px]">
            <thead>
              <tr className="text-slate-500 border-b border-slate-800 uppercase">
                <th className="px-2 py-1">Type</th>
                <th className="px-2 py-1">Host</th>
                <th className="px-2 py-1">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-300">
              {KEDDEH_AUTHORITATIVE_DNS.map((record, i) => {
                const isMailRecord = ['MX', 'TXT'].includes(record.type) && (record.host === '@' || record.type === 'TXT');
                return (
                  <tr key={i} className={`hover:bg-slate-800/30 ${isMailRecord ? 'opacity-60' : ''}`}>
                    <td className="px-2 py-2 text-cyan-400 font-bold">{record.type}</td>
                    <td className="px-2 py-2">{record.host}</td>
                    <td className="px-2 py-2 truncate max-w-[150px]" title={record.value}>
                        {isMailRecord ? <span className="text-amber-500 font-bold">[LOCKED]</span> : ''} {record.value}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mesh Execution Topology Section */}
      <div className="space-y-4 border-t border-slate-800 pt-6">
        <h2 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-widest">
          <Activity className="w-4 h-4 text-emerald-400" />
          Mesh Execution Topology
        </h2>
        
        {meshStatus ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 bg-emerald-950/20 p-2 rounded-lg border border-emerald-900/30">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
               STATUS: {meshStatus.supervisor_state}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <div className="text-[9px] font-bold text-slate-500 uppercase">Authority Mesh</div>
                 {meshStatus.authority_mesh.map((node: any) => (
                   <div key={node.id} className="flex items-center justify-between text-[10px] bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="font-mono text-white">{node.id}</span>
                      <span className="text-emerald-400">:{node.port}</span>
                   </div>
                 ))}
              </div>
              <div className="space-y-2">
                 <div className="text-[9px] font-bold text-slate-500 uppercase">Frontage Mesh</div>
                 {meshStatus.frontage_mesh.map((node: any) => (
                   <div key={node.id} className="flex items-center justify-between text-[10px] bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="font-mono text-white">{node.id}</span>
                      <span className="text-emerald-400">:{node.port}</span>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-[10px] text-slate-500 font-mono italic">Initializing Triad mesh registry...</div>
        )}
      </div>
    </div>
  );
};
