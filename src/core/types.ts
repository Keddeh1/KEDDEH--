/**
 * Branded Types for rigorous type-safety
 */

export type InodeId = string & { readonly __brand: unique symbol };
export type Pid = number & { readonly __brand: unique symbol };

export const brandInodeId = (id: string): InodeId => {
  if (typeof id !== 'string' || !id.trim()) throw new Error('INVALID_INODE_ID');
  return id as InodeId;
};
export const brandPid = (pid: number): Pid => {
  if (!Number.isSafeInteger(pid) || pid < 1) throw new Error('INVALID_PROCESS_ID');
  return pid as Pid;
};
