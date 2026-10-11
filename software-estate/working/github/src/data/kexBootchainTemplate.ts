export const KEX_MICROKERNEL_VFS_BOOTCHAIN_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"/>
<title>KEX Microkernel VFS Bootchain · A. Keddeh · Braink AI</title>
<style>
:root {
  --bg: #020617;
  --panel: rgba(15, 23, 42, 0.95);
  --line: rgba(148, 163, 184, 0.25);
  --text: #e2e8f0;
  --muted: #94a3b8;
  --dim: #475569;
  --cyan: #38bdf8;
  --green: #4ade80;
  --amber: #fbbf24;
  --red: #f87171;
  --mono: "JetBrains Mono", "SFMono-Regular", Menlo, Monaco, Consolas, monospace;
  --sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

* { box-sizing: border-box; }
body {
  margin: 0;
  min-height: 100vh;
  background: radial-gradient(circle at 10% 0%, rgba(56, 189, 248, 0.12), transparent 30rem),
              radial-gradient(circle at 90% 10%, rgba(74, 222, 128, 0.08), transparent 25rem),
              #020617;
  color: var(--text);
  font-family: var(--sans);
  padding: 16px;
  overflow-x: hidden;
}

.shell {
  max-width: 1540px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Header Banner */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 18px;
  border-radius: 12px;
  background: var(--panel);
  border: 1px solid var(--line);
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--mono);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.05em;
}
.brand .pill {
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: var(--cyan);
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
}
.brand .sub {
  color: var(--muted);
  font-weight: 400;
  font-size: 12px;
}
.stage-pill {
  font-family: var(--mono);
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(251, 191, 36, 0.4);
  background: rgba(251, 191, 36, 0.1);
  color: var(--amber);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.stage-pill.done {
  border-color: rgba(74, 222, 128, 0.4);
  background: rgba(74, 222, 128, 0.1);
  color: var(--green);
}
.led {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: currentColor;
  box-shadow: 0 0 8px currentColor;
}

/* Bootchain Progress Pipeline */
.boot-pipeline {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}
.pipe-step {
  border: 1px solid var(--line);
  background: rgba(15, 23, 42, 0.7);
  border-radius: 10px;
  padding: 8px 10px;
  font-family: var(--mono);
  font-size: 11px;
  transition: all 0.2s ease;
  position: relative;
}
.pipe-step.pending { opacity: 0.4; }
.pipe-step.active {
  border-color: var(--amber);
  background: rgba(251, 191, 36, 0.08);
  opacity: 1;
}
.pipe-step.complete {
  border-color: var(--green);
  background: rgba(74, 222, 128, 0.08);
  opacity: 1;
}
.pipe-step strong { display: block; font-size: 11.5px; margin-bottom: 2px; }
.pipe-step span { font-size: 10px; color: var(--muted); }

/* Main Stage Container */
.stage-wrap {
  display: grid;
  grid-template-columns: 1.3fr 0.7fr;
  gap: 14px;
}
@media (max-width: 1080px) {
  .boot-pipeline { grid-template-columns: repeat(2, 1fr); }
  .stage-wrap { grid-template-columns: 1fr; }
}

/* TERMINAL_0: Bootstrap Carrier */
#stage-terminal-0 {
  border: 1px solid var(--line);
  background: #020617;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  min-height: 560px;
}
.t0-titlebar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(148, 163, 184, 0.15);
  padding-bottom: 10px;
  margin-bottom: 10px;
  font-family: var(--mono);
  font-size: 11px;
  color: var(--muted);
}
.t0-log {
  flex: 1;
  font-family: var(--mono);
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
  overflow-y: auto;
  color: #cbd5e1;
  padding-right: 6px;
}
.t0-promptline {
  display: flex;
  gap: 8px;
  align-items: center;
  border-top: 1px solid rgba(148, 163, 184, 0.15);
  padding-top: 10px;
  margin-top: 10px;
}
.t0-prompt {
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 700;
  color: var(--amber);
  white-space: nowrap;
}
input#t0-input {
  flex: 1;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(15, 23, 42, 0.85);
  color: #f8fafc;
  border-radius: 8px;
  padding: 8px 12px;
  font: 12.5px var(--mono);
  outline: none;
}
input#t0-input:focus {
  border-color: var(--cyan);
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
}

/* TERMINAL_1: Assembled Production Stage */
#stage-terminal-1 {
  display: none;
  border: 1px solid rgba(74, 222, 128, 0.35);
  background: #020617;
  border-radius: 14px;
  padding: 0;
  min-height: 560px;
  overflow: hidden;
  position: relative;
}
#t1-frame {
  width: 100%;
  height: 580px;
  border: none;
  display: block;
}

/* VFS Inode Inspector Pane */
.vfs-pane {
  border: 1px solid var(--line);
  background: rgba(15, 23, 42, 0.7);
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 640px;
  overflow-y: auto;
}
.pane-title {
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 700;
  color: var(--cyan);
  display: flex;
  justify-content: space-between;
}
.tree-box {
  font-family: var(--mono);
  font-size: 11px;
  line-height: 1.5;
  white-space: pre-wrap;
  color: #94a3b8;
  background: rgba(2, 6, 23, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 8px;
  padding: 10px;
  max-height: 220px;
  overflow-y: auto;
}
.file-preview-box {
  font-family: var(--mono);
  font-size: 10.5px;
  line-height: 1.5;
  white-space: pre-wrap;
  color: #cbd5e1;
  background: rgba(2, 6, 23, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 8px;
  padding: 10px;
  max-height: 240px;
  overflow-y: auto;
}

/* Quick Action Chips */
.quick-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}
.quick-btn {
  font-family: var(--mono);
  font-size: 11px;
  border: 1px solid rgba(56, 189, 248, 0.3);
  background: rgba(56, 189, 248, 0.08);
  color: var(--cyan);
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.quick-btn:hover {
  background: rgba(56, 189, 248, 0.2);
  border-color: var(--cyan);
}
.quick-btn.danger {
  border-color: rgba(248, 113, 113, 0.3);
  background: rgba(248, 113, 113, 0.08);
  color: var(--red);
}
.quick-btn.danger:hover {
  background: rgba(248, 113, 113, 0.2);
}
</style>
</head>
<body>

<div class="shell">
  <!-- Header Bar -->
  <header class="top-bar">
    <div class="brand">
      <span class="pill">KEX-BOOTCHAIN</span>
      <span>A. KEDDEH // BRAINK AI</span>
      <span class="sub">VFS-Driven Bootloader → Microkernel → Micro-OS → Assembler</span>
    </div>
    <div class="stage-pill" id="stageIndicator">
      <span class="led"></span>
      <span id="stageLabel">STAGE 0: BOOTSTRAP TERMINAL</span>
    </div>
  </header>

  <!-- 7-Stage Bootchain Pipeline Tracker -->
  <nav class="boot-pipeline">
    <div class="pipe-step active" id="pipe-0">
      <strong>1. TERMINAL_0</strong>
      <span>Bootstrap carrier</span>
    </div>
    <div class="pipe-step pending" id="pipe-1">
      <strong>2. PRELOAD_VFS</strong>
      <span>Image validation</span>
    </div>
    <div class="pipe-step pending" id="pipe-2">
      <strong>3. BOOTLOADER</strong>
      <span>/boot/kexboot.json</span>
    </div>
    <div class="pipe-step pending" id="pipe-3">
      <strong>4. MICROKERNEL</strong>
      <span>Ring-0 vfs mount</span>
    </div>
    <div class="pipe-step pending" id="pipe-4">
      <strong>5. MICRO-OS</strong>
      <span>Daemons & processes</span>
    </div>
    <div class="pipe-step pending" id="pipe-5">
      <strong>6. ASSEMBLER</strong>
      <span>Spec → Terminal vNext</span>
    </div>
    <div class="pipe-step pending" id="pipe-6">
      <strong>7. TERMINAL_1</strong>
      <span>Assembled workstation</span>
    </div>
  </nav>

  <!-- Workspace Container -->
  <div class="stage-wrap">
    <!-- Carrier Container -->
    <div id="carrier-container">
      <!-- TERMINAL_0: Bootstrap Carrier (Accepts only boot/inspect/install commands) -->
      <section id="stage-terminal-0">
        <div class="t0-titlebar">
          <span>KEX_TERMINAL_0 [BOOTSTRAP_PROMPT]</span>
          <div class="quick-row">
            <button class="quick-btn" onclick="execT0('boot')">▶ boot</button>
            <button class="quick-btn" onclick="execT0('vfs inspect')">vfs inspect</button>
            <button class="quick-btn" onclick="execT0('help')">help</button>
            <button class="quick-btn danger" onclick="resetBootchain()">reset</button>
          </div>
        </div>
        <div class="t0-log" id="t0-output"></div>
        <div class="t0-promptline" id="t0-input-line">
          <span class="t0-prompt">kex-bootldr#</span>
          <input id="t0-input" autocomplete="off" spellcheck="false" autofocus placeholder="type 'boot' to execute bootchain, or 'help'..." />
        </div>
      </section>

      <!-- TERMINAL_1: Assembled Production Stage (Generated dynamically by Micro-OS & Assembler) -->
      <section id="stage-terminal-1">
        <iframe id="t1-frame" sandbox="allow-scripts allow-forms"></iframe>
      </section>
    </div>

    <!-- Live VFS & Inode Inspector -->
    <aside class="vfs-pane">
      <div class="pane-title">
        <span>PRELOADED VFS IMAGE</span>
        <span id="vfs-size-badge" style="color: var(--muted); font-size: 10px;">INODES: 0</span>
      </div>
      <div class="tree-box" id="vfs-tree-display"></div>
      <div class="pane-title">
        <span>INSPECTED INODE</span>
        <span id="inspected-path" style="color: var(--muted); font-size: 10px;">/boot/kexboot.json</span>
      </div>
      <div class="file-preview-box" id="vfs-file-preview"></div>
    </aside>
  </div>
</div>

<script>
// ==========================================
// KERNEL SYSCALL BRIDGE (Parent Membrane)
// ==========================================
const pendingSyscalls = new Map();
window.addEventListener('message', (e) => {
  if (e.data && e.data.__kernel_syscall_response) {
    const { id, result } = e.data.__kernel_syscall_response;
    if (pendingSyscalls.has(id)) {
      pendingSyscalls.get(id)(result);
      pendingSyscalls.delete(id);
    }
  }
});

async function syscall(call, args = []) {
  const id = Math.random().toString(36).substring(2, 11);
  return new Promise((resolve) => {
    pendingSyscalls.set(id, resolve);
    window.parent.postMessage({ __kernel_syscall: { call, args, id } }, '*');
  });
}

// BOOT INTEGRITY CHECK (PROVENANCE VERIFICATION)
async function verifyIntegrity() {
  console.log('[KEX Bootchain] Verifying application provenance...');
  const verified = await syscall('SYS_VERIFY_APP', [typeof APP_ID !== 'undefined' ? APP_ID : 'kex-bootchain', typeof APP_HASH !== 'undefined' ? APP_HASH : 'none']);
  if (verified) {
    console.log('[KEX Bootchain] SHA-256 Provenance Ledger Match: OK');
  } else {
    console.warn('[KEX Bootchain] Warning: Provenance verification failed or ledger mismatch.');
  }
}
verifyIntegrity();

// ----------------------------------------------------------------------------
// 2. EMBEDDED PRELOADED_VFS_IMAGE (Complete filesystem image with bootfiles)
// ----------------------------------------------------------------------------
const PRELOADED_VFS_IMAGE = {
  "/boot/kexboot.json": JSON.stringify({
    schema: "kexboot/v1",
    authority: "A.KEDDEH",
    kernel_entry: "/kernel/microkernel.kex",
    init_entry: "/micro-os/init.kex",
    assembly_spec: "/build/terminal/spec.json",
    required_manifest: [
      "/boot/kexboot.json",
      "/kernel/microkernel.kex",
      "/micro-os/init.kex",
      "/micro-os/services.json",
      "/build/terminal/spec.json"
    ],
    hash_algorithm: "SHA-256",
    zero_policy: "strictly non-zero weighted live state"
  }, null, 2),

  "/kernel/microkernel.kex": [
    "# KEX MICROKERNEL RING-0 DIRECTIVE",
    "ARCH: x86_64-wasm",
    "AUTHORITY: A.KEDDEH",
    "PAGE_SIZE: 4096",
    "MEM_MAPPING: [0x00000000 -> 0x00400000]",
    "VFS_ROOT_INODE: 2",
    "PROCESS_CAPACITY: 128",
    "INIT_EXEC_ENTRY: /micro-os/init.kex"
  ].join("\\n"),

  "/micro-os/init.kex": [
    "#!/bin/kex-sh",
    "# KEX MICRO-OS INIT DAEMON (PID 1)",
    "mount -t vfs /dev/vfs0 /",
    "load-services /micro-os/services.json",
    "verify-lineage --authority A.KEDDEH",
    "assemble-terminal --spec /build/terminal/spec.json --out /run/terminal.vnext.html",
    "exec /run/terminal.vnext.html"
  ].join("\\n"),

  "/micro-os/services.json": JSON.stringify({
    services: [
      { id: "kex-volume-mnt", name: "KEX Volume Storage Engine", state: "STARTING", pid: 2 },
      { id: "braink-ai-mesh", name: "Braink AI Neural Bus", state: "STARTING", pid: 3 },
      { id: "proof-ledgerd", name: "SHA-256 Lineage Ledger", state: "STARTING", pid: 4 },
      { id: "terminal-assembler", name: "VNext Terminal Compiler", state: "RUNNING", pid: 5 }
    ]
  }, null, 2),

  "/build/terminal/spec.json": JSON.stringify({
    spec_version: "terminal.vnext.2026",
    authority: "A.KEDDEH",
    title: "KEX Linux Workstation vNext",
    theme: "cyber-cyan",
    features: [
      "VFS Inode Explorer",
      "Process Scheduler Reflection",
      "Interactive Shell Execution",
      "Microkernel Proof Verification"
    ],
    default_prompt: "ak@kex-linux:~$"
  }, null, 2),

  "/etc/os-release": [
    'NAME="KEX Linux Microkernel"',
    'VERSION="6.0.297-bootchain"',
    'ID=kex-linux',
    'AUTHORITY="A.KEDDEH"',
    'PRETTY_NAME="KEX Linux 6.0 (Assembled by Microkernel)"'
  ].join("\\n"),

  "/etc/hostname": "kex-microkernel\\n",

  "/boot/grub/grub.cfg": [
    "set default=0",
    "set timeout=3",
    "menuentry 'KEX Linux Microkernel 6.0 (Ring-0 WASM)' {",
    "    linux /kernel/microkernel.kex root=/dev/vfs0 quiet authority=A.KEDDEH",
    "    initrd /micro-os/init.kex",
    "}"
  ].join("\\n"),

  "/micro-os/daemons.conf": [
    "[program:kex-volume-mnt]",
    "command=/bin/kex-volume-vfs --mount-point /kex-volume",
    "autostart=true",
    "autorestart=true",
    "",
    "[program:braink-ai-mesh]",
    "command=/bin/braink-ai-core --vector-dimensions 1536",
    "autostart=true",
    "",
    "[program:proof-ledgerd]",
    "command=/bin/proof-ledgerd --algorithm sha256 --verify-lineage",
    "autostart=true"
  ].join("\\n"),

  "/build/terminal/theme.css": [
    ":root {",
    "  --bg-primary: #050811;",
    "  --accent-cyan: #38bdf8;",
    "  --accent-green: #22c55e;",
    "  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;",
    "}",
    ".terminal-container { background: var(--bg-primary); border: 1px solid rgba(56, 189, 248, 0.2); }"
  ].join("\\n"),

  "/home/operator/manifest.yaml": [
    "apiVersion: kex.microkernel/v1",
    "kind: NodeDeployment",
    "metadata:",
    "  name: sovereign-worker-alpha",
    "  authority: A.KEDDEH",
    "spec:",
    "  replicas: 3",
    "  vfsStorage: 10Gi",
    "  isolation: ring-0-wasm"
  ].join("\\n"),

  "/var/log/bootchain_audit.log": [
    "2026-09-20T12:00:00.102Z [STAGE-0] Carrier bootstrap initialized.",
    "2026-09-20T12:00:00.145Z [STAGE-1] Inode preloader validated disk image integrity.",
    "2026-09-20T12:00:00.210Z [STAGE-2] Bootloader verified /boot/kexboot.json manifest."
  ].join("\\n"),

  "/kex-volume/proof/SEED_HASH.txt": "3807f83f9af105b87a40f7532ba961ad7826dd82b3d59fd518b0e679624fee8d\\n"
};

// Machine State
let bootchainState = {
  stage: 0, // 0: TERMINAL_0, 1: VFS, 2: BOOTLOADER, 3: MICROKERNEL, 4: MICRO_OS, 5: ASSEMBLER, 6: TERMINAL_1
  vfs: {},
  bootConfig: null,
  kernelVerified: false,
  services: [],
  assembledHtml: null
};

// Helper: Output to TERMINAL_0
const t0Output = document.getElementById("t0-output");
function logT0(text, color = "#cbd5e1") {
  const line = document.createElement("div");
  line.style.color = color;
  line.textContent = text;
  t0Output.appendChild(line);
  t0Output.scrollTop = t0Output.scrollHeight;
}

// SHA-256 Helper
async function computeSha256(text) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// Update Bootchain Step Visuals
function updatePipelineStep(stepIndex, state) {
  const el = document.getElementById("pipe-" + stepIndex);
  if (!el) return;
  el.className = "pipe-step " + state;
}

function setStageBadge(label, isDone = false) {
  const ind = document.getElementById("stageIndicator");
  const lbl = document.getElementById("stageLabel");
  lbl.textContent = label;
  if (isDone) ind.classList.add("done");
  else ind.classList.remove("done");
}

// ----------------------------------------------------------------------------
// 1. TERMINAL_0 BOOTSTRAP INITIALIZATION
// ----------------------------------------------------------------------------
function initTerminal0() {
  t0Output.innerHTML = "";
  logT0("KEX BOOTSTRAP CARRIER · TERMINAL_0", "#38bdf8");
  logT0("Authority: A. KEDDEH // BRAINK AI", "#94a3b8");
  logT0("VFS Preloaded: " + Object.keys(PRELOADED_VFS_IMAGE).length + " inodes available in disk image.", "#94a3b8");
  logT0("Awaiting operator directive. Type 'boot' to commence bootchain.\\n");
  updatePipelineStep(0, "active");
  setStageBadge("STAGE 0: BOOTSTRAP TERMINAL");
  renderVfsTree(PRELOADED_VFS_IMAGE);
  inspectFile("/boot/kexboot.json");
}

// ----------------------------------------------------------------------------
// 2-6. THE BOOTCHAIN ORCHESTRATOR
// ----------------------------------------------------------------------------
async function runBootchain() {
  if (bootchainState.stage > 0 && bootchainState.stage < 6) {
    logT0("[!] Bootchain execution already in progress...", "#fbbf24");
    return;
  }

  logT0(">>> INITIATING BOOTCHAIN DIRECTIVE...", "#38bdf8");

  // --- STEP 1: PRELOAD VFS ---
  bootchainState.stage = 1;
  updatePipelineStep(0, "complete");
  updatePipelineStep(1, "active");
  setStageBadge("STAGE 1: PRELOADING VFS IMAGE");
  
  // Real telemetry from host
  const telemetry = await syscall('SYS_GET_TELEMETRY');
  logT0("[1/6] Preloading raw VFS image into memory...");
  logT0("      -> Host Hardware: " + telemetry.computePower + " GFLOPS detected.");
  logT0("      -> Memory Pool:   " + (telemetry.memoryUsage * 100).toFixed(2) + "% utilized.");
  await delay(120);

  bootchainState.vfs = JSON.parse(JSON.stringify(PRELOADED_VFS_IMAGE));
  renderVfsTree(bootchainState.vfs);
  logT0("      -> Mounted " + Object.keys(bootchainState.vfs).length + " system inodes into VFS table.");
  updatePipelineStep(1, "complete");

  // --- STEP 2: BOOTLOADER READS /boot/kexboot.json ---
  bootchainState.stage = 2;
  updatePipelineStep(2, "active");
  setStageBadge("STAGE 2: PARSING /boot/kexboot.json");
  logT0("[2/6] Bootloader parsing /boot/kexboot.json...");
  await delay(260);

  const rawConfig = bootchainState.vfs["/boot/kexboot.json"];
  if (!rawConfig) {
    logT0("[FAIL] /boot/kexboot.json missing from VFS!", "#f87171");
    return;
  }
  bootchainState.bootConfig = JSON.parse(rawConfig);
  logT0("      -> Authority: " + bootchainState.bootConfig.authority);
  logT0("      -> Kernel target: " + bootchainState.bootConfig.kernel_entry);
  logT0("      -> Init daemon:   " + bootchainState.bootConfig.init_entry);
  updatePipelineStep(2, "complete");

  // --- STEP 3: MICROKERNEL VALIDATION & MOUNT ---
  bootchainState.stage = 3;
  updatePipelineStep(3, "active");
  setStageBadge("STAGE 3: MICROKERNEL VALIDATION");
  logT0("[3/6] Microkernel booting & validating bootfile hashes...");
  await delay(300);

  for (const path of bootchainState.bootConfig.required_manifest) {
    const content = bootchainState.vfs[path];
    if (!content) {
      logT0("[FAIL] Manifest file missing: " + path, "#f87171");
      return;
    }
    const hash = await computeSha256(content);
    logT0("      -> Verified " + path.padEnd(26) + " [" + hash.slice(0, 10) + "...]");
  }
  bootchainState.kernelVerified = true;
  logT0("      -> Ring-0 microkernel memory boundaries locked.");
  updatePipelineStep(3, "complete");

  // --- STEP 4: MICRO-OS SERVICE & PROCESS ENGINE ---
  bootchainState.stage = 4;
  updatePipelineStep(4, "active");
  setStageBadge("STAGE 4: MICRO-OS SERVICE ACTIVATION");
  logT0("[4/6] Micro-OS starting init daemon & background services...");
  
  const hostProcs = await syscall('SYS_GET_PROCS');
  logT0("      -> Host Microkernel reports " + hostProcs.length + " active system tasks.");
  await delay(220);

  const srvData = JSON.parse(bootchainState.vfs["/micro-os/services.json"]);
  bootchainState.services = srvData.services.map(s => ({ ...s, state: "RUNNING" }));
  for (const s of bootchainState.services) {
    logT0("      -> [PID " + s.pid + "] " + s.name.padEnd(30) + " [ONLINE]");
  }
  updatePipelineStep(4, "complete");

  // --- STEP 5: ASSEMBLER BUILDS terminal.vnext.html ---
  bootchainState.stage = 5;
  updatePipelineStep(5, "active");
  setStageBadge("STAGE 5: ASSEMBLING TERMINAL vNEXT");
  logT0("[5/6] Assembler generating production TERMINAL_1 from /build/terminal/spec.json...");
  await delay(380);

  const spec = JSON.parse(bootchainState.vfs["/build/terminal/spec.json"]);
  bootchainState.assembledHtml = assembleTerminalVNext(spec, bootchainState.vfs, bootchainState.services);

  // Store the compiled artifact back into VFS at /run/terminal.vnext.html
  bootchainState.vfs["/run/terminal.vnext.html"] = bootchainState.assembledHtml;
  renderVfsTree(bootchainState.vfs);
  logT0("      -> Generated /run/terminal.vnext.html (" + bootchainState.assembledHtml.length + " bytes)");
  updatePipelineStep(5, "complete");

  // --- STEP 6: SPAWN TERMINAL_1 IN CONTROLLED RUNTIME MEMBRANE ---
  bootchainState.stage = 6;
  updatePipelineStep(6, "complete");
  setStageBadge("STAGE 6: TERMINAL_1 RUNNING", true);
  logT0("[6/6] Controlled membrane transition: Spawning TERMINAL_1...", "#4ade80");
  await delay(300);

  activateTerminal1(bootchainState.assembledHtml);
}

// ----------------------------------------------------------------------------
// 6. THE ASSEMBLER (Builds the standalone TERMINAL_1 artifact from VFS)
// ----------------------------------------------------------------------------
function assembleTerminalVNext(spec, vfs, services) {
  const escapedVfs = JSON.stringify(vfs).replace(/</g, "\\\\u003c");
  const escapedServices = JSON.stringify(services);

  return \`<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<title>\${spec.title}</title>
<style>
  :root {
    --bg: #030712;
    --panel: #0f172a;
    --cyan: #38bdf8;
    --green: #4ade80;
    --text: #f8fafc;
    --muted: #94a3b8;
    --mono: "JetBrains Mono", Menlo, Consolas, monospace;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    height: 100vh;
    background: var(--bg);
    color: var(--text);
    font-family: var(--mono);
    display: flex;
    flex-direction: column;
    padding: 12px;
  }
  .t1-header {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid rgba(56, 189, 248, 0.2);
    padding-bottom: 8px;
    margin-bottom: 10px;
    font-size: 11px;
    color: var(--muted);
  }
  .t1-header strong { color: var(--cyan); }
  .screen {
    flex: 1;
    overflow-y: auto;
    font-size: 12.5px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
    padding-right: 6px;
  }
  .prompt-row {
    display: flex;
    gap: 8px;
    align-items: center;
    border-top: 1px solid rgba(148, 163, 184, 0.15);
    padding-top: 8px;
    margin-top: 8px;
  }
  .prompt { color: var(--green); font-weight: bold; }
  input {
    flex: 1;
    background: transparent;
    border: none;
    color: #f8fafc;
    font: inherit;
    outline: none;
  }
  .cyan { color: var(--cyan); }
  .green { color: var(--green); }
  .muted { color: var(--muted); }
</style>
</head>
<body>
  <div class="t1-header">
    <span>\${spec.title} · Assembled by Micro-OS</span>
    <span>STATUS: <strong class="green">RING-3 APPLICATION CONTAINER</strong></span>
  </div>
  <div class="screen" id="termScreen"></div>
  <div class="prompt-row">
    <span class="prompt">\${spec.default_prompt}</span>
    <input id="termInput" autofocus autocomplete="off" spellcheck="false" placeholder="type 'help', 'ls', 'cat <file>', 'ps', 'uname'..." />
  </div>

<script>
  const VFS = \${escapedVfs};
  const SERVICES = \${escapedServices};
  const termScreen = document.getElementById("termScreen");
  const termInput = document.getElementById("termInput");

  function print(text, cls = "") {
    const div = document.createElement("div");
    if (cls) div.className = cls;
    div.textContent = text;
    termScreen.appendChild(div);
    termScreen.scrollTop = termScreen.scrollHeight;
  }

  print("=== KEX LINUX WORKSTATION vNEXT (TERMINAL_1) ===", "cyan");
  print("Booted from /kernel/microkernel.kex & /micro-os/init.kex");
  print("Preloaded VFS and system daemons are mounted and active.\\n");

  termInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const line = termInput.value.trim();
      termInput.value = "";
      if (!line) return;
      print("\${spec.default_prompt} " + line, "muted");
      execT1(line);
    }
  });

  function execT1(cmd) {
    const [c, ...args] = cmd.split(/\\\\s+/);
    switch(c) {
      case "help":
        print("TERMINAL_1 Commands:");
        print("  ls [path]      List files in mounted VFS");
        print("  cat <file>     Display contents of file in VFS");
        print("  ps             List processes spawned by Micro-OS");
        print("  uname -a       Show microkernel release and architecture");
        print("  clear          Clear workstation screen");
        break;
      case "ls":
        const dir = args[0] || "/";
        const matches = Object.keys(VFS).filter(k => k.startsWith(dir === "/" ? "/" : dir));
        if (!matches.length) print("ls: cannot access '" + dir + "': No such file");
        else print(matches.join("  "));
        break;
      case "cat":
        if (!args[0]) { print("usage: cat <file>"); break; }
        const p = args[0].startsWith("/") ? args[0] : "/" + args[0];
        if (VFS[p]) print(VFS[p]);
        else print("cat: " + args[0] + ": No such file");
        break;
      case "ps":
        print("PID  STATE    SERVICE / COMMAND");
        print("  1  RUNNING  /micro-os/init.kex");
        SERVICES.forEach(s => {
          print(String(s.pid).padStart(3) + "  " + s.state.padEnd(8) + " " + s.name);
        });
        break;
      case "uname":
        print("KEX-Microkernel 6.0.297-bootchain x86_64-wasm (Auth: A. Keddeh)");
        break;
      case "clear":
        termScreen.innerHTML = "";
        break;
      default:
        print("bash: " + c + ": command not found");
    }
  }
<\\\\/script>
</body>
</html>\`;
}

// ----------------------------------------------------------------------------
// 7. MEMBRANE ACTIVATION (Mounts TERMINAL_1 into iframe)
// ----------------------------------------------------------------------------
function activateTerminal1(htmlSource) {
  const t0Stage = document.getElementById("stage-terminal-0");
  const t1Stage = document.getElementById("stage-terminal-1");
  const frame = document.getElementById("t1-frame");

  // Set the assembled code directly into sandboxed iframe membrane
  frame.srcdoc = htmlSource;
  t0Stage.style.display = "none";
  t1Stage.style.display = "block";
}

function resetBootchain() {
  document.getElementById("stage-terminal-0").style.display = "flex";
  document.getElementById("stage-terminal-1").style.display = "none";
  for (let i = 0; i <= 6; i++) {
    updatePipelineStep(i, i === 0 ? "active" : "pending");
  }
  bootchainState = {
    stage: 0,
    vfs: {},
    bootConfig: null,
    kernelVerified: false,
    services: [],
    assembledHtml: null
  };
  initTerminal0();
}

// ----------------------------------------------------------------------------
// TERMINAL_0 COMMAND INTERPRETER
// (Only accepts bootstrap directives: boot, vfs inspect, cat, help, reset)
// ----------------------------------------------------------------------------
const t0Input = document.getElementById("t0-input");
t0Input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const val = t0Input.value.trim();
    t0Input.value = "";
    if (!val) return;
    execT0(val);
  }
});

function execT0(cmd) {
  logT0("kex-bootldr# " + cmd, "#fbbf24");
  const [c, ...args] = cmd.split(/\\s+/);

  switch(c) {
    case "boot":
      runBootchain();
      break;
    case "vfs":
      if (args[0] === "inspect" || !args[0]) {
        logT0("Preloaded VFS Inode Manifest:");
        Object.keys(PRELOADED_VFS_IMAGE).forEach(k => logT0("  " + k));
      } else {
        logT0("usage: vfs inspect");
      }
      break;
    case "cat":
      if (!args[0]) { logT0("usage: cat <path>"); break; }
      const p = args[0].startsWith("/") ? args[0] : "/" + args[0];
      if (PRELOADED_VFS_IMAGE[p]) {
        logT0("--- INODE: " + p + " ---", "#38bdf8");
        logT0(PRELOADED_VFS_IMAGE[p]);
        inspectFile(p);
      } else {
        logT0("cat: " + args[0] + ": Inode not found in VFS image", "#f87171");
      }
      break;
    case "help":
      logT0("TERMINAL_0 Bootstrap Directives:");
      logT0("  boot           Execute bootchain (/boot/kexboot.json -> Assembler)");
      logT0("  vfs inspect    Enumerate preloaded VFS disk image");
      logT0("  cat <path>     Inspect raw bootfile in preloaded image");
      logT0("  reset          Reinitialize carrier to Stage 0");
      break;
    case "reset":
    case "reboot":
      resetBootchain();
      break;
    default:
      logT0("bootldr: unknown directive '" + c + "'. Type 'boot' or 'help'.", "#f87171");
  }
}

// ----------------------------------------------------------------------------
// VFS INSPECTOR UI HELPERS
// ----------------------------------------------------------------------------
function renderVfsTree(vfsMap) {
  const treeEl = document.getElementById("vfs-tree-display");
  const countBadge = document.getElementById("vfs-size-badge");
  const paths = Object.keys(vfsMap).sort();
  countBadge.textContent = "INODES: " + paths.length;

  let out = "/\\n";
  paths.forEach((p, idx) => {
    const isLast = idx === paths.length - 1;
    out += (isLast ? "└── " : "├── ") + p + "\\n";
  });
  treeEl.textContent = out;
}

function inspectFile(path) {
  const preview = document.getElementById("vfs-file-preview");
  const label = document.getElementById("inspected-path");
  label.textContent = path;
  preview.textContent = PRELOADED_VFS_IMAGE[path] || "[inode not found]";
}

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

// Initial Boot
initTerminal0();
</script>
</body>
</html>
`;
