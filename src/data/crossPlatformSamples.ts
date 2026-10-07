import { FileItem } from '../types';

// Helper to create Uint8Array base64 data URL or raw byte array
function createElfBytes(): string {
  const bytes = new Uint8Array(256);
  // ELF Header (64-bit Little Endian, x86-64)
  bytes.set([
    0x7f, 0x45, 0x4c, 0x46, // \x7fELF
    0x02,                   // 64-bit
    0x01,                   // Little endian
    0x01,                   // Version 1
    0x00,                   // System V ABI
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // Padding
    0x02, 0x00,             // ET_EXEC
    0x3e, 0x00,             // EM_X86_64
    0x01, 0x00, 0x00, 0x00, // EV_CURRENT
    0x00, 0x10, 0x40, 0x00, 0x00, 0x00, 0x00, 0x00, // e_entry: 0x401000
    0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // e_phoff
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00  // e_shoff
  ], 0);

  // Embedded strings
  const str = "GLIBC_2.34\0libc.so.6\0printf\0KEDDEH Linux High-Throughput Worker Engine v2.4\0Execution Verified [PID 4092]\0";
  for (let i = 0; i < str.length; i++) {
    bytes[64 + i] = str.charCodeAt(i);
  }
  return btoa(String.fromCharCode.apply(null, Array.from(bytes)));
}

function createPeBytes(): string {
  const bytes = new Uint8Array(256);
  // DOS Header
  bytes[0] = 0x4d; // 'M'
  bytes[1] = 0x5a; // 'Z'
  bytes[0x3c] = 0x40; // e_lfanew = 0x40

  // PE Signature
  bytes.set([0x50, 0x45, 0x00, 0x00], 0x40); // 'PE\0\0'
  // COFF Header (AMD64, 4 sections)
  bytes.set([0x64, 0x86, 0x04, 0x00], 0x44);

  // Embedded strings
  const str = "KERNEL32.dll\0USER32.dll\0WriteFile\0GetStdHandle\0KEDDEH Win32 High-Fidelity Process Engine\0Calculations Complete [Exit 0]\0";
  for (let i = 0; i < str.length; i++) {
    bytes[80 + i] = str.charCodeAt(i);
  }
  return btoa(String.fromCharCode.apply(null, Array.from(bytes)));
}

function createMachoBytes(): string {
  const bytes = new Uint8Array(256);
  // Mach-O 64-bit Little Endian (Apple Silicon ARM64)
  bytes.set([
    0xcf, 0xfa, 0xed, 0xfe, // MH_MAGIC_64
    0x0c, 0x00, 0x00, 0x01, // CPU_TYPE_ARM64
    0x00, 0x00, 0x00, 0x00, // CPU_SUBTYPE_ARM64_ALL
    0x02, 0x00, 0x00, 0x00, // MH_EXECUTE
    0x04, 0x00, 0x00, 0x00  // ncmds
  ], 0);

  // Embedded strings
  const str = "libSystem.B.dylib\0_main\0XNU Darwin 23.0 Kernel Substrate\0Apple Silicon M-Series Thread Dispatch Active\0Process Terminated Normally\0";
  for (let i = 0; i < str.length; i++) {
    bytes[48 + i] = str.charCodeAt(i);
  }
  return btoa(String.fromCharCode.apply(null, Array.from(bytes)));
}

function createWasmBytes(): string {
  // A valid minimal WebAssembly module containing an exported function
  // (module (func (export "compute") (result i32) (i32.const 42)))
  const wasm = new Uint8Array([
    0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, // \0asm v1
    0x01, 0x05, 0x01, 0x60, 0x00, 0x01, 0x7f,       // Type section: () -> i32
    0x03, 0x02, 0x01, 0x00,                         // Function section: func 0 uses type 0
    0x07, 0x0b, 0x01, 0x07, 0x63, 0x6f, 0x6d, 0x70, 0x75, 0x74, 0x65, 0x00, 0x00, // Export: "compute"
    0x0a, 0x06, 0x01, 0x04, 0x00, 0x41, 0x2a, 0x0b // Code: i32.const 42; end
  ]);
  return btoa(String.fromCharCode.apply(null, Array.from(wasm)));
}

export const SAMPLE_CROSS_PLATFORM_FILES: FileItem[] = [
  {
    id: 'file-sample-html-cybergrid',
    name: 'cybergrid_arcade.html',
    folderId: 'folder-home',
    parentId: 'folder-home',
    category: 'code',
    mimeType: 'text/html',
    size: '4.8 KB',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    content: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>CyberGrid Terminal Arcade</title>
<style>
  body { margin:0; background:#07090e; color:#38bdf8; font-family:monospace; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; overflow:hidden; }
  canvas { border: 2px solid #0284c7; border-radius: 8px; box-shadow: 0 0 30px rgba(14,165,233,0.3); background: #030712; }
  h1 { font-size: 16px; letter-spacing: 3px; margin-bottom: 8px; color: #7dd3fc; }
  p { font-size: 11px; color: #94a3b8; }
</style>
</head>
<body>
  <h1>// CYBERGRID RUNTIME //</h1>
  <p>Interactive HTML5 Application · Arrow Keys to Navigate Particle Field</p>
  <canvas id="c" width="600" height="360"></canvas>
  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    let x = 300, y = 180, vx = 2, vy = 1.5;
    const particles = Array.from({length: 40}, () => ({
      x: Math.random() * 600,
      y: Math.random() * 360,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 3 + 1
    }));
    window.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') vx = -4;
      if (e.key === 'ArrowRight') vx = 4;
      if (e.key === 'ArrowUp') vy = -4;
      if (e.key === 'ArrowDown') vy = 4;
    });
    window.addEventListener('keyup', () => { vx = 1.5; vy = 1.2; });
    function render() {
      ctx.fillStyle = 'rgba(3, 7, 18, 0.2)';
      ctx.fillRect(0, 0, 600, 360);
      particles.forEach(p => {
        p.x = (p.x + p.vx + 600) % 600;
        p.y = (p.y + p.vy + 360) % 360;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      x = (x + vx + 600) % 600;
      y = (y + vy + 360) % 360;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 12, y - 12, 24, 24);
      requestAnimationFrame(render);
    }
    render();
  </script>
</body>
</html>`,
    starred: true,
    inTrash: false,
    tags: ['HTML5', 'Live Executable'],
    isSystem: false
  },
  {
    id: 'file-sample-linux-worker',
    name: 'keddeh_worker.elf',
    folderId: 'folder-home',
    parentId: 'folder-home',
    category: 'code',
    mimeType: 'application/x-executable',
    size: '18.4 KB',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    content: createElfBytes(),
    starred: true,
    inTrash: false,
    tags: ['Linux', 'ELF 64-bit'],
    isSystem: false
  },
  {
    id: 'file-sample-win-calc',
    name: 'hash_calculator.exe',
    folderId: 'folder-home',
    parentId: 'folder-home',
    category: 'code',
    mimeType: 'application/vnd.microsoft.portable-executable',
    size: '24.2 KB',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    content: createPeBytes(),
    starred: true,
    inTrash: false,
    tags: ['Windows', 'Win32 PE'],
    isSystem: false
  },
  {
    id: 'file-sample-mac-runner',
    name: 'darwin_core.app',
    folderId: 'folder-home',
    parentId: 'folder-home',
    category: 'code',
    mimeType: 'application/x-mach-binary',
    size: '32.1 KB',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    content: createMachoBytes(),
    starred: true,
    inTrash: false,
    tags: ['macOS', 'Mach-O ARM64'],
    isSystem: false
  },
  {
    id: 'file-sample-wasm-matrix',
    name: 'matrix_compute.wasm',
    folderId: 'folder-home',
    parentId: 'folder-home',
    category: 'code',
    mimeType: 'application/wasm',
    size: '2.4 KB',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    content: createWasmBytes(),
    starred: true,
    inTrash: false,
    tags: ['WASM', 'WebAssembly'],
    isSystem: false
  },
  {
    id: 'file-sample-linux-sh',
    name: 'cluster_bootstrap.sh',
    folderId: 'folder-home',
    parentId: 'folder-home',
    category: 'code',
    mimeType: 'text/x-shellscript',
    size: '1.1 KB',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    content: `#!/usr/bin/env bash
# KEDDEH High-Throughput Cluster Bootstrap
echo "[BOOTSTRAP] Initializing POSIX cluster interface..."
echo "[BOOTSTRAP] Allocating 128KB SRAM buffer..."
echo "[BOOTSTRAP] Connecting Stratum V2 mining lanes 01..20..."
echo "[STATUS] All 20 lanes online. Nonce scanning initiated."
exit 0`,
    starred: false,
    inTrash: false,
    tags: ['Shell', 'Script'],
    isSystem: false
  },
  {
    id: 'file-sample-win-bat',
    name: 'win32_hypervisor.bat',
    folderId: 'folder-home',
    parentId: 'folder-home',
    category: 'code',
    mimeType: 'application/x-bat',
    size: '0.8 KB',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    content: `@echo off
echo ==============================================
echo  KEDDEH WIN32 HYPERVISOR CONTROL SUBSTRATE
echo ==============================================
echo [INFO] CPU Target: AMD64 / AVX-512
echo [INFO] Mounting virtual ConHost window...
echo [INFO] Launching workers...
echo [SUCCESS] Hypervisor grid ready.
pause`,
    starred: false,
    inTrash: false,
    tags: ['Windows', 'Batch'],
    isSystem: false
  }
];
