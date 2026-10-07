import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Cpu,
  Terminal,
  Activity,
  Zap,
  Play,
  Square,
  BarChart3,
  Shield,
  Layers,
  Code,
  ArrowRight,
  Database,
  Search,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Hash,
  Server
} from 'lucide-react';
import { FileItem, FolderItem, GoogleDriveUser } from '../../types';
import { GLOBAL_SOLO_MINING_ENGINE, MiningEngineState } from '../../services/AutonomousSoloMiningSubstrate';

interface HomeDashboardProps {
  files: FileItem[];
  folders: FolderItem[];
  onOpenFilePreview: (file: FileItem) => void;
  onOpenUpload: () => void;
  onOpenCreateFolder: () => void;
  onOpenStoragePlan: () => void;
  onUpdateFiles: (newFiles: FileItem[]) => void;
  isDriveConnected?: boolean;
  driveUser?: GoogleDriveUser | null;
  onConnectDrive?: () => void;
}

interface MiningParams {
  version: number;
  prev_block_hash: string;
  merkle_root: string;
  timestamp: number;
  bits: number;
  target_hex: string;
  start_nonce: number;
  chunk_size: number;
}

import { BrainkNeuralFabric } from '../substrate/BrainkNeuralFabric';

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  files,
  onOpenFilePreview,
}) => {
  return (
    <div className="flex flex-col h-full bg-slate-950 p-6 overflow-y-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Workspace</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-white mb-4">Recent Files</h2>
            <div className="space-y-2">
              {files.filter(f => !f.inTrash).slice(0, 5).map(file => (
                <div 
                  key={file.id} 
                  onClick={() => onOpenFilePreview(file)}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 cursor-pointer flex items-center gap-3 transition-colors"
                >
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span className="text-xs text-slate-300">{file.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-white mb-4">Braink Agent</h2>
            <div className="text-xs text-slate-400 mb-4">Agent is active and monitoring workspace tasks...</div>
            <BrainkNeuralFabric sramSnapshot={"00".repeat(5120+64*20)} activeLanes={5} />
          </div>
        </div>
      </div>
    </div>
  );
};
