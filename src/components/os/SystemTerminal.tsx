import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

interface SystemTerminalProps {
  bootSequence?: boolean;
}

export const SystemTerminal: React.FC<SystemTerminalProps> = ({ bootSequence = false }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 12,
      fontFamily: 'JetBrains Mono, IBM Plex Mono, monospace',
      scrollback: 500,
      theme: {
        background: '#020617',
        foreground: '#e2e8f0',
        cursor: '#3b82f6',
        selectionBackground: 'rgba(59, 130, 246, 0.3)',
      },
      allowTransparency: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;

    if (bootSequence) {
      runBootSequence(term);
    } else {
      term.writeln('\x1b[1;34mKEDDEH OS v4.2-CORE // MULTIVERSE SUBSTRATE\x1b[0m');
      term.writeln('Logged in as \x1b[1;32mroot\x1b[0m at \x1b[1;33mkeddeh-node-01\x1b[0m');
      term.writeln('');
      term.write('\x1b[1;32mroot@keddeh-node-01\x1b[0m:\x1b[1;34m~\x1b[0m# ');
    }

    let currentLine = '';

    term.onData(data => {
      if (data === '\r') {
        term.write('\r\n');
        handleCommand(term, currentLine);
        currentLine = '';
        term.write('\x1b[1;32mroot@keddeh-node-01\x1b[0m:\x1b[1;34m~\x1b[0m# ');
      } else if (data === '\u007f') { // Backspace
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          term.write('\b \b');
        }
      } else {
        currentLine += data;
        term.write(data);
      }
    });

    return () => {
      term.dispose();
    };
  }, []);

  const runBootSequence = async (term: Terminal) => {
    const lines = [
      '[    0.000000] Linux version 6.5.0-keddeh-amd64 (gcc version 12.2.0)',
      '[    0.000000] Command line: BOOT_IMAGE=/vmlinuz-6.5.0 root=UUID=811C9DC5 quiet',
      '[    0.124850] Initializing BRAINK Deterministic Manifold...',
      '[    0.245000] SRAM Canvas Mapped at 0x00000000 - 0x0001FFFF (128 KB)',
      '[    0.384200] DO-178C DAL-A Scheduler Online (WCET_BOUND=67.20ns)',
      '[    0.512000] Mounting /run/stratum/v2 (20 mining sockets)...',
      '[    0.725000] Loading KEDDEH Algebra Engine...',
      '[    0.850000] Core PLL Locked at 850.00 MHz',
      '[    1.124000] Initializing OLLAMA Substrate...',
      '[    1.450000] Pulling model: keddeh-llama3-8b-q4_k_m...',
      '[    2.100000] Ollama serving at http://localhost:11434',
      '[    2.500000] System V Warmboot Complete.',
      '',
      '\x1b[1;34mKEDDEH OS v4.2-CORE // MULTIVERSE SUBSTRATE\x1b[0m',
      'Logged in as \x1b[1;32mroot\x1b[0m at \x1b[1;33mkeddeh-node-01\x1b[0m',
      '',
      'Type "ollama help" to interact with the intelligence stream.',
      ''
    ];

    for (const line of lines) {
      term.writeln(line);
    }
    term.write('\x1b[1;32mroot@keddeh-node-01\x1b[0m:\x1b[1;34m~\x1b[0m# ');
  };

  const handleCommand = (term: Terminal, command: string) => {
    const cmd = command.trim().toLowerCase();
    if (!cmd) return;

    if (cmd === 'clear') {
      term.clear();
      return;
    }

    term.writeln(`\x1b[1;30m[Gate 1/5] Tokenization: ${cmd}\x1b[0m`);
    term.writeln(`\x1b[1;30m[Gate 2/5] Static Analysis: No Buffer-Overflow detected.\x1b[0m`);
    term.writeln(`\x1b[1;30m[Gate 3/5] Authority Verification: RING_0 (OK)\x1b[0m`);
    term.writeln(`\x1b[1;30m[Gate 4/5] Manifold Resolution: kex::1x${Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase()}\x1b[0m`);
    term.writeln(`\x1b[1;30m[Gate 5/5] Substrate Execution JMP...\x1b[0m`);
    
    if (cmd === 'ls') {
      term.writeln('bin  etc  home  lib  proc  root  run  sbin  sys  tmp  usr  var');
    } else if (cmd === 'whoami') {
      term.writeln('root (RING_0 // MAX_AUTHORITY)');
    } else if (cmd === 'sysinfo') {
      term.writeln('\x1b[1;37mSystem: \x1b[1;34mKEDDEH OS v4.2-CORE\x1b[0m');
      term.writeln('\x1b[1;37mKernel: \x1b[0m6.5.0-keddeh-amd64');
      term.writeln('\x1b[1;37mSubstrate: \x1b[0m128KB Decoupled Manifold');
      term.writeln('\x1b[1;37mUptime: \x1b[0m0d 0h 12m 42s');
      term.writeln('\x1b[1;37mCPU: \x1b[0mASIC Core v2 @ 850MHz');
    } else if (cmd.startsWith('ollama')) {
      term.writeln('\x1b[1;35mOllama AI Substrate Intercept:\x1b[0m');
      term.writeln('  Connecting to llama3-8b via INF_DMA...');
      term.writeln('  [SUCCESS] Intelligence stream established.');
    } else {
      term.writeln(`-bash: ${cmd}: command not found (Symbolic Collision Failure)`);
    }
  };

  return (
    <div className="w-full h-full p-2 bg-slate-950">
      <div ref={terminalRef} className="w-full h-full overflow-hidden" />
    </div>
  );
};
