import { CommercialLicense, CommercialTierPlan } from '../types';

export const COMMERCIAL_TIERS: CommercialTierPlan[] = [
  {
    id: 'community',
    name: 'Developer Community',
    badge: 'Open Source',
    tagline: 'Ideal for individual hackers, students, and open-source operating system exploration.',
    monthlyPriceUsd: 0,
    annualPriceUsd: 0,
    seatsText: '1 Developer Seat',
    nodeLimitText: '1 Virtual Node',
    highlights: [
      '1 Concurrent Virtual Server Node',
      'KEX Linux Microkernel Userspace Terminal',
      'Open Source OS Installation Studio',
      'Local VFS Storage Vault (30 GB)',
      'Community GitHub & Discord Support',
      'Basic Performance Metrics',
    ],
    specs: {
      vCpuCap: '4 vCPUs (Shared)',
      ramCap: '8 GB vRAM',
      vfsStorage: '30 GB SSD Pool',
      sla: 'Best-Effort (Community)',
      telemetry: 'Standard Terminal Stats',
      verification: 'Self-Service Test Suite',
      support: 'Community Forums & Docs',
    },
  },
  {
    id: 'pro',
    name: 'Professional VPS',
    badge: 'Fast-Moving Teams',
    tagline: 'High-speed VPS nodes with full Google Drive cloud mount and terminal tooling.',
    monthlyPriceUsd: 29,
    annualPriceUsd: 290,
    seatsText: 'Up to 5 Team Seats',
    nodeLimitText: '4 Virtual Nodes',
    highlights: [
      '4 Isolated VPS Nodes with Dedicated Cores',
      'Dual-Mount: VFS Vault + Google Drive v3 OAuth',
      'Virtual Port Router & Reverse Proxy (HTTP, SSH)',
      'Automated Hourly Cluster Snapshots',
      'High-Peak Stress Testing & Benchmark Suite',
      'Priority Email Support (4-Hour Response SLA)',
    ],
    specs: {
      vCpuCap: '16 vCPUs (Dedicated)',
      ramCap: '32 GB ECC vRAM',
      vfsStorage: '250 GB NVMe Pool',
      sla: '99.95% Availability SLA',
      telemetry: 'Real-time Event Loop Telemetry',
      verification: 'Standard SOS Test Run',
      support: 'Priority Email (4h Response)',
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise Cloud',
    badge: 'Most Popular',
    tagline: 'High-availability multi-node cluster orchestration, daemon supervisor, custom reverse proxy ingress, and 99.999% SLA.',
    monthlyPriceUsd: 199,
    annualPriceUsd: 1990,
    seatsText: 'Unlimited Organization Seats',
    nodeLimitText: 'Unlimited Nodes & Clusters',
    highlights: [
      'Unlimited Virtual Server Nodes & Distributed Clusters',
      'Multi-Daemon Infrastructure Supervisor (NGINX, PostgreSQL, Redis, Docker)',
      'Live Resource Metrics & Telemetry (CPU, RAM, Disk, Net)',
      'Automated Snapshot Capture & Point-in-Time Rollback',
      'Custom Domain Ingress & Reverse Proxy Routing',
      '24/7 Dedicated Support Desk with 15-Minute Response SLA',
    ],
    specs: {
      vCpuCap: 'Unlimited Core Provisioning',
      ramCap: 'Unlimited Scalable vRAM',
      vfsStorage: 'Multi-Terabyte Encrypted Mesh',
      sla: '99.999% Fault-Tolerant High-Availability',
      telemetry: 'Real-Time Resource Metrics & Telemetry',
      verification: 'Full Automated Healthcheck Suite',
      support: 'Dedicated Slack/Teams + 24/7 Phone Desk',
    },
  },
  {
    id: 'sovereign',
    name: 'Private & Air-Gapped Cloud',
    badge: 'Self-Hosted',
    tagline: 'Completely air-gapped, zero-external-egress deployment for private on-premises infrastructure.',
    monthlyPriceUsd: 499,
    annualPriceUsd: 4990,
    seatsText: 'Unlimited Organization Seats',
    nodeLimitText: 'Unlimited Private Clusters',
    highlights: [
      '100% Self-Contained Standalone Deployment Package',
      'Zero Outbound Network or External API Dependencies',
      'Local Storage Vault & On-Premises File Synchronization',
      'Automated Local Backup & Disaster Recovery Pipelines',
      'Multi-Node Private Network Firewall Controls',
      'Dedicated Enterprise Engineering Support',
    ],
    specs: {
      vCpuCap: 'Bare-Metal & Private Hardware',
      ramCap: 'Full Physical System RAM',
      vfsStorage: 'Encrypted Local NVMe Pools',
      sla: '100% On-Premises Local Availability',
      telemetry: 'Local Systemd Journalctl & Resource Logs',
      verification: 'Self-Contained Verification Suite',
      support: 'Dedicated Enterprise Support Team',
    },
  },
];

export const INITIAL_DEFAULT_LICENSE: CommercialLicense = {
  tier: 'enterprise',
  tierName: 'Enterprise Cloud (Evaluation Edition)',
  licenseKey: 'SK-ENT-2026-9A82-F02E-ACTIVE',
  organization: 'Enterprise Pilot Customer',
  contactEmail: 'engineering@client-corp.com',
  activatedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  expiresAt: new Date(Date.now() + 351 * 86400000).toISOString(),
  isActive: true,
  vatId: 'US-942851029',
  signatureHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  billingPeriod: 'annual',
  seats: 50,
  maxNodes: 999,
  features: [
    'UNLIMITED_NODES',
    'DAEMON_SUPERVISOR',
    'LIVE_RESOURCE_MONITORING',
    'SNAPSHOT_ROLLBACK_ENGINE',
    'GOOGLE_DRIVE_OAUTH_SYNC',
    'DOCKER_K8S_EXPORT',
  ],
};

export function generateCryptographicLicenseKey(
  tier: 'community' | 'pro' | 'enterprise' | 'sovereign',
  orgName: string
): string {
  const prefix = tier === 'sovereign' ? 'SK-SOV' : tier === 'enterprise' ? 'SK-ENT' : tier === 'pro' ? 'SK-PRO' : 'SK-COM';
  const year = new Date().getFullYear();
  
  // Deterministic hash based on orgName
  const hash = orgName.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0);
  const hexPart1 = Math.abs(hash & 0xffff).toString(16).toUpperCase().padStart(4, '0');
  const hexPart2 = Math.abs((hash >> 16) & 0xffff).toString(16).toUpperCase().padStart(4, '0');
  
  const suffix = tier === 'enterprise' || tier === 'sovereign' ? 'ENT' : 'PRO';
  return `${prefix}-${year}-${hexPart1}-${hexPart2}-${suffix}`;
}

export interface RoiBenchmarkScenario {
  nodesCount: number;
  vCpuPerNode: number;
  ramGbPerNode: number;
}

export function calculateCloudSavings(scenario: RoiBenchmarkScenario) {
  // Approximate standard AWS EC2 c6i.xlarge pricing (~$0.17/hr -> ~$124/mo per 4 vCPU / 8GB)
  const totalCores = scenario.nodesCount * scenario.vCpuPerNode;
  const totalRamGb = scenario.nodesCount * scenario.ramGbPerNode;

  // AWS equivalent cost per month
  const awsCostPerCore = 28.5; // $/core/mo
  const awsCostPerRamGb = 4.2; // $/GB/mo
  const awsStorageCost = scenario.nodesCount * 12; // EBS SSD storage
  const awsEstimatedMonthly = Math.round(totalCores * awsCostPerCore + totalRamGb * awsCostPerRamGb + awsStorageCost);

  // SERVERspace cost (Enterprise flat $199/mo or Pro $29/mo)
  const serverspaceMonthly = scenario.nodesCount <= 4 && totalCores <= 16 ? 29 : 199;
  const monthlySavings = Math.max(0, awsEstimatedMonthly - serverspaceMonthly);
  const annualSavings = monthlySavings * 12;
  const savingsPercent = Math.min(92, Math.max(45, Math.round((monthlySavings / awsEstimatedMonthly) * 100)));

  return {
    awsEstimatedMonthly,
    serverspaceMonthly,
    monthlySavings,
    annualSavings,
    savingsPercent,
    totalCores,
    totalRamGb,
  };
}
