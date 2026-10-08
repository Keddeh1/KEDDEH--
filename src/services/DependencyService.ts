import type { SoftwarePackage } from '../types';
import { dependencyOrder } from '../core/kex/dependencyOrder';
import { GLOBAL_KERNEL_SERVICE } from './KernelService';
import { PROVENANCE_SERVICE } from './ProvenanceService';
import { GLOBAL_VFS_PRIMITIVE } from '../core/vfs/vfs';
import { HTML5_APP_TEMPLATES } from '../data/html5Apps';

export interface InstalledSoftware {
  pkgId: string;
  installedAt: string;
  version: string;
  status: 'ACTIVE' | 'STOPPED';
  binPath: string;
  integrityHash: string;
  kernelHash: string;
}

type InstallRuntime = {
  vfs: Pick<typeof GLOBAL_VFS_PRIMITIVE, 'create' | 'read' | 'update' | 'delete'>;
  kernel: Pick<typeof GLOBAL_KERNEL_SERVICE, 'init' | 'verifyIntegrity'>;
  templates: ReadonlyMap<string, string>;
  audit: (description: string, coordinates: [bigint, bigint, bigint]) => Promise<unknown>;
};
const defaultRuntime: InstallRuntime = {
  vfs: GLOBAL_VFS_PRIMITIVE,
  kernel: GLOBAL_KERNEL_SERVICE,
  templates: new Map(HTML5_APP_TEMPLATES.map(app => [`app-${app.id}`, app.code])),
  audit: (description, coordinates) => PROVENANCE_SERVICE.logEvent('OS_INSTALL', description, coordinates)
};

/** Installs actual application carriers into the existing persistent VFS. */
export class DependencyService {
  private installed = new Map<string, InstalledSoftware>();
  private operation: Promise<unknown> = Promise.resolve();
  constructor(private readonly runtime: InstallRuntime = defaultRuntime) { this.loadState(); }

  private loadState() {
    if (typeof localStorage === 'undefined') return;
    try {
      const data = JSON.parse(localStorage.getItem('kex_installed_software') || '{}');
      if (!data || typeof data !== 'object' || Array.isArray(data)) return;
      for (const [id, value] of Object.entries(data)) {
        const record = value as InstalledSoftware;
        // Old synthetic records have no kernelHash and cannot imply installation.
        if (record?.pkgId === id && typeof record.version === 'string' && typeof record.kernelHash === 'string' && /^sha256:[a-f0-9]{64}$/.test(record.integrityHash)) this.installed.set(id, { ...record });
      }
    } catch { /* Cache absence does not change durable VFS state. */ }
  }
  private saveState() {
    if (typeof localStorage === 'undefined') return;
    try { localStorage.setItem('kex_installed_software', JSON.stringify(Object.fromEntries(this.installed))); }
    catch { /* The VFS inode holds the durable installation record. */ }
  }
  private serialize<T>(run: () => Promise<T>): Promise<T> {
    const result = this.operation.then(run);
    this.operation = result.catch(() => undefined);
    return result;
  }
  getInstalledPackages(): InstalledSoftware[] { return [...this.installed.values()].map(record => ({ ...record })); }
  isInstalled(pkgId: string): boolean { return this.installed.has(pkgId); }
  private inode(pkgId: string): string { return `file-bin-${pkgId}`; }
  private async digest(content: string): Promise<string> {
    const bytes = new TextEncoder().encode(content);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return 'sha256:' + [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, '0')).join('');
  }
  async getExecutable(pkgId: string): Promise<string> {
    const inode = await this.runtime.vfs.read(this.inode(pkgId));
    const installation = inode.metadata.installation as InstalledSoftware | undefined;
    if (!installation || installation.pkgId !== pkgId || typeof inode.data !== 'string' || await this.digest(inode.data) !== installation.integrityHash) throw new Error(`INSTALLATION_READBACK_FAILED:${pkgId}`);
    this.installed.set(pkgId, { ...installation });
    return inode.data;
  }
  hydrateInstalledPackages(catalog: SoftwarePackage[]): Promise<InstalledSoftware[]> {
    return this.serialize(async () => {
      this.installed.clear();
      for (const pkg of catalog) {
        if (!this.runtime.templates.has(pkg.id)) continue;
        try { await this.getExecutable(pkg.id); }
        catch (error) {
          if (!(error instanceof Error) || (!error.message.startsWith('Inode not found:') && !error.message.startsWith('INSTALLATION_READBACK_FAILED:'))) throw error;
        }
      }
      this.saveState();
      return this.getInstalledPackages();
    });
  }
  resolveAndInstall(pkg: SoftwarePackage, allPkgs: SoftwarePackage[]): Promise<string[]> {
    return this.serialize(async () => {
      const ordered = dependencyOrder(pkg, allPkgs);
      // Resolve executable bytes for the complete plan before changing durable state.
      for (const item of ordered) {
        if (!this.runtime.templates.has(item.id)) throw new Error(`NATIVE_WORKER_INSTALLATION_REQUIRED:${item.id}`);
        if (!this.runtime.templates.get(item.id)?.trim()) throw new Error(`EMPTY_APPLICATION_CARRIER:${item.id}`);
      }
      await this.runtime.kernel.init();
      const logs: string[] = [];
      for (const item of ordered) {
        const content = this.runtime.templates.get(item.id)!;
        const integrityHash = await this.digest(content);
        let previous: Awaited<ReturnType<InstallRuntime['vfs']['read']>> | undefined;
        try { previous = await this.runtime.vfs.read(this.inode(item.id)); }
        catch (error) {
          if (!(error instanceof Error) || !error.message.startsWith('Inode not found:')) throw error;
        }
        const installed = previous?.metadata.installation as InstalledSoftware | undefined;
        if (installed?.version === item.version && installed.integrityHash === integrityHash && previous?.data === content) {
          this.installed.set(item.id, { ...installed });
          logs.push(`[UNCHANGED] ${item.id}@${item.version}`);
          continue;
        }
        const kernelHash = await this.runtime.kernel.verifyIntegrity(content);
        if (!/^[A-Fa-f0-9]{8}$/.test(kernelHash)) throw new Error(`KERNEL_INTEGRITY_UNAVAILABLE:${item.id}`);
        const binPath = `/bin/${item.id.replace(/^app-/, '')}.html`;
        const record: InstalledSoftware = { pkgId: item.id, installedAt: new Date().toISOString(), version: item.version, status: 'ACTIVE', binPath, integrityHash, kernelHash };
        const metadata = { ...previous?.metadata, path: binPath, installation: record };
        if (previous) await this.runtime.vfs.update(this.inode(item.id), metadata, content);
        else await this.runtime.vfs.create(this.inode(item.id), metadata, content);
        await this.getExecutable(item.id);
        logs.push(`[INSTALLED] ${item.id}@${item.version} -> ${binPath} [${integrityHash}]`);
        try { await this.runtime.audit(`VFS installation ${item.id}@${item.version}: ${integrityHash}`, [BigInt(Math.max(1, new TextEncoder().encode(content).length)), BigInt(Math.max(1, this.installed.size)), 1n]); }
        catch (error) { logs.push(`[AUDIT_PENDING] ${item.id}: ${error instanceof Error ? error.message : String(error)}`); }
      }
      this.saveState();
      return logs;
    });
  }
  uninstall(pkgId: string): Promise<void> {
    return this.serialize(async () => {
      await this.runtime.vfs.delete(this.inode(pkgId));
      this.installed.delete(pkgId);
      this.saveState();
    });
  }
}
export const GLOBAL_DEPENDENCY_SERVICE = new DependencyService();
