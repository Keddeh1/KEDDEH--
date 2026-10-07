import React, { useState } from 'react';
import {
  X,
  Save,
  FileText,
  Check,
  Download,
  Share2,
  Clock,
  Sparkles,
  Maximize2,
  Minimize2,
  Lock
} from 'lucide-react';
import { FileItem } from '../../types';

interface DocumentEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: FileItem | null;
  onSave: (doc: FileItem) => void;
}

export const DocumentEditorModal: React.FC<DocumentEditorModalProps> = ({
  isOpen,
  onClose,
  document,
  onSave,
}) => {
  const [title, setTitle] = useState(document ? document.name : 'Untitled Document.md');
  const [content, setContent] = useState(
    document ? (document.rawContent || document.description || '') : '# New Document\n\nType your content here...'
  );
  const [isSaved, setIsSaved] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync state when document changes
  React.useEffect(() => {
    if (document) {
      setTitle(document.name);
      setContent(document.rawContent || document.description || '');
    } else {
      setTitle('Untitled Document.md');
      setContent('# New Document\n\nType your content here...');
    }
    setIsSaved(false);
  }, [document, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const updatedDoc: FileItem = {
      id: document ? document.id : `doc-${Date.now()}`,
      name: title.trim() || 'Untitled Document.md',
      folderId: document ? document.folderId : 'folder-documents',
      category: 'documents',
      size: new Blob([content]).size,
      mimeType: 'text/markdown',
      updatedAt: new Date().toISOString(),
      createdAt: document ? document.createdAt : new Date().toISOString(),
      starred: document ? document.starred : false,
      inTrash: false,
      rawContent: content,
      description: content.slice(0, 150),
      tags: document ? document.tags : ['Document', 'Workspace'],
    };

    onSave(updatedDoc);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = title.endsWith('.md') ? title : `${title}.md`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 animate-fadeIn">
      <div
        className={`bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden transition-all duration-300 ${
          isFullscreen ? 'w-full h-full max-w-none max-h-none rounded-none' : 'w-full max-w-5xl h-[88vh]'
        }`}
      >
        {/* Editor Top Bar */}
        <div className="px-6 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FileText className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document Title (e.g. Mutual_NDA_2026.md)"
              className="bg-transparent text-sm font-bold text-white border-b border-transparent hover:border-slate-700 focus:border-blue-500 focus:outline-none px-1 py-0.5 w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 hidden sm:inline mr-2">
              {wordCount} words · {charCount} chars
            </span>

            <button
              type="button"
              onClick={handleDownload}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Download file"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
            >
              {isSaved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              <span>{isSaved ? 'Saved!' : 'Save Document'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close Editor"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Editor Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-950/40">
          {/* Main Textarea */}
          <div className="flex-1 p-6 overflow-y-auto flex flex-col">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your document, agreement, or notes here using markdown or plain text..."
              className="w-full flex-1 bg-transparent text-slate-200 text-sm font-sans leading-relaxed focus:outline-none resize-none selection:bg-blue-600 selection:text-white"
              style={{ minHeight: '380px' }}
            />
          </div>

          {/* Side Helper / Quick Templates */}
          <div className="w-full md:w-72 border-t md:border-t-0 md:border-l border-slate-800 p-4 bg-slate-900/60 overflow-y-auto space-y-4 text-xs">
            <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              Document Metadata
            </div>
            <div className="space-y-1.5 text-slate-300 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Storage Location:</span>
                <span className="text-slate-300">Workspace Documents</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Format:</span>
                <span className="text-cyan-400 font-mono">Markdown / Text</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="text-emerald-400 font-semibold">Active Draft</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                Insert Template Clauses
              </div>
              <button
                type="button"
                onClick={() =>
                  setContent(
                    (prev) =>
                      prev +
                      '\n\n### Confidentiality & Non-Disclosure Clause\nBoth parties agree to hold all proprietary technical specifications, trade secrets, algorithms, and source materials in strict confidence for a period of five (5) years from the effective date of disclosure.'
                  )
                }
                className="w-full text-left p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer text-[11px]"
              >
                + Confidentiality Clause
              </button>
              <button
                type="button"
                onClick={() =>
                  setContent(
                    (prev) =>
                      prev +
                      '\n\n### Intellectual Property Ownership\nAll algorithms, source code, data architectures, and derived artifacts created hereunder shall remain the exclusive intellectual property of the author, with zero implied transfer of underlying patent or copyright rights.'
                  )
                }
                className="w-full text-left p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer text-[11px]"
              >
                + IP Ownership Clause
              </button>
              <button
                type="button"
                onClick={() =>
                  setContent(
                    (prev) =>
                      prev +
                      '\n\n### Governing Law & Dispute Resolution\nThis agreement shall be construed and governed in accordance with applicable laws, with disputes submitted to binding arbitration.'
                  )
                }
                className="w-full text-left p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer text-[11px]"
              >
                + Governing Law Clause
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
