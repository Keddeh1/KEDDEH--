import React from 'react';
import { Trash2, RotateCcw, AlertTriangle, HardDrive } from 'lucide-react';
import { FileItem, FolderItem } from '../types';
import { CategoryBadge, AssetCategoryVisualizer } from './AssetCategoryVisualizer';
import { formatBytes, formatDate } from '../data/VfsInitialSubstrate';

interface TrashBinProps {
  trashedFiles: FileItem[];
  trashedFolders: FolderItem[];
  onRestoreFile: (fileId: string) => void;
  onRestoreFolder: (folderId: string) => void;
  onPermanentDeleteFile: (fileId: string) => void;
  onPermanentDeleteFolder: (folderId: string) => void;
  onEmptyTrash: () => void;
}

export const TrashBin: React.FC<TrashBinProps> = ({
  trashedFiles,
  trashedFolders,
  onRestoreFile,
  onRestoreFolder,
  onPermanentDeleteFile,
  onPermanentDeleteFolder,
  onEmptyTrash,
}) => {
  const totalTrashBytes = trashedFiles.reduce((acc, f) => acc + f.size, 0);
  const totalCount = trashedFiles.length + trashedFolders.length;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Trash & Recycle Bin</h1>
            <p className="text-xs text-slate-400">
              Items in trash take up <span className="text-rose-400 font-mono font-semibold">{formatBytes(totalTrashBytes)}</span>.
            </p>
          </div>
        </div>

        {totalCount > 0 && (
          <button
            onClick={onEmptyTrash}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Empty Trash Now</span>
          </button>
        )}
      </div>

      {totalCount === 0 ? (
        <div className="border border-dashed border-slate-800 rounded-2xl p-16 text-center space-y-3 bg-slate-900/30">
          <Trash2 className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">Trash is Empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When you delete files or folders from your storage space, they appear here until you empty the trash.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-medium uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4 hidden md:table-cell">Type</th>
                <th className="py-3 px-4 hidden sm:table-cell">Size</th>
                <th className="py-3 px-4 hidden lg:table-cell">Trashed Date</th>
                <th className="py-3 px-4 text-right pr-6">Restore / Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {trashedFolders.map((folder) => (
                <tr key={folder.id} className="hover:bg-slate-850 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-200">{folder.name} (Folder)</td>
                  <td className="py-3 px-4 hidden md:table-cell text-slate-400">Folder</td>
                  <td className="py-3 px-4 hidden sm:table-cell text-slate-400">--</td>
                  <td className="py-3 px-4 hidden lg:table-cell text-slate-400 font-mono">{formatDate(folder.updatedAt)}</td>
                  <td className="py-3 px-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onRestoreFolder(folder.id)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore</span>
                      </button>
                      <button
                        onClick={() => onPermanentDeleteFolder(folder.id)}
                        className="p-1.5 rounded text-rose-400 hover:bg-rose-950/40 cursor-pointer"
                        title="Delete Permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {trashedFiles.map((file) => (
                <tr key={file.id} className="hover:bg-slate-850 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <AssetCategoryVisualizer category={file.category} className="w-4 h-4" />
                      <span className="font-medium text-slate-200 truncate max-w-xs">{file.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <CategoryBadge category={file.category} />
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell font-mono text-slate-400">{formatBytes(file.size)}</td>
                  <td className="py-3 px-4 hidden lg:table-cell font-mono text-slate-400">{formatDate(file.trashedAt || file.updatedAt)}</td>
                  <td className="py-3 px-4 text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onRestoreFile(file.id)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore</span>
                      </button>
                      <button
                        onClick={() => onPermanentDeleteFile(file.id)}
                        className="p-1.5 rounded text-rose-400 hover:bg-rose-950/40 cursor-pointer"
                        title="Delete Permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
