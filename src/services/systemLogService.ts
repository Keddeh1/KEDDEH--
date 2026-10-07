import { SystemLogEntry } from '../types';

type LogListener = (log: SystemLogEntry) => void;

class SystemLogService {
  private static instance: SystemLogService;
  private listeners: LogListener[] = [];
  private logs: SystemLogEntry[] = [];
  private counter = 5000;

  private constructor() {}

  public static getInstance(): SystemLogService {
    if (!SystemLogService.instance) {
      SystemLogService.instance = new SystemLogService();
    }
    return SystemLogService.instance;
  }

  public subscribe(listener: LogListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public addLog(entry: Omit<SystemLogEntry, 'id' | 'timestamp'>) {
    const log: SystemLogEntry = {
      ...entry,
      id: `log-${this.counter++}`,
      timestamp: new Date().toISOString().slice(11, 23),
    };
    this.logs = [log, ...this.logs].slice(0, 500);
    this.listeners.forEach(l => l(log));
  }

  public getRecentLogs() {
    return [...this.logs];
  }
}

export const GLOBAL_SYSTEM_LOGS = SystemLogService.getInstance();
