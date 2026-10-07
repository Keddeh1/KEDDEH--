/**
 * Branded Types for rigorous type-safety
 */

export type InodeId = string & { readonly __brand: unique symbol };
export type Pid = number & { readonly __brand: unique symbol };

export const brandInodeId = (id: string): InodeId => id as InodeId;
export const brandPid = (pid: number): Pid => pid as Pid;
