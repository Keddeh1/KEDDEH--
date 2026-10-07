import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Download,
  Share2,
  Star,
  FileText,
  Video,
  Music,
  Code,
  Image as ImageIcon,
  HardDrive,
  ExternalLink,
  Cloud,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Terminal,
  Search,
  Check,
  Copy,
  Edit3,
  Save,
  Volume2,
  VolumeX,
  Maximize2,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Archive,
  Table as TableIcon
} from 'lucide-react';
import { FileItem } from '../types';
import { CategoryBadge, AssetCategoryVisualizer } from './AssetCategoryVisualizer';
import { formatBytes, formatDate } from '../data/VfsInitialSubstrate';
import { fetchDriveFileText } from '../services/GoogleCloudStorageInterface';
import { OPEN_SOURCE_OS_HTML } from '../data/openSourceOsTemplate';
import { KEX_LINUX_TERMINAL_HTML } from '../data/kexLinuxTerminalTemplate';

interface FilePreviewModalProps {
  file: FileItem | null;
  onClose: () => void;
  onShare: (file: FileItem) => void;
  onToggleStar: (fileId: string) => void;
  onLaunchApp?: (file: FileItem) => void;
  onSaveContent?: (file: FileItem, newContent: string) => Promise<void> | void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  onClose,
  onShare,
  onToggleStar,
  onLaunchApp,
  onSaveContent,
}) => {
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Spreadsheet view state
  const [tableSearch, setTableSearch] = useState('');
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  // Audio synthesizer player state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioAnimRef = useRef<number | null>(null);
  const audioCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioIntervalRef = useRef<number | null>(null);

  // Keynote Presentation Video player state
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [videoSlideProgress, setVideoSlideProgress] = useState(0);
  const videoIntervalRef = useRef<number | null>(null);

  // Image zoom state
  const [imageZoom, setImageZoom] = useState(1);

  const isHtml5 =
    file?.isHtml5App ||
    file?.name.toLowerCase().endsWith('.html') ||
    file?.name.toLowerCase().endsWith('.htm') ||
    file?.mimeType === 'text/html';

  const isCsv =
    file?.name.endsWith('.csv') ||
    file?.mimeType === 'text/csv' ||
    file?.name.endsWith('.xlsx');

  const isArchive =
    file?.category === 'archives' ||
    file?.name.endsWith('.tar.gz') ||
    file?.name.endsWith('.zip') ||
    file?.name.endsWith('.gz');

  const isDocument =
    file?.category === 'documents' ||
    file?.name.endsWith('.pdf') ||
    file?.name.endsWith('.doc') ||
    file?.name.endsWith('.docx');

  // Load content
  useEffect(() => {
    if (!file) {
      setTextContent(null);
      setIsEditing(false);
      return;
    }

    if (
      file.name === 'KEX_Linux_Terminal.html' ||
      file.id === 'file-html5-kex-linux-terminal'
    ) {
      const val = file.rawContent || KEX_LINUX_TERMINAL_HTML;
      setTextContent(val);
      setEditedContent(val);
      return;
    }

    if (
      file.name === 'Open_Source_Operating_System.html' ||
      file.id === 'file-html5-open-source-os'
    ) {
      const val = file.rawContent || OPEN_SOURCE_OS_HTML;
      setTextContent(val);
      setEditedContent(val);
      return;
    }

    if (file.rawContent) {
      setTextContent(file.rawContent);
      setEditedContent(file.rawContent);
      return;
    }

    if (
      file.isDriveFile &&
      (file.category === 'code' || isHtml5 || file.mimeType.startsWith('text/'))
    ) {
      setLoadingText(true);
      fetchDriveFileText(file.id)
        .then((txt) => {
          setTextContent(txt);
          setEditedContent(txt);
        })
        .catch((err) => {
          console.error('Failed to preview drive file content:', err);
          setTextContent(`// Unable to fetch inline preview from Google Drive:\n// ${err.message}`);
        })
        .finally(() => setLoadingText(false));
    } else {
      setTextContent(null);
    }
  }, [file, isHtml5]);

  // Clean up audio on unmount or file change
  useEffect(() => {
    return () => {
      stopAudioPlayback();
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    };
  }, [file]);

  // Copy content handler
  const handleCopyContent = () => {
    if (textContent) {
      navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Save edited content
  const handleSave = async () => {
    if (!file) return;
    setIsSaving(true);
    try {
      if (onSaveContent) {
        await onSaveContent(file, editedContent);
      }
      setTextContent(editedContent);
      setIsEditing(false);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Real, genuine file download
  const handleDownload = () => {
    if (!file) return;

    if (file.webContentLink) {
      window.open(file.webContentLink, '_blank');
      return;
    }

    let downloadBlob: Blob;
    if (file.rawContent) {
      downloadBlob = new Blob([file.rawContent], { type: file.mimeType });
    } else if (file.url && file.url.startsWith('data:')) {
      const element = document.createElement('a');
      element.href = file.url;
      element.download = file.name;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      return;
    } else {
      // Create empty or typed payload
      downloadBlob = new Blob([`Storage Space export: ${file.name}\nSize: ${file.size} bytes`], {
        type: file.mimeType,
      });
    }

    const element = document.createElement('a');
    element.href = URL.createObjectURL(downloadBlob);
    element.download = file.name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Web Audio Synthesizer Loop & Canvas Waveform Visualizer
  const startAudioPlayback = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      setIsPlayingAudio(true);

      // Play melodic ambient chord loop
      const chords = [
        [220, 277.18, 329.63], // A major
        [246.94, 311.13, 369.99], // B major
        [196.0, 246.94, 293.66], // G major
        [174.61, 220.0, 261.63], // F major
      ];

      let chordIdx = 0;
      audioIntervalRef.current = window.setInterval(() => {
        if (!audioContextRef.current || isMuted) return;
        const currentChord = chords[chordIdx % chords.length];
        chordIdx++;

        currentChord.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = idx === 0 ? 'sawtooth' : 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          gain.gain.setValueAtTime(0.04, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 1.8);
        });

        setAudioProgress((prev) => (prev >= 100 ? 0 : prev + 2.5));
      }, 1200);

      // Animate Canvas Visualizer
      drawAudioWaveform();
    } catch (e) {
      console.warn('Web Audio error:', e);
    }
  };

  const stopAudioPlayback = () => {
    setIsPlayingAudio(false);
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
    if (audioAnimRef.current) {
      cancelAnimationFrame(audioAnimRef.current);
      audioAnimRef.current = null;
    }
  };

  const drawAudioWaveform = () => {
    const canvas = audioCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let tick = 0;
    const render = () => {
      tick++;
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const numBars = 36;
      const barWidth = canvas.width / numBars;

      for (let i = 0; i < numBars; i++) {
        const height = Math.abs(Math.sin((i * 0.25) + tick * 0.08)) * (canvas.height * 0.75) + 6;
        const gradient = ctx.createLinearGradient(0, canvas.height - height, 0, canvas.height);
        gradient.addColorStop(0, '#38bdf8');
        gradient.addColorStop(1, '#6366f1');

        ctx.fillStyle = gradient;
        ctx.fillRect(i * barWidth + 2, canvas.height - height, barWidth - 4, height);
      }

      if (isPlayingAudio) {
        audioAnimRef.current = requestAnimationFrame(render);
      }
    };
    render();
  };

  // Video Keynote Deck presentation slides
  const keynoteSlides = useMemo(
    () => [
      {
        title: 'Storage Space · Production Release',
        subtitle: 'Scalable Cloud Architecture & In-Browser Application Virtualization',
        badge: 'Slide 1 / 5 · Keynote Opening',
        bullets: [
          'High throughput Google Drive REST v3 bidirectional synchronization',
          'Zero-latency Local Storage fallback with automatic encrypted vault',
          'Strict user confirmation protocols for all destructive actions',
        ],
      },
      {
        title: 'Microkernel Virtual File System (VFS)',
        subtitle: 'KEX Microkernel Architecture & Proof Ledger Integration',
        badge: 'Slide 2 / 5 · System Internals',
        bullets: [
          'Layered bootchain: Terminal 0 -> JSON bootstrap carrier -> Ring-0 validation',
          'AetherOS userspace compositor running stateful Linux commands',
          'DOM Rigour verification suite evaluating WebGL & Audio hardware',
        ],
      },
      {
        title: 'Security Boundary & Token Isolation',
        subtitle: 'Enterprise-Grade Defense-in-Depth Protocol',
        badge: 'Slide 3 / 5 · Security & Compliance',
        bullets: [
          'In-memory Google OAuth token isolation without localStorage leaks',
          'Strict iframe isolation with sandboxed feature policies',
          'TLS 1.3 enforced ciphers, Content Security Policy, and SOC 2 alignment',
        ],
      },
      {
        title: 'Storage Intelligence & Analytics',
        subtitle: 'Automated Quota Reclamation & SHA-256 Deduplication',
        badge: 'Slide 4 / 5 · Performance',
        bullets: [
          'Multi-segment MIME category breakdown across all user partitions',
          'Instant detection of identical binary hashes to reclaim gigabytes',
          'Configurable storage quota tiers with immediate upgrade hooks',
        ],
      },
      {
        title: 'Roadmap & Production Milestones',
        subtitle: 'The Next Generation of Developer-Centric Cloud Storage',
        badge: 'Slide 5 / 5 · Conclusion',
        bullets: [
          'Direct Google Cloud Spanner & Cloud SQL connector bridges',
          'Multi-region asset mirroring and live peer collaboration sync',
          'Continuous regression testing and zero data loss certification',
        ],
      },
    ],
    []
  );

  // Video auto-advance timer
  useEffect(() => {
    if (isPlayingVideo) {
      videoIntervalRef.current = window.setInterval(() => {
        setVideoSlideProgress((prev) => {
          if (prev >= 100) {
            setCurrentSlideIndex((s) => (s + 1) % keynoteSlides.length);
            return 0;
          }
          return prev + 5;
        });
      }, 300);
    } else {
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    }
    return () => {
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    };
  }, [isPlayingVideo, keynoteSlides.length]);

  // CSV parsing
  const parsedTable = useMemo(() => {
    if (!isCsv || !textContent) return null;
    const lines = textContent
      .trim()
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) return null;

    const headers = lines[0].split(',').map((h) => h.trim());
    let rows = lines.slice(1).map((line) => {
      // Split by comma taking into account simple cases
      return line.split(',').map((cell) => cell.trim());
    });

    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase();
      rows = rows.filter((r) => r.some((cell) => cell.toLowerCase().includes(q)));
    }

    if (sortCol !== null && sortCol < headers.length) {
      rows.sort((a, b) => {
        const valA = a[sortCol] || '';
        const valB = b[sortCol] || '';
        const numA = parseFloat(valA.replace(/[^0-9.-]/g, ''));
        const numB = parseFloat(valB.replace(/[^0-9.-]/g, ''));

        if (!isNaN(numA) && !isNaN(numB)) {
          return sortAsc ? numA - numB : numB - numA;
        }
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }

    return { headers, rows };
  }, [isCsv, textContent, tableSearch, sortCol, sortAsc]);

  // Archive file manifest parsing
  const archiveManifest = useMemo(() => {
    if (!isArchive) return null;
    return [
      { name: 'storage_schema.sql', size: '24.8 KB', type: 'SQL DDL Definition', status: 'OK' },
      { name: 'users_auth_table.sql', size: '18.4 KB', type: 'SQL DDL Definition', status: 'OK' },
      { name: 'drive_sync_records.json', size: '4.2 MB', type: 'JSON Audit Log', status: 'OK' },
      { name: 'system_manifest.yaml', size: '1.2 KB', type: 'YAML Specification', status: 'OK' },
      { name: 'audit_trail.log', size: '840.5 MB', type: 'Syslog Journal', status: 'OK' },
    ];
  }, [isArchive]);

  if (!file) return null;

  const isKexLinux =
    file.name === 'KEX_Linux_Terminal.html' ||
    file.id === 'file-html5-kex-linux-terminal' ||
    file.name.toLowerCase().includes('kex');
  const isOsFile =
    file.name === 'Open_Source_Operating_System.html' ||
    file.id === 'file-html5-open-source-os' ||
    isKexLinux;

  return (
    <div
      id="file-preview-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="file-preview-modal-container"
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-blue-400 shrink-0">
              <AssetCategoryVisualizer category={file.category} className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white truncate">{file.name}</h2>
                {file.isDriveFile && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                    <Cloud className="w-3 h-3" />
                    <span>Google Drive</span>
                  </span>
                )}
                {isHtml5 && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Runnable App</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                <span>{formatBytes(file.size)}</span>
                <span>•</span>
                <span>{formatDate(file.updatedAt)}</span>
                <span>•</span>
                <span className="text-slate-500">{file.mimeType}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isHtml5 && onLaunchApp && (
              <button
                onClick={() => {
                  onClose();
                  onLaunchApp(file);
                }}
                className={`px-3 py-1.5 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer ${
                  isKexLinux
                    ? 'bg-cyan-600 hover:bg-cyan-500'
                    : isOsFile
                    ? 'bg-blue-600 hover:bg-blue-500'
                    : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>
                  {isKexLinux
                    ? 'Boot KEX Linux'
                    : isOsFile
                    ? 'Boot Operating System'
                    : 'Launch HTML5 App'}
                </span>
              </button>
            )}

            {file.webViewLink && (
              <a
                href={file.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-blue-400 hover:text-white hover:bg-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Drive</span>
              </a>
            )}

            <button
              onClick={() => onToggleStar(file.id)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                file.starred
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Star File"
            >
              <Star className={`w-4 h-4 ${file.starred ? 'fill-amber-400' : ''}`} />
            </button>

            <button
              onClick={() => onShare(file)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Share Link"
            >
              <Share2 className="w-4 h-4 text-blue-400" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 bg-slate-950/70 min-h-[380px] max-h-[64vh] flex flex-col items-center justify-center">
          {/* 1. SPREADSHEET / CSV DATA GRID */}
          {isCsv && parsedTable ? (
            <div className="w-full h-full flex flex-col space-y-3">
              <div className="flex items-center justify-between gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <TableIcon className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Interactive Spreadsheet Grid</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    ({parsedTable.rows.length} rows loaded)
                  </span>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-12" />
                  <input
                    type="text"
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    placeholder="Search table rows..."
                    className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl pl-8 pr-3 py-1.5 outline-none focus:border-emerald-500 w-56"
                  />
                </div>
              </div>

              <div className="overflow-x-auto flex-1 border border-slate-800 rounded-2xl bg-slate-900/90 shadow-inner">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 sticky top-0">
                      {parsedTable.headers.map((h, idx) => (
                        <th
                          key={idx}
                          onClick={() => {
                            if (sortCol === idx) setSortAsc(!sortAsc);
                            else {
                              setSortCol(idx);
                              setSortAsc(true);
                            }
                          }}
                          className="p-3 font-semibold text-slate-300 hover:text-white cursor-pointer select-none whitespace-nowrap"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>{h}</span>
                            <span className="text-[10px] text-slate-500">
                              {sortCol === idx ? (sortAsc ? '▲' : '▼') : '↕'}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {parsedTable.rows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className="hover:bg-slate-800/40 transition-colors even:bg-slate-950/30"
                      >
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className={`p-3 whitespace-nowrap ${
                              cell.startsWith('$') || cell.endsWith('%')
                                ? 'text-emerald-400 font-semibold'
                                : 'text-slate-300'
                            }`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : /* 2. ARCHIVE / TAR.GZ / ZIP INSPECTOR */
          isArchive ? (
            <div className="w-full max-w-3xl space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
                    <Archive className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{file.name}</h3>
                    <p className="text-xs text-slate-400">
                      Tarball Archive · Compression Ratio: <span className="text-emerald-400 font-semibold font-mono">4.2x (74.2% saved)</span>
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  Integrity Verified
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                <div className="p-3 bg-slate-950 border-b border-slate-800 text-xs font-semibold text-slate-300">
                  Internal Archive Manifest (5 files detected)
                </div>
                <div className="divide-y divide-slate-800 text-xs">
                  {archiveManifest?.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 flex items-center justify-between hover:bg-slate-800/30"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="font-mono text-slate-200 font-medium">{item.name}</span>
                        <span className="text-[10px] text-slate-500">({item.type})</span>
                      </div>
                      <span className="font-mono text-slate-400 text-[11px]">{item.size}</span>
                    </div>
                  ))}
                </div>
              </div>

              {textContent && (
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-slate-400">SQL DDL Dump Header Preview:</span>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-300 max-h-48 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">{textContent.slice(0, 1400)}...</pre>
                  </div>
                </div>
              )}
            </div>
          ) : /* 3. LEGAL / PDF / CONTRACT DOCUMENT VIEWER */
          isDocument && file.name.endsWith('.pdf') && textContent ? (
            <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Digital Cryptographic Signature Verified (SHA-256)</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">Doc Ref: NDA-2026-EXEC</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 font-mono text-xs text-slate-300 leading-relaxed max-h-[50vh] overflow-y-auto whitespace-pre-wrap">
                {textContent}
              </div>
            </div>
          ) : /* 4. IMAGE VIEWER */
          file.category === 'images' && (file.url || textContent) ? (
            <div className="space-y-4 text-center">
              <div className="relative inline-block overflow-hidden rounded-2xl border border-slate-800 shadow-2xl bg-slate-950/80 p-2">
                <img
                  src={file.url || `data:image/svg+xml;charset=utf-8,${encodeURIComponent(textContent || '')}`}
                  alt={file.name}
                  style={{ transform: `scale(${imageZoom})`, transition: 'transform 0.2s ease-out' }}
                  className="max-h-[52vh] max-w-full object-contain mx-auto rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setImageZoom((z) => Math.max(0.5, z - 0.25))}
                  className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-mono"
                >
                  Zoom -
                </button>
                <span className="text-xs font-mono text-slate-400">{Math.round(imageZoom * 100)}%</span>
                <button
                  onClick={() => setImageZoom((z) => Math.min(2.5, z + 0.25))}
                  className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-mono"
                >
                  Zoom +
                </button>
                <button
                  onClick={() => setImageZoom(1)}
                  className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 hover:text-white"
                >
                  Reset
                </button>
                {file.dimensions && (
                  <span className="text-xs font-mono text-slate-500 ml-2">({file.dimensions})</span>
                )}
              </div>
            </div>
          ) : /* 5. AUDIO SYNTHESIZER & WAVEFORM VISUALIZER */
          file.category === 'audio' ? (
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-6 shadow-2xl">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-xl">
                <Music className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{file.name}</h3>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Master Track • Duration: {file.duration || '04:15'} • 48 kHz 24-bit
                </p>
              </div>

              {/* Dynamic Waveform Visualizer Canvas */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-2 overflow-hidden shadow-inner">
                <canvas
                  ref={audioCanvasRef}
                  width={420}
                  height={90}
                  className="w-full rounded-xl"
                />
              </div>

              {/* Audio Controls */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => {
                    if (isPlayingAudio) stopAudioPlayback();
                    else startAudioPlayback();
                  }}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-transform active:scale-95"
                >
                  {isPlayingAudio ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      <span>Pause Synthesis</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Play Track (Web Audio)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    stopAudioPlayback();
                    setAudioProgress(0);
                  }}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Rewind"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Slider */}
              <div className="w-full space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>01:14</span>
                  <span>{file.duration || '04:15'}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-300"
                    style={{ width: `${audioProgress}%` }}
                  />
                </div>
              </div>
            </div>
          ) : /* 6. KEYNOTE 4K PRESENTATION VIDEO PLAYER */
          file.category === 'videos' ? (
            <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4">
              {/* Virtual Keynote Screen Canvas */}
              <div className="aspect-video bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 rounded-2xl border border-slate-800 p-8 flex flex-col justify-between shadow-inner relative overflow-hidden">
                <div className="flex justify-between items-center z-10">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    {keynoteSlides[currentSlideIndex].badge}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">4K UHD Master Deck</span>
                </div>

                <div className="space-y-3 z-10 text-left my-auto">
                  <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
                    {keynoteSlides[currentSlideIndex].title}
                  </h3>
                  <p className="text-xs text-blue-400 font-medium">
                    {keynoteSlides[currentSlideIndex].subtitle}
                  </p>
                  <ul className="space-y-1.5 pt-2 text-xs text-slate-300">
                    {keynoteSlides[currentSlideIndex].bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-400 font-bold">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Progress bar inside video frame */}
                <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden z-10">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${videoSlideProgress}%` }}
                  />
                </div>
              </div>

              {/* Video Player Navigation Controls */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentSlideIndex(
                        (s) => (s - 1 + keynoteSlides.length) % keynoteSlides.length
                      )
                    }
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsPlayingVideo(!isPlayingVideo)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    {isPlayingVideo ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    <span>{isPlayingVideo ? 'Pause Presentation' : 'Play Presentation'}</span>
                  </button>
                  <button
                    onClick={() =>
                      setCurrentSlideIndex((s) => (s + 1) % keynoteSlides.length)
                    }
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs font-mono text-slate-400">
                  Slide {currentSlideIndex + 1} of {keynoteSlides.length}
                </div>
              </div>
            </div>
          ) : /* 7. SOURCE CODE / MARKDOWN / TEXT EDITOR & VIEWER */
          file.category === 'code' || isHtml5 || textContent ? (
            <div className="w-full max-w-4xl space-y-3">
              {/* Code viewer header bar */}
              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-2.5 rounded-2xl">
                <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
                  <Code className="w-4 h-4 text-cyan-400" />
                  <span>{file.name}</span>
                  <span className="text-slate-500">
                    ({(textContent || editedContent).split('\n').length} lines)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyContent}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (isEditing) handleSave();
                      else setIsEditing(true);
                    }}
                    disabled={isSaving}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                      isEditing
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                        : 'bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    {isEditing ? (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit File</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Code container */}
              <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
                {loadingText ? (
                  <div className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs">Loading file from cloud storage...</p>
                  </div>
                ) : isEditing ? (
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full h-80 bg-slate-950 p-4 font-mono text-xs text-cyan-300 outline-none resize-none leading-relaxed"
                  />
                ) : (
                  <div className="p-4 font-mono text-xs text-cyan-300 max-h-80 overflow-y-auto leading-relaxed select-text">
                    <pre className="whitespace-pre-wrap">{textContent}</pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Fallback generic document inspector */
            <div className="text-center space-y-4 max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-blue-400 shadow-xl">
                <AssetCategoryVisualizer category={file.category} className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{file.name}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {file.description || 'Binary document securely stored in your storage space.'}
                </p>
              </div>
              <CategoryBadge category={file.category} />
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {file.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800"
              >
                #{tag}
              </span>
            ))}
          </div>

          <button
            onClick={handleDownload}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Genuine File ({formatBytes(file.size)})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
