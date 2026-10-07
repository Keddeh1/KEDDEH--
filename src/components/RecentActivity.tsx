import React from 'react';
import { Clock, FileText, Upload, Star, Trash2, Folder, CheckCircle } from 'lucide-react';
import { FileItem } from '../types';
import { formatDate } from '../data/VfsInitialSubstrate';
import { AssetCategoryVisualizer } from './AssetCategoryVisualizer';

interface RecentActivityProps {
  files: FileItem[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ files }) => {
  // Sort files by modified date descending
  const recentFiles = [...files]
    .filter((f) => !f.inTrash)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
        <div className="p-3 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Recent Vault Activity</h1>
          <p className="text-xs text-slate-400">Chronological history of files added, modified, or starred in your storage space.</p>
        </div>
      </div>

      <div className="space-y-3">
        {recentFiles.map((file, idx) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors text-xs"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
                <AssetCategoryVisualizer category={file.category} className="w-4 h-4" />
              </div>
              <div className="truncate">
                <h3 className="font-semibold text-slate-200 truncate">{file.name}</h3>
                <p className="text-[11px] text-slate-400">
                  Modified • {file.tags.map((t) => `#${t}`).join(' ')}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0 font-mono text-slate-400">
              <p className="text-slate-300 font-medium">{formatDate(file.updatedAt)}</p>
              <p className="text-[10px] text-slate-500">{file.mimeType}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
