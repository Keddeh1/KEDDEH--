import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  items?: string[];
  confirmLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  items,
  confirmLabel = 'Confirm',
  isDestructive = true,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="confirm-action-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="confirm-action-modal-container"
        className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 space-y-4 text-slate-100 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="confirm-action-modal-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Icon & Header */}
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isDestructive
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}
          >
            {isDestructive ? (
              <Trash2 className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">{title}</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Affected Items List (if applicable) */}
        {items && items.length > 0 && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 max-h-36 overflow-y-auto space-y-1 text-xs font-mono text-slate-300">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 truncate py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
                <span className="truncate">{item}</span>
              </div>
            ))}
          </div>
        )}

        {/* Warning Note */}
        {isDestructive && (
          <p className="text-[11px] text-rose-300/90 bg-rose-950/30 border border-rose-900/40 rounded-lg p-2.5">
            This action interacts directly with your Google Drive and mutates the cloud data.
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            id="confirm-action-cancel-btn"
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="confirm-action-proceed-btn"
            type="button"
            disabled={isLoading}
            onClick={async () => {
              await onConfirm();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-sm cursor-pointer flex items-center gap-1.5 ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 disabled:opacity-50'
                : 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50'
            }`}
          >
            {isLoading ? (
              <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
            ) : null}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
