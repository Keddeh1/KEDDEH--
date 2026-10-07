# Workspace Restoration: Full Build as Default with Dedicated Tabs & Floating Mode

Restore the complete application build as the primary default view, ensuring that no features, files, or navigation workflows are displaced. Integrate the 4 decoupled planes and runtime tools directly into dedicated tabs in the sidebar and header, while providing the floating window desktop as an optional workspace mode.

---

## User Decisions & Clarifications

> [!IMPORTANT]
> The following configuration was confirmed via user clarification:
> - **Primary Workspace**: Restore the **full build as default** (complete sidebar, header, file system, document workspace, mining lab, server cluster, and analytics).
> - **Planes & Runtime Tools Location**: Host the 4 decoupled planes (Display, OS, Memory, Driver/VFS), Stratum engine, and Multicast mesh **inside dedicated tabs in the navigation sidebar and header**.
> - **Floating Window Mode**: Keep the floating, dockable artifact container environment available via an accessible workspace toggle button in the header.

---

## 1. Workspace Restoration Architecture

Ensure the root view in `src/App.tsx` renders the full, rich workstation layout by default:

```
┌─────────────────┬─────────────────────────────────────────────────────────────┐
│ SIDEBAR         │ CLOUD INFRASTRUCTURE HEADER                                │
│ [KEDDEH GRID]   │ Breadcrumbs · Search · Filters · [Floating OS] · Status     │
│                 ├─────────────────────────────────────────────────────────────┤
│ Workspace Home  │ ACTIVE TAB VIEW                                             │
│ Stratum Console │                                                             │
│ Decoupled Planes│ • Decoupled 4-Planes Controller (Screen, OS, Memory, Drive) │
│ Files & Storage │ • Stratum & Multicast Hardware Substrate                    │
│ Documents       │ • Storage Carrier Substrate (Files & Grid)                  │
│ Legal Workspace │ • Document & Code Editor                                    │
│ Infrastructure  │ • Server Cluster & Analytics                                │
│ Licensing       │ • Commercial Licensing & Product Showcase                   │
└─────────────────┴─────────────────────────────────────────────────────────────┘
```

---

## 2. Dedicated Tabs & Navigation

1. **Decoupled Planes Tab** (`planes`):
   - Dedicated tab in the navigation sidebar housing all 4 decoupled planes:
     - **Display & Observer Projection** ($\tau$ frame buffer, 60 FPS).
     - **OS Relational Engine** (transition scheduler, 20 lanes, $449.8\,\text{M ops/sec}$).
     - **1-Origin Injective Memory Manifold** (64-byte cache line hexadecimal inspector, wave collapse).
     - **Driver & VFS Substrate** (hardware carrier control, safe disconnect trap $\text{pos}_R=1$, $\mathcal{O}(1)$ rehydration).
2. **Stratum & Mining Console Tab** (`ai` / `mining`):
   - Live TCP socket telemetry (`bitcoin.viabtc.io:3333`), difficulty tracking, share distribution, and raw JSON-RPC stream.
3. **Infrastructure & Server Tab** (`server`):
   - Full server cluster diagnostics, dual runtime workstation, and multicast mesh telemetry.
4. **All Existing Tabs Fully Preserved**:
   - `home`, `files`, `documents`, `legal`, `starred`, `analytics`, `trash`, `pricing`, `showcase`, `software`.

---

## 3. Toggleable Floating Window Workspace

- Add a clean **"Floating Window Workspace"** button in the top header.
- Users can switch into the floating desktop workspace at any time to freely drag, resize, and arrange artifact containers, and switch back to the classic tabbed workspace with one click.
- All file modals (Upload, Create Folder, Document Editor, Activation, File Preview) remain wired and active in both modes.

---

## 4. Verification Plan

1. **Default View Verification**:
   - Verify the app loads into the complete full build with sidebar, header, and active tab content visible immediately.
2. **Tab Navigation Verification**:
   - Verify clicking each sidebar item loads the corresponding view without errors or missing data.
   - Verify the dedicated **Decoupled Planes** view allows interactive carrier detach/rehydrate and wave collapse.
3. **Workspace Mode Toggle**:
   - Verify toggling between Full Build and Floating Window Workspace is instantaneous and preserves state.
4. **Build & Test Parity**:
   - Run `lint_applet` and verify 100% test pass across `npm run test:engineering` and `npm run mcp:self-test`.
