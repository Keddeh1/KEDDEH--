import { OPEN_SOURCE_OS_HTML, MINING_OS_HTML, KERA_MESH_OS_HTML } from './openSourceOsTemplate';
import { KEX_LINUX_TERMINAL_HTML } from './kexLinuxTerminalTemplate';
import { KEX_MICROKERNEL_VFS_BOOTCHAIN_HTML } from './kexBootchainTemplate';
import { HTML5_PARTICLE_PHYSICS_HTML } from './html5ParticlePhysicsTemplate';
import { HTML5_BREAKOUT_GAME_HTML } from './html5BreakoutGameTemplate';
import { HTML5_AUDIO_SYNTHESIZER_HTML } from './html5SynthesizerTemplate';
import { HTML5_SQL_STUDIO_HTML } from './html5SqlStudioTemplate';
import { HTML5_MARKDOWN_STUDIO_HTML } from './html5MarkdownStudioTemplate';
import { HTML5_PAINT_STUDIO_HTML } from './html5PaintStudioTemplate';
import { HTML5_CALCULATOR_HTML } from './html5CalculatorTemplate';
import { HTML5_CHROME_BROWSER_HTML } from './html5ChromeBrowserTemplate';

export interface Html5AppTemplate {
  id: string;
  name: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  color: string;
  code: string;
}

export const HTML5_APP_TEMPLATES: Html5AppTemplate[] = [
  {
    id: 'kex-bootchain',
    name: 'KEX_MICROKERNEL_VFS_BOOTCHAIN.html',
    title: 'KEX Microkernel VFS Bootchain · A. Keddeh',
    category: 'Boot Architecture & Microkernel',
    description: 'Layered bootchain: TERMINAL_0 bootstrap prompt -> Preloaded VFS image -> /boot/kexboot.json -> Microkernel ring-0 mount -> Micro-OS services -> Assembler -> Generated TERMINAL_1 workstation.',
    tags: ['Bootchain', 'A. Keddeh', 'Braink AI', 'VFS Image', 'Microkernel', 'Micro-OS', 'Assembler', 'Terminal vNext'],
    color: 'from-sky-500 via-cyan-500 to-emerald-600',
    code: KEX_MICROKERNEL_VFS_BOOTCHAIN_HTML,
  },
  {
    id: 'kex-linux-terminal',
    name: 'KEX_Linux_Terminal.html',
    title: 'KEX Linux Terminal · A. Keddeh',
    category: 'Operating System & Terminal',
    description: 'Auto-booted KEX Linux userspace emulator by A. Keddeh with live interactive shell, stateful filesystem, CPU registers, process table, and proof ledger.',
    tags: ['KEX Linux', 'A. Keddeh', 'Braink AI', 'Terminal', 'CPU Registers', 'Proof Ledger', 'Interactive Shell'],
    color: 'from-cyan-500 via-teal-500 to-indigo-600',
    code: KEX_LINUX_TERMINAL_HTML,
  },
  {
    id: 'open-source-os',
    name: 'Open_Source_Operating_System.html',
    title: 'AetherOS Linux-Web Open-Source Kernel',
    category: 'Operating System & Kernel',
    description: 'Complete standalone in-browser Operating System with Linux GRUB bootloader, Bash terminal, DOM rigour testing suite, and persistent VFS windowing desktop.',
    tags: ['Operating System', 'Linux Kernel', 'DOM Rigour', 'Bash Shell', 'VFS Storage', 'Open Source'],
    color: 'from-emerald-500 via-teal-600 to-cyan-600',
    code: OPEN_SOURCE_OS_HTML,
  },
  {
    id: 'sql-studio',
    name: 'HTML5_Relational_SQL_Studio.html',
    title: 'HTML5 Relational SQL Query Studio',
    category: 'Database & SQL',
    description: 'In-browser relational database query engine with catalog inspector, SQL editor, query presets, live result grid, execution telemetry, and CSV export.',
    tags: ['HTML5 App', 'SQL Database', 'Relational Engine', 'Catalog Inspector', 'Analytics'],
    color: 'from-indigo-500 via-blue-600 to-cyan-500',
    code: HTML5_SQL_STUDIO_HTML,
  },
  {
    id: 'markdown-studio',
    name: 'HTML5_Markdown_Notebook_Studio.html',
    title: 'HTML5 Markdown Engineering Studio',
    category: 'Documentation & Workspace',
    description: 'Dual-pane live Markdown technical writing workstation with GitHub-flavored table & code rendering, word metrics, engineering specs, and HTML/MD export.',
    tags: ['HTML5 App', 'Markdown Editor', 'Live Preview', 'Technical RFC', 'Documentation'],
    color: 'from-teal-500 via-emerald-600 to-sky-600',
    code: HTML5_MARKDOWN_STUDIO_HTML,
  },
  {
    id: 'audio-synth',
    name: 'HTML5_Audio_Synthesizer.html',
    title: 'HTML5 Web Audio Synthesizer & Spectrum Workstation',
    category: 'Audio & DSP',
    description: 'Polyphonic 2-octave synthesizer with customizable waveforms, ADSR envelope shaping, resonant low-pass filter, stereo delay, patch presets, and dual FFT/Oscilloscope visualizers.',
    tags: ['HTML5 App', 'Web Audio API', 'FFT Visualizer', 'Synthesizer', 'ADSR Envelope'],
    color: 'from-amber-500 via-orange-600 to-rose-600',
    code: HTML5_AUDIO_SYNTHESIZER_HTML,
  },
  {
    id: 'arcade-game',
    name: 'HTML5_Retro_Arcade_Breakout.html',
    title: 'HTML5 Retro Cyber Breakout Game',
    category: 'Game & Web Audio',
    description: 'Cyber arcade breakout game with 3 progressive sectors, armored/explosive bricks, falling power-ups (lasers, multi-ball, shields), dynamic spark physics, and Web Audio SFX.',
    tags: ['HTML5 App', 'Arcade Game', 'Web Audio API', 'Game Physics', 'High Score'],
    color: 'from-purple-500 via-pink-600 to-rose-500',
    code: HTML5_BREAKOUT_GAME_HTML,
  },
  {
    id: 'physics-lab',
    name: 'HTML5_Particle_Physics_Lab.html',
    title: 'HTML5 Particle & Vortex Physics Lab',
    category: 'Simulation & Canvas',
    description: 'Interactive 2D multi-mode particle physics simulation with vortex dynamics, galaxy spirals, gravitational fields, kinetic energy telemetry, and shockwave bursts.',
    tags: ['HTML5 App', 'Canvas 2D', 'Physics Engine', 'Particle Vortex', 'Kinetic Telemetry'],
    color: 'from-cyan-500 via-sky-600 to-blue-600',
    code: HTML5_PARTICLE_PHYSICS_HTML,
  },
  {
    id: 'paint-studio',
    name: 'HTML5_Raster_Paint_Studio.html',
    title: 'AetherPaint Graphics & Canvas Studio',
    category: 'Creative & Graphics',
    description: 'Raster and geometric vector illustration studio featuring brush engines, line/rect/circle tools, color palettes, undo history, and PNG export.',
    tags: ['HTML5 App', 'Canvas 2D', 'Raster Paint', 'Vector Shapes', 'Art Studio'],
    color: 'from-rose-500 via-pink-600 to-amber-500',
    code: HTML5_PAINT_STUDIO_HTML,
  },
  {
    id: 'scientific-calc',
    name: 'HTML5_Scientific_Calculator.html',
    title: 'AetherOS Scientific & Math Engine',
    category: 'Productivity & Utilities',
    description: 'Advanced scientific calculator with trigonometry, logarithms, power exponents, factorials, memory tape registers, and live keyboard support.',
    tags: ['HTML5 App', 'Scientific Math', 'Trigonometry', 'Calculator', 'Tape Engine'],
    color: 'from-blue-500 via-teal-600 to-emerald-600',
    code: HTML5_CALCULATOR_HTML,
  },
  {
    id: 'chrome-browser',
    name: 'Google_Chrome_Workstation.html',
    title: 'Google Chrome Workstation · A. Keddeh',
    category: 'Networking & Web',
    description: 'High-fidelity Google Chrome simulation workstation with multi-tab support, integrated search, and kernel-verified provenance. Utilizes the embedded membrane architecture for secure web browsing simulation.',
    tags: ['Google Chrome', 'Browser', 'Networking', 'Web Engineering', 'Workstation'],
    color: 'from-blue-400 via-red-500 to-yellow-500',
    code: HTML5_CHROME_BROWSER_HTML,
  },
  {
    id: 'mining-os',
    name: 'Stratum_Mining_Core_OS.html',
    title: 'Stratum Mining Core OS · Production Engine',
    category: 'Operating System & Crypto',
    description: 'Specialized production mining operating system with real-time Stratum+TCP telemetry, hashrate visualization, share analytics, and sovereign microkernel logs.',
    tags: ['Mining', 'Stratum+TCP', 'Crypto', 'Hashrate', 'Telemetry', 'A. Keddeh'],
    color: 'from-cyan-500 via-blue-600 to-indigo-700',
    code: MINING_OS_HTML,
  },
  {
    id: 'kera-mesh-node',
    name: 'KERA_Mesh_Node.html',
    title: 'KERA Sovereign Mesh Node · P2P Discovery Matrix',
    category: 'Networking & Infrastructure',
    description: 'Resident HTML projection app for KERA Mesh P2P discovery matrix, binding UDP multicast (239.29.7.100:4003) and streaming live carrier telemetry from the PM2 substrate.',
    tags: ['KERA Mesh', 'P2P Matrix', 'Multicast UDP', 'Carrier Mesh', 'A. Keddeh', 'Telemetry'],
    color: 'from-purple-500 via-violet-600 to-cyan-500',
    code: KERA_MESH_OS_HTML,
  }
];
