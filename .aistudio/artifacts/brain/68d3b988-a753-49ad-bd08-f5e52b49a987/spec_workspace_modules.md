# Technical Specification: Context-Aware Workspace Modules

This artifact defines the reusable conventions for modular dashboard widgets.

## 1. Module Contract (Base Class/Convention)
Every module MUST implement a standardized `WorkspaceModule` interface:
```tsx
interface WorkspaceModule {
  id: string;
  context: 'desktop' | 'touch';
  data: any;
  render: () => JSX.Element;
}
```

## 2. Module Implementations
- **Asset Manager**: 
    - Logic: Implements tiered VFS access (Local -> Drive -> Registry).
- **System Telemetry**: 
    - Implementation Stub:
    ```tsx
    export const TelemetryModule = ({ data }) => (
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
        <h3 className="text-xs font-bold text-white mb-2">System Load</h3>
        {/* Real-time sparkline render */}
      </div>
    );
    ```
- **Quick Actions**: 
    - Implementation Stub:
    ```tsx
    export const QuickActionTile = ({ label, action }) => (
      <button onClick={action} className="p-4 bg-blue-600 rounded-lg text-white">
        {label}
      </button>
    );
    ```
