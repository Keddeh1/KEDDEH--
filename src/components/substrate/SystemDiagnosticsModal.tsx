import React, { useState, useEffect } from 'react';
import {
  X,
  Activity,
  Server,
  Cpu,
  RefreshCw,
  HardDrive,
  Layers,
  CheckCircle2,
  Clock,
  Sparkles,
  Database
} from 'lucide-react';
import {
  GLOBAL_AUTOMATED_MAINTENANCE,
  AutomatedMaintenanceStatus
} from '../../services/automatedMaintenanceService';
import { ServerNode, ServerDaemon } from '../../types';
import { INITIAL_SERVER_NODES, INITIAL_SERVER_DAEMONS, formatBytes } from '../../data/InfrastructureNodeMetadata';

interface SystemDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdvancedServerView?: () => void;
}

export const SystemDiagnosticsModal: React.FC<SystemDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  onOpenAdvancedServerView,
}) => {
  const [activeTab, setActiveTab] = useState<'maintenance' | 'telemetry' | 'processes'>('maintenance');
  const [maintStatus, setMaintStatus] = useState<AutomatedMaintenanceStatus>(
    GLOBAL_AUTOMATED_MAINTENANCE.getStatus()
  );
  const [nodes] = useState<ServerNode[]>(() => {
    const saved = localStorage.getItem('serverspace_nodes');
    return saved ? JSON.parse(saved) : INITIAL_SERVER_NODES;
  });
  const [daemons] = useState<ServerDaemon[]>(() => {
    const saved = localStorage.getItem('serverspace_daemons');
    return saved ? JSON.parse(saved) : INITIAL_SERVER_DAEMONS;
  });

  useEffect(() => {
    const unsubMaint = GLOBAL_AUTOMATED_MAINTENANCE.subscribe(() => {
      setMaintStatus(GLOBAL_AUTOMATED_MAINTENANCE.getStatus());
    });

    return () => {
      unsubMaint();
    };
  }, []);

  if (!isOpen) return null;

  const totalVcpu = nodes.reduce((sum, n) => sum + n.vCpu, 0);
  const totalRamGb = Math.round(nodes.reduce((sum, n) => sum + n.vRamMb, 0) / 1024);
  const totalDiskGb = nodes.reduce((sum, n) => sum + n.diskGb, 0);
  const runningNodesCount = nodes.filter((n) => n.status === 'running').length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>System Health &amp; Diagnostics Panel</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  HEALTHY
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Automated maintenance cycles, node allocations, system daemons, and live metrics.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAdvancedServerView && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdvancedServerView();
                }}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer shadow transition-colors"
              >
                Go to Server Platform ↗
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 border-b border-slate-800 bg-slate-950/40 overflow-x-auto no-scrollbar py-2">
          <button
            type="button"
            onClick={() => setActiveTab('maintenance')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'maintenance'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Automated Maintenance Logs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('telemetry')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'telemetry'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Cluster Telemetry</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('processes')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'processes'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Nodes &amp; System Daemons</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB: MAINTENANCE */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              {/* Status Banner */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Autonomous Background Daemon Active</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Cycles Completed: {maintStatus.totalMaintenanceCycles} · Last run: {new Date(maintStatus.lastRunTimestamp).toLocaleTimeString()}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => GLOBAL_AUTOMATED_MAINTENANCE.runMaintenancePass()}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Trigger Immediate Maintenance</span>
                </button>
              </div>

              {/* Maintenance Log Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Recent Automated Background Tasks
                </h4>
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                  <div className="divide-y divide-slate-800/60 font-mono text-xs">
                    {maintStatus.recentLogs.map((log) => (
                      <div key={log.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {log.category}
                          </span>
                          <span className="text-slate-200 font-sans font-medium">{log.taskName}</span>
                        </div>
                        <div className="flex items-center gap-4 text-slate-400 text-[11px] font-sans">
                          <span>{log.details}</span>
                          <span className="text-emerald-400 shrink-0">{log.durationMs}ms</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CLUSTER TELEMETRY */}
          {activeTab === 'telemetry' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Online Nodes</div>
                  <div className="text-base font-bold text-emerald-400 mt-1">{runningNodesCount} / {nodes.length}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Cluster Healthy</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Total Virtual CPUs</div>
                  <div className="text-base font-bold text-cyan-400 mt-1">{totalVcpu} vCores</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Allocated Across Nodes</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Total Virtual RAM</div>
                  <div className="text-base font-bold text-indigo-400 mt-1">{totalRamGb} GB</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">ECC Memory Pool</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Total VFS Storage</div>
                  <div className="text-base font-bold text-purple-400 mt-1">{totalDiskGb} GB</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Local Vault + Cloud Mount</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
                <div className="text-slate-400 font-bold">Storage &amp; Runtime Metrics:</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300 text-[11px]">
                  <div>• VFS Vault Engine: Mounted &amp; Indexed</div>
                  <div>• Background Daemon: Nominal (0 errors)</div>
                  <div>• Active Network Subnet: 10.240.0.0/24</div>
                  <div>• System Telemetry: 100% Operational</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PROCESSES & DAEMONS */}
          {activeTab === 'processes' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Active Virtual Compute Nodes ({nodes.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {nodes.map((node) => (
                    <div key={node.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{node.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {node.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-3">
                        <span>{node.os}</span>
                        <span>•</span>
                        <span>{node.vCpu} vCPUs</span>
                        <span>•</span>
                        <span>{(node.vRamMb / 1024).toFixed(0)} GB RAM</span>
                        <span>•</span>
                        <span>{node.diskGb} GB Disk</span>
                      </div>
                      {node.env && Object.keys(node.env).length > 0 && (
                        <div className="pt-2 mt-2 border-t border-slate-800/40">
                          <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tight">Active Environment Variables:</div>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(node.env).map(([key, value]) => (
                              <div key={key} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] font-mono">
                                <span className="text-cyan-400">{key}=</span>
                                <span className="text-slate-300">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  System Daemons ({daemons.length})
                </h4>
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 text-xs">
                  <div className="divide-y divide-slate-800/60 font-mono">
                    {daemons.map((daemon) => (
                      <div key={daemon.id} className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-200 font-bold">{daemon.name}</span>
                          <span className="text-slate-500 text-[11px] font-sans">{daemon.description}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          ACTIVE
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
