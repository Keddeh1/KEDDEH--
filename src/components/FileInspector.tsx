import React, { useState } from 'react';
import {
  X,
  Star,
  Share2,
  Trash2,
  Eye,
  Download,
  Tag,
  FileText,
  Calendar,
  HardDrive,
  Globe,
  Copy,
  Check,
  Plus,
  AlertTriangle,
  Folder,
  ExternalLink,
  Cloud,
  Play,
  Sparkles
} from 'lucide-react';
import { FileItem } from '../types';
import { CategoryBadge, AssetCategoryVisualizer } from './AssetCategoryVisualizer';
import { formatBytes, formatDate } from '../data/VfsInitialSubstrate';

interface FileInspectorProps {
  file: FileItem | null;
  onClose: () => void;
  onToggleStar: (fileId: string) => void;
  onTrash: (fileId: string) => void;
  onPreview: (file: FileItem) => void;
  onShare: (file: FileItem) => void;
  onUpdateFile: (updatedFile: FileItem) => void;
  folderName: string;
  onLaunchApp?: (file: FileItem) => void;
}

export const FileInspector: React.FC<FileInspectorProps> = ({
  file,
  onClose,
  onToggleStar,
  onTrash,
  onPreview,
  onShare,
  onUpdateFile,
  folderName,
  onLaunchApp,
}) => {
  const [newTag, setNewTag] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!file) return null;

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    const cleanTag = newTag.trim().replace(/^#/, '');
    if (!file.tags.includes(cleanTag)) {
      onUpdateFile({ ...file, tags: [...file.tags, cleanTag] });
    }
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateFile({
      ...file,
      tags: file.tags.filter((t) => t !== tagToRemove),
    });
  };

  const handleSaveDescription = () => {
    onUpdateFile({ ...file, description });
    setIsEditingDescription(false);
  };

  const handleCopyPath = () => {
    navigator.clipboard.writeText(`/${folderName}/${file.name}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="w-80 lg:w-96 bg-slate-900 border-l border-slate-800 flex flex-col justify-between h-full shrink-0 select-none shadow-2xl overflow-y-auto">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <FileText className="w-4 h-4 text-blue-400" />
          <span className="font-semibold uppercase tracking-wider text-[11px]">File Details</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-6">
        {/* Preview Header Card */}
        <div className="relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden p-4 flex flex-col items-center justify-center min-h-[160px] group">
          {file.category === 'images' && file.url ? (
            <img
              src={file.url}
              alt={file.name}
              className="max-h-40 w-auto object-contain rounded-lg"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-2">
              <AssetCategoryVisualizer category={file.category} className="w-10 h-10" />
              <CategoryBadge category={file.category} />
            </div>
          )}

          <div className="flex items-center gap-2 mt-3">
            {(file.isHtml5App || file.name.endsWith('.html') || file.name.endsWith('.htm') || file.mimeType === 'text/html') && onLaunchApp ? (
              <button
                onClick={() => onLaunchApp(file)}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Launch App</span>
              </button>
            ) : null}
            <button
              onClick={() => onPreview(file)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            {file.webViewLink && (
              <a
                href={file.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                <span>Drive</span>
              </a>
            )}
            {file.webContentLink && (
              <a
                href={file.webContentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center shadow-md cursor-pointer transition-colors"
                title="Download from Google Drive"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
              </a>
            )}
          </div>
        </div>

        {/* File Title & Duplicate Alert */}
        <div className="space-y-2">
          {file.isDriveFile && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[10px] font-medium">
              <Cloud className="w-3 h-3 text-blue-400" />
              <span>Google Drive Cloud Item</span>
            </div>
          )}

          {file.isDuplicate && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Duplicate file detected. Considers moving to Trash to save space.</span>
            </div>
          )}

          <h2 className="text-sm font-semibold text-white break-all leading-snug">
            {file.name}
          </h2>

          {/* Quick Action Toolbar */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <button
              onClick={() => onToggleStar(file.id)}
              className={`p-2 rounded-lg border flex flex-col items-center gap-1 text-[11px] transition-colors cursor-pointer ${
                file.starred
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <Star className={`w-4 h-4 ${file.starred ? 'fill-amber-400' : ''}`} />
              <span>{file.starred ? 'Starred' : 'Star'}</span>
            </button>

            <button
              onClick={() => onShare(file)}
              className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 flex flex-col items-center gap-1 text-[11px] transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-blue-400" />
              <span>Share</span>
            </button>

            <button
              onClick={handleCopyPath}
              className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 flex flex-col items-center gap-1 text-[11px] transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Copied' : 'Copy Path'}</span>
            </button>

            <button
              onClick={() => onTrash(file.id)}
              className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-rose-400 hover:bg-rose-950/40 hover:border-rose-800 flex flex-col items-center gap-1 text-[11px] transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* File Metadata Properties */}
        <div className="space-y-3 pt-2 border-t border-slate-800/80 text-xs">
          <h3 className="font-semibold text-slate-300 uppercase text-[10px] tracking-wider">
            Properties
          </h3>

          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 divide-y divide-slate-800/60 font-mono text-[11px]">
            <div className="py-2 flex justify-between">
              <span className="text-slate-500">Size</span>
              <span className="text-slate-200">{formatBytes(file.size)} ({file.size.toLocaleString()} bytes)</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-slate-500">Location</span>
              <span className="text-blue-400 flex items-center gap-1">
                <Folder className="w-3 h-3" />
                {folderName}
              </span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-slate-500">Type</span>
              <span className="text-slate-200">{file.mimeType}</span>
            </div>
            {file.dimensions && (
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Dimensions</span>
                <span className="text-slate-200">{file.dimensions}</span>
              </div>
            )}
            {file.duration && (
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Duration</span>
                <span className="text-slate-200">{file.duration}</span>
              </div>
            )}
            <div className="py-2 flex justify-between">
              <span className="text-slate-500">Created</span>
              <span className="text-slate-400">{formatDate(file.createdAt)}</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-slate-500">Modified</span>
              <span className="text-slate-400">{formatDate(file.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Tags Section */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-300 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-400" />
              <span>Tags</span>
            </h3>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {file.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px]"
              >
                <span>#{tag}</span>
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-rose-400 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            <form onSubmit={handleAddTag} className="inline-flex items-center">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="+ Add tag..."
                className="bg-slate-950 border border-slate-800 focus:border-blue-500 rounded px-2 py-0.5 text-[11px] text-slate-200 outline-none w-24"
              />
            </form>
          </div>
        </div>

        {/* Description / Annotation Notes */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-300 uppercase text-[10px] tracking-wider">
              Description Notes
            </h3>
            {!isEditingDescription && (
              <button
                onClick={() => {
                  setDescription(file.description || '');
                  setIsEditingDescription(true);
                }}
                className="text-blue-400 hover:underline text-[11px] cursor-pointer"
              >
                {file.description ? 'Edit' : 'Add Note'}
              </button>
            )}
          </div>

          {isEditingDescription ? (
            <div className="space-y-2">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write notes about this file..."
                className="w-full h-20 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-blue-500 resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditingDescription(false)}
                  className="px-2.5 py-1 rounded bg-slate-800 text-slate-400 hover:text-slate-200 text-[11px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDescription}
                  className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-medium"
                >
                  Save Note
                </button>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60 italic leading-relaxed">
              {file.description || 'No notes added yet for this file.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
