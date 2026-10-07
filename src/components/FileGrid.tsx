import React from 'react';
import { motion } from 'motion/react';
import {
  Folder,
  Star,
  Trash2,
  Share2,
  Eye,
  MoreVertical,
  Check,
  FileCheck,
  Download,
  Copy,
  Play,
  Sparkles
} from 'lucide-react';
import { FileItem, FolderItem } from '../types';
import { CategoryBadge, AssetCategoryVisualizer } from './AssetCategoryVisualizer';
import { formatBytes, formatDate } from '../data/VfsInitialSubstrate';

interface FileGridProps {
  folders: FolderItem[];
  files: FileItem[];
  selectedIds: string[];
  activeFileId: string | null;
  onSelectFolder: (folderId: string) => void;
  onSelectFile: (file: FileItem, e: React.MouseEvent) => void;
  onToggleSelectId: (id: string, e: React.MouseEvent) => void;
  onToggleStarFile: (fileId: string, e: React.MouseEvent) => void;
  onToggleStarFolder: (folderId: string, e: React.MouseEvent) => void;
  onTrashFile: (fileId: string, e: React.MouseEvent) => void;
  onTrashFolder: (folderId: string, e: React.MouseEvent) => void;
  onPreviewFile: (file: FileItem, e: React.MouseEvent) => void;
  onShareFile: (file: FileItem, e: React.MouseEvent) => void;
  getFolderStats: (folderId: string) => { count: number; totalBytes: number };
  onLaunchApp?: (file: FileItem) => void;
}

export const FileGrid: React.FC<FileGridProps> = ({
  folders,
  files,
  selectedIds,
  activeFileId,
  onSelectFolder,
  onSelectFile,
  onToggleSelectId,
  onToggleStarFile,
  onToggleStarFolder,
  onTrashFile,
  onTrashFolder,
  onPreviewFile,
  onShareFile,
  getFolderStats,
  onLaunchApp,
}) => {
  return (
    <div className="p-6 space-y-8">
      {/* Folders Section */}
      {folders.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Folders ({folders.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {folders.map((folder) => {
              const isSelected = selectedIds.includes(folder.id);
              const stats = getFolderStats(folder.id);

              return (
                <motion.div
                  key={folder.id}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => onSelectFolder(folder.id)}
                  className={`group relative bg-slate-900/80 hover:bg-slate-850 border p-4 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-950/20 ring-1 ring-blue-500'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${folder.color}20` }}
                      >
                        <Folder className="w-5 h-5" style={{ color: folder.color }} />
                      </div>
                      <div className="truncate">
                        <h3 className="text-sm font-medium text-slate-200 truncate group-hover:text-white">
                          {folder.name}
                        </h3>
                        <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                          {stats.count} items • {formatBytes(stats.totalBytes)}
                        </p>
                      </div>
                    </div>

                    {/* Folder Star Button */}
                    <button
                      onClick={(e) => onToggleStarFolder(folder.id, e)}
                      className={`p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer ${
                        folder.starred ? 'text-amber-400' : 'text-slate-600 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${folder.starred ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Files Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Files ({files.length})
          </h2>
        </div>

        {files.length === 0 ? (
          <div className="border border-dashed border-slate-800 rounded-2xl p-12 text-center space-y-3 bg-slate-950/30">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Folder className="w-6 h-6" />
            </div>
            <p className="text-sm text-slate-300 font-medium">This folder is empty</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Upload files or drag and drop files from your computer to store them in this vault.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {files.map((file) => {
              const isSelected = selectedIds.includes(file.id);
              const isActive = activeFileId === file.id;

              const isHtml = file.isHtml5App || file.name.endsWith('.html') || file.name.endsWith('.htm') || file.mimeType === 'text/html';
              const isKexLinux = file.name === 'KEX_Linux_Terminal.html' || file.id === 'file-html5-kex-linux-terminal' || file.name.toLowerCase().includes('kex');
              const isOsFile = file.name === 'Open_Source_Operating_System.html' || file.id === 'file-html5-open-source-os' || isKexLinux;

              return (
                <motion.div
                  key={file.id}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.15 }}
                  onClick={(e) => onSelectFile(file, e)}
                  onDoubleClick={(e) => {
                    if (isHtml && onLaunchApp) {
                      onLaunchApp(file);
                    } else {
                      onPreviewFile(file, e);
                    }
                  }}
                  className={`group relative bg-slate-900 border rounded-xl overflow-hidden cursor-pointer transition-all flex flex-col justify-between ${
                    isActive
                      ? 'border-blue-500 ring-2 ring-blue-500/50 bg-slate-850 shadow-lg shadow-blue-500/10'
                      : isSelected
                      ? 'border-blue-500/80 bg-blue-950/30'
                      : 'border-slate-800/90 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  {/* Card Preview Header */}
                  <div className="relative h-36 bg-slate-950/70 border-b border-slate-800/80 overflow-hidden flex items-center justify-center p-3">
                    {/* Image Preview / Thumbnail */}
                    {file.category === 'images' && file.url ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover rounded-md group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 shadow-inner">
                          <AssetCategoryVisualizer category={file.category} className="w-8 h-8" />
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide">
                          {file.mimeType.split('/')[1] || file.category}
                        </span>
                      </div>
                    )}

                    {/* HTML5 or OS App Badge */}
                    {isKexLinux ? (
                      <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 text-[9px] font-mono font-bold flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                        <span>KEX LINUX</span>
                      </span>
                    ) : isOsFile ? (
                      <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-blue-500/25 text-blue-300 border border-blue-500/50 text-[9px] font-mono font-bold flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-2.5 h-2.5 text-blue-400" />
                        <span>BOOTABLE OS</span>
                      </span>
                    ) : isHtml && (
                      <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono font-medium flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>HTML5</span>
                      </span>
                    )}

                    {/* Top Overlay Actions: Select Checkbox & Star */}
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                      <button
                        onClick={(e) => onToggleSelectId(file.id, e)}
                        className={`pointer-events-auto p-1.5 rounded-lg border backdrop-blur-md transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-slate-900/80 border-slate-700 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => onToggleStarFile(file.id, e)}
                        className={`pointer-events-auto p-1.5 rounded-lg border backdrop-blur-md transition-all cursor-pointer ${
                          file.starred
                            ? 'bg-slate-900/90 border-amber-500/40 text-amber-400'
                            : 'bg-slate-900/80 border-slate-700 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-amber-400'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${file.starred ? 'fill-amber-400' : ''}`} />
                      </button>
                    </div>

                    {/* Quick Hover Action Buttons */}
                    <div className="absolute inset-x-2 bottom-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                      {isHtml && onLaunchApp ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onLaunchApp(file);
                          }}
                          className={`flex-1 py-1 px-2 rounded text-white text-[11px] font-semibold flex items-center justify-center gap-1 shadow-md cursor-pointer transition-colors ${
                            isKexLinux
                              ? 'bg-cyan-600 hover:bg-cyan-500 border border-cyan-400/50'
                              : isOsFile
                              ? 'bg-blue-600 hover:bg-blue-500 border border-blue-400/50'
                              : 'bg-emerald-600 hover:bg-emerald-500 border border-emerald-500'
                          }`}
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>{isKexLinux ? 'Boot KEX' : isOsFile ? 'Boot OS' : 'Run'}</span>
                        </button>
                      ) : null}
                      <button
                        onClick={(e) => onPreviewFile(file, e)}
                        className="flex-1 py-1 px-2 rounded bg-slate-900/90 hover:bg-blue-600 text-slate-200 hover:text-white border border-slate-700/80 text-[11px] font-medium flex items-center justify-center gap-1 shadow-md cursor-pointer transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>
                    </div>
                  </div>

                  {/* Card Content Footer */}
                  <div className="p-3.5 space-y-2.5">
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-1.5">
                        <h3
                          className="text-xs font-semibold text-slate-200 group-hover:text-white truncate"
                          title={file.name}
                        >
                          {file.name}
                        </h3>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>{formatBytes(file.size)}</span>
                        <span>{formatDate(file.updatedAt).split(',')[0]}</span>
                      </div>
                    </div>

                    {/* Tags & Action Icons */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-xs">
                      <CategoryBadge category={file.category} />

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => onShareFile(file, e)}
                          className="p-1 rounded text-slate-500 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                          title="Share Link"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => onTrashFile(file.id, e)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
