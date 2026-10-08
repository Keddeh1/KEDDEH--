/**
 * VFS Primitive Implementation
 * 
 * Complexity Analysis:
 * - CRUD: O(1) for direct inode access, O(log N) for path lookup (where N is depth)
 * 
 * Safety Constraints:
 * - Atomic operation locks (Semaphore-based)
 * - Persistent backing storage via IndexedDB
 */

import { z } from 'zod';
import { InodeId, brandInodeId } from '../types';
import { VFS_STORAGE_INDEXED_DB } from '../../services/vfsStorageIndexedDb';

const InodeSchema = z.object({
  id: z.string(),
  metadata: z.record(z.string(), z.any()),
  data: z.any(),
});

export class VFSPrimitive {
  private inodes: Map<InodeId, z.infer<typeof InodeSchema>> = new Map();
  private locks = new Map<InodeId, Array<() => void>>();
  private isHydrated = false;
  constructor(private readonly storage = VFS_STORAGE_INDEXED_DB) {}

  private async acquireLock(id: InodeId): Promise<void> {
    const queue = this.locks.get(id);
    if (!queue) {
      this.locks.set(id, []);
      return;
    }
    await new Promise<void>(resolve => queue.push(resolve));
  }

  private releaseLock(id: InodeId): void {
    const queue = this.locks.get(id);
    const next = queue?.shift();
    if (next) next();
    else this.locks.delete(id);
  }

  /**
   * Hydrate in-memory inodes from IndexedDB persistent store
   */
  async hydrateFromIndexedDb(): Promise<void> {
    try {
      const persistedInodes = await this.storage.getAllInodes();
      for (const record of persistedInodes) {
        const brandedId = brandInodeId(record.id);
        await this.acquireLock(brandedId);
        try {
          const current = await this.storage.getInode(record.id);
          if (current && !this.inodes.has(brandedId)) this.inodes.set(brandedId, {
            id: current.id,
            metadata: current.metadata || {},
            data: current.data,
          });
        } finally { this.releaseLock(brandedId); }

      }
      this.isHydrated = true;
      console.log(`[VFSPrimitive] Hydrated ${persistedInodes.length} persistent inodes.`);
    } catch (err) {
      console.warn('[VFSPrimitive] Could not hydrate from IndexedDB, operating in-memory:', err);
    }
  }

  async create(id: string, metadata: Record<string, any>, data: any): Promise<void> {
    const brandedId = brandInodeId(id);
    const validated = InodeSchema.parse({ id, metadata, data });
    
    await this.acquireLock(brandedId);
    try {
      if (this.inodes.has(brandedId)) throw new Error(`Inode already exists: ${id}`);
      // Commit durable state before publishing the in-memory version.
      await this.storage.saveInode({
        id,
        path: metadata.path,
        metadata,
        data,
        updatedAt: new Date().toISOString()
      });
      this.inodes.set(brandedId, validated);
    } finally {
      this.releaseLock(brandedId);
    }
  }

  async read(id: string): Promise<z.infer<typeof InodeSchema>> {
    const brandedId = brandInodeId(id);
    await this.acquireLock(brandedId);
    try {
      let inode = this.inodes.get(brandedId);
      if (!inode) {
        // Attempt lazy load from IndexedDB
        const persisted = await this.storage.getInode(id);
        if (persisted) {
          inode = {
            id: persisted.id,
            metadata: persisted.metadata,
            data: persisted.data
          };
          this.inodes.set(brandedId, inode);
        }
      }
      if (!inode) throw new Error(`Inode not found: ${id}`);
      return InodeSchema.parse(inode);
    } finally {
      this.releaseLock(brandedId);
    }
  }

  async update(id: string, metadata: Record<string, any>, data: any): Promise<void> {
    const brandedId = brandInodeId(id);
    const validated = InodeSchema.parse({ id, metadata, data });
    
    await this.acquireLock(brandedId);
    try {
      if (!this.inodes.has(brandedId)) throw new Error(`Inode not found: ${id}`);
      // Commit durable state before publishing the in-memory version.
      await this.storage.saveInode({
        id,
        path: metadata.path,
        metadata,
        data,
        updatedAt: new Date().toISOString()
      });
      this.inodes.set(brandedId, validated);
    } finally {
      this.releaseLock(brandedId);
    }
  }

  async delete(id: string): Promise<void> {
    const brandedId = brandInodeId(id);
    await this.acquireLock(brandedId);
    try {
      if (!this.inodes.has(brandedId)) throw new Error(`Inode not found: ${id}`);
      await this.storage.deleteInode(id);
      this.inodes.delete(brandedId);
    } finally {
      this.releaseLock(brandedId);
    }
  }

  async flushToIndexedDb(): Promise<void> {
    for (const id of [...this.inodes.keys()]) {
      await this.acquireLock(id);
      try {
        const inode = this.inodes.get(id);
        if (!inode) continue;
        await this.storage.saveInode({
          id: inode.id,
          path: inode.metadata.path,
          metadata: inode.metadata,
          data: inode.data,
          updatedAt: new Date().toISOString()
        });
      } finally { this.releaseLock(id); }
    }
  }
}

export const GLOBAL_VFS_PRIMITIVE = new VFSPrimitive();
