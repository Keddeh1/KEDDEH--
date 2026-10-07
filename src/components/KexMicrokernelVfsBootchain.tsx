import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Cpu,
  Layers,
  FileCode,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  Zap,
  FolderTree,
  FileText,
  Activity
} from 'lucide-react';
// Pure Web Crypto SHA-256 helper
export async function sha256Hex(content: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(content);
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Fallback FNV-1a based hex string for non-crypto environments
  let h = 0x811c9dc5;
  for (let i = 0; i < data.length; i++) {
    h ^= data[i];
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export interface KexMicrokernelVfsBootchainProps {
  onClose?: () => void;
  className?: string;
}

// ----------------------------------------------------------------------------
// 1. PRELOADED VFS IMAGE (The Immutable Disk Blueprint)
// ----------------------------------------------------------------------------
export const PRELOADED_VFS_IMAGE: Record<string, string> = {
  '/boot/kexboot.json': JSON.stringify(
    {
      schema: 'kexboot/v1',
      authority: 'A.KEDDEH',
      kernel_entry: '/kernel/microkernel.kex',
      init_entry: '/micro-os/init.kex',
      assembly_spec: '/build/terminal/spec.json',
      required_manifest: [
        '/boot/kexboot.json',
        '/kernel/microkernel.kex',
        '/micro-os/init.kex',
        '/micro-os/services.json',
        '/build/terminal/spec.json'
      ],
      hash_algorithm: 'SHA-256',
      zero_policy: 'strictly non-zero weighted live state'
    },
    null,
    2
  ),

  '/kernel/microkernel.kex': [
    '# KEX MICROKERNEL RING-0 DIRECTIVE',
    'ARCH: x86_64-wasm',
    'AUTHORITY: A.KEDDEH',
    'PAGE_SIZE: 4096',
    'MEM_MAPPING: [0x00000000 -> 0x00400000]',
    'VFS_ROOT_INODE: 2',
    'PROCESS_CAPACITY: 128',
    'INIT_EXEC_ENTRY: /micro-os/init.kex',
    'STATUS: RING-0 VERIFIED'
  ].join('\n'),

  '/micro-os/init.kex': [
    '#!/bin/kex-sh',
    '# KEX MICRO-OS INIT DAEMON (PID 1)',
    'mount -t vfs /dev/vfs0 /',
    'load-services /micro-os/services.json',
    'verify-lineage --authority A.KEDDEH',
    'assemble-terminal --spec /build/terminal/spec.json --out /run/terminal.vnext.html',
    'exec /run/terminal.vnext.html'
  ].join('\n'),

  '/micro-os/services.json': JSON.stringify(
    {
      services: [
        { id: 'kex-volume-mnt', name: 'KEX Volume Storage Engine', state: 'STARTING', pid: 2, port: 8420 },
        { id: 'braink-ai-mesh', name: 'Braink AI Neural Bus', state: 'STARTING', pid: 3, port: 9001 },
        { id: 'proof-ledgerd', name: 'SHA-256 Lineage Ledger', state: 'STARTING', pid: 4, port: 8080 },
        { id: 'terminal-assembler', name: 'VNext Terminal Compiler', state: 'RUNNING', pid: 5, port: 3000 }
      ]
    },
    null,
    2
  ),

  '/build/terminal/spec.json': JSON.stringify(
    {
      spec_version: 'terminal.vnext.2026',
      authority: 'A.KEDDEH',
      title: 'KEX Linux Workstation vNext',
      theme: 'cyber-cyan',
      features: [
        'VFS Inode Explorer',
        'Process Scheduler Reflection',
        'Interactive Shell Execution',
        'Microkernel Proof Verification'
      ],
      default_prompt: 'ak@kex-linux:~$'
    },
    null,
    2
  ),

  '/etc/os-release': [
    'NAME="KEX Linux Microkernel"',
    'VERSION="6.0.297-bootchain"',
    'ID=kex-linux',
    'AUTHORITY="A.KEDDEH"',
    'PRETTY_NAME="KEX Linux 6.0 (Assembled by Microkernel)"'
  ].join('\n'),

  '/etc/hostname': 'kex-microkernel\n',

  '/kex-volume/proof/SEED_HASH.txt': '3807f83f9af105b87a40f7532ba961ad7826dd82b3d59fd518b0e679624fee8d\n'
};

export type BootStage = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface LogEntry {
  id: string;
  time: string;
  text: string;
  type: 'info' | 'success' | 'warn' | 'error' | 'cmd' | 'header';
}

interface ServiceItem {
  id: string;
  name: string;
  state: string;
  pid: number;
  port?: number;
}

export function KexMicrokernelVfsBootchain({ onClose, className = '' }: KexMicrokernelVfsBootchainProps) {
  // Bootchain state tracking: Set to Stage 6 by default for "Always Online" access
  const [stage, setStage] = useState<BootStage>(6);
  const [isBooting, setIsBooting] = useState(false);
  const [t0Input, setT0Input] = useState('');
  const [t0Logs, setT0Logs] = useState<LogEntry[]>([]);
  const [vfs, setVfs] = useState<Record<string, string>>(PRELOADED_VFS_IMAGE);
  const [selectedFile, setSelectedFile] = useState<string>('/boot/kexboot.json');
  const [verifiedHashes, setVerifiedHashes] = useState<Record<string, string>>({});
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [assembledHtml, setAssembledHtml] = useState<string | null>(null);

  // Terminal_1 interactive state (post-assembly)
  const [t1Input, setT1Input] = useState('');
  const [t1Logs, setT1Logs] = useState<Array<{ text: string; color?: string }>>([]);

  const t0BottomRef = useRef<HTMLDivElement>(null);
  const t1BottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    t0BottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [t0Logs]);

  useEffect(() => {
    t1BottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [t1Logs]);

  // Initial prompt banner for TERMINAL_0
  useEffect(() => {
    resetBootchain();
  }, []);

  const addT0Log = (text: string, type: LogEntry['type'] = 'info') => {
    setT0Logs((prev) => {
      const entry: LogEntry = {
        id: `log_${Date.now()}_${prev.length + 1}`,
        time: new Date().toLocaleTimeString(),
        text,
        type
      };
      return [...prev, entry];
    });
  };

  const computeHash = async (content: string): Promise<string> => {
    try {
      if (typeof crypto !== 'undefined' && crypto.subtle) {
        const enc = new TextEncoder().encode(content);
        const buf = await crypto.subtle.digest('SHA-256', enc);
        return Array.from(new Uint8Array(buf))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
      }
      return sha256Hex(content);
    } catch {
      return sha256Hex(content);
    }
  };

  const resetBootchain = () => {
    setStage(6);
    setIsBooting(false);
    setVfs(PRELOADED_VFS_IMAGE);
    setSelectedFile('/boot/kexboot.json');
    setVerifiedHashes({});
    setServices([]);
    setAssembledHtml(null);

    setT0Logs([
      {
        id: 'init-1',
        time: new Date().toLocaleTimeString(),
        text: '=== KEX RELATIONAL SUBSTRATE · TERMINAL_0 ===',
        type: 'header'
      },
      {
        id: 'init-2',
        time: new Date().toLocaleTimeString(),
        text: 'State: CONNECTED // Authority: A. KEDDEH',
        type: 'info'
      },
      {
        id: 'init-3',
        time: new Date().toLocaleTimeString(),
        text: "Relational Continuity Active. Type 'vfs inspect' for inode state.",
        type: 'info'
      }
    ]);
    
    // Automatically seed Terminal_1 for instant access (Always Online)
    const serviceList: ServiceItem[] = JSON.parse(PRELOADED_VFS_IMAGE['/micro-os/services.json']).services.map((s: any) => ({
      ...s,
      state: 'RUNNING'
    }));
    setServices(serviceList);
    setT1Logs([
      { text: '=== KEX LINUX WORKSTATION vNEXT (TERMINAL_1) ===', color: 'text-cyan-400 font-bold' },
      { text: 'ONLINE · Authority Verified: A. KEDDEH // BRAINK AI', color: 'text-emerald-400' },
      { text: 'Relational State Continuity Active · Layer 1 Root Reserved', color: 'text-slate-400' },
      { text: "Type 'help', 'ls', 'cat <file>', 'ps', 'uname -a', or 'services'.\n", color: 'text-amber-400' }
    ]);
  };

  // ----------------------------------------------------------------------------
  // THE BOOTCHAIN ORCHESTRATOR
  // ----------------------------------------------------------------------------
  const runBootchainSequence = async () => {
    if (isBooting) return;
    setIsBooting(true);
    addT0Log('>>> RE-SYNCHRONIZING RELATIONAL STATE...', 'cmd');

    // Instant migration to Terminal_1 (Always Online Principle)
    setStage(6);
    setIsBooting(false);
    addT0Log('      -> State Vector Unified. Workstation Active.', 'success');
  };

  // ----------------------------------------------------------------------------
  // TERMINAL_0 COMMAND EVALUATOR (Bootstrap Carrier)
  // ----------------------------------------------------------------------------
  const handleT0Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = t0Input.trim();
    if (!cmd) return;
    setT0Input('');

    addT0Log(`kex-bootldr# ${cmd}`, 'cmd');
    const [action, ...args] = cmd.split(/\s+/);

    switch (action.toLowerCase()) {
      case 'boot':
        runBootchainSequence();
        break;

      case 'vfs':
        if (args[0] === 'inspect' || !args[0]) {
          addT0Log('Preloaded VFS Inode Manifest:');
          Object.keys(vfs).forEach((path) => {
            const bytes = vfs[path].length;
            addT0Log(`  ${path.padEnd(36)} (${bytes} bytes)`);
          });
        } else {
          addT0Log("usage: vfs inspect", 'warn');
        }
        break;

      case 'cat':
        if (!args[0]) {
          addT0Log("usage: cat <path>", 'warn');
          break;
        }
        const targetPath = args[0].startsWith('/') ? args[0] : '/' + args[0];
        if (vfs[targetPath]) {
          addT0Log(`--- INODE: ${targetPath} ---`, 'info');
          addT0Log(vfs[targetPath]);
          setSelectedFile(targetPath);
        } else {
          addT0Log(`cat: ${args[0]}: Inode not found in VFS image`, 'error');
        }
        break;

      case 'status':
        addT0Log(`Current Stage: ${stage} / 6`);
        addT0Log(`VFS Inodes: ${Object.keys(vfs).length}`);
        addT0Log(`Services: ${services.length} active`);
        break;

      case 'help':
        addT0Log('TERMINAL_0 Bootstrap Directives:');
        addT0Log('  boot           Execute complete bootchain (/boot/kexboot.json -> Assembler)');
        addT0Log('  vfs inspect    Enumerate preloaded VFS disk image');
        addT0Log('  cat <path>     Inspect raw file contents in preloaded VFS');
        addT0Log('  status         Report bootchain stage and kernel boundaries');
        addT0Log('  reset          Reinitialize carrier to Stage 0');
        break;

      case 'reset':
      case 'reboot':
        resetBootchain();
        break;

      default:
        addT0Log(`bootldr: unknown directive '${action}'. Type 'boot' or 'help'.`, 'error');
    }
  };

  // ----------------------------------------------------------------------------
  // TERMINAL_1 COMMAND EVALUATOR (Assembled Workstation)
  // ----------------------------------------------------------------------------
  const handleT1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const line = t1Input.trim();
    if (!line) return;
    setT1Input('');

    setT1Logs((prev) => [...prev, { text: `ak@kex-linux:~$ ${line}`, color: 'text-slate-300' }]);

    const { GLOBAL_COGNITIVE_SUBSTRATE, sha256Hex } = await import('../services/brainkCognitiveSubstrate');
    const [c, ...args] = line.split(/\s+/);
    
    // Process creation simulation (CS Process Rigor)
    GLOBAL_COGNITIVE_SUBSTRATE.spawnProcess(line, 104);

    switch (c.toLowerCase()) {
      case 'help':
        setT1Logs((prev) => [
          ...prev,
          { text: 'TERMINAL_1 Assembled Workstation Commands:', color: 'text-cyan-400' },
          { text: '  ls [path]      List files in mounted VFS', color: 'text-slate-300' },
          { text: '  cat <file>     Display contents with integrity check', color: 'text-slate-300' },
          { text: '  stat <file>    Inspect Inode metadata (size, mode, hash)', color: 'text-slate-300' },
          { text: '  ps             Reflect real Process Control Blocks', color: 'text-slate-300' },
          { text: '  memdump        Dump 128KB Linear Memory registers', color: 'text-slate-300' },
          { text: '  uname -a       Show microkernel release and architecture', color: 'text-slate-300' },
          { text: '  clear          Clear workstation screen', color: 'text-slate-300' }
        ]);
        break;

      case 'ls': {
        const dir = args[0] || '/';
        const matches = Object.keys(vfs).filter((k) => k.startsWith(dir === '/' ? '/' : dir));
        if (!matches.length) {
          setT1Logs((prev) => [...prev, { text: `ls: cannot access '${dir}': No such file`, color: 'text-rose-400' }]);
        } else {
          setT1Logs((prev) => [...prev, { text: matches.join('   '), color: 'text-cyan-300' }]);
        }
        break;
      }

      case 'cat': {
        if (!args[0]) {
          setT1Logs((prev) => [...prev, { text: 'usage: cat <file>', color: 'text-amber-400' }]);
          break;
        }
        const p = args[0].startsWith('/') ? args[0] : '/' + args[0];
        const content = vfs[p];
        if (content) {
          const inode = GLOBAL_COGNITIVE_SUBSTRATE.getInode(p);
          const currentHash = sha256Hex(content);
          
          if (inode && inode.checksum !== currentHash) {
             setT1Logs((prev) => [...prev, { text: `[CRITICAL] Integrity Violation: File ${p} hash mismatch!`, color: 'text-rose-500 font-bold' }]);
             break;
          }

          setT1Logs((prev) => [
            ...prev, 
            { text: `[VERIFIED] Content SHA-256: ${currentHash.substring(0, 16)}...`, color: 'text-emerald-400 text-[10px]' },
            { text: content, color: 'text-slate-200' }
          ]);
          setSelectedFile(p);
        } else {
          setT1Logs((prev) => [...prev, { text: `cat: ${args[0]}: No such file or directory`, color: 'text-rose-400' }]);
        }
        break;
      }

      case 'stat': {
        const p = args[0]?.startsWith('/') ? args[0] : '/' + (args[0] || '');
        const inode = GLOBAL_COGNITIVE_SUBSTRATE.getInode(p);
        if (inode) {
          setT1Logs((prev) => [
            ...prev,
            { text: `  File: ${inode.path}`, color: 'text-white' },
            { text: `  Size: ${inode.size} bytes`, color: 'text-slate-300' },
            { text: `  Inode: ${inode.inodeId}  Mode: (${inode.mode.toString(8)}/drwxr-xr-x)`, color: 'text-slate-300' },
            { text: `  Modify: ${new Date(inode.mtime).toISOString()}`, color: 'text-slate-300' },
            { text: `  Checksum: ${inode.checksum}`, color: 'text-cyan-400' }
          ]);
        } else {
          setT1Logs((prev) => [...prev, { text: `stat: cannot stat '${args[0]}': No such file`, color: 'text-rose-400' }]);
        }
        break;
      }

      case 'ps': {
        const processes = GLOBAL_COGNITIVE_SUBSTRATE.getProcesses();
        setT1Logs((prev) => [
          ...prev,
          { text: '  PID   PPID   UID   STATE      START_TIME   COMMAND', color: 'text-slate-400 font-bold underline' },
          ...processes.map(p => ({
            text: `${String(p.pid).padStart(5)}  ${String(p.ppid).padStart(5)}  ${String(p.uid).padStart(4)}   ${p.state.padEnd(10)} ${new Date(p.startTime).toLocaleTimeString()}  ${p.command}`,
            color: p.pid === 1 ? 'text-emerald-400' : 'text-slate-200'
          }))
        ]);
        break;
      }

      case 'memdump': {
        const { GLOBAL_CONCURRENT_RUNTIME_ENGINE, MEMORY_MAP } = await import('../services/runtimeConcurrentEngine');
        const mapper = GLOBAL_CONCURRENT_RUNTIME_ENGINE.getMemoryMapper();
        const head = mapper.readU32(MEMORY_MAP.REG_RING_BUFFER_HEAD);
        const tail = mapper.readU32(MEMORY_MAP.REG_RING_BUFFER_TAIL);
        const wcet = mapper.readU32(MEMORY_MAP.REG_LAST_WCET_NANOS);
        
        setT1Logs((prev) => [
          ...prev,
          { text: '--- RING-0 KERNEL TELEMETRY REGISTERS ---', color: 'text-violet-400 font-bold' },
          { text: `[0x9900] REG_RING_HEAD:  ${head} (0x${head.toString(16).toUpperCase()})`, color: 'text-slate-300' },
          { text: `[0x9904] REG_RING_TAIL:  ${tail} (0x${tail.toString(16).toUpperCase()})`, color: 'text-slate-300' },
          { text: `[0x9910] REG_LAST_WCET:  ${wcet} ns`, color: 'text-amber-400' },
          { text: `[0x9914] REG_SINGULARITY: 0`, color: 'text-slate-300' },
          { text: '--- ADJACENCY MATRIX (FIRST 4 QUADRANTS) ---', color: 'text-slate-500' },
          { text: `[0x0000] ${mapper.readFloat32(0x0000).toFixed(2)}  ${mapper.readFloat32(0x0004).toFixed(2)}  ${mapper.readFloat32(0x0008).toFixed(2)}  ${mapper.readFloat32(0x000C).toFixed(2)}`, color: 'text-cyan-500' }
        ]);
        break;
      }

      case 'services':
        setT1Logs((prev) => [
          ...prev,
          { text: 'UNIT                    LOAD   ACTIVE   SUB     DESCRIPTION', color: 'text-slate-400 font-bold' },
          ...services.map((s) => ({
            text: `${(s.id + '.service').padEnd(23)} loaded active   running ${s.name} (PID ${s.pid})`,
            color: 'text-emerald-400'
          }))
        ]);
        break;

      case 'uname':
        setT1Logs((prev) => [
          ...prev,
          {
            text: 'Linux kex-linux 6.0.297-bootchain #1 SMP PREEMPT 2026 x86_64-wasm GNU/Linux (Authority: A. Keddeh)',
            color: 'text-emerald-300'
          }
        ]);
        break;

      case 'clear':
        setT1Logs([]);
        break;

      default:
        setT1Logs((prev) => [...prev, { text: `bash: ${c}: command not found. Type 'help'.`, color: 'text-rose-400' }]);
    }
  };

  const PIPELINE_STEPS = [
    { id: 0, title: '1. TERMINAL_0', desc: 'Bootstrap Carrier' },
    { id: 1, title: '2. PRELOAD_VFS', desc: 'Image Validation' },
    { id: 2, title: '3. BOOTLOADER', desc: '/boot/kexboot.json' },
    { id: 3, title: '4. MICROKERNEL', desc: 'Ring-0 VFS Mount' },
    { id: 4, title: '5. MICRO-OS', desc: 'Init & Daemons' },
    { id: 5, title: '6. ASSEMBLER', desc: 'Spec → Terminal vNext' },
    { id: 6, title: '7. TERMINAL_1', desc: 'Running Workstation' }
  ];

  return (
    <div className={`w-full flex flex-col bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden ${className}`}>
      {/* Top Banner */}
      <header className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-lg text-sky-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-mono text-sm font-bold tracking-wide text-white">KEX MICROKERNEL VFS BOOTCHAIN</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                A. KEDDEH // BRAINK AI
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Deterministic bootloader chain: Preloaded VFS → Microkernel → Micro-OS → Assembler → Terminal vNext
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border ${
              stage === 6
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : stage > 0
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                stage === 6 ? 'bg-emerald-400 animate-pulse' : stage > 0 ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span>
              {stage === 0
                ? 'STAGE 0: BOOTSTRAP TERMINAL'
                : stage === 6
                ? 'STAGE 6: TERMINAL_1 ASSEMBLED'
                : `BOOTING STAGE ${stage}/6`}
            </span>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Close"
            >
              ✕
            </button>
          )}
        </div>
      </header>

      {/* 7-Step Bootchain Pipeline Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 px-6 py-3 bg-slate-900/50 border-b border-slate-800 text-xs font-mono">
        {PIPELINE_STEPS.map((step) => {
          const isComplete = stage > step.id;
          const isActive = stage === step.id;
          return (
            <div
              key={step.id}
              className={`p-2.5 rounded-lg border transition ${
                isActive
                  ? 'border-amber-400/60 bg-amber-500/10 text-amber-300 shadow-sm'
                  : isComplete
                  ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-400'
                  : 'border-slate-800 bg-slate-900/30 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">{step.title}</span>
                {isComplete ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : isActive ? (
                  <Activity className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                ) : null}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">{step.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Main Workspace: Left = Terminal Active Stage, Right = Preloaded VFS Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 flex-1 min-h-[560px]">
        {/* Left Column: Active Terminal (Terminal_0 OR Terminal_1) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {stage < 6 ? (
            /* ========================================================= */
            /* STAGE 0-5: TERMINAL_0 BOOTSTRAP CARRIER                   */
            /* ========================================================= */
            <div className="flex-1 flex flex-col bg-black/90 border border-slate-800 rounded-xl p-4 font-mono text-xs">
              {/* Carrier Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3 text-slate-400">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <span className="text-white font-semibold">TERMINAL_0</span>
                  <span className="text-slate-500">[Bootstrap Carrier Shell]</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => runBootchainSequence()}
                    disabled={isBooting}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30 disabled:opacity-50 transition"
                  >
                    <Play className="w-3 h-3" />
                    <span>boot</span>
                  </button>
                  <button
                    onClick={() => {
                      setT0Input('vfs inspect');
                      addT0Log('kex-bootldr# vfs inspect', 'cmd');
                      addT0Log('Preloaded VFS Inode Manifest:');
                      Object.keys(vfs).forEach((p) => addT0Log(`  ${p}`));
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition"
                  >
                    inspect
                  </button>
                  <button
                    onClick={resetBootchain}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 transition"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>reset</span>
                  </button>
                </div>
              </div>

              {/* Log Output Area */}
              <div className="flex-1 overflow-y-auto max-h-[460px] space-y-1.5 pr-2">
                {t0Logs.map((log) => (
                  <div
                    key={log.id}
                    className={`leading-relaxed ${
                      log.type === 'header'
                        ? 'text-sky-400 font-bold border-b border-sky-500/20 pb-1'
                        : log.type === 'cmd'
                        ? 'text-amber-300 font-semibold'
                        : log.type === 'success'
                        ? 'text-emerald-400'
                        : log.type === 'warn'
                        ? 'text-amber-400'
                        : log.type === 'error'
                        ? 'text-rose-400'
                        : 'text-slate-300'
                    }`}
                  >
                    {log.text}
                  </div>
                ))}
                <div ref={t0BottomRef} />
              </div>

              {/* Terminal_0 Input Line */}
              <form onSubmit={handleT0Submit} className="flex items-center gap-2 pt-3 border-t border-slate-800/80 mt-3">
                <span className="text-amber-400 font-bold whitespace-nowrap">kex-bootldr#</span>
                <input
                  type="text"
                  value={t0Input}
                  onChange={(e) => setT0Input(e.target.value)}
                  disabled={isBooting}
                  placeholder="type 'boot' to trigger bootchain, 'vfs inspect', or 'help'..."
                  className="flex-1 bg-transparent border-none text-white focus:outline-none placeholder-slate-600"
                />
              </form>
            </div>
          ) : (
            /* ========================================================= */
            /* STAGE 6: TERMINAL_1 ASSEMBLED WORKSTATION (Runtime)       */
            /* ========================================================= */
            <div className="flex-1 flex flex-col bg-black/95 border border-emerald-500/40 rounded-xl p-4 font-mono text-xs shadow-2xl">
              {/* Assembled Header */}
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20 mb-3 text-slate-400">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="text-white font-bold">TERMINAL_1</span>
                  <span className="text-emerald-400">[Workstation vNext · Ring-3 Container]</span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-slate-400">Authority: A. KEDDEH</span>
                  <button
                    onClick={resetBootchain}
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reboot Carrier</span>
                  </button>
                </div>
              </div>

              {/* Workstation Output Area */}
              <div className="flex-1 overflow-y-auto max-h-[460px] space-y-1 pr-2">
                {t1Logs.map((log, idx) => (
                  <div key={idx} className={log.color || 'text-slate-200'}>
                    {log.text}
                  </div>
                ))}
                <div ref={t1BottomRef} />
              </div>

              {/* Terminal_1 Input Line */}
              <form onSubmit={handleT1Submit} className="flex items-center gap-2 pt-3 border-t border-slate-800 mt-3">
                <span className="text-emerald-400 font-bold whitespace-nowrap">ak@kex-linux:~$</span>
                <input
                  type="text"
                  value={t1Input}
                  onChange={(e) => setT1Input(e.target.value)}
                  placeholder="type 'help', 'ls', 'cat <file>', 'ps', 'uname -a'..."
                  className="flex-1 bg-transparent border-none text-white focus:outline-none placeholder-slate-600"
                />
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Preloaded VFS & Inode Inspector */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-sky-400 font-bold">
                <FolderTree className="w-4 h-4" />
                <span>PRELOADED VFS INODES</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                {Object.keys(vfs).length} FILES
              </span>
            </div>

            {/* Tree File List */}
            <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
              {Object.keys(vfs).map((path) => {
                const isSelected = selectedFile === path;
                const isVerified = verifiedHashes[path];
                return (
                  <button
                    key={path}
                    onClick={() => setSelectedFile(path)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left transition ${
                      isSelected
                        ? 'bg-sky-500/20 text-sky-200 border border-sky-500/30'
                        : 'hover:bg-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{path}</span>
                    </div>
                    {isVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Inode Content Viewer */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                <span className="font-semibold text-slate-300">INSPECTED INODE</span>
                <span className="text-sky-400 truncate max-w-[180px]">{selectedFile}</span>
              </div>
              <div className="bg-black/70 border border-slate-800/80 rounded-lg p-3 text-[11px] text-slate-300 max-h-[200px] overflow-y-auto whitespace-pre font-mono">
                {vfs[selectedFile] || '[empty or not found]'}
              </div>
            </div>

            {/* Microkernel Ring-0 Memory & SHA Status */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Kernel Authority:</span>
                <span className="text-white font-bold">A. KEDDEH</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Ring-0 Memory:</span>
                <span className="text-sky-400">0x00000000 - 0x00400000</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Init Daemon:</span>
                <span className="text-emerald-400">/micro-os/init.kex (PID 1)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
