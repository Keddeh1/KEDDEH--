export interface RuntimeInput { type: string; [key: string]: unknown; }

export class InputPrimitive {
  private readonly handlers = new Map<string, Set<(event: RuntimeInput) => void>>();
  normalizeEvent(rawEvent: RuntimeInput): { type: string; payload: RuntimeInput } {
    if (!rawEvent || typeof rawEvent.type !== 'string' || !rawEvent.type.trim()) throw new Error('INVALID_INPUT_EVENT');
    return { type: rawEvent.type, payload: rawEvent };
  }
  handleEvent(rawEvent: RuntimeInput): void {
    const event = this.normalizeEvent(rawEvent);
    for (const handler of [...(this.handlers.get(event.type) ?? [])]) handler(event.payload);
  }
  on(type: string, handler: (event: RuntimeInput) => void): () => void {
    if (!type.trim() || typeof handler !== 'function') throw new Error('INVALID_INPUT_HANDLER');
    const handlers = this.handlers.get(type) ?? new Set();
    handlers.add(handler); this.handlers.set(type, handlers);
    return () => { handlers.delete(handler); if (!handlers.size) this.handlers.delete(type); };
  }
}
