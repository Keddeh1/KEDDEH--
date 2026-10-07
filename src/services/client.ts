/**
 * Sovereign Stratum Client Ingestion Engine (client.ts)
 * 
 * Enforces strict physical tripwire: Disconnects and drops the socket
 * if a single accumulated message exceeds 10 kilobytes without successfully
 * registering a newline character.
 */
export { StratumClient, ClientState } from './StratumClient';
export type { StratumMetrics, StratumLogEntry, StratumJob } from './StratumClient';
