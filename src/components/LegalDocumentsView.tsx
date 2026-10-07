import React from 'react';
import { Shield, FileText, Scale, Lock, ShieldCheck, Download } from 'lucide-react';
import { FileItem } from '../types';
import { formatBytes, formatDate } from '../data/VfsInitialSubstrate';

interface LegalDocumentsViewProps {
  files: FileItem[];
  onPreviewFile: (file: FileItem) => void;
}

export const LegalDocumentsView: React.FC<LegalDocumentsViewProps> = ({ files, onPreviewFile }) => {
  const legalFiles = files.filter(f => 
    f.name.toLowerCase().includes('legal') || 
    f.name.toLowerCase().includes('contract') || 
    f.name.toLowerCase().includes('nda') ||
    f.name.toLowerCase().includes('architecture') ||
    f.name.toLowerCase().includes('deployment') ||
    f.name.toLowerCase().includes('v50') ||
    f.tags?.some(t => ['Legal', 'Contract', 'NDA', 'Architecture', 'Deployment', 'V50'].includes(t))
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
      <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Legal, Architecture & Compliance</h2>
            <p className="text-xs text-slate-400">Secure repository for NDAs, service agreements, and V50 architectural specifications.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {legalFiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {legalFiles.map(file => (
              <div 
                key={file.id}
                onClick={() => onPreviewFile(file)}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-emerald-500/50 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <ShieldCheck className="w-4 h-4 text-emerald-500 opacity-50" />
                </div>
                <h3 className="text-sm font-bold text-white truncate mb-1">{file.name}</h3>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>{formatBytes(file.size)}</span>
                  <span>{formatDate(file.updatedAt)}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Verified Secure</span>
                  <button className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-slate-600 gap-4">
            <Lock className="w-12 h-12 opacity-20" />
            <p className="text-sm">No legal or architecture documents identified in the current storage substrate.</p>
          </div>
        )}
      </div>
    </div>
  );
};
