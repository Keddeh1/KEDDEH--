import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Play,
  Pause,
  RotateCw,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Download,
  Filter,
  Copy,
  Cpu,
  Layers,
  Search,
  Check,
  HardDrive,
  Clock
} from 'lucide-react';
import { SystemLogEntry } from '../../types';
import { GLOBAL_SYSTEM_LOGS } from '../../services/SystemJournalTelemetrySubstrate';

const INITIAL_LOGS: SystemLogEntry[] = [
  {
    id: 'log-101',
    timestamp: new Date(Date.now() - 12000).toISOString().slice(11, 23),
    service: 'systemd[1]',
    level: 'INFO',
    message: 'Started SERVERspace Cloud Orchestrator Daemon.',
    source: 'systemd',
    pid: 1,
  },
  {
    id: 'log-102',
    timestamp: new Date(Date.now() - 10000).toISOString().slice(11, 23),
    service: 'kernel',
    level: 'INFO',
    message: 'VirtIO network interface eth0 initialized (Subnet: 10.240.0.0/24).',
    source: 'network',
    pid: 0,
  },
  {
    id: 'log-103',
    timestamp: new Date(Date.now() - 8500).toISOString().slice(11, 23),
    service: 'vfs-engine',
    level: 'SUCCESS',
    message: 'VFS Vault mounted at /mnt/vault with linear journaling (integrity: nominal).',
    source: 'vfs',
    pid: 412,
  },
  {
    id: 'log-104',
    timestamp: new Date(Date.now() - 7000).toISOString().slice(11, 23),
    service: 'nginx',
    level: 'INFO',
    message: 'Reverse proxy listening on 0.0.0.0:80, 0.0.0.0:443 (SSL TLS 1.3 enabled).',
    source: 'network',
    pid: 884,
  },
  {
    id: 'log-105',
    timestamp: new Date(Date.now() - 5500).toISOString().slice(11, 23),
    service: 'sshd',
    level: 'INFO',
    message: 'OpenSSH daemon listening on port 22 with ed25519 key authentication.',
    source: 'auth',
    pid: 530,
  },
  {
    id: 'log-106',
    timestamp: new Date(Date.now() - 4000).toISOString().slice(11, 23),
    service: 'maintenance-daemon',
    level: 'SUCCESS',
    message: 'Automated housekeeping completed: cache pruned, indices verified in 14ms.',
    source: 'systemd',
    pid: 1205,
  },
  {
    id: 'log-107',
    timestamp: new Date(Date.now() - 2500).toISOString().slice(11, 23),
    service: 'cluster-monitor',
    level: 'INFO',
    message: 'All 4 cluster master & worker nodes responding to heartbeat pings (<1ms).',
    source: 'kernel',
    pid: 1410,
  },
  {
    id: 'log-108',
    timestamp: new Date(Date.now() - 1000).toISOString().slice(11, 23),
    service: 'vfs-sync',
    level: 'SUCCESS',
    message: 'Snapshot ledger synced: local vault blocks verified with SHA-256 root.',
    source: 'vfs',
    pid: 1622,
  }
];

const LOG_TEMPLATES: { service: string; source: 'kernel' | 'systemd' | 'vfs' | 'network' | 'auth'; level: 'INFO' | 'SUCCESS' | 'WARN'; message: string; pid: number }[] = [
  { service: 'kernel', source: 'kernel', level: 'INFO', message: 'CPU scheduler: load balanced across active vCPUs with 0 context contention.', pid: 0 },
  { service: 'vfs-engine', source: 'vfs', level: 'SUCCESS', message: 'Read block sequence 0x240..0x3FF flushed to storage vault cache.', pid: 412 },
  { service: 'nginx', source: 'network', level: 'INFO', message: 'HTTP GET /api/v1/cluster/health 200 OK (latency: 1.2ms).', pid: 884 },
  { service: 'cluster-monitor', source: 'kernel', level: 'INFO', message: 'Memory allocation pool: 42% utilized, zero swap activity detected.', pid: 1410 },
  { service: 'sshd', source: 'auth', level: 'INFO', message: 'Session keepalive ACK received from internal node srv-worker-01.', pid: 530 },
  { service: 'maintenance-daemon', source: 'systemd', level: 'SUCCESS', message: 'Transient buffer compaction completed: 2.4 MB reclaimed.', pid: 1205 },
  { service: 'port-router', source: 'network', level: 'INFO', message: 'Virtual routing table check: 5 ports active, 0 dropped packets.', pid: 910 },
  { service: 'vfs-engine', source: 'vfs', level: 'INFO', message: 'Inode cache hit ratio: 99.4% across 1,420 accessed entries.', pid: 412 },
];

export const SystemLogsPanel: React.FC = () => {
  const [logs, setLogs] = useState<SystemLogEntry[]>(INITIAL_LOGS);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [filterSource, setFilterSource] = useState<string>('ALL');
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const logCounterRef = useRef<number>(200);

  // Connect to real-time system journal
  useEffect(() => {
    // Initial sync
    const initialLogs = GLOBAL_SYSTEM_LOGS.getRecentLogs();
    if (initialLogs.length > 0) {
      setLogs(prev => {
        const existingIds = new Set(prev.map(l => l.id));
        const uniqueNew = initialLogs.filter(l => !existingIds.has(l.id));
        return [...uniqueNew, ...prev].slice(0, 200);
      });
    }

    if (!isStreaming) return;

    const unsubscribe = GLOBAL_SYSTEM_LOGS.subscribe((newLog: SystemLogEntry) => {
      setLogs((prev) => [newLog, ...prev.slice(0, 199)]);
    });

    return () => unsubscribe();
  }, [isStreaming]);

  const filteredLogs = logs.filter((log) => {
    if (filterSource !== 'ALL' && log.source !== filterSource) return false;
    if (filterLevel !== 'ALL' && log.level !== filterLevel) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const match =
        log.service.toLowerCase().includes(query) ||
        log.message.toLowerCase().includes(query) ||
        log.source.toLowerCase().includes(query);
      if (!match) return false;
    }
    return true;
  });

  const handleCopyLog = (log: SystemLogEntry) => {
    const text = `[${log.timestamp}] [${log.level}] [${log.service}] (pid ${log.pid}): ${log.message}`;
    navigator.clipboard.writeText(text);
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadLogs = () => {
    const exportText = logs
      .map((l) => `[${l.timestamp}] [${l.level.padEnd(7)}] [${l.service.padEnd(16)}] (${l.source}) pid:${l.pid} - ${l.message}`)
      .join('\n');
    const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `serverspace-journalctl-${Date.now()}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">System Logs &amp; Journald Stream</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {isStreaming ? 'STREAMING ACTIVE' : 'PAUSED'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Live virtual operating system journal, daemon status transitions, and storage I/O events.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isStreaming
                  ? 'bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isStreaming ? 'Pause Stream' : 'Resume Stream'}</span>
            </button>

            <button
              onClick={() => setLogs(INITIAL_LOGS)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Reset Logs</span>
            </button>

            <button
              onClick={handleDownloadLogs}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Raw .log</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-500 font-medium">Source:</span>
            {['ALL', 'kernel', 'systemd', 'vfs', 'network', 'auth'].map((src) => (
              <button
                key={src}
                onClick={() => setFilterSource(src)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors cursor-pointer uppercase ${
                  filterSource === src
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {src}
              </button>
            ))}

            <span className="text-slate-500 font-medium ml-2">Level:</span>
            {['ALL', 'INFO', 'SUCCESS', 'WARN'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors cursor-pointer ${
                  filterLevel === lvl
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Structured Log Terminal Feed */}
      <div
        ref={logContainerRef}
        className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl"
      >
        <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-4">
            <span>TIMESTAMP (UTC)</span>
            <span className="hidden sm:inline">LEVEL</span>
            <span>SERVICE [PID]</span>
            <span className="hidden md:inline">SUBSYSTEM</span>
          </div>
          <span>Showing {filteredLogs.length} events</span>
        </div>

        <div className="divide-y divide-slate-800/50 max-h-[560px] overflow-y-auto font-mono text-xs">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No log messages matching filter criteria.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isCopied = copiedId === log.id;

              return (
                <div
                  key={log.id}
                  onClick={() => handleCopyLog(log)}
                  className="p-3 hover:bg-slate-900/60 transition-colors flex items-start justify-between gap-3 cursor-pointer group"
                  title="Click to copy single log entry"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="text-slate-500 text-[11px] shrink-0 pt-0.5">
                      {log.timestamp}
                    </span>

                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        log.level === 'SUCCESS'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : log.level === 'WARN'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/10 text-cyan-400 border border-blue-500/20'
                      }`}
                    >
                      {log.level}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-slate-200">
                          {log.service}
                        </span>
                        <span className="text-slate-500 text-[10px]">
                          [{log.pid}]
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          {log.source}
                        </span>
                      </div>
                      <p className="text-slate-300 font-sans text-xs mt-0.5 leading-relaxed break-words">
                        {log.message}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyLog(log);
                    }}
                    className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-white transition-colors shrink-0 cursor-pointer"
                  >
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
