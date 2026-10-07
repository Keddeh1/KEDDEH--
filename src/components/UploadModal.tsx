import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  FileText,
  AlertCircle,
  Cloud,
  Tag,
  Plus,
  Table,
  Code2,
  FileCode,
  Sparkles,
  Layers
} from 'lucide-react';
import { FileCategory, FileItem } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFolderId: string | null;
  folderName?: string;
  onUploadSuccess: (newFiles: FileItem[]) => void;
  isDriveMode?: boolean;
  onUploadDriveFile?: (file: File, onProgress: (percent: number) => void) => Promise<FileItem>;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  currentFolderId,
  folderName,
  onUploadSuccess,
  isDriveMode = false,
  onUploadDriveFile,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFileName, setCurrentFileName] = useState('');
  const [customTags, setCustomTags] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'create'>('upload');

  // New Document creation state
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState<'markdown' | 'csv' | 'json' | 'typescript' | 'html'>('markdown');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const detectCategory = (mime: string, name: string): FileCategory => {
    const ext = name.split('.').pop()?.toLowerCase() || '';

    if (
      mime.startsWith('image/') ||
      ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)
    ) {
      return 'images';
    }
    if (
      mime.startsWith('video/') ||
      ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)
    ) {
      return 'videos';
    }
    if (
      mime.startsWith('audio/') ||
      ['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(ext)
    ) {
      return 'audio';
    }
    if (
      ['zip', 'rar', 'tar', 'gz', '7z'].includes(ext) ||
      mime.includes('zip') ||
      mime.includes('tar') ||
      mime.includes('compressed')
    ) {
      return 'archives';
    }
    if (
      [
        'js',
        'jsx',
        'ts',
        'tsx',
        'html',
        'htm',
        'css',
        'json',
        'py',
        'sql',
        'sh',
        'yml',
        'yaml',
        'xml',
      ].includes(ext) ||
      mime.includes('javascript') ||
      mime.includes('json') ||
      mime.includes('html') ||
      mime.includes('css')
    ) {
      return 'code';
    }
    if (
      [
        'pdf',
        'doc',
        'docx',
        'txt',
        'rtf',
        'odt',
        'csv',
        'xls',
        'xlsx',
        'ppt',
        'pptx',
        'md',
      ].includes(ext) ||
      mime.includes('pdf') ||
      mime.includes('document') ||
      mime.includes('sheet') ||
      mime.includes('presentation')
    ) {
      return 'documents';
    }
    return 'other';
  };

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const processFiles = async (fileList: FileList) => {
    setIsUploading(true);
    setUploadError(null);
    setProgress(10);

    const uploadedItems: FileItem[] = [];
    const filesArray = Array.from(fileList);

    try {
      if (isDriveMode && onUploadDriveFile) {
        // Real Google Drive upload
        for (let i = 0; i < filesArray.length; i++) {
          const file = filesArray[i];
          setCurrentFileName(file.name);
          const uploaded = await onUploadDriveFile(file, (percent) => {
            const overall = Math.round(((i + percent / 100) / filesArray.length) * 100);
            setProgress(overall);
          });
          uploadedItems.push(uploaded);
        }
      } else {
        // Client Vault Upload with full persistence
        const tagsArr = customTags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);

        for (let index = 0; index < filesArray.length; index++) {
          const file = filesArray[index];
          setCurrentFileName(file.name);
          const category = detectCategory(file.type, file.name);
          const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

          let previewUrl: string | undefined = undefined;
          let rawContent: string | undefined = undefined;

          const isTextual =
            file.type.startsWith('text/') ||
            file.name.endsWith('.md') ||
            file.name.endsWith('.txt') ||
            file.name.endsWith('.csv') ||
            file.name.endsWith('.json') ||
            file.name.endsWith('.ts') ||
            file.name.endsWith('.js') ||
            file.name.endsWith('.html') ||
            file.name.endsWith('.css') ||
            file.name.endsWith('.sql') ||
            file.name.endsWith('.yml') ||
            file.name.endsWith('.yaml') ||
            file.name.endsWith('.log');

          if (isTextual) {
            try {
              rawContent = await file.text();
            } catch (err) {
              console.warn('Failed reading file text:', err);
            }
          }

          if (file.type.startsWith('image/')) {
            try {
              previewUrl = await readFileAsDataUrl(file);
              if (file.name.endsWith('.svg') || file.type === 'image/svg+xml') {
                rawContent = await file.text();
              }
            } catch (err) {
              console.warn('Failed reading image base64:', err);
            }
          } else if (!isTextual && file.size <= 8 * 1024 * 1024) {
            // For smaller binaries, generate data URL for instant download/playback
            try {
              previewUrl = await readFileAsDataUrl(file);
            } catch (err) {
              console.warn('Failed reading binary data URL:', err);
            }
          }

          const isHtml5 =
            file.name.toLowerCase().endsWith('.html') ||
            file.name.toLowerCase().endsWith('.htm') ||
            file.type === 'text/html';

          const newFileItem: FileItem = {
            id: fileId,
            name: file.name,
            folderId: currentFolderId,
            category,
            size: file.size,
            mimeType: file.type || 'application/octet-stream',
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            starred: false,
            inTrash: false,
            tags: tagsArr.length > 0 ? tagsArr : [category, 'Uploaded'],
            url: previewUrl,
            rawContent,
            isHtml5App: isHtml5,
            description: `${file.name} uploaded to storage vault.`,
          };

          uploadedItems.push(newFileItem);
          setProgress(Math.round(((index + 1) / filesArray.length) * 100));
        }
      }

      setIsUploading(false);
      setProgress(100);
      onUploadSuccess(uploadedItems);
      onClose();
    } catch (err: any) {
      console.error('File processing error:', err);
      setIsUploading(false);
      setUploadError(err.message || 'An error occurred while uploading file(s).');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files);
    }
  };

  const handleCreateDocument = () => {
    const timestamp = new Date().toISOString();
    const tagsArr = customTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    let filename = docName.trim();
    let content = '';
    let mime = 'text/plain';
    let cat: FileCategory = 'documents';
    let isHtml5 = false;

    if (docType === 'markdown') {
      if (!filename.endsWith('.md')) filename += '.md';
      mime = 'text/markdown';
      cat = 'documents';
      content = `# ${docName || 'New Document'}\n\nCreated: ${new Date().toLocaleDateString()}\n\n## Overview\nAdd your technical notes or documentation here.\n\n- Task 1\n- Task 2\n- Task 3\n`;
    } else if (docType === 'csv') {
      if (!filename.endsWith('.csv')) filename += '.csv';
      mime = 'text/csv';
      cat = 'documents';
      content = `ID,Name,Category,Status,Estimated_Hours\n101,Core Gateway,Infrastructure,Active,24\n102,UI Polish,Frontend,In Review,12\n103,VFS Runner,Virtualization,Complete,36\n`;
    } else if (docType === 'json') {
      if (!filename.endsWith('.json')) filename += '.json';
      mime = 'application/json';
      cat = 'code';
      content = JSON.stringify(
        {
          title: docName || 'Application Settings',
          createdAt: timestamp,
          version: '1.0.0',
          enabled: true,
          options: {
            cacheTTLSeconds: 3600,
            compression: true,
            telemetry: false,
          },
        },
        null,
        2
      );
    } else if (docType === 'typescript') {
      if (!filename.endsWith('.ts')) filename += '.ts';
      mime = 'text/typescript';
      cat = 'code';
      content = `/**\n * ${docName || 'Service Module'}\n */\n\nexport interface ServiceConfig {\n  endpoint: string;\n  timeoutMs: number;\n}\n\nexport async function initializeService(config: ServiceConfig): Promise<boolean> {\n  console.log('Connecting to', config.endpoint);\n  return true;\n}\n`;
    } else if (docType === 'html') {
      if (!filename.endsWith('.html')) filename += '.html';
      mime = 'text/html';
      cat = 'code';
      isHtml5 = true;
      content = `<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="utf-8">\n  <title>${docName || 'Interactive Canvas App'}</title>\n  <style>\n    body { margin: 0; background: #0f172a; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; }\n    canvas { border: 1px solid #334155; border-radius: 8px; }\n  </style>\n</head>\n<body>\n  <canvas id="app" width="400" height="300"></canvas>\n  <script>\n    const ctx = document.getElementById('app').getContext('2d');\n    ctx.fillStyle = '#38bdf8';\n    ctx.font = '20px monospace';\n    ctx.fillText('Storage Space HTML5 App', 50, 150);\n  </script>\n</body>\n</html>`;
    }

    const createdItem: FileItem = {
      id: `file-${Date.now()}`,
      name: filename || `New_Document.${docType === 'markdown' ? 'md' : docType === 'csv' ? 'csv' : docType === 'json' ? 'json' : docType === 'typescript' ? 'ts' : 'html'}`,
      folderId: currentFolderId,
      category: cat,
      size: new Blob([content]).size,
      mimeType: mime,
      updatedAt: timestamp,
      createdAt: timestamp,
      starred: false,
      inTrash: false,
      rawContent: content,
      isHtml5App: isHtml5,
      tags: tagsArr.length > 0 ? tagsArr : [docType, 'Created'],
      description: `New ${docType} file created in storage workspace.`,
    };

    onUploadSuccess([createdItem]);
    onClose();
  };

  return (
    <div
      id="upload-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="upload-modal-container"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-5 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/15 border border-blue-500/30 text-blue-400">
              {isDriveMode ? <Cloud className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                {isDriveMode ? 'Upload to Google Drive' : 'Add Files to Storage Space'}
              </h2>
              <p className="text-xs text-slate-400">
                Location:{' '}
                <span className="text-blue-400 font-medium">
                  {folderName || (isDriveMode ? 'Google Drive Root' : 'Vault Root')}
                </span>
              </p>
            </div>
          </div>
          <button
            id="close-upload-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation: Upload Files vs Create New Document */}
        {!isDriveMode && (
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Local Files</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'create'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Document</span>
            </button>
          </div>
        )}

        {uploadError && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{uploadError}</span>
          </div>
        )}

        {activeTab === 'upload' ? (
          <>
            {/* Drag & Drop Zone */}
            <div
              id="dropzone-area"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                dragActive
                  ? 'border-blue-500 bg-blue-950/30 scale-[1.01]'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/50 hover:bg-slate-950/80'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleChange}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 shadow-inner">
                <Upload className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-200">
                  Click to browse or drag and drop files from your computer
                </p>
                <p className="text-[11px] text-slate-500">
                  Full fidelity support: Documents, CSV spreadsheets, images, videos, audio, archives, and source code
                </p>
              </div>
            </div>

            {/* Upload Progress Bar */}
            {isUploading && (
              <div className="space-y-2 bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium truncate max-w-[240px]">
                    {currentFileName ? `Processing: ${currentFileName}` : 'Saving to storage space...'}
                  </span>
                  <span className="text-blue-400 font-mono font-bold">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          /* Create Document Tab */
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">File Type:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDocType('markdown')}
                  className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                    docType === 'markdown'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Markdown (.md)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDocType('csv')}
                  className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                    docType === 'csv'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Table className="w-4 h-4" />
                  <span>Spreadsheet (.csv)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDocType('json')}
                  className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                    docType === 'json'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Code2 className="w-4 h-4" />
                  <span>Config (.json)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDocType('typescript')}
                  className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                    docType === 'typescript'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <FileCode className="w-4 h-4" />
                  <span>TypeScript (.ts)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDocType('html')}
                  className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-colors cursor-pointer col-span-2 ${
                    docType === 'html'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>HTML5 Canvas App (.html)</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">File Name:</label>
              <input
                type="text"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder={
                  docType === 'markdown'
                    ? 'Architecture_Notes'
                    : docType === 'csv'
                    ? 'User_Metrics_2026'
                    : docType === 'json'
                    ? 'cluster_settings'
                    : docType === 'typescript'
                    ? 'analytics_service'
                    : 'particle_interactive'
                }
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none"
              />
            </div>
          </div>
        )}

        {/* Tags input */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-blue-400" />
            <span>Metadata Tags (comma separated):</span>
          </label>
          <input
            type="text"
            value={customTags}
            onChange={(e) => setCustomTags(e.target.value)}
            placeholder="e.g. production, finance, vfs"
            className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-none"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
          >
            Cancel
          </button>
          {activeTab === 'upload' ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Select Files</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCreateDocument}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Document</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
