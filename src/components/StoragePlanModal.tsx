import React from 'react';
import { Sparkles, Check, X, Shield, Zap, Database } from 'lucide-react';
import { StoragePlan } from '../types';
import { STORAGE_PLANS, formatBytes } from '../data/VfsInitialSubstrate';

interface StoragePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: StoragePlan;
  onSelectPlan: (plan: StoragePlan) => void;
  usedBytes: number;
}

export const StoragePlanModal: React.FC<StoragePlanModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  onSelectPlan,
  usedBytes,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl p-6 md:p-8 space-y-6 animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Upgrade Vault Storage Space</h2>
              <p className="text-xs text-slate-400">
                Current usage: <span className="text-blue-400 font-mono font-semibold">{formatBytes(usedBytes)}</span> used
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Storage Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STORAGE_PLANS.map((plan) => {
            const isCurrent = currentPlan.id === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-5 flex flex-col justify-between space-y-4 transition-all ${
                  isCurrent
                    ? 'bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/30'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500 text-white shadow">
                    {plan.badge}
                  </span>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-bold text-white">{plan.name}</h3>
                  </div>

                  <div>
                    <p className="text-2xl font-extrabold text-white">{formatBytes(plan.limitBytes)}</p>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">{plan.price}</p>
                  </div>

                  <ul className="space-y-2 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => {
                    onSelectPlan(plan);
                    onClose();
                  }}
                  disabled={isCurrent}
                  className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-colors cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 cursor-default'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                  }`}
                >
                  {isCurrent ? 'Active Plan' : 'Select Plan'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
