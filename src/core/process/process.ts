/**
 * Process Primitive Implementation
 * 
 * Performance Goal: <5ms signal propagation
 */

import { EventEmitter } from 'events';
import { z } from 'zod';
import { Pid, brandPid } from '../types';

const ProcessStatusSchema = z.enum(['running', 'terminated']);

export class ProcessPrimitive extends EventEmitter {
  private processes: Map<Pid, { pid: Pid, status: z.infer<typeof ProcessStatusSchema> }> = new Map();

  constructor() {
    super();
  }

  spawn(pid: number): void {
    const brandedPid = brandPid(pid);
    if (this.processes.get(brandedPid)?.status === 'running') throw new Error('PROCESS_ALREADY_RUNNING');
    this.processes.set(brandedPid, { pid: brandedPid, status: 'running' });
    this.emit('spawn', brandedPid);
  }

  // Synchronous event dispatch; latency must be measured by the caller.
  terminate(pid: number, signal: 'SIGTERM' | 'SIGKILL'): void {
    if (signal !== 'SIGTERM' && signal !== 'SIGKILL') throw new Error('INVALID_PROCESS_SIGNAL');
    const brandedPid = brandPid(pid);
    const proc = this.processes.get(brandedPid);
    if (proc && proc.status === 'running') {
      proc.status = 'terminated';
      this.emit('signal', { pid: brandedPid, signal });
      this.emit('terminated', brandedPid);
    }
  }

  getProcessStatus(pid: number): 'running' | 'terminated' | undefined {
    const brandedPid = brandPid(pid);
    const proc = this.processes.get(brandedPid);
    return proc ? ProcessStatusSchema.parse(proc.status) : undefined;
  }
}
