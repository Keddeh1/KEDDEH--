/**
 * Input Primitive Implementation
 * 
 * Performance Goal: <16.6ms input resolution
 */

export class InputPrimitive {
  private handlers: Map<string, (e: any) => void> = new Map();

  // Normalize all input types to a single event object
  normalizeEvent(rawEvent: any): { type: string, payload: any } {
    return { type: rawEvent.type, payload: rawEvent };
  }

  // <16.6ms resolution
  handleEvent(rawEvent: any): void {
    const event = this.normalizeEvent(rawEvent);
    const handler = this.handlers.get(event.type);
    if (handler) {
      handler(event.payload);
    }
  }

  on(type: string, handler: (e: any) => void): void {
    this.handlers.set(type, handler);
  }
}
