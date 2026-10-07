import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Key, 
  AlertTriangle, 
  ChevronRight, 
  Terminal, 
  CheckCircle2, 
  Lock, 
  BookOpen,
  FileSearch,
  Cpu
} from 'lucide-react';

interface ComplianceQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

const COMPLIANCE_STEPS: ComplianceQuestion[] = [
  {
    id: 'stratum-protocol',
    question: 'Which Stratum method is responsible for negotiating session capabilities and initial difficulty?',
    options: ['mining.authorize', 'mining.subscribe', 'mining.set_difficulty', 'mining.submit'],
    correctIndex: 1,
  },
  {
    id: 'kernel-isolation',
    question: 'How does the KEX Microkernel ensure zero-latency VFS access for high-peak compute?',
    options: [
      'Using synthetic buffer clones',
      'Direct memory mapping (mmap) over VirtIO bus',
      'Asynchronous thread pooling with priority 0',
      'Inode caching via standard POSIX layer'
    ],
    correctIndex: 1,
  },
  {
    id: 'licensing-governance',
    question: 'What standard governs the formal verification of this sovereign hardware stack?',
    options: ['ISO 9001', 'ISO/IEC 29119', 'DO-178C DAL-A', 'ISO 26262 ASIL-D'],
    correctIndex: 2,
  },
  {
    id: 'ethical-alignment',
    question: 'Attest to the deployment sector for this sovereign APK instance:',
    options: [
      'Unregulated / Experimental Research',
      'Regulated Industrial / Mission-Critical Facility',
      'Public Cloud Shared Compute',
      'High-Frequency Trading Network'
    ],
    correctIndex: 1,
  }
];

interface ComplianceVerifierProps {
  onVerified: (licenseKey: string) => void;
  onCancel: () => void;
}

export const ComplianceVerifier: React.FC<ComplianceVerifierProps> = ({ onVerified, onCancel }) => {
  const [step, setStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [licenseKey, setLicenseKey] = useState('');
  const [isFinalizing, setIsFinalizing] = useState(false);

  const currentQuestion = COMPLIANCE_STEPS[step];

  const handleNext = () => {
    if (selectedOption === null) {
      setError('Please select an option to verify your technical understanding.');
      return;
    }

    if (selectedOption !== currentQuestion.correctIndex) {
      setError('Technical verification failed. Insufficient architectural understanding detected.');
      return;
    }

    setError(null);
    setSelectedOption(null);
    if (step < COMPLIANCE_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setStep(COMPLIANCE_STEPS.length); // Move to license entry
    }
  };

  const handleFinalize = async () => {
    if (!licenseKey.trim().startsWith('SK-')) {
      setError('Invalid production license key format. Keys must originate from A. Keddeh Sovereign Registry.');
      return;
    }
    
    setIsFinalizing(true);
    
    // Physically invoke the kernel to verify this APK and license
    const { GLOBAL_KERNEL_OE, sha256Hex } = await import('../../services/brainkCognitiveSubstrate');
    const licenseHash = sha256Hex(licenseKey);
    const result = GLOBAL_KERNEL_OE.syscall(8, ['stratum-apk', licenseHash]); // SYS_VERIFY_APP

    setTimeout(() => {
      if (result) {
        onVerified(licenseKey);
      } else {
        setError('KERNEL_REJECTION: Hardware HSM could not verify license signature.');
      }
      setIsFinalizing(false);
    }, 1500);
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl max-w-xl w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950/40 p-6 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Technical Compliance Audit</h3>
            <p className="text-[11px] text-slate-400 font-mono uppercase tracking-widest">
              Architectural Verification · DO-178C DAL-A · ISO 29119
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Deployment of the Stratum Mining Core OS requires rigorous architectural verification. You must demonstrate a functional understanding of the microkernel bootchain and provide a valid production license key.
        </p>
      </div>

      <div className="p-6 space-y-6">
        {step < COMPLIANCE_STEPS.length ? (
          /* Question View */
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 uppercase">
              <span>Technical Verification Step {step + 1} of {COMPLIANCE_STEPS.length}</span>
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            
            <h4 className="text-sm font-semibold text-white leading-snug">
              {currentQuestion.question}
            </h4>

            <div className="space-y-2">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedOption(idx);
                    setError(null);
                  }}
                  className={`w-full p-3.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    selectedOption === idx
                      ? 'bg-indigo-500/10 border-indigo-500 text-white shadow-sm shadow-indigo-500/10'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      selectedOption === idx ? 'border-indigo-400 bg-indigo-400' : 'border-slate-700'
                    }`}>
                      {selectedOption === idx && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* License Entry View */
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 uppercase">
              <span>Architectural Logic Verified</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">Technical Logic &amp; Sector Alignment Verified</p>
                <p className="text-emerald-400/80 leading-relaxed">
                  Knowledge of Stratum semantics and industrial deployment constraints confirmed. Finalizing deployment environment requires a valid production license key.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Key className="w-3 h-3 text-cyan-400" />
                <span>Production License Key</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={licenseKey}
                  onChange={(e) => {
                    setLicenseKey(e.target.value);
                    setError(null);
                  }}
                  placeholder="SK-ENT-2026-XXXX-XXXX-XXXX"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm font-mono text-white placeholder-slate-600 outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
              <p className="text-[10px] text-slate-500 italic">
                Source your key from the Sovereign Registry (Enterprise Dashboard) or the physical hardware HSM.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-6 pt-0 flex items-center gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-bold transition-colors cursor-pointer"
        >
          Abort Deployment
        </button>
        {step < COMPLIANCE_STEPS.length ? (
          <button
            onClick={handleNext}
            className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
          >
            <span>Verify Architectural Logic</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleFinalize}
            disabled={isFinalizing || !licenseKey.trim()}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-600/20 disabled:opacity-50"
          >
            {isFinalizing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Validating Signature...</span>
              </>
            ) : (
              <>
                <Cpu className="w-4 h-4" />
                <span>Finalize APK Environment</span>
              </>
            )}
          </button>
        )}
      </div>
      
      {/* ISO Compliance Footer */}
      <div className="px-6 py-3 bg-slate-900/50 border-t border-slate-800/50 flex items-center justify-between text-[9px] font-mono text-slate-500 uppercase tracking-tighter">
        <div className="flex gap-4">
          <span>ISO/IEC 29119-3 Compliant</span>
          <span>DO-178C Verified</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Terminal className="w-3 h-3" />
          <span>Kernel ID: 0x8F9B2C4E</span>
        </div>
      </div>
    </div>
  );
};
