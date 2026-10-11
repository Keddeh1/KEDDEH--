# R2 independent family browser observations

This is bounded Chromium evidence produced by a separate family-test worker. Initial verification was followed by bounded source repairs; a separate reviewer checks the patches and reruns. Exact pre-repair copies, patches and SHA-256 lineage are in [development/r2-family](../development/r2-family/). Source SHA-256 before/after is present in every runtime receipt. The aggregate is [r2-family-controls.json](r2-family-controls.json); runnable harnesses are [control runner](../tests/r2-family-controls.cjs), [actions](../tests/r2-family-actions.cjs), and [summary builder](../tests/r2-family-summary.py).

## Result and scope

Twenty-three HTML identities were loaded in fresh ephemeral contexts: seven Drive families, eleven standalone HTML5 carriers, and five raw GitHub HTML identities. Thirty-three bounded assertions passed and zero remain failed. Some assertions are shell inventory, not functional qualification. Four identities previously reported runtime errors. Targeted reruns after the source and harness repairs below have no runtime errors; this does not establish whole-system qualification.

- CasePath: filled a disposable matter field through the actual form, navigated to save, reloaded, and verified the same field value returned; IndexedDB database inventory was captured. Repeated step navigation retained the matter. This does not qualify legal analysis, DOCX exports or external delivery.
- Calculator: UI entered `2 + 3`, independently asserted displayed `5`; repeated reset, malformed expression and recovery to `7 × 6 = 42` worked.
- Paint: actual pointer drawing changed encoded canvas pixels; Undo restored the exact preceding raster; rectangle selection changed the active tool.
- Physics: pause/resume/pause changed the control state; mode and a valid gravity value were retained in controls. Numerical physics fidelity was not tested.
- Synthesizer: patch selection and oscilloscope mode changed the UI. Audio playback and acoustic fidelity were not tested.
- Breakout: keyboard input and elapsed game frames changed the canvas raster. No completed-level or high-score persistence qualification.
- Governed estate: checking one real gate produced the independently computed percentage, and unchecking restored zero. An app's gate labels are not treated as governance approval.
- Active Warehouse and Computer Stack: Mirror increased a resident X revision by exactly one; unknown CLI command followed by Help remained responsive. No provider probe or full machine conformance qualification.
- Bootchain: VFS inspection exposed boot paths; invalid input, Help and Reset retained Stage 0. Worker-dependent boot/assembled execution was not tested.
- Launchpad and V76: safe navigation/launcher changed displayed content. Launchpad unbooted resident-status action records a blocked dependency; V76 retains its R4 runtime with the absent optional dock explicitly identified.
- IL-LLM: a negative address remains contained; the legacy resolver API and parsed BRAINK binding are independently checked after initialization. This is not full IL-LLM semantic or embedded-carrier qualification.
- Host-dependent AetherOS, Chrome, Mesh, Mining and KexLinux: shell text or canvas presence only. The five raw GitHub HTMLs are separately accounted and byte-identical counterparts are explicitly mapped in the JSON; they are not silently collapsed. These shells do not establish backend, syscall, virtual OS or mining capability.

## Repaired source failures and harness defect

| Identity | Original cause | Bounded repair and remaining boundary |
| --- | --- | --- |
| BRAINK HTML Launchpad v11 | Missing `renderResident`, `render` and `appendLog` globals | Restored state-to-DOM projections and receipt logging with textContent; no emulator, host or mining operations added. Unbooted Linux status stays blocked. |
| BRAINK V76 | R4 optional dock markup absent; binding attempted `appendChild` on null | Bind only when every required dock element exists; expose `BRAINK_R4_UI` missing IDs. Existing BRAINK_R4 runtime remains exported. Dock not reconstructed or represented as available. |
| BRAINK IL-LLM KEX user space v11 | Six application/json payloads entity-encoded; legacy v9 resolver also ran before later v10 binding markup | Source JSON decoded and validated; legacy resolver starts on DOMContentLoaded. Parsed data meaning retained. |
| IL-LLM and microkernel bootchain harness | Playwright `serviceWorkers: block` injects an unchecked navigator.serviceWorker getter, which throws in opaque sandbox frames | Replaced that harness option with a guarded registration-denial hook. CSP still denies workers. Explicit registration probe rejects with SecurityError. Neither iframe sandbox nor bootchain source was weakened. |

Pre-repair browser receipts remain in [r2-family-before-repair](r2-family-before-repair/). The Playwright injection was located in its installed `lib/coreBundle.js` around line 51296; the application sources contain no serviceWorker call responsible for that exception. This closure is a **harness repair**, not new application service-worker capability. Every targeted rerun independently captures an empty runtime-error array and denied service-worker registration.

## Isolation and evidential limits

Only exact loopback-origin GET/HEAD requests were allowed. CSP denies connections, workers, objects and form submission; service workers and WebSockets were blocked. Contexts were ephemeral, downloads cancelled and dialogs dismissed. No production server, host credentials, external messages, mining/payment controls or provider probes were used. A throwaway local static server was closed after each HTML.

Mining source appends startup log messages claiming socket negotiation and active mining while updating random metrics. The inspected implementation polls a relative telemetry API, which is blocked here. Those labels are **not evidence of a socket connection, authentication, hashing or payment**. Mesh telemetry and host syscall consumers likewise remain adapter-dependent. Startup log text must not be presented as reproduced infrastructure capability.

Five initial harness reports are retained in [r2-family-harness-initial-failures](r2-family-harness-initial-failures/). They caught test assumptions, not confirmed application defects: two CLI assertions read the assembly terminal rather than the CLI log; one slider attempted a value below its declared minimum; two canvas shells were checked for body text. Corrected reruns supply current evidence. These initial five failures required harness corrections, not source changes. The later source repairs above address separately reproduced startup failures.

The separate parent-owned priority suite covers R14, managed-VFS AetherOS, KEX Terminal, Markdown and SQL. HCF remains a startup/dependency inventory outside this control suite. StoreSpace and ServerSpace originals remain unavailable and are not substituted by other applications. Persistent CasePath data was checked across a reload in one disposable context, not a new browser profile or crash-recovery scenario.

## Reproduction

Run from the estate root after source preflight review:

```sh
node tests/r2-family-controls.cjs --root working/drive --out evidence/r2-family-drive --execute-reviewed
node tests/r2-family-controls.cjs --root working/html5 --out evidence/r2-family-html5 --execute-reviewed
node tests/r2-family-controls.cjs --root working/github --out evidence/r2-family-github --execute-reviewed
python3 tests/r2-family-summary.py
```

The runner currently uses `/usr/bin/chromium` and the provisioned Playwright module at `/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.js`. Portability of those dependency paths must be handled by the package setup guide; no screenshot is part of this family suite.

## Separate review

A separate reviewer reran the four affected carriers: eight assertions passed, zero runtime errors, and all service-worker denial probes succeeded. The reviewer checked all three repaired source hashes and confirmed decoded IL-LLM JSON values match the original entity-decoded values; outside those JSON blocks the only IL-LLM changes are the deferred-listener boundaries. Evidence: [independent source review](r2-family-independent-source.json) and [independent browser receipts](r2-family-independent/).
