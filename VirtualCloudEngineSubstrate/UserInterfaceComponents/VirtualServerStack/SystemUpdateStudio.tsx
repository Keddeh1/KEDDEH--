import React, { useState } from 'react';
import { 
  RefreshCw, 
  ShieldCheck, 
  Wifi, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Terminal,
  FileCode
} from 'lucide-react';
import { OFFICIAL_FIRMWARE_REGISTRY, FirmwareUpdateEngine } from '../../services/firmwareUpdateEngine';

export const SystemUpdateStudio: React.FC = () => {
  const [activeStep, setActiveStep] = useState<'IDLE' | 'DOWNLOADING' | 'VERIFYING' | 'APPLYING' | 'SUCCESS'>('IDLE');
  const [selectedOsId, setSelectedOsId] = useState<string>('os-stratum-mining');
  const [updateLog, setUpdateLog] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleStartUpdate = async () => {
    setError(null);
    setActiveStep('DOWNLOADING');
    setUpdateLog(['[NET] Initiating connection to official firmware registry...', '[NET] Protocol: ISO/IEC 23001-7 via WiFi (Simulated)']);
    
    // Simulate Download
    for (let i = 0; i <= 100; i += 20) {
      setProgress(i);
      await new Promise(r => setTimeout(r, 200));
    }

    setActiveStep('VERIFYING');
    setUpdateLog(prev => [...prev, '[CRYPTO] Downloading manifest signature...', '[CRYPTO] Performing ISO/IEC 29119-3 hash verification...']);
    
    const result = await FirmwareUpdateEngine.verifyIso(selectedOsId, 'https://registry.internal/firmware.iso');
    
    if (!result.success) {
      setError(result.error || 'VERIFICATION_FAILED');
      setActiveStep('IDLE');
      return;
    }

    setUpdateLog(prev => [...prev, '[SUCCESS] Hash match verified against kernel ledger.']);
    await new Promise(r => setTimeout(r, 600));

    setActiveStep('APPLYING');
    setUpdateLog(prev => [...prev, '[VFS] Writing verified kernel to /boot sector...', '[VFS] Rebuilding initramfs...']);
    
    await FirmwareUpdateEngine.applyUpdate(selectedOsId);
    
    setUpdateLog(prev => [...prev, '[SUCCESS] System firmware updated successfully.']);
    setActiveStep('SUCCESS');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl max-w-2xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/20">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">System Firmware Update</h3>
            <p className="text-xs text-slate-400">Standard ISO update engine for technical firmware management.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono text-emerald-400">
          <Wifi className="w-3 h-3" />
          <span>OTA_BRIDGE_ACTIVE</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Component</label>
            <select 
              value={selectedOsId}
              onChange={(e) => setSelectedOsId(e.target.value)}
              disabled={activeStep !== 'IDLE'}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="os-stratum-mining">Stratum Mining Core (Production)</option>
              <option value="os-kex-linux">KEX Linux Kernel (Core)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verification Standard</label>
            <div className="flex items-center gap-2 h-10 px-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{OFFICIAL_FIRMWARE_REGISTRY[selectedOsId]?.standard || 'ISO/IEC 29119-3'}</span>
            </div>
          </div>
        </div>

        {activeStep === 'IDLE' ? (
          <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-6 text-center space-y-4">
            <Cpu className="w-10 h-10 text-slate-700 mx-auto" />
            <div className="space-y-1">
              <p className="text-sm text-slate-300 font-medium">New Firmware Version Available</p>
              <p className="text-[11px] text-slate-500">v{OFFICIAL_FIRMWARE_REGISTRY[selectedOsId]?.version} · Released {OFFICIAL_FIRMWARE_REGISTRY[selectedOsId]?.releaseDate}</p>
            </div>
            <button
              onClick={handleStartUpdate}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 mx-auto"
            >
              <span>Download &amp; Verify ISO</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-blue-400">{activeStep}...</span>
              <span className="text-slate-500">{progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="bg-slate-950 rounded-xl p-4 font-mono text-[10px] space-y-1 text-slate-400 max-h-32 overflow-y-auto border border-slate-800">
              {updateLog.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-slate-600">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                  <span className={log.includes('SUCCESS') ? 'text-emerald-400' : ''}>{log}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeStep === 'SUCCESS' && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-400 animate-in zoom-in-95">
            <CheckCircle2 className="w-5 h-5" />
            <div className="text-xs">
              <p className="font-bold">Firmware Update Complete</p>
              <p className="opacity-80">The system is now running on the verified v{OFFICIAL_FIRMWARE_REGISTRY[selectedOsId]?.version} kernel.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <div className="text-xs">
              <p className="font-bold">Update Failed</p>
              <p className="opacity-80">Reason: {error}. The system state remains unchanged.</p>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[9px] font-mono text-slate-600 uppercase tracking-tighter">
        <div className="flex gap-4">
          <span>ISO/IEC 23001-7 OTA COMPLIANT</span>
          <span>FIRMWARE SIGNATURE: VERIFIED</span>
        </div>
        <div className="flex items-center gap-1">
          <Terminal className="w-3 h-3" />
          <span>KEX_UPDATER_v2.1</span>
        </div>
      </div>
    </div>
  );
};
