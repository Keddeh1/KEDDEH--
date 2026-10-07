export type FileCategory = 'images' | 'documents' | 'videos' | 'audio' | 'archives' | 'code' | 'other';

export interface FileItem {
  id: string;
  name: string;
  folderId: string | null; // UI folder structure
  parentId?: string | null; // VFS kernel structure
  category: FileCategory;
  size: number | string; // bytes or formatted string
  mimeType: string;
  updatedAt: string;
  createdAt: string;
  starred: boolean;
  inTrash: boolean;
  trashedAt?: string;
  url?: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  isDriveFile?: boolean;
  isHtml5App?: boolean;
  isSystem?: boolean;
  content?: string;
  rawContent?: string;
  tags: string[];
  dimensions?: string;
  duration?: string;
  description?: string;
  sharedWith?: string[];
  isDuplicate?: boolean;
  // Keddeh 1x Architecture fields
  manifoldCoord?: number; // Injective Identity Coordinate
  vfsSubstrates?: string[]; // Dual VFS Substrate identifiers (e.g. ['ALPHA', 'BETA'])
  directJmpTarget?: string; // Memory offset for direct JMP execution (e.g. '1x401000')
  lifecycleState?: 'ACTIVE' | 'REHYDRATABLE' | 'WAITING_IO' | 'SUSPENDED';
}

export interface FolderItem {
  id: string;
  name: string;
  parentId: string | null; // null means root
  color: string;
  starred: boolean;
  inTrash: boolean;
  createdAt: string;
  updatedAt: string;
  isDriveFolder?: boolean;
}

export interface GoogleDriveUser {
  displayName: string;
  emailAddress: string;
  photoLink?: string;
}

export interface GoogleDriveQuota {
  limit: number; // Total quota in bytes
  usage: number; // Total used in bytes
  usageInDrive: number;
  usageInDriveTrash: number;
}

export interface StorageCategoryInfo {
  category: FileCategory;
  label: string;
  color: string;
  bgLight: string;
  iconName: string;
}

export type ViewMode = 'grid' | 'list';
export type SortOption = 'name' | 'size' | 'updatedAt' | 'type';
export type SortOrder = 'asc' | 'desc';

export type NavTab =
  | 'home'
  | 'planes'
  | 'ai'
  | 'documents'
  | 'files'
  | 'legal'
  | 'server'
  | 'showcase'
  | 'pricing'
  | 'index'
  | 'apps'
  | 'analytics'
  | 'starred'
  | 'recent'
  | 'trash'
  | 'software'
  | 'shared';

export interface CommercialLicense {
  tier: 'community' | 'pro' | 'enterprise' | 'sovereign';
  tierName: string;
  licenseKey: string;
  organization: string;
  contactEmail: string;
  activatedAt: string;
  expiresAt: string;
  isActive: boolean;
  vatId?: string;
  signatureHash: string;
  billingPeriod: 'monthly' | 'annual';
  seats: number;
  maxNodes: number;
  features: string[];
}

export type LicenseTier = CommercialLicense;

export interface CommercialTierPlan {
  id: 'community' | 'pro' | 'enterprise' | 'sovereign';
  name: string;
  badge?: string;
  tagline: string;
  monthlyPriceUsd: number;
  annualPriceUsd: number;
  seatsText: string;
  nodeLimitText: string;
  highlights: string[];
  specs: {
    vCpuCap: string;
    ramCap: string;
    vfsStorage: string;
    sla: string;
    telemetry: string;
    verification: string;
    support: string;
  };
}

export interface StoragePlan {
  id: string;
  name: string;
  limitBytes: number;
  price: string;
  badge?: string;
  features: string[];
}

export type ServerStatus = 'running' | 'stopped' | 'rebooting' | 'provisioning' | 'paused';

export type ServerSubTab =
  | 'nodes'
  | 'provenance'
  | 'os-studio'
  | 'desktop'
  | 'software'
  | 'rack-ai'
  | 'terminal'
  | 'logs'
  | 'services'
  | 'mining'
  | 'market'
  | 'ports'
  | 'mounts'
  | 'maintenance'
  | 'updates'
  | 'infra-mining'
  | 'snapshots'
  | 'substrate';

export interface ServerNode {
  id: string;
  name: string;
  label: string;
  os: string;
  kernelVersion: string;
  ip: string;
  publicIp: string;
  status: ServerStatus;
  uptimeSeconds: number;
  vCpu: number;
  vRamMb: number;
  diskGb: number;
  cpuUsage: number;
  ramUsage: number;
  diskUsage: number;
  netRxKbps: number;
  netTxKbps: number;
  mountedStorage: string[];
  openPorts: number[];
  activeServices: string[];
  location: string;
  createdAt: string;
  authorNote?: string;
  env?: Record<string, string>;
  firmwareVersion: string;
}

export interface ServerDaemon {
  id: string;
  name: string;
  serviceName: string;
  status: 'active' | 'inactive' | 'failed' | 'restarting';
  description: string;
  pid: number;
  memoryMb: number;
  cpuPercent: number;
  uptime: string;
  port?: number;
  supervisor?: 'pm2' | 'systemd';
  pm2Id?: number;
  command?: string;
  dataDir?: string;
  namespace?: string;
  nodeId?: string;
}

export interface ServerSnapshot {
  id: string;
  serverId: string;
  serverName: string;
  name: string;
  sizeBytes: number;
  createdAt: string;
  description: string;
  status: 'ready' | 'creating';
}

export interface VirtualPortRule {
  port: number;
  protocol: 'HTTP' | 'HTTPS' | 'TCP' | 'SSH' | 'WS';
  targetService: string;
  status: 'OPEN' | 'FILTERED' | 'LISTENING';
  externalUrl?: string;
}

export interface OperatingSystemCatalogItem {
  id: string;
  name: string;
  version: string;
  category: 'linux' | 'bsd' | 'specialized' | 'minimal' | 'custom';
  architecture: 'x86_64' | 'arm64' | 'riscv64';
  kernel: string;
  defaultDesktop: 'GNOME 46' | 'KDE Plasma 6' | 'XFCE 4.18' | 'KEX MicroShell' | 'i3wm Minimal' | 'Headless Server';
  minVcpu: number;
  minRamGb: number;
  minDiskGb: number;
  description: string;
  tags: string[];
  isInstalled?: boolean;
  isoSizeMb: number;
  badge?: string;
}

export interface VirtualHardwareSpec {
  cpuCores: number;
  cpuArchitecture: 'x86_64' | 'arm64' | 'riscv64';
  cpuClockGhz: number;
  cpuGovernor: 'performance' | 'schedutil' | 'powersave';
  nestedVirtualization: boolean;
  gpuModel: 'none' | 'nvidia-h100-vgpu' | 'braink-synaptic-npu' | 'amd-mi300x-vgpu' | 'virtio-gpu-3d' | 'webgpu-direct';
  gpuVramGb: number;
  displayResolution: '1920x1080' | '2560x1440' | '3840x2160' | '3440x1440';
  displayRefreshHz: 60 | 120 | 144 | 240;
  displayScale: 1 | 1.25 | 1.5 | 2;
  monitorCount: 1 | 2 | 3;
  ramGb: number;
  ramType: 'ECC DDR5-5600' | 'HBM3e Unified' | 'LPDDR5X';
  zramCompression: boolean;
  diskGb: number;
  storageBus: 'NVMe PCIe 5.0' | 'VirtIO SCSI' | 'VFS Cloud Block';
  iopsLimit: number;
  networkNic: 'VirtIO 100Gbps' | 'WireGuard Mesh' | 'Bridged Cloud';
}

export interface VirtualDesktopWindow {
  id: string;
  title: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  appType: 'terminal' | 'files' | 'editor' | 'monitor' | 'braink' | 'browser' | 'settings';
}

export interface StressBenchmarkMetric {
  timestamp: string;
  cpuLoadPercent: number;
  gpuTensorTflops: number;
  memBandwidthGbps: number;
  thermalDegC: number;
  powerWatts: number;
  tokensPerSec: number;
}

export interface BrainkCorticalLayer {
  id: string;
  name: string;
  layerNumber: number;
  function: string;
  activeRate: number; // 0 - 100%
  neuronsFiredPerSec: number;
  description: string;
}

export interface BrainkVirtualBrainState {
  status: 'dormant' | 'calibrating' | 'conscious' | 'hyper-plasticity';
  synapticConnections: number;
  actionPotentialHz: number;
  coherenceScore: number; // 0 - 100
  dominantFrequency: 'Delta (2Hz)' | 'Theta (6Hz)' | 'Alpha (10Hz)' | 'Beta (22Hz)' | 'Gamma (40Hz)';
  neurotransmitters: {
    dopamine: number; // 0 - 100
    serotonin: number;
    acetylcholine: number;
    noradrenaline: number;
  };
  corticalLayers: BrainkCorticalLayer[];
  recentThoughts: Array<{
    id: string;
    timestamp: string;
    stream: string;
    corticalOrigin: string;
    plasticityDelta: number;
    bioCentricProof: string;
  }>;
  activeStimuli: Array<{
    id: string;
    type: 'visual' | 'auditory' | 'symbolic' | 'sensorimotor';
    label: string;
    intensity: number;
  }>;
}

export interface BrainkKernelTelemetry {
  isWasmReady: boolean;
  wasmBinaryBytes: number;
  wasmMemoryPages: number;
  activeConcepts: number;
  activeEdges: number;
  epochCount: number;
  injectedPacketCount: number;
  lastPacketTimeNs: number;
  lastSkCoordinate: [number, number, number];
  lastMoebiusWireHex: string;
  transitiveClosurePathCount: number;
  averageEigenvectorCentrality: number;
  gammaFrequencyHz: number;
  kernelState: 'BOOTING' | 'ONLINE_WASM' | 'FALLBACK';
  workerThreadId: string;
  throughputOpsPerSec: number;
}

export interface BrainkWasmEdge {
  from: string;
  to: string;
  weight: number;
  isTransitive?: boolean;
}

export interface TourStep {
  id: string;
  stepNumber: number;
  title: string;
  section: 'overview' | 'nodes' | 'os-studio' | 'desktop' | 'rack-ai' | 'braink' | 'terminal' | 'storage';
  selector?: string;
  description: string;
  howToUse: string;
  proTip: string;
  badge?: string;
}

export interface SystemControlDoc {
  id: string;
  title: string;
  category: 'Virtual Compute' | 'Operating Systems' | 'Display & GPU' | 'AI & Neural' | 'Storage & I/O' | 'Networking';
  actionSummary: string;
  technicalFunction: string;
  operationalConsequence: string;
  keyboardShortcut?: string;
  statusIndicator: string;
}

export interface SoftwarePackage {
  id: string;
  name: string;
  category: 'ai' | 'database' | 'web' | 'dev' | 'monitoring' | 'security';
  version: string;
  description: string;
  longDescription: string;
  icon: string;
  serviceName: string;
  defaultPort?: number;
  protocol?: 'HTTP' | 'HTTPS' | 'TCP' | 'WS';
  isInstalled: boolean;
  isRunning: boolean;
  sizeMb: number;
  dependencies: string[];
  maintainer: string;
  license: string;
  installCommand: string;
  configFile?: {
    path: string;
    content: string;
  };
}

// ==============================================================================
// BRAINK ACTIVE AGENTIC RUNTIME INTERFACES
// ==============================================================================

export type BrainkAgentStatus =
  | 'idle'
  | 'perceiving'
  | 'reasoning'
  | 'planning'
  | 'executing'
  | 'verifying'
  | 'homeostasis';

export type BrainkAgentMode = 'autonomous' | 'supervised' | 'manual';

export type BrainkAgentServiceTarget =
  | 'kera_mesh'
  | 'pm2_supervisor'
  | 'metal_gpu'
  | 'cognitive_substrate'
  | 'vfs_storage'
  | 'formal_verification';

export interface BrainkAgentAction {
  id: string;
  timestamp: number;
  service: BrainkAgentServiceTarget;
  action: string;
  parameters?: Record<string, any>;
  status: 'pending' | 'executing' | 'success' | 'failed';
  durationMs: number;
  resultSummary: string;
  proofDigest: string;
  skCoordinate?: [number, number, number];
}

export interface BrainkAgentThought {
  id: string;
  timestamp: string;
  cycle: number;
  phase: 'PERCEPTION' | 'S_K_SYNTHESIS' | 'PLANNING' | 'EXECUTION' | 'VERIFICATION';
  content: string;
  reasoningSource: 'KEDDEH_IL_LLM_SOVEREIGN' | 'BRAINK_WASM_SUBSTRATE' | 'GEMINI_3.8_FLASH';
  confidence: number; // 0 - 100
  targetService?: BrainkAgentServiceTarget;
  associatedProof?: string;
  skVector?: string;
}

export interface BrainkConnectedService {
  id: BrainkAgentServiceTarget;
  name: string;
  endpoint: string;
  port?: number;
  protocol: string;
  status: 'ONLINE' | 'STANDBY' | 'ENGAGED' | 'DISCONNECTED';
  description: string;
  lastSync: string;
  metricLabel: string;
  metricValue: string;
}

export interface BrainkAgenticState {
  isRunning: boolean;
  mode: BrainkAgentMode;
  currentStatus: BrainkAgentStatus;
  cycleCount: number;
  activeGoal: string;
  connectedServices: BrainkConnectedService[];
  recentThoughts: BrainkAgentThought[];
  actionHistory: BrainkAgentAction[];
  gammaSynchronyHz: number;
  homeostaticCoherence: number;
  verifiedInvariantCount: number;
}

export interface FirmwareUpdateManifest {
  id: string;
  version: string;
  releaseDate: string;
  releaseNotes: string;
  isoUrl: string;
  isoHash: string; // SHA-256
  minPreviousVersion: string;
  sizeBytes: number;
  critical: boolean;
  targetArchitecture: 'x86_64' | 'arm64' | 'riscv64' | 'universal';
  verificationAuthority: string; // e.g. "ISO/IEC 29119 Authority"
  complianceCheckId: string;
}

export interface FirmwareUpdateStatus {
  step: 'idle' | 'downloading' | 'verifying' | 'testing' | 'applying' | 'rebooting' | 'completed' | 'failed';
  progress: number; // 0 - 100
  currentStepDescription: string;
  error?: string;
  verifiedHash?: string;
  testReport?: string;
}

export interface SystemLogEntry {
  id: string;
  timestamp: string;
  service: string;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';
  message: string;
  source: 'kernel' | 'systemd' | 'vfs' | 'network' | 'auth';
  pid: number;
}
