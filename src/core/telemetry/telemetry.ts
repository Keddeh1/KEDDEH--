export interface TelemetrySample { cpu: number; memory: number; }

/** Reuses a typed-array view; measurements come from the runtime provider. */
export class TelemetryPrimitive {
  private readonly data = new Float64Array([NaN, NaN]);
  private measuredAt: number | null = null;
  constructor(private readonly provider?: () => TelemetrySample) {}

  update(sample: TelemetrySample): void {
    if (![sample.cpu, sample.memory].every(value => Number.isFinite(value) && value >= 0 && value <= 1)) {
      throw new Error('INVALID_TELEMETRY_SAMPLE');
    }
    this.data[0] = sample.cpu;
    this.data[1] = sample.memory;
    this.measuredAt = Date.now();
  }

  getMetrics(): Float64Array {
    if (this.provider) this.update(this.provider());
    return this.data;
  }

  getStatus(maxAgeMs = 10000): 'UNKNOWN' | 'CURRENT' | 'STALE' {
    if (!Number.isFinite(maxAgeMs) || maxAgeMs < 0) throw new Error('INVALID_TELEMETRY_AGE');
    if (this.measuredAt === null) return 'UNKNOWN';
    return Date.now() - this.measuredAt > maxAgeMs ? 'STALE' : 'CURRENT';
  }
}
