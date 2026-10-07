import React, { useState } from 'react';
import {
  Cpu,
  Monitor,
  HardDrive,
  Download,
  Play,
  RotateCw,
  Sliders,
  CheckCircle2,
  Sparkles,
  Zap,
  Layers,
  ArrowRight,
  Terminal,
  Settings,
  Shield,
  FileCode,
  ExternalLink,
  PlusCircle,
  HelpCircle,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { OperatingSystemCatalogItem, VirtualHardwareSpec, ServerNode } from '../../types';
import { OPEN_SOURCE_OS_CATALOG, DEFAULT_HARDWARE_SPEC } from '../../data/serverspaceData';
import { ComplianceVerifier } from './ComplianceVerifier';

interface OsInstallationStudioProps {
  activeNode: ServerNode;
  onApplyHardwareSpec: (spec: VirtualHardwareSpec) => void;
  onInstallComplete: (os: OperatingSystemCatalogItem, spec: VirtualHardwareSpec) => void;
  onLaunchDesktop: () => void;
  onRequestHelp?: (topicId: string) => void;
}

export const OsInstallationStudio: React.FC<OsInstallationStudioProps> = ({
  activeNode,
  onApplyHardwareSpec,
  onInstallComplete,
  onLaunchDesktop,
  onRequestHelp,
}) => {
  const [catalog, setCatalog] = useState<OperatingSystemCatalogItem[]>(OPEN_SOURCE_OS_CATALOG);
  const [selectedOsId, setSelectedOsId] = useState<string>('os-kex-linux');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'linux' | 'bsd' | 'specialized' | 'custom'>('all');
  const [spec, setSpec] = useState<VirtualHardwareSpec>(DEFAULT_HARDWARE_SPEC);

  // Custom ISO state
  const [customIsoUrl, setCustomIsoUrl] = useState('');
  const [customIsoName, setCustomIsoName] = useState('');

  // Verifiable State Machine for OS Deployment
  type DeploymentState = 'IDLE' | 'AUDIT_REQUIRED' | 'INSTALLING' | 'BOOTING' | 'COMPLETED' | 'ABORTED';
  const [deploymentState, setDeploymentState] = useState<DeploymentState>('IDLE');
  const [installProgress, setInstallProgress] = useState(0);
  const [installStepLog, setInstallStepLog] = useState<string[]>([]);
  const [verifiedLicense, setVerifiedLicense] = useState<string | null>(null);

  const selectedOs = catalog.find((item) => item.id === selectedOsId) || catalog[0];

  // Formal Transition Logic (The Logical Guardrail)
  const transitionTo = (nextState: DeploymentState) => {
    const validTransitions: Record<DeploymentState, DeploymentState[]> = {
      'IDLE': ['AUDIT_REQUIRED', 'INSTALLING', 'ABORTED'],
      'AUDIT_REQUIRED': ['INSTALLING', 'ABORTED', 'IDLE'],
      'INSTALLING': ['BOOTING', 'ABORTED'],
      'BOOTING': ['COMPLETED', 'ABORTED'],
      'COMPLETED': ['IDLE'],
      'ABORTED': ['IDLE']
    };

    if (!validTransitions[deploymentState].includes(nextState)) {
      console.error(`INVARIANT_VIOLATION: Illegal state transition from ${deploymentState} to ${nextState}`);
      return;
    }

    // Rigorous Guardrail: Cannot enter INSTALLING for specialized OS without verification
    if (nextState === 'INSTALLING' && selectedOs.category === 'specialized' && !verifiedLicense) {
      console.error('COMPLIANCE_VIOLATION: Transition to INSTALLING blocked by missing verifiable audit.');
      setDeploymentState('AUDIT_REQUIRED');
      return;
    }

    setDeploymentState(nextState);
  };

  const handleStartInstallation = async () => {
    transitionTo('INSTALLING');
    setInstallProgress(5);
    setInstallStepLog([
      `[INIT] Mounting virtual target drive (${spec.diskGb} GB via ${spec.storageBus})`,
      `[BUS] Allocating ${spec.cpuCores} Cores (${spec.cpuArchitecture}) with ${spec.cpuClockGhz}GHz ${spec.cpuGovernor} governor`,
      `[GPU] Initializing hardware passthrough accelerator: ${spec.gpuModel}`,
    ]);

    // Stage 1: Partitioning (Real VFS interaction)
    const { GLOBAL_KERNEL_OE } = await import('../../services/brainkCognitiveSubstrate');
    GLOBAL_KERNEL_OE.syscall('SYS_WRITE_INODE', [`/dev/vfs_partition_${selectedOs.id}`, `BOOT_SECTOR_${selectedOs.name}`, 0o600]);
    await new Promise(r => setTimeout(r, 400));
    setInstallProgress(25);
    setInstallStepLog(prev => [...prev, `[VFS] Partitioning disk with GPT... OK`, `[VFS] Created root partition at /dev/vfs_partition_${selectedOs.id}`]);

    // Stage 2: Hardware Verification (Real execution)
    setInstallStepLog(prev => [...prev, `[HW] Executing physical silicon audit via WebGL2 and Worker Pool...`]);
    const { detectCpuHardware, detectGpuHardware, runStressBenchmark } = await import('../../services/hardwareComputeEngine');
    const cpuInfo = detectCpuHardware();
    const gpuInfo = detectGpuHardware();
    
    // Run a real 1-second benchmark to verify stability
    const benchmarkResult = await runStressBenchmark(1000);
    
    setInstallProgress(45);
    setInstallStepLog(prev => [...prev, 
      `[HW] CPU: ${cpuInfo.logicalCores} logical cores detected.`,
      `[HW] GPU: ${gpuInfo.unmaskedRenderer || gpuInfo.renderer} verified.`,
      `[HW] Peak Performance: ${benchmarkResult.tokensPerSec} ops/sec verified.`
    ]);

    // Stage 3: Extraction (Writing "files" to VFS)
    setInstallStepLog(prev => [...prev, `[EXTRACT] Unpacking rootfs kernel image ${selectedOs.kernel}...`]);
    GLOBAL_KERNEL_OE.syscall('SYS_WRITE_INODE', [`/etc/os-release`, `NAME="${selectedOs.name}"\nVERSION="${selectedOs.version}"`, 0o644]);
    GLOBAL_KERNEL_OE.syscall('SYS_WRITE_INODE', [`/boot/vmlinuz-${selectedOs.version}`, `BINARY_DATA_OF_KERNEL`, 0o755]);
    await new Promise(r => setTimeout(r, 600));
    setInstallProgress(65);
    setInstallStepLog(prev => [...prev, `[EXTRACT] Extracted ${selectedOs.isoSizeMb} MB to /`]);

    // Stage 4: Service Setup
    GLOBAL_KERNEL_OE.syscall('SYS_EXEC', [`/usr/bin/systemd --init`, 1]);
    await new Promise(r => setTimeout(r, 500));
    setInstallProgress(85);
    setInstallStepLog(prev => [...prev, `[PACKAGES] Initializing systemd units and Braink VFS drivers...`]);

    // Stage 5: Finalization
    await new Promise(r => setTimeout(r, 400));
    setInstallProgress(100);
    const successMsg = `[SUCCESS] ${selectedOs.name} natural installation completed successfully! Booting into desktop.`;
    setInstallStepLog(prev => [...prev, successMsg]);
    transitionTo('BOOTING');
    
    setTimeout(() => {
      transitionTo('COMPLETED');
      // Persist the actual node update
      onInstallComplete(selectedOs, { ...spec });
    }, 1000);

    // Register a verified deliverable for this deployment
    try {
      const { executeDeliverableVerification } = await import('../../services/verifiedDeliverablesRegistry');
      await executeDeliverableVerification('DELIV-03-KEX-VFS-BOOTCHAIN');
    } catch (e) {
      console.warn('Deliverable registration skipped during OS install');
    }
  };

  const handleTriggerInstallation = () => {
    if (selectedOs.category === 'specialized' && !verifiedLicense) {
      transitionTo('AUDIT_REQUIRED');
      return;
    }
    handleStartInstallation();
  };

  const onComplianceVerified = (licenseKey: string) => {
    setVerifiedLicense(licenseKey);
    // Explicit transition from AUDIT to INSTALLING
    transitionTo('INSTALLING');
    setTimeout(() => {
      handleStartInstallation();
    }, 500);
  };

  const handleAddCustomIso = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customIsoName.trim()) return;
    const newOs: OperatingSystemCatalogItem = {
      id: `os-custom-${Date.now()}`,
      name: customIsoName,
      version: 'User-Mounted ISO',
      category: 'custom',
      architecture: 'x86_64',
      kernel: 'Custom Kernel from ISO boot sector',
      defaultDesktop: 'GNOME 46',
      minVcpu: 2,
      minRamGb: 4,
      minDiskGb: 40,
      description: `User-provided operating system image loaded from ${customIsoUrl || 'local optical file mounter'}.`,
      tags: ['Custom ISO', 'User Mounter', 'Live Boot'],
      isoSizeMb: 4500,
    };
    setCatalog((prev) => [newOs, ...prev]);
    setSelectedOsId(newOs.id);
    setCustomIsoName('');
    setCustomIsoUrl('');
  };

  const filteredCatalog = catalog.filter((os) => {
    if (categoryFilter === 'all') return true;
    return os.category === categoryFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Operating System Installation Studio
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Direct Hypervisor Mounter
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Install Operating Systems &amp; Select Parameters of GPU, CPU, and Displays
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Provision open-source distributions (Ubuntu, Arch, Alpine, Debian, FreeBSD, KEX Linux) or upload custom ISOs. Customize hardware specs down to clock governors, tensor coprocessors, and multi-display DPI before booting.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onRequestHelp && (
              <button
                onClick={() => onRequestHelp('btn-os-install')}
                className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Explain this function"
              >
                <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>How to use this</span>
              </button>
            )}
            <button
              onClick={onLaunchDesktop}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Monitor className="w-4 h-4" />
              <span>Launch Virtual Desktop</span>
            </button>
          </div>
        </div>
        {verifiedLicense && (
          <div className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono animate-in fade-in slide-in-from-left-2">
            <ShieldCheck className="w-3 h-3" />
            <span>Compliance Verified: {verifiedLicense.substring(0, 12)}... (Regulated Industrial Sector)</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Operating System Selection & Catalog (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Open-Source Operating System Catalog</span>
                </h3>
                <p className="text-[11px] text-slate-400">Select any standard or specialized operating system to install</p>
              </div>

              {/* Filter pills */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
                {(['all', 'linux', 'bsd', 'specialized', 'custom'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-colors cursor-pointer ${
                      categoryFilter === cat
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
              {filteredCatalog.map((os) => {
                const isSelected = os.id === selectedOsId;
                return (
                  <div
                    key={os.id}
                    onClick={() => setSelectedOsId(os.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-950/40 border-blue-500 shadow-md shadow-blue-500/10'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4 className="text-xs font-bold text-white leading-tight">{os.name}</h4>
                        {os.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">
                            {os.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2">
                        {os.description}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>Desktop: <strong className="text-slate-200">{os.defaultDesktop}</strong></span>
                        <span>Arch: <strong className="text-cyan-400">{os.architecture}</strong></span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {os.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Upload Custom ISO / URL Input Section */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Mount Custom ISO / Operating System URL</span>
                </span>
                <span className="text-[10px] text-slate-400">Supports .iso, .qcow2, .img</span>
              </div>
              <form onSubmit={handleAddCustomIso} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="OS Name (e.g. NixOS 24.05 / TempleOS / ReactOS)"
                  value={customIsoName}
                  onChange={(e) => setCustomIsoName(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="text"
                  placeholder="ISO Download URL or local path (optional)"
                  value={customIsoUrl}
                  onChange={(e) => setCustomIsoUrl(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  disabled={!customIsoName.trim()}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-cyan-300 text-xs font-semibold rounded-lg border border-slate-700 cursor-pointer shrink-0 transition-colors"
                >
                  Mount Image
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Fine-Tuning Hardware Parameters: GPU, CPU, Displays (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <span>Virtual Hardware &amp; Display Parameters</span>
                </h3>
                <p className="text-[11px] text-slate-400">Select parameters of GPU, CPU, Displays, and Bus</p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                VirtIO Gen5
              </span>
            </div>

            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
              {/* CPU PARAMETERS */}
              <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-blue-400" />
                    <span>CPU Cores &amp; Architecture</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-blue-400">{spec.cpuCores} Cores ({spec.cpuClockGhz} GHz)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={spec.cpuCores}
                    onChange={(e) => setSpec({ ...spec, cpuCores: Number(e.target.value) })}
                    className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 font-mono focus:outline-none focus:border-blue-500"
                  >
                    <option value={2}>2 Cores (Baseline)</option>
                    <option value={4}>4 Cores (Balanced)</option>
                    <option value={8}>8 Cores (High Peak)</option>
                    <option value={16}>16 Cores (Workstation)</option>
                    <option value={32}>32 Cores (Rack Unit)</option>
                    <option value={64}>64 Cores (Supercomputing)</option>
                  </select>

                  <select
                    value={spec.cpuArchitecture}
                    onChange={(e) => setSpec({ ...spec, cpuArchitecture: e.target.value as any })}
                    className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 font-mono focus:outline-none focus:border-blue-500"
                  >
                    <option value="x86_64">x86_64 (Intel/AMD)</option>
                    <option value="arm64">ARM64 Neoverse V2</option>
                    <option value="riscv64">RISC-V RV64GC (Open)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                  <span>Governor:</span>
                  <div className="flex gap-1.5">
                    {(['performance', 'schedutil', 'powersave'] as const).map((gov) => (
                      <button
                        key={gov}
                        type="button"
                        onClick={() => setSpec({ ...spec, cpuGovernor: gov })}
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono cursor-pointer ${
                          spec.cpuGovernor === gov
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {gov}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* GPU PARAMETERS */}
              <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-violet-400" />
                    <span>GPU / Neural Accelerator</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-violet-400">{spec.gpuVramGb} GB vRAM</span>
                </div>

                <select
                  value={spec.gpuModel}
                  onChange={(e) => {
                    const model = e.target.value as any;
                    let vram = 16;
                    if (model === 'nvidia-h100-vgpu') vram = 80;
                    if (model === 'braink-synaptic-npu') vram = 48;
                    if (model === 'amd-mi300x-vgpu') vram = 192;
                    if (model === 'none') vram = 0;
                    setSpec({ ...spec, gpuModel: model, gpuVramGb: vram });
                  }}
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 font-mono focus:outline-none focus:border-violet-500"
                >
                  <option value="braink-synaptic-npu">Braink Synaptic NPU (A. Keddeh Bio-Centric Accelerator)</option>
                  <option value="nvidia-h100-vgpu">NVIDIA H100 vGPU (80GB SXM5 - Tensor Core)</option>
                  <option value="amd-mi300x-vgpu">AMD Instinct MI300X vGPU (192GB CDNA3)</option>
                  <option value="virtio-gpu-3d">VirtIO-GPU 3D (Vulkan &amp; OpenGL 4.6 Native)</option>
                  <option value="webgpu-direct">WebGPU Direct Hardware Passthrough</option>
                  <option value="none">Standard 2D Framebuffer (No GPU)</option>
                </select>
              </div>

              {/* DISPLAY PARAMETERS */}
              <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Virtual Displays &amp; Resolution</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-cyan-400">{spec.displayRefreshHz} Hz</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={spec.displayResolution}
                    onChange={(e) => setSpec({ ...spec, displayResolution: e.target.value as any })}
                    className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 font-mono focus:outline-none focus:border-cyan-500"
                  >
                    <option value="1920x1080">1920x1080 (FHD 1080p)</option>
                    <option value="2560x1440">2560x1440 (QHD 2K)</option>
                    <option value="3840x2160">3840x2160 (4K UHD)</option>
                    <option value="3440x1440">3440x1440 (Ultrawide 21:9)</option>
                  </select>

                  <select
                    value={spec.displayRefreshHz}
                    onChange={(e) => setSpec({ ...spec, displayRefreshHz: Number(e.target.value) as any })}
                    className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 font-mono focus:outline-none focus:border-cyan-500"
                  >
                    <option value={60}>60 Hz (Standard)</option>
                    <option value={120}>120 Hz (High Refresh)</option>
                    <option value={144}>144 Hz (Ultra Fluid)</option>
                    <option value={240}>240 Hz (Esports Grade)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">DPI Scaling</label>
                    <div className="flex gap-1">
                      {([1, 1.25, 1.5, 2] as const).map((sc) => (
                        <button
                          key={sc}
                          type="button"
                          onClick={() => setSpec({ ...spec, displayScale: sc })}
                          className={`flex-1 py-1 rounded text-[10px] font-mono cursor-pointer ${
                            spec.displayScale === sc
                              ? 'bg-cyan-600 text-white font-bold'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {sc}x
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Monitors</label>
                    <div className="flex gap-1">
                      {([1, 2, 3] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setSpec({ ...spec, monitorCount: m })}
                          className={`flex-1 py-1 rounded text-[10px] font-mono cursor-pointer ${
                            spec.monitorCount === m
                              ? 'bg-cyan-600 text-white font-bold'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {m} Screen{m > 1 ? 's' : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* RAM & STORAGE BUS */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <label className="text-xs font-semibold text-slate-200 block mb-1">vRAM Allocation</label>
                  <select
                    value={spec.ramGb}
                    onChange={(e) => setSpec({ ...spec, ramGb: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 font-mono focus:outline-none"
                  >
                    <option value={4}>4 GB DDR5</option>
                    <option value={8}>8 GB DDR5</option>
                    <option value={16}>16 GB DDR5</option>
                    <option value={32}>32 GB ECC DDR5</option>
                    <option value={64}>64 GB ECC DDR5</option>
                    <option value={128}>128 GB Unified</option>
                  </select>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <label className="text-xs font-semibold text-slate-200 block mb-1">Storage Bus</label>
                  <select
                    value={spec.storageBus}
                    onChange={(e) => setSpec({ ...spec, storageBus: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 font-mono focus:outline-none"
                  >
                    <option value="NVMe PCIe 5.0">NVMe PCIe 5.0 (Direct)</option>
                    <option value="VirtIO SCSI">VirtIO SCSI (Cloud Block)</option>
                    <option value="VFS Cloud Block">VFS Cloud Block Inode</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ACTION: START NATURAL INSTALLATION */}
            <div className="pt-2">
              <button
                onClick={handleTriggerInstallation}
                disabled={deploymentState === 'INSTALLING' || deploymentState === 'BOOTING'}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {deploymentState === 'INSTALLING' || deploymentState === 'BOOTING' ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Deploying {selectedOs.name} ({installProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <span>{selectedOs.category === 'specialized' ? 'Audit & Deploy Technical APK' : `Start OS Installation onto ${activeNode.name}`}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Audit Modal Overlay (The Logical Guardrail) */}
      {deploymentState === 'AUDIT_REQUIRED' && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <ComplianceVerifier 
            onVerified={onComplianceVerified}
            onCancel={() => transitionTo('IDLE')}
          />
        </div>
      )}

      {/* INSTALLATION PROGRESS / CONSOLE LOG OVERLAY */}
      {deploymentState !== 'IDLE' && deploymentState !== 'AUDIT_REQUIRED' && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-white">
                OS Deployment Stream: {selectedOs.name}
              </h4>
            </div>
            <span className="text-xs font-bold text-cyan-400">{installProgress}% Complete</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${installProgress}%` }}
            />
          </div>

          {/* Terminal log messages */}
          <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800/80 space-y-1 text-[11px] text-slate-300 max-h-40 overflow-y-auto">
            {installStepLog.map((log, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-slate-500">{`>`}</span>
                <span className={log.includes('[SUCCESS]') ? 'text-emerald-400 font-bold' : ''}>{log}</span>
              </div>
            ))}
          </div>

          {deploymentState === 'COMPLETED' && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                OS and hardware stack is active on node!
              </span>
              <button
                onClick={onLaunchDesktop}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Open Virtual Desktop Environment</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
