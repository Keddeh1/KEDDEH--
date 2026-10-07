import React from 'react';
import {
  Image as ImageIcon,
  FileText,
  Video,
  Music,
  Archive,
  Code,
  HardDrive,
  File
} from 'lucide-react';
import { FileCategory } from '../types';
import { CATEGORY_CONFIG } from '../data/VfsInitialSubstrate';

interface AssetCategoryVisualizerProps {
  category: FileCategory;
  className?: string;
}

export const AssetCategoryVisualizer: React.FC<AssetCategoryVisualizerProps> = ({ category, className = 'w-5 h-5' }) => {
  switch (category) {
    case 'images':
      return <ImageIcon className={`${className} text-blue-400`} />;
    case 'documents':
      return <FileText className={`${className} text-emerald-400`} />;
    case 'videos':
      return <Video className={`${className} text-purple-400`} />;
    case 'audio':
      return <Music className={`${className} text-amber-400`} />;
    case 'archives':
      return <Archive className={`${className} text-pink-400`} />;
    case 'code':
      return <Code className={`${className} text-cyan-400`} />;
    case 'other':
    default:
      return <HardDrive className={`${className} text-slate-400`} />;
  }
};

export const CategoryBadge: React.FC<{ category: FileCategory }> = ({ category }) => {
  const cfg = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border"
      style={{
        backgroundColor: `${cfg.color}15`,
        borderColor: `${cfg.color}35`,
        color: cfg.color,
      }}
    >
      <AssetCategoryVisualizer category={category} className="w-3 h-3" />
      <span>{cfg.label.split(' ')[0]}</span>
    </span>
  );
};
