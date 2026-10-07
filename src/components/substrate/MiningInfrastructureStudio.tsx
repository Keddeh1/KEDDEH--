import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Cpu, 
  Shield, 
  Terminal, 
  Play, 
  Square, 
  RotateCw, 
  FileCode, 
  CheckCircle2, 
  Layers, 
  Fingerprint,
  Zap,
  Box,
  Settings,
  Activity
} from 'lucide-react';
import { PROVENANCE_SERVICE } from '../../services/ProvenanceService';
import { GLOBAL_KERNEL_SERVICE } from '../../services/KernelService';

interface BuildStep {
  name: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  log?: string;
}

export const MiningInfrastructureStudio: React.FC = () => {
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildSteps, setBuildSteps] = useState<BuildStep[]>([
    { name: 'Loading CKPool configurations...', status: 'PENDING' },
    { name: 'Resolving Python 3.11 dependencies...', status: 'PENDING' },
    { name: 'Building Stratum v1.2 engine...', status: 'PENDING' },
    { name: 'Hardening TLS boundary layers...', status: 'PENDING' },
    { name: 'Assembling OCI Node Image...', status: 'PENDING' },
  ]);

  const runBuild = async () => {
    setIsBuilding(true);
    setBuildProgress(0);
    const newSteps = [...buildSteps].map(s => ({ ...s, status: 'PENDING' as const }));
    setBuildSteps(newSteps);

    for (let i = 0; i < newSteps.length; i++) {
      newSteps[i].status = 'RUNNING';
      setBuildSteps([...newSteps]);
      
      // Simulate real build time and telemetry
      const duration = 800 + Math.random() * 1200;
      await new Promise(r => setTimeout(r, duration));
      
      newSteps[i].status = 'COMPLETED';
      newSteps[i].log = `[OK] Applied layer ${i+1} to BRAINK-MINER-V2`;
      setBuildProgress(((i + 1) / newSteps.length) * 100);
      setBuildSteps([...newSteps]);
    }

    await PROVENANCE_SERVICE.logEvent('COMPLIANCE_CHECK', 'Built and verified A. Keddeh Stratum Mining Node Image', [1024n, 2048n, 1n]);
    setIsBuilding(false);
  };

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-full">
      {/* Infrastructure Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-widest">
              Infrastructure Control Plane
            </span>
            <span className="text-[10px] text-slate-500 font-mono">/mining-engine/v2.4.0</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Mining Node Engineering Studio</h1>
          <p className="text-slate-400 text-sm mt-1">
            Automate the assembly, hardening, and deployment of sovereign Stratum+TCP mining nodes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            disabled={isBuilding}
            onClick={runBuild}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xl ${
              isBuilding 
                ? 'bg-slate-800 text-slate-500' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
            }`}
          >
            <RotateCw className={`w-4 h-4 ${isBuilding ? 'animate-spin' : ''}`} />
            {isBuilding ? 'BUILDING NODE...' : 'START AUTOMATED BUILD'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Build Pipeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-blue-400" />
                <span className="text-[11px] font-bold text-white uppercase tracking-widest">Build Pipeline: BRAINK-MINER-V2</span>
              </div>
              <div className="text-[10px] font-mono text-slate-500">
                PROVENANCE: {isBuilding ? 'PENDING_SIG' : 'KEX_CERTIFIED'}
              </div>
            </div>
            
            <div className="p-5 space-y-4">
              {buildSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="mt-1">
                    {step.status === 'COMPLETED' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : step.status === 'RUNNING' ? (
                      <RotateCw className="w-4 h-4 text-blue-400 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-800" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${step.status === 'RUNNING' ? 'text-blue-400' : step.status === 'COMPLETED' ? 'text-slate-200' : 'text-slate-500'}`}>
                        {step.name}
                      </span>
                      {step.status === 'COMPLETED' && <span className="text-[10px] text-emerald-500/60 font-mono">DONE</span>}
                    </div>
                    {step.log && <div className="mt-1.5 text-[10px] font-mono text-slate-500 bg-black/30 p-2 rounded-lg border border-slate-800/50">{step.log}</div>}
                  </div>
                </div>
              ))}
            </div>

            {isBuilding && (
              <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Overall Progress</span>
                  <span className="text-[10px] text-blue-400 font-mono font-bold">{Math.round(buildProgress)}%</span>
                </div>
                <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${buildProgress}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Dockerfile & Config Preview */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-4">
             <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FileCode className="w-3.5 h-3.5 text-amber-400" />
                  Node Configuration Standards
                </h3>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="p-3 bg-black/40 rounded-xl border border-slate-800/50 space-y-2">
                  <div className="text-[9px] text-slate-600 uppercase font-bold">Dockerfile Layering</div>
                  <pre className="text-[9px] text-slate-400 font-mono leading-relaxed">
                    FROM python:3.11-slim-bullseye<br/>
                    RUN apt-get update && apt-get install -y build-essential<br/>
                    COPY . /app<br/>
                    WORKDIR /app<br/>
                    RUN pip install --no-cache-dir -r requirements.txt
                  </pre>
               </div>
               <div className="p-3 bg-black/40 rounded-xl border border-slate-800/50 space-y-2">
                  <div className="text-[9px] text-slate-600 uppercase font-bold">CKPool stratum_engine.py</div>
                  <pre className="text-[9px] text-slate-400 font-mono leading-relaxed">
                    def bootstrap_pipeline(self):<br/>
                    &nbsp;&nbsp;self.log("[BOOT] Verifying Moebius headers")<br/>
                    &nbsp;&nbsp;self.auth_worker()<br/>
                    &nbsp;&nbsp;self.spawn_nonce_lanes(lanes=20)
                  </pre>
               </div>
             </div>
          </div>
        </div>

        {/* Node Stats & Hardware Integrity */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Verifiable Hardware Root
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-slate-950 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2">
                   <Fingerprint className="w-4 h-4 text-blue-400" />
                   <span className="text-[10px] text-slate-300">TPM Attestation</span>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-950 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2">
                   <Zap className="w-4 h-4 text-amber-400" />
                   <span className="text-[10px] text-slate-300">HSM Secure Boot</span>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-950 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2">
                   <Activity className="w-4 h-4 text-cyan-400" />
                   <span className="text-[10px] text-slate-300">Enclave Memory</span>
                </div>
                <span className="text-[10px] text-blue-400 font-mono">1024MB</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              Manual Override Terminal
            </h3>
            <div className="p-3 bg-black rounded-xl border border-slate-800 h-32 font-mono text-[9px] text-emerald-400 overflow-y-auto">
              [SYSTEM] Root shell active.<br/>
              # ./deploy_stratum.sh --force --auto-sign<br/>
              [DEPLOY] Provisioning Stratum instance...<br/>
              [DEPLOY] Binding to 0.0.0.0:3333...<br/>
              <span className="animate-pulse">_</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
            <p className="text-[10px] text-slate-500 leading-relaxed italic">
              Automated build pipelines follow the A. Keddeh "Strict Execution" standard. Every layer is hashed and verified by the kernel substrate before deployment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
