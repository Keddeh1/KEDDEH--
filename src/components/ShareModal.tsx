import React, { useState } from 'react';
import {
  Share2,
  X,
  Copy,
  Check,
  Globe,
  Lock,
  UserCheck,
  Shield,
  Link as LinkIcon
} from 'lucide-react';
import { FileItem } from '../types';

interface ShareModalProps {
  file: FileItem | null;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ file, onClose }) => {
  const [accessLevel, setAccessLevel] = useState<'public' | 'restricted' | 'password'>('public');
  const [copied, setCopied] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [sharedEmails, setSharedEmails] = useState<string[]>(file?.sharedWith || ['team@company.com']);

  if (!file) return null;

  const shareableUrl = file.webViewLink || `https://storage-space.vault/share/${file.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    if (!sharedEmails.includes(newEmail.trim())) {
      setSharedEmails([...sharedEmails, newEmail.trim()]);
    }
    setNewEmail('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5 animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/15 border border-blue-500/30 text-blue-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Share File Access</h2>
              <p className="text-xs text-slate-400 truncate max-w-xs">{file.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Link Copy Box */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-blue-400" />
            <span>Vault Shareable Link:</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareableUrl}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Access Permissions */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300">General Permission</label>
          <div className="space-y-2">
            <button
              onClick={() => setAccessLevel('public')}
              className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                accessLevel === 'public'
                  ? 'bg-blue-950/40 border-blue-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Globe className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold">Anyone with the link</p>
                <p className="text-[11px] text-slate-400">Anyone on the web with this link can view & download.</p>
              </div>
            </button>

            <button
              onClick={() => setAccessLevel('restricted')}
              className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                accessLevel === 'restricted'
                  ? 'bg-blue-950/40 border-blue-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold">Restricted Access</p>
                <p className="text-[11px] text-slate-400">Only invited users with granted emails can open this file.</p>
              </div>
            </button>
          </div>
        </div>

        {/* Invite People */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <label className="text-xs font-medium text-slate-300">Invite Collaborators</label>
          <form onSubmit={handleAddEmail} className="flex gap-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer shrink-0"
            >
              Invite
            </button>
          </form>

          <div className="space-y-1.5 pt-1">
            {sharedEmails.map((email) => (
              <div
                key={email}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300"
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{email}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Can View</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
