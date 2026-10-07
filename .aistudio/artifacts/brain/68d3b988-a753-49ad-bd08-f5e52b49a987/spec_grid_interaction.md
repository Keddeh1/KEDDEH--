# Technical Specification: Bento-Grid Modular Layout Engine

This artifact defines the elite, reusable conventions for the grid layout engine.

## 1. Grid Engine Core (Reusable)
- **Container Strategy**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-max gap-4`.
- **Dynamic Sizing**: Utilize `grid-row-span` and `grid-col-span` classes based on module importance and content density requirements.
- **Responsiveness**: Enforce `1440px` max-width container baseline.

## 2. Interaction Layer (Unified Input)
- **Convention**: All interactive elements MUST use a unified hook `useInteraction` to normalize pointer events.
- **Implementation Stub**:
```tsx
export const useInteraction = (handlers: {
  onClick: (e: React.PointerEvent) => void;
  onDragStart: (e: React.PointerEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
}) => {
  return {
    onPointerDown: (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse') handlers.onClick(e);
      // Normalized touch/mouse logic
    }
  };
};
```
