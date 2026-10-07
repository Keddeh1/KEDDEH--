/**
 * Telemetry Primitive Implementation
 * 
 * Performance Goal: Zero-copy transmission
 */

export class TelemetryPrimitive {
  private data: Float64Array = new Float64Array(2); // [cpu, mem]

  // Returns TypedArray view for zero-copy access
  getMetrics(): Float64Array {
    // Simulating hardware/kernel polling
    this.data[0] = Math.random(); 
    this.data[1] = Math.random();
    return this.data;
  }
}
