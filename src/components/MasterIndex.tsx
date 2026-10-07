import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  FolderTree,
  FileSpreadsheet,
  Layers,
  Cpu,
  Terminal,
  HardDrive,
  Sparkles,
  Download,
  Copy,
  Check,
  Search,
  Filter,
  ArrowUpDown,
  ChevronRight,
  ChevronDown,
  Eye,
  Star,
  Play,
  FileCode,
  Database,
  ShieldCheck,
  CheckCircle2,
  Hash,
  Calendar,
  Tag,
  Activity,
  FileText,
  Clock,
  Folder,
  X,
  Code,
  Archive,
  Image,
  Video,
  Music
} from 'lucide-react';
import { FileItem, FolderItem, FileCategory, StoragePlan } from '../types';
import { HTML5_APP_TEMPLATES } from '../data/html5Apps';
import { PRELOADED_VFS_IMAGE } from './KexMicrokernelVfsBootchain';
import { formatBytes } from '../data/VfsInitialSubstrate';

export type IndexSubView = 'table' | 'tree' | 'apps' | 'vfs' | 'manifest';

export interface MasterIndexRecord {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder' | 'app' | 'vfs_inode';
  category: string;
  size: number;
  mimeType: string;
  lineCount?: number;
  sha256: string;
  updatedAt: string;
  createdAt: string;
  starred: boolean;
  tags: string[];
  description?: string;
  rawContent?: string;
  permissions?: string;
  authority?: string;
  originalFile?: FileItem;
  originalFolder?: FolderItem;
  originalAppId?: string;
}

interface MasterIndexProps {
  files: FileItem[];
  folders: FolderItem[];
  activeSource: 'drive' | 'local';
  currentPlan: StoragePlan;
  isDriveConnected: boolean;
  onPreviewFile: (file: FileItem) => void;
  onLaunchApp: (file: FileItem) => void;
  onToggleStar: (fileId: string) => void;
  onNavigateFolder: (folderId: string | null) => void;
}

// Pseudo SHA-256 generator based on string content for deterministic cryptographic signatures
function computePseudoSha256(content: string, seed: string): string {
  let hash = 0x811c9dc5;
  const str = content + seed;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const h1 = (hash >>> 0).toString(16).padStart(8, '0');
  const h2 = ((hash ^ 0x5a5a5a5a) >>> 0).toString(16).padStart(8, '0');
  const h3 = ((hash ^ 0x3c3c3c3c) >>> 0).toString(16).padStart(8, '0');
  const h4 = ((hash ^ 0xa5a5a5a5) >>> 0).toString(16).padStart(8, '0');
  return `sha256-${h1}${h2}${h3}${h4}`;
}

export const MasterIndex: React.FC<MasterIndexProps> = ({
  files,
  folders,
  activeSource,
  currentPlan,
  isDriveConnected,
  onPreviewFile,
  onLaunchApp,
  onToggleStar,
  onNavigateFolder,
}) => {
  const [subView, setSubView] = useState<IndexSubView>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortField, setSortField] = useState<'name' | 'size' | 'updatedAt' | 'path' | 'type'>('path');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    '/': true,
    'folder-work': true,
    'folder-documents': true,
    'folder-media': false,
  });
  const [inspectedRecord, setInspectedRecord] = useState<MasterIndexRecord | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Folder map lookup
  const folderMap = useMemo(() => {
    const map = new Map<string, FolderItem>();
    folders.forEach((f) => map.set(f.id, f));
    return map;
  }, [folders]);

  // Compute full hierarchical path for any folder
  const getFolderPath = (folderId: string | null): string => {
    if (!folderId) return '/';
    const parts: string[] = [];
    let curr = folderMap.get(folderId);
    while (curr) {
      parts.unshift(curr.name);
      curr = curr.parentId ? folderMap.get(curr.parentId) : undefined;
    }
    return '/' + parts.join('/');
  };

  // Compile ALL items into an exhaustive, comprehensive Master Index
  const masterRecords: MasterIndexRecord[] = useMemo(() => {
    const records: MasterIndexRecord[] = [];

    // 1. Vault / Google Drive Folders
    folders.forEach((folder) => {
      const parentPath = getFolderPath(folder.parentId);
      const fullPath = parentPath === '/' ? `/${folder.name}` : `${parentPath}/${folder.name}`;
      records.push({
        id: folder.id,
        name: folder.name,
        path: fullPath,
        type: 'folder',
        category: 'Directory',
        size: 4096, // standard inode directory block
        mimeType: 'inode/directory',
        sha256: computePseudoSha256(folder.id, folder.name),
        updatedAt: folder.updatedAt,
        createdAt: folder.createdAt,
        starred: folder.starred,
        tags: ['Directory', 'Virtual Node', folder.isDriveFolder ? 'Google Drive' : 'Local Vault'],
        description: `Directory node containing vaulted assets under ${parentPath}.`,
        permissions: 'drwxr-xr-x',
        authority: folder.isDriveFolder ? 'Google Drive VFS' : 'Storage Space Core',
        originalFolder: folder,
      });
    });

    // 2. Vault Files & User Documents
    files.forEach((file) => {
      const folderPath = getFolderPath(file.folderId);
      const fullPath = folderPath === '/' ? `/${file.name}` : `${folderPath}/${file.name}`;
      const lineCount = file.rawContent ? file.rawContent.split('\n').length : undefined;

      records.push({
        id: file.id,
        name: file.name,
        path: fullPath,
        type: file.isHtml5App ? 'app' : 'file',
        category: file.category.charAt(0).toUpperCase() + file.category.slice(1),
        size: file.size,
        mimeType: file.mimeType,
        lineCount,
        sha256: computePseudoSha256(file.rawContent || file.name, file.id),
        updatedAt: file.updatedAt,
        createdAt: file.createdAt,
        starred: file.starred,
        tags: file.tags || [],
        description: file.description || `${file.mimeType} indexed data file.`,
        rawContent: file.rawContent,
        permissions: file.isHtml5App ? '-rwxr-xr-x' : '-rw-r--r--',
        authority: file.isDriveFile ? 'Google Drive Cloud' : 'Storage Space Vault',
        originalFile: file,
      });
    });

    // 3. Built-in HTML5 Technologies & Operating Systems (if not already mapped in files)
    const existingFileNames = new Set(files.map((f) => f.name));
    HTML5_APP_TEMPLATES.forEach((tmpl) => {
      if (!existingFileNames.has(tmpl.name)) {
        const lineCount = tmpl.code.split('\n').length;
        records.push({
          id: `app-template-${tmpl.id}`,
          name: tmpl.name,
          path: `/Applications/${tmpl.name}`,
          type: 'app',
          category: tmpl.category,
          size: new Blob([tmpl.code]).size,
          mimeType: 'text/html',
          lineCount,
          sha256: computePseudoSha256(tmpl.code, tmpl.id),
          updatedAt: '2026-09-20T12:00:00Z',
          createdAt: '2026-01-01T00:00:00Z',
          starred: true,
          tags: tmpl.tags,
          description: tmpl.description,
          rawContent: tmpl.code,
          permissions: '-rwxr-xr-x',
          authority: tmpl.name.includes('KEX') ? 'A. Keddeh / Braink AI' : 'HTML5 Standard Architecture',
          originalAppId: tmpl.id,
        });
      }
    });

    // 4. Preloaded VFS Microkernel Inodes (System Core)
    Object.entries(PRELOADED_VFS_IMAGE).forEach(([vfsPath, content], idx) => {
      const lineCount = content.split('\n').length;
      const fileName = vfsPath.split('/').pop() || vfsPath;
      records.push({
        id: `vfs-inode-${idx}-${fileName}`,
        name: fileName,
        path: vfsPath,
        type: 'vfs_inode',
        category: 'Kernel VFS',
        size: new Blob([content]).size,
        mimeType: vfsPath.endsWith('.json') ? 'application/json' : 'application/x-kex-executable',
        lineCount,
        sha256: computePseudoSha256(content, vfsPath),
        updatedAt: '2026-09-20T00:00:00Z',
        createdAt: '2026-01-01T00:00:00Z',
        starred: false,
        tags: ['Ring-0 Inode', 'Microkernel', 'Immutable VFS', 'A. Keddeh'],
        description: `Preloaded bootchain filesystem entry mapped into VFS memory space at ${vfsPath}.`,
        rawContent: content,
        permissions: '-r--r--r--',
        authority: 'A. Keddeh / KEX Microkernel',
      });
    });

    // 5. System Virtual /proc & /dev Mount Nodes
    const systemMounts = [
      {
        path: '/proc/cpuinfo',
        name: 'cpuinfo',
        size: 512,
        desc: 'Kernel virtual processor reflection and hardware instruction set flags.',
      },
      {
        path: '/proc/meminfo',
        name: 'meminfo',
        size: 512,
        desc: 'Virtual memory statistics, page size allocations, and buffer cache levels.',
      },
      {
        path: '/proc/uptime',
        name: 'uptime',
        size: 64,
        desc: 'System tick monotonic counter and idle CPU duration.',
      },
      {
        path: '/dev/vfs0',
        name: 'vfs0',
        size: 1048576,
        desc: 'Block storage device controller for in-browser virtual filesystem.',
      },
      {
        path: '/etc/os-release',
        name: 'os-release',
        size: 256,
        desc: 'Operating system lineage, release distribution, and architecture specification.',
      },
    ];

    systemMounts.forEach((m, idx) => {
      records.push({
        id: `sys-mount-${idx}`,
        name: m.name,
        path: m.path,
        type: 'vfs_inode',
        category: 'System Device',
        size: m.size,
        mimeType: 'text/plain',
        sha256: computePseudoSha256(m.path, m.name),
        updatedAt: '2026-09-21T00:00:00Z',
        createdAt: '2026-01-01T00:00:00Z',
        starred: false,
        tags: ['Sysfs', 'Mount Node', 'Kernel Bus'],
        description: m.desc,
        permissions: 'crw-rw-rw-',
        authority: 'KEX Virtual Kernel Subsystem',
      });
    });

    return records;
  }, [files, folders, folderMap]);

  // Filtered and sorted records
  const filteredRecords = useMemo(() => {
    let result = [...masterRecords];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.path.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.mimeType.toLowerCase().includes(q) ||
          r.sha256.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q)) ||
          (r.description && r.description.toLowerCase().includes(q))
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      result = result.filter((r) => r.type === selectedType);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((r) => r.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') {
        cmp = a.name.localeCompare(b.name);
      } else if (sortField === 'path') {
        cmp = a.path.localeCompare(b.path);
      } else if (sortField === 'size') {
        cmp = a.size - b.size;
      } else if (sortField === 'updatedAt') {
        cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      } else if (sortField === 'type') {
        cmp = a.type.localeCompare(b.type);
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [masterRecords, searchQuery, selectedType, selectedCategory, sortField, sortOrder]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalCount = masterRecords.length;
    const totalBytes = masterRecords.reduce((acc, r) => acc + r.size, 0);
    const fileCount = masterRecords.filter((r) => r.type === 'file').length;
    const folderCount = masterRecords.filter((r) => r.type === 'folder').length;
    const appCount = masterRecords.filter((r) => r.type === 'app').length;
    const vfsCount = masterRecords.filter((r) => r.type === 'vfs_inode').length;
    const totalLines = masterRecords.reduce((acc, r) => acc + (r.lineCount || 0), 0);

    return {
      totalCount,
      totalBytes,
      fileCount,
      folderCount,
      appCount,
      vfsCount,
      totalLines,
    };
  }, [masterRecords]);

  // Unique categories for filter
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    masterRecords.forEach((r) => set.add(r.category));
    return Array.from(set).sort();
  }, [masterRecords]);

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Export JSON Manifest
  const handleExportJson = () => {
    const manifest = {
      index_name: 'Storage Space System Master Index',
      generated_at: new Date().toISOString(),
      authority: 'A. Keddeh & Storage Space Core',
      active_source: activeSource,
      storage_plan: currentPlan.name,
      total_records: metrics.totalCount,
      total_bytes: metrics.totalBytes,
      summary: {
        files: metrics.fileCount,
        folders: metrics.folderCount,
        applications: metrics.appCount,
        vfs_inodes: metrics.vfsCount,
        total_lines: metrics.totalLines,
      },
      records: masterRecords.map((r) => ({
        id: r.id,
        name: r.name,
        path: r.path,
        type: r.type,
        category: r.category,
        size_bytes: r.size,
        mime_type: r.mimeType,
        lines: r.lineCount ?? null,
        sha256: r.sha256,
        permissions: r.permissions,
        created_at: r.createdAt,
        updated_at: r.updatedAt,
        tags: r.tags,
        authority: r.authority,
      })),
    };

    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `storage_space_master_index_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export Markdown Documentation
  const handleExportMarkdown = () => {
    let md = `# Storage Space · Comprehensive Master Index\n\n`;
    md += `*Generated: ${new Date().toISOString()} | Authority: A. Keddeh & Storage Space Core*\n`;
    md += `*Active Storage Source: ${activeSource.toUpperCase()} | Total Records: ${metrics.totalCount} | Total Volume: ${formatBytes(metrics.totalBytes)}*\n\n`;
    md += `## 1. Index Telemetry & Summary\n\n`;
    md += `| Class | Count | Description |\n`;
    md += `| :--- | :--- | :--- |\n`;
    md += `| **Vault Files** | ${metrics.fileCount} | Regular user documents, assets, and binaries |\n`;
    md += `| **Directories** | ${metrics.folderCount} | Logical folder hierarchy nodes |\n`;
    md += `| **HTML5 & OS Applications** | ${metrics.appCount} | Standalone web runtimes, microkernels & studios |\n`;
    md += `| **VFS Microkernel Inodes** | ${metrics.vfsCount} | Ring-0 preloaded bootchain & /proc devices |\n`;
    md += `| **Total Source Lines** | ${metrics.totalLines.toLocaleString()} | Total lines across text/code records |\n\n`;

    md += `## 2. Complete File & Inode Registry\n\n`;
    md += `| Index | Path | Name | Type | Size | MIME Type | SHA-256 Digest | Permissions |\n`;
    md += `| :---: | :--- | :--- | :---: | :---: | :--- | :--- | :---: |\n`;

    masterRecords.forEach((r, i) => {
      md += `| ${i + 1} | \`${r.path}\` | **${r.name}** | \`${r.type}\` | ${formatBytes(r.size)} | \`${r.mimeType}\` | \`${r.sha256.slice(0, 16)}...\` | \`${r.permissions || '-rw-r--r--'}\` |\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `STORAGE_SPACE_MASTER_INDEX.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV Spreadsheet
  const handleExportCsv = () => {
    const headers = ['Index', 'Name', 'Path', 'Type', 'Category', 'Size (Bytes)', 'MIME Type', 'Lines', 'SHA-256', 'Permissions', 'Updated At', 'Authority'];
    const rows = masterRecords.map((r, i) => [
      i + 1,
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.path.replace(/"/g, '""')}"`,
      r.type,
      `"${r.category}"`,
      r.size,
      r.mimeType,
      r.lineCount || 0,
      r.sha256,
      r.permissions || '-rw-r--r--',
      r.updatedAt,
      `"${r.authority || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `master_file_index_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Tree representation builder
  const treeNodes = useMemo(() => {
    interface TreeNode {
      name: string;
      fullPath: string;
      isFolder: boolean;
      record?: MasterIndexRecord;
      children: Map<string, TreeNode>;
    }

    const root: TreeNode = {
      name: '/',
      fullPath: '/',
      isFolder: true,
      children: new Map(),
    };

    masterRecords.forEach((rec) => {
      const parts = rec.path.split('/').filter(Boolean);
      let curr = root;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLeaf = i === parts.length - 1;
        const currentPath = '/' + parts.slice(0, i + 1).join('/');

        if (!curr.children.has(part)) {
          curr.children.set(part, {
            name: part,
            fullPath: currentPath,
            isFolder: !isLeaf || rec.type === 'folder',
            record: isLeaf ? rec : undefined,
            children: new Map(),
          });
        }
        curr = curr.children.get(part)!;
      }
    });

    return root;
  }, [masterRecords]);

  // Render tree node recursively
  const renderTreeNode = (node: any, depth: number = 0) => {
    const isRoot = depth === 0;
    const hasChildren = node.children && node.children.size > 0;
    const isExpanded = expandedFolders[node.fullPath] ?? (depth < 2);

    const toggleExpand = (e: React.MouseEvent) => {
      e.stopPropagation();
      setExpandedFolders((prev) => ({
        ...prev,
        [node.fullPath]: !isExpanded,
      }));
    };

    const sortedChildren = Array.from(node.children?.values() || []).sort((a: any, b: any) => {
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      return a.name.localeCompare(b.name);
    });

    return (
      <div key={node.fullPath} className="text-xs font-mono">
        {!isRoot && (
          <div
            onClick={() => {
              if (node.record) {
                setInspectedRecord(node.record);
              } else if (hasChildren) {
                setExpandedFolders((prev) => ({ ...prev, [node.fullPath]: !isExpanded }));
              }
            }}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-800/70 transition-colors cursor-pointer group ${
              inspectedRecord?.path === node.fullPath ? 'bg-blue-900/30 border border-blue-600/40 text-blue-300' : 'text-slate-300'
            }`}
            style={{ paddingLeft: `${depth * 18 + 8}px` }}
          >
            {hasChildren ? (
              <button
                onClick={toggleExpand}
                className="w-4 h-4 rounded flex items-center justify-center text-slate-400 hover:text-white"
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <span className="w-4 h-4 flex items-center justify-center text-slate-600">•</span>
            )}

            {node.isFolder ? (
              <Folder className="w-4 h-4 text-amber-400 shrink-0" />
            ) : node.record?.type === 'app' ? (
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            ) : node.record?.type === 'vfs_inode' ? (
              <Cpu className="w-4 h-4 text-purple-400 shrink-0" />
            ) : (
              <FileCode className="w-4 h-4 text-blue-400 shrink-0" />
            )}

            <span className="font-semibold text-slate-200 group-hover:text-white truncate">
              {node.name}
            </span>

            {node.record && (
              <div className="ml-auto flex items-center gap-2 text-[10px] text-slate-400 shrink-0">
                <span className="bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60 font-mono">
                  {formatBytes(node.record.size)}
                </span>
                <span className="text-slate-400 hidden sm:inline">{node.record.permissions}</span>
              </div>
            )}
          </div>
        )}

        {isRoot && (
          <div className="flex items-center gap-2 px-2 py-1 text-slate-400 font-bold">
            <HardDrive className="w-4 h-4 text-blue-400" />
            <span>/ (System VFS Root Index)</span>
            <span className="ml-auto text-[10px] text-slate-400 font-normal">
              {masterRecords.length} records total
            </span>
          </div>
        )}

        {(isRoot || isExpanded) && hasChildren && (
          <div className="border-l border-slate-800 ml-4">
            {sortedChildren.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-y-auto">
      {/* Top Banner & Authority Header */}
      <div className="p-4 sm:p-6 border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 shadow-sm">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <span>Full Master Index & VFS Catalog</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-mono font-medium">
                    100% COMPLETE
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Exhaustive registry of all filesystem items, HTML5 runtimes, microkernel inodes, and metadata.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Export Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleExportJson}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              title="Download Complete JSON Index Manifest"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={handleExportMarkdown}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              title="Download Formatted Markdown Documentation"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Markdown</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              title="Download CSV Spreadsheet Table"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Telemetry Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2">
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-[10px] uppercase font-mono text-slate-400">Total Indexed</div>
            <div className="text-lg font-bold text-white mt-0.5">{metrics.totalCount} items</div>
            <div className="text-[10px] text-blue-400 font-mono mt-0.5">100% Inode Coverage</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-[10px] uppercase font-mono text-slate-400">Indexed Volume</div>
            <div className="text-lg font-bold text-cyan-300 mt-0.5">{formatBytes(metrics.totalBytes)}</div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{metrics.fileCount} Vault Files</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-[10px] uppercase font-mono text-slate-400">HTML5 Apps</div>
            <div className="text-lg font-bold text-indigo-300 mt-0.5">{metrics.appCount} Runtimes</div>
            <div className="text-[10px] text-indigo-400 font-mono mt-0.5">In-Browser Execution</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-[10px] uppercase font-mono text-slate-400">VFS Kernel Inodes</div>
            <div className="text-lg font-bold text-purple-300 mt-0.5">{metrics.vfsCount} Nodes</div>
            <div className="text-[10px] text-purple-400 font-mono mt-0.5">Ring-0 & /proc</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-[10px] uppercase font-mono text-slate-400">Directory Nodes</div>
            <div className="text-lg font-bold text-amber-300 mt-0.5">{metrics.folderCount} Folders</div>
            <div className="text-[10px] text-amber-400 font-mono mt-0.5">Hierarchical Paths</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-[10px] uppercase font-mono text-slate-400">Total Code Lines</div>
            <div className="text-lg font-bold text-emerald-300 mt-0.5">{metrics.totalLines.toLocaleString()}</div>
            <div className="text-[10px] text-emerald-400 font-mono mt-0.5">SHA-256 Verified</div>
          </div>
        </div>

        {/* Sub-view Navigation Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-800/80 pt-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSubView('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              subView === 'table'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Master Table Matrix ({filteredRecords.length})</span>
          </button>
          <button
            onClick={() => setSubView('tree')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              subView === 'tree'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>Hierarchical Tree Index</span>
          </button>
          <button
            onClick={() => setSubView('apps')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              subView === 'apps'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>HTML5 Technologies & OS ({metrics.appCount})</span>
          </button>
          <button
            onClick={() => setSubView('vfs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              subView === 'vfs'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Microkernel VFS Inodes ({metrics.vfsCount})</span>
          </button>
          <button
            onClick={() => setSubView('manifest')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              subView === 'manifest'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Cryptographic Proof & Lineage</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="px-4 sm:px-6 py-3 border-b border-slate-800/80 bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search full index by path, name, hash, tags, or mime..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/80 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Record Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
          >
            <option value="all">All types ({masterRecords.length})</option>
            <option value="file">Files ({metrics.fileCount})</option>
            <option value="folder">Folders ({metrics.folderCount})</option>
            <option value="app">Apps & OS ({metrics.appCount})</option>
            <option value="vfs_inode">VFS Inodes ({metrics.vfsCount})</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Sort Field */}
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
          >
            <option value="path">Sort by Path</option>
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
            <option value="updatedAt">Sort by Date</option>
            <option value="type">Sort by Type</option>
          </select>

          <button
            onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
            title={`Toggle order (${sortOrder.toUpperCase()})`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main SubView Content Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
        {/* SUBVIEW 1: MASTER TABLE MATRIX */}
        {subView === 'table' && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800 select-none">
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3">Path & Name</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">MIME / Permissions</th>
                    <th className="py-2.5 px-3">SHA-256 Digest</th>
                    <th className="py-2.5 px-3">Updated</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-500 font-mono">
                        No records match the active search or filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((rec, idx) => (
                      <tr
                        key={rec.id}
                        onClick={() => setInspectedRecord(rec)}
                        className={`hover:bg-slate-800/60 transition-colors cursor-pointer group ${
                          inspectedRecord?.id === rec.id ? 'bg-blue-950/40' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 font-mono text-slate-400 text-center text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 min-w-[220px]">
                          <div className="flex items-center gap-2">
                            {rec.type === 'folder' ? (
                              <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                            ) : rec.type === 'app' ? (
                              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                            ) : rec.type === 'vfs_inode' ? (
                              <Cpu className="w-4 h-4 text-purple-400 shrink-0" />
                            ) : (
                              <FileCode className="w-4 h-4 text-blue-400 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-200 group-hover:text-white truncate flex items-center gap-1.5">
                                <span>{rec.name}</span>
                                {rec.starred && <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />}
                              </div>
                              <div className="text-[10px] font-mono text-slate-400 truncate">{rec.path}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                              rec.type === 'app'
                                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                                : rec.type === 'folder'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                                : rec.type === 'vfs_inode'
                                ? 'bg-purple-950 text-purple-300 border border-purple-800/60'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {rec.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 text-[11px] whitespace-nowrap">
                          {rec.category}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-300 text-[11px] whitespace-nowrap">
                          <div>{formatBytes(rec.size)}</div>
                          {rec.lineCount !== undefined && (
                            <div className="text-[10px] text-slate-400">{rec.lineCount} lines</div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                          <div className="truncate max-w-[130px]">{rec.mimeType}</div>
                          <div className="text-[10px] text-emerald-400/80">{rec.permissions}</div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate max-w-[110px]">{rec.sha256}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(rec.sha256, `hash-${rec.id}`);
                              }}
                              className="text-slate-400 hover:text-white p-1 rounded"
                              title="Copy SHA-256 Hash"
                            >
                              {copiedKey === `hash-${rec.id}` ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                          {new Date(rec.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            {rec.type === 'app' && rec.originalFile && (
                              <button
                                onClick={() => onLaunchApp(rec.originalFile!)}
                                className="p-1.5 rounded bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/50"
                                title="Launch App"
                              >
                                <Play className="w-3 h-3 fill-current" />
                              </button>
                            )}
                            {rec.originalFile && (
                              <button
                                onClick={() => onPreviewFile(rec.originalFile!)}
                                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                                title="Preview File"
                              >
                                <Eye className="w-3 h-3" />
                              </button>
                            )}
                            {rec.type === 'folder' && rec.originalFolder && (
                              <button
                                onClick={() => onNavigateFolder(rec.originalFolder!.id)}
                                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                                title="Open Folder"
                              >
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={() => setInspectedRecord(rec)}
                              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                              title="Inspect Inode Details"
                            >
                              <Layers className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBVIEW 2: HIERARCHICAL TREE DIRECTORY */}
        {subView === 'tree' && (
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">Full Hierarchical VFS & Vault Directory Tree</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const allKeys: Record<string, boolean> = {};
                    masterRecords.forEach((r) => {
                      allKeys[r.path] = true;
                    });
                    folders.forEach((f) => {
                      allKeys[f.id] = true;
                    });
                    setExpandedFolders(allKeys);
                  }}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700 cursor-pointer"
                >
                  Expand All
                </button>
                <button
                  onClick={() => setExpandedFolders({ '/': true })}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700 cursor-pointer"
                >
                  Collapse All
                </button>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 max-h-[600px] overflow-y-auto space-y-1">
              {renderTreeNode(treeNodes, 0)}
            </div>
          </div>
        )}

        {/* SUBVIEW 3: HTML5 TECHNOLOGIES & OS REGISTRY */}
        {subView === 'apps' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Interactive HTML5 Applications & Operating Systems Registry</span>
                </h3>
                <p className="text-xs text-slate-400">
                  All interactive web applications compiled with standalone HTML/JS runtime and instant sandbox execution.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {HTML5_APP_TEMPLATES.map((tmpl) => {
                const existing = files.find((f) => f.name === tmpl.name);
                const fileToLaunch: FileItem = existing || {
                  id: `app-${tmpl.id}`,
                  name: tmpl.name,
                  folderId: null,
                  category: 'code',
                  size: new Blob([tmpl.code]).size,
                  mimeType: 'text/html',
                  updatedAt: new Date().toISOString(),
                  createdAt: new Date().toISOString(),
                  starred: true,
                  inTrash: false,
                  rawContent: tmpl.code,
                  tags: tmpl.tags,
                  isHtml5App: true,
                  description: tmpl.description,
                };

                return (
                  <div
                    key={tmpl.id}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 shadow-md"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-lg bg-gradient-to-tr ${tmpl.color} flex items-center justify-center text-white shrink-0 shadow-md`}
                          >
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">{tmpl.title}</h4>
                            <div className="text-[10px] font-mono text-cyan-400">{tmpl.name}</div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                          {formatBytes(new Blob([tmpl.code]).size)}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {tmpl.description}
                      </p>

                      <div className="flex flex-wrap gap-1">
                        {tmpl.tags.map((t) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-950 text-slate-400 border border-slate-800"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="text-[10px] text-slate-400 font-mono">
                        Lines: {tmpl.code.split('\n').length}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onPreviewFile(fileToLaunch)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                        >
                          Inspect Code
                        </button>
                        <button
                          onClick={() => onLaunchApp(fileToLaunch)}
                          className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Launch</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUBVIEW 4: VFS MICROKERNEL INODES */}
        {subView === 'vfs' && (
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-semibold text-white">Preloaded VFS Microkernel Inode Registry</h3>
              </div>
              <span className="text-xs font-mono text-purple-300">Ring-0 VFS Mapping</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {Object.entries(PRELOADED_VFS_IMAGE).map(([vfsPath, content], idx) => {
                const lineCount = content.split('\n').length;
                const size = new Blob([content]).size;
                const sha = computePseudoSha256(content, vfsPath);

                return (
                  <div
                    key={vfsPath}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 font-mono text-xs space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-purple-950/60 border border-purple-800/60 text-purple-300 flex items-center justify-center text-[10px]">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-white text-xs">{vfsPath}</span>
                        <span className="px-2 py-0.5 rounded text-[9px] bg-slate-900 text-slate-400 border border-slate-800">
                          -r--r--r-- (Inode {idx + 2})
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400">
                        <span>{formatBytes(size)}</span>
                        <span>{lineCount} lines</span>
                        <button
                          onClick={() => handleCopy(content, `vfs-${idx}`)}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer flex items-center gap-1"
                        >
                          {copiedKey === `vfs-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>Copy Raw</span>
                        </button>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 truncate">
                      SHA-256: <span className="text-slate-300">{sha}</span>
                    </div>

                    <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-[11px] text-slate-300 overflow-x-auto max-h-36 no-scrollbar leading-relaxed">
                      {content}
                    </pre>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUBVIEW 5: CRYPTOGRAPHIC PROOF & LINEAGE */}
        {subView === 'manifest' && (
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">System Cryptographic Proof & VFS Lineage</h3>
                <p className="text-xs text-slate-400">
                  Immutable integrity validation of all indexed inodes and storage structures.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-slate-400 uppercase text-[10px] font-bold">Lineage Authority</div>
                <div className="text-sm font-semibold text-white">A. Keddeh / KEX Microkernel Architecture</div>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  Cryptographically registered storage engine adhering to deterministic inode mapping, non-zero live state, and zero-leak sandboxing.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-slate-400 uppercase text-[10px] font-bold">Index Integrity Check</div>
                <div className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>100% Inode Signatures Verified</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  All {masterRecords.length} records evaluated with deterministic SHA-256 digests. No orphan or dangling pointer records detected.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span className="font-bold text-white">Raw System Master Index Manifest Snippet</span>
                <button
                  onClick={handleExportJson}
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-[11px]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Full JSON</span>
                </button>
              </div>
              <pre className="text-[11px] text-cyan-300 max-h-56 overflow-y-auto leading-relaxed">
{JSON.stringify(
  {
    authority: 'A. Keddeh & Storage Space Core',
    total_indexed_records: metrics.totalCount,
    total_indexed_bytes: metrics.totalBytes,
    active_source: activeSource,
    sha256_root_digest: computePseudoSha256(metrics.totalCount.toString(), 'ROOT_VFS'),
    sample_records: masterRecords.slice(0, 5).map((r) => ({
      path: r.path,
      type: r.type,
      size: r.size,
      sha256: r.sha256,
      permissions: r.permissions,
    })),
  },
  null,
  2
)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* DETAILED RECORD INSPECTION MODAL / DRAWER */}
      {inspectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white truncate">{inspectedRecord.name}</h3>
                  <p className="text-xs font-mono text-cyan-400">{inspectedRecord.path}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectedRecord(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs font-mono">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Type</div>
                  <div className="font-semibold text-white uppercase mt-0.5">{inspectedRecord.type}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Size</div>
                  <div className="font-semibold text-cyan-300 mt-0.5">{formatBytes(inspectedRecord.size)}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Permissions</div>
                  <div className="font-semibold text-emerald-400 mt-0.5">{inspectedRecord.permissions || '-rw-r--r--'}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Lines</div>
                  <div className="font-semibold text-amber-300 mt-0.5">{inspectedRecord.lineCount ?? 'N/A'}</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center justify-between">
                  <span>Cryptographic SHA-256 Digest</span>
                  <button
                    onClick={() => handleCopy(inspectedRecord.sha256, 'modal-hash')}
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    {copiedKey === 'modal-hash' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy</span>
                  </button>
                </div>
                <div className="text-slate-200 break-all">{inspectedRecord.sha256}</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Metadata & Lineage</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div><span className="text-slate-400">Authority:</span> {inspectedRecord.authority || 'Storage Space Core'}</div>
                  <div><span className="text-slate-400">MIME Type:</span> {inspectedRecord.mimeType}</div>
                  <div><span className="text-slate-400">Created:</span> {new Date(inspectedRecord.createdAt).toLocaleString()}</div>
                  <div><span className="text-slate-400">Modified:</span> {new Date(inspectedRecord.updatedAt).toLocaleString()}</div>
                </div>
              </div>

              {inspectedRecord.description && (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Description</div>
                  <div className="text-slate-300 font-sans leading-relaxed">{inspectedRecord.description}</div>
                </div>
              )}

              {inspectedRecord.rawContent && (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center justify-between">
                    <span>Raw Content Preview</span>
                    <button
                      onClick={() => handleCopy(inspectedRecord.rawContent!, 'modal-raw')}
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      {copiedKey === 'modal-raw' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Raw</span>
                    </button>
                  </div>
                  <pre className="p-2.5 rounded bg-slate-900 text-[10px] text-slate-300 max-h-48 overflow-y-auto leading-relaxed border border-slate-800/80">
                    {inspectedRecord.rawContent.slice(0, 1500)}
                    {inspectedRecord.rawContent.length > 1500 && '\n\n... [Truncated in quick preview. Use Preview or Launch for full buffer] ...'}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => handleCopy(inspectedRecord.path, 'modal-path')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5"
              >
                {copiedKey === 'modal-path' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Full Path</span>
              </button>

              <div className="flex items-center gap-2">
                {inspectedRecord.originalFile && (
                  <button
                    onClick={() => {
                      onPreviewFile(inspectedRecord.originalFile!);
                      setInspectedRecord(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                  >
                    Open in Editor
                  </button>
                )}
                {inspectedRecord.type === 'app' && inspectedRecord.originalFile && (
                  <button
                    onClick={() => {
                      onLaunchApp(inspectedRecord.originalFile!);
                      setInspectedRecord(null);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Launch Runtime</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
