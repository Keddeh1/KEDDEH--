import { FileItem, FolderItem } from '../types';
import { INITIAL_FILES as CONTEXT_INITIAL_FILES, INITIAL_FOLDERS as CONTEXT_INITIAL_FOLDERS } from '../data/VfsInitialSubstrate';
import { SAMPLE_CROSS_PLATFORM_FILES } from '../data/crossPlatformSamples';
import { HTML5_APP_TEMPLATES } from '../data/html5Apps';

export interface OsSectorState {
  id: string;
  worker_id: string;
  worker_name: string;
  protocol: string;
  status: 'ONLINE' | 'STANDBY' | 'MAINTENANCE' | 'CALIBRATING';
  pools: Array<{
    url: string;
    user: string;
    pass: string;
  }>;
  hashrateTh?: number;
  temperatureC?: number;
  voltageV?: number;
  allocatedBlocks?: number[];
  firmwareVersion?: string;
  mountPoint?: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface InodeRecord {
  id: string;
  path?: string;
  metadata: Record<string, any>;
  data: string | ArrayBuffer | Uint8Array;
  updatedAt: string;
  checksum?: string;
}

export interface SystemMetaRecord {
  key: string;
  value: any;
  updatedAt: string;
}

export interface VfsBackupSnapshot {
  version: number;
  exportedAt: string;
  holdingCharter: string;
  resonanceLock: number;
  substrateSignature: string;
  files: FileItem[];
  folders: FolderItem[];
  sectors: OsSectorState[];
  inodes?: InodeRecord[];
}

const DB_NAME = 'KEX_VFS_PERSISTENCE_DB';
const DB_VERSION = 1;

export const DEFAULT_OS_SECTORS: OsSectorState[] = [
  {
    id: 'SECTOR_001',
    worker_id: 'SECTOR_001',
    worker_name: 'keddeh.ALPHA',
    protocol: 'Stratum V2 / IPC',
    status: 'ONLINE',
    pools: [
      {
        url: 'stratum+tcp://btc.viabtc.io:3333',
        user: 'keddeh.ALPHA',
        pass: '123'
      }
    ],
    hashrateTh: 14.82,
    temperatureC: 58.4,
    voltageV: 0.92,
    mountPoint: '/mnt/sector_alpha',
    firmwareVersion: 'v1.6.0-hardened',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'SECTOR_002',
    worker_id: 'SECTOR_002',
    worker_name: 'keddeh.BETA',
    protocol: 'Stratum V2 / IPC',
    status: 'ONLINE',
    pools: [
      {
        url: 'stratum+tcp://btc.viabtc.io:3333',
        user: 'keddeh.BETA',
        pass: '123'
      }
    ],
    hashrateTh: 15.20,
    temperatureC: 59.1,
    voltageV: 0.92,
    mountPoint: '/mnt/sector_beta',
    firmwareVersion: 'v1.6.0-hardened',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'SECTOR_003',
    worker_id: 'SECTOR_003',
    worker_name: 'keddeh.GAMMA',
    protocol: 'Stratum V2 / IPC',
    status: 'STANDBY',
    pools: [
      {
        url: 'stratum+tcp://btc.viabtc.io:3333',
        user: 'keddeh.GAMMA',
        pass: '123'
      }
    ],
    hashrateTh: 14.50,
    temperatureC: 57.0,
    voltageV: 0.91,
    mountPoint: '/mnt/sector_gamma',
    firmwareVersion: 'v1.6.0-hardened',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'SECTOR_004',
    worker_id: 'SECTOR_004',
    worker_name: 'keddeh.DELTA',
    protocol: 'Stratum V2 / IPC',
    status: 'ONLINE',
    pools: [
      {
        url: 'stratum+tcp://btc.viabtc.io:3333',
        user: 'keddeh.DELTA',
        pass: '123'
      }
    ],
    hashrateTh: 15.05,
    temperatureC: 60.2,
    voltageV: 0.93,
    mountPoint: '/mnt/sector_delta',
    firmwareVersion: 'v1.6.0-hardened',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'SECTOR_005',
    worker_id: 'SECTOR_005',
    worker_name: 'keddeh.EPSILON',
    protocol: 'Stratum V2 / IPC',
    status: 'ONLINE',
    pools: [
      {
        url: 'stratum+tcp://btc.viabtc.io:3333',
        user: 'keddeh.EPSILON',
        pass: '123'
      }
    ],
    hashrateTh: 15.65,
    temperatureC: 61.0,
    voltageV: 0.94,
    mountPoint: '/mnt/sector_epsilon',
    firmwareVersion: 'v1.6.0-hardened',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'SECTOR_OS_KEX',
    worker_id: 'SECTOR_OS_KEX',
    worker_name: 'kex.MICROKERNEL_SYS',
    protocol: 'Toroidal VFS 1-Based (1,1,1)',
    status: 'ONLINE',
    pools: [
      {
        url: 'kex://keddeh/apex/triad',
        user: 'kex.system',
        pass: 'sovereign'
      }
    ],
    mountPoint: '/boot/kex',
    firmwareVersion: 'KEX-MICROKERNEL-v6.8.4',
    updatedAt: new Date().toISOString(),
    metadata: {
      resonanceLock: 0.297,
      dampingFactor: 0.703,
      substrateSignature: '1x412E3800CA000748'
    }
  },
  {
    id: 'SECTOR_OS_AETHER',
    worker_id: 'SECTOR_OS_AETHER',
    worker_name: 'aether.DESKTOP_ENV',
    protocol: 'Aether Desktop UI IPC',
    status: 'ONLINE',
    pools: [],
    mountPoint: '/srv/aether',
    firmwareVersion: 'AETHER-OS-v2026.10',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'SECTOR_OS_MINING',
    worker_id: 'SECTOR_OS_MINING',
    worker_name: 'stratum.CORE_MINER',
    protocol: 'Stratum+TCP Telemetry',
    status: 'ONLINE',
    pools: [
      {
        url: 'stratum+tcp://btc.viabtc.io:3333',
        user: 'keddeh.ALPHA',
        pass: '123'
      }
    ],
    mountPoint: '/var/mining',
    firmwareVersion: 'STRATUM-OS-v2.4',
    updatedAt: new Date().toISOString()
  }
];

class VfsStorageIndexedDb {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private isInitialized = false;

  private getDb(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported in this runtime environment.'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 1. Files Object Store
        if (!db.objectStoreNames.contains('files')) {
          const fileStore = db.createObjectStore('files', { keyPath: 'id' });
          fileStore.createIndex('folderId', 'folderId', { unique: false });
          fileStore.createIndex('parentId', 'parentId', { unique: false });
          fileStore.createIndex('category', 'category', { unique: false });
          fileStore.createIndex('starred', 'starred', { unique: false });
          fileStore.createIndex('inTrash', 'inTrash', { unique: false });
          fileStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // 2. Folders Object Store
        if (!db.objectStoreNames.contains('folders')) {
          const folderStore = db.createObjectStore('folders', { keyPath: 'id' });
          folderStore.createIndex('parentId', 'parentId', { unique: false });
          folderStore.createIndex('starred', 'starred', { unique: false });
          folderStore.createIndex('inTrash', 'inTrash', { unique: false });
        }

        // 3. OS Sector States Store
        if (!db.objectStoreNames.contains('os_sectors')) {
          const sectorStore = db.createObjectStore('os_sectors', { keyPath: 'id' });
          sectorStore.createIndex('worker_id', 'worker_id', { unique: true });
          sectorStore.createIndex('status', 'status', { unique: false });
        }

        // 4. Low-Level Inodes Store
        if (!db.objectStoreNames.contains('inodes')) {
          const inodeStore = db.createObjectStore('inodes', { keyPath: 'id' });
          inodeStore.createIndex('path', 'path', { unique: false });
        }

        // 5. System Invariant & Metadata Store
        if (!db.objectStoreNames.contains('system_meta')) {
          db.createObjectStore('system_meta', { keyPath: 'key' });
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => {
          db.close();
          this.dbPromise = null;
        };
        resolve(db);
      };

      request.onerror = () => {
        console.error('[IndexedDB VFS] Failed to open database:', request.error);
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  /**
   * Initialize and hydrate data from IndexedDB.
   * If the DB is pristine (first load), seeds the default file, folder, and OS sector states.
   */
  async init(): Promise<{
    files: FileItem[];
    folders: FolderItem[];
    sectors: OsSectorState[];
    isFirstBoot: boolean;
  }> {
    const db = await this.getDb();

    // Check if files store already has data
    const existingFiles = await this.getAllFiles();
    const existingFolders = await this.getAllFolders();
    const existingSectors = await this.getAllSectors();

    const isFirstBoot = existingFiles.length === 0 && existingFolders.length === 0;

    if (isFirstBoot) {
      console.log('[IndexedDB VFS] Pristine database detected. Seeding initial VFS files, folders, and OS sectors...');
      
      // Build comprehensive initial file list combining html5 apps, cross platform samples and defaults
      const seedHtml5: FileItem[] = HTML5_APP_TEMPLATES.map(template => ({
        id: `file-bin-${template.id}`,
        name: `${template.id}.html`,
        folderId: 'folder-html5',
        parentId: 'folder-html5',
        category: 'code',
        mimeType: 'text/html',
        size: typeof template.code === 'string' ? template.code.length : 128000,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        content: template.code,
        rawContent: template.code,
        starred: false,
        inTrash: false,
        tags: ['Standard', 'A. Keddeh', 'HTML5'],
        isSystem: true,
        isHtml5App: true
      }));

      // Combine and deduplicate
      const filesMap = new Map<string, FileItem>();
      [...CONTEXT_INITIAL_FILES, ...seedHtml5, ...SAMPLE_CROSS_PLATFORM_FILES].forEach(f => {
        if (!filesMap.has(f.id)) {
          filesMap.set(f.id, f);
        }
      });

      const allSeedFiles = Array.from(filesMap.values());
      const allSeedFolders = [...CONTEXT_INITIAL_FOLDERS];
      const allSeedSectors = [...DEFAULT_OS_SECTORS];

      // Save everything to IndexedDB
      await this.saveFilesBatch(allSeedFiles);
      await this.saveFoldersBatch(allSeedFolders);
      await this.saveSectorsBatch(allSeedSectors);

      // Save system metadata
      await this.setMeta('holdingCharter', 'LAYNA CO PTY LTD (ABN 79 691 036 236)');
      await this.setMeta('resonanceLock', 0.297);
      await this.setMeta('substrateSignature', '0x412E3800CA000748');
      await this.setMeta('zcgReductionAxioms', 'A1-A4 ENFORCED');
      await this.setMeta('createdAt', new Date().toISOString());
      await this.setMeta('schemaVersion', DB_VERSION);

      this.isInitialized = true;
      return {
        files: allSeedFiles,
        folders: allSeedFolders,
        sectors: allSeedSectors,
        isFirstBoot: true
      };
    }

    // Ensure sectors exist even if previously initialized without them
    let sectors = existingSectors;
    if (sectors.length === 0) {
      sectors = [...DEFAULT_OS_SECTORS];
      await this.saveSectorsBatch(sectors);
    }

    this.isInitialized = true;
    console.log(`[IndexedDB VFS] Successfully hydrated ${existingFiles.length} files, ${existingFolders.length} folders, and ${sectors.length} OS sectors from persistent storage.`);

    return {
      files: existingFiles,
      folders: existingFolders,
      sectors,
      isFirstBoot: false
    };
  }

  // ==========================================
  // FILES OPERATIONS
  // ==========================================

  async getAllFiles(): Promise<FileItem[]> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readonly');
      const store = tx.objectStore('files');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async getFile(id: string): Promise<FileItem | null> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readonly');
      const store = tx.objectStore('files');
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async saveFile(file: FileItem): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readwrite');
      const store = tx.objectStore('files');
      const req = store.put({
        ...file,
        updatedAt: file.updatedAt || new Date().toISOString()
      });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async saveFilesBatch(files: FileItem[]): Promise<void> {
    if (files.length === 0) return;
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readwrite');
      const store = tx.objectStore('files');
      files.forEach(file => {
        store.put({
          ...file,
          updatedAt: file.updatedAt || new Date().toISOString()
        });
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async deleteFile(id: string): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readwrite');
      const store = tx.objectStore('files');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async deleteFilesBatch(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readwrite');
      const store = tx.objectStore('files');
      ids.forEach(id => store.delete(id));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // ==========================================
  // FOLDERS OPERATIONS
  // ==========================================

  async getAllFolders(): Promise<FolderItem[]> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('folders', 'readonly');
      const store = tx.objectStore('folders');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async getFolder(id: string): Promise<FolderItem | null> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('folders', 'readonly');
      const store = tx.objectStore('folders');
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async saveFolder(folder: FolderItem): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('folders', 'readwrite');
      const store = tx.objectStore('folders');
      const req = store.put({
        ...folder,
        updatedAt: folder.updatedAt || new Date().toISOString()
      });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async saveFoldersBatch(folders: FolderItem[]): Promise<void> {
    if (folders.length === 0) return;
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('folders', 'readwrite');
      const store = tx.objectStore('folders');
      folders.forEach(f => {
        store.put({
          ...f,
          updatedAt: f.updatedAt || new Date().toISOString()
        });
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async deleteFolder(id: string): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('folders', 'readwrite');
      const store = tx.objectStore('folders');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // ==========================================
  // OS SECTORS OPERATIONS
  // ==========================================

  async getAllSectors(): Promise<OsSectorState[]> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('os_sectors', 'readonly');
      const store = tx.objectStore('os_sectors');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async getSector(id: string): Promise<OsSectorState | null> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('os_sectors', 'readonly');
      const store = tx.objectStore('os_sectors');
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async saveSector(sector: OsSectorState): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('os_sectors', 'readwrite');
      const store = tx.objectStore('os_sectors');
      const req = store.put({
        ...sector,
        updatedAt: new Date().toISOString()
      });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async saveSectorsBatch(sectors: OsSectorState[]): Promise<void> {
    if (sectors.length === 0) return;
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('os_sectors', 'readwrite');
      const store = tx.objectStore('os_sectors');
      sectors.forEach(s => {
        store.put({
          ...s,
          updatedAt: s.updatedAt || new Date().toISOString()
        });
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async deleteSector(id: string): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('os_sectors', 'readwrite');
      const store = tx.objectStore('os_sectors');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // ==========================================
  // INODES OPERATIONS (Low-Level / VFSPrimitive)
  // ==========================================

  async getAllInodes(): Promise<InodeRecord[]> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('inodes', 'readonly');
      const store = tx.objectStore('inodes');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async getInode(id: string): Promise<InodeRecord | null> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('inodes', 'readonly');
      const store = tx.objectStore('inodes');
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async saveInode(inode: InodeRecord): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('inodes', 'readwrite');
      const store = tx.objectStore('inodes');
      const req = store.put({
        ...inode,
        updatedAt: new Date().toISOString()
      });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async deleteInode(id: string): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('inodes', 'readwrite');
      const store = tx.objectStore('inodes');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // ==========================================
  // SYSTEM METADATA OPERATIONS
  // ==========================================

  async getMeta<T = any>(key: string): Promise<T | null> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('system_meta', 'readonly');
      const store = tx.objectStore('system_meta');
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ? req.result.value : null);
      req.onerror = () => reject(req.error);
    });
  }

  async setMeta(key: string, value: any): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('system_meta', 'readwrite');
      const store = tx.objectStore('system_meta');
      const req = store.put({
        key,
        value,
        updatedAt: new Date().toISOString()
      });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // ==========================================
  // SNAPSHOT & RESET UTILITIES
  // ==========================================

  async exportSnapshot(): Promise<VfsBackupSnapshot> {
    const files = await this.getAllFiles();
    const folders = await this.getAllFolders();
    const sectors = await this.getAllSectors();
    const inodes = await this.getAllInodes();

    return {
      version: DB_VERSION,
      exportedAt: new Date().toISOString(),
      holdingCharter: 'LAYNA CO PTY LTD (ABN 79 691 036 236)',
      resonanceLock: 0.297,
      substrateSignature: '1x412E3800CA000748',
      files,
      folders,
      sectors,
      inodes
    };
  }

  async importSnapshot(snapshot: VfsBackupSnapshot): Promise<void> {
    if (!snapshot || !Array.isArray(snapshot.files) || !Array.isArray(snapshot.folders)) {
      throw new Error('Invalid VFS backup snapshot format.');
    }

    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['files', 'folders', 'os_sectors', 'inodes', 'system_meta'], 'readwrite');
      
      const fileStore = tx.objectStore('files');
      const folderStore = tx.objectStore('folders');
      const sectorStore = tx.objectStore('os_sectors');
      const inodeStore = tx.objectStore('inodes');
      const metaStore = tx.objectStore('system_meta');

      fileStore.clear();
      folderStore.clear();
      sectorStore.clear();
      inodeStore.clear();

      snapshot.files.forEach(f => fileStore.put(f));
      snapshot.folders.forEach(f => folderStore.put(f));
      if (Array.isArray(snapshot.sectors)) {
        snapshot.sectors.forEach(s => sectorStore.put(s));
      }
      if (Array.isArray(snapshot.inodes)) {
        snapshot.inodes.forEach(i => inodeStore.put(i));
      }

      metaStore.put({
        key: 'lastImportAt',
        value: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async resetToDefaults(): Promise<{
    files: FileItem[];
    folders: FolderItem[];
    sectors: OsSectorState[];
  }> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['files', 'folders', 'os_sectors', 'inodes', 'system_meta'], 'readwrite');
      tx.objectStore('files').clear();
      tx.objectStore('folders').clear();
      tx.objectStore('os_sectors').clear();
      tx.objectStore('inodes').clear();
      tx.objectStore('system_meta').clear();

      tx.oncomplete = async () => {
        const result = await this.init();
        resolve(result);
      };
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const VFS_STORAGE_INDEXED_DB = new VfsStorageIndexedDb();
