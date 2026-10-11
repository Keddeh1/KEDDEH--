# Drive runtime source handoff

Acquired 2026-10-10 UTC: ten complete original HTML files, 33,927,993 bytes total. Every local byte count matches Drive metadata. Original filenames, Drive IDs, direct links, creation/modification timestamps, acquisition timestamps and SHA-256 values are in `../originals/drive/manifest.json`. `SHA256SUMS` permits future integrity checks. Originals are preservation-only; make all changes in `../working/drive/`.

## Static findings

- R14: script `p19-host-adapter-runtime` (zero-based script index 126) has 31 literal backslash-n sequences and no actual newlines. JavaScript parsing fails on its first character. This prevents that host-adapter script from binding its interfaces. The separate R14 script parses, but successful integration must be established by runtime tests. Do not global-replace escapes throughout the file: embedded JSON and other string data require them.
- HCF: external dependencies include Google Identity, unpinned jsDelivr `v86@latest`, Google Fonts, import-map entries for `@google/genai@0.7.0` and `@tailwindcss/browser@^4.1.3`, and a `/index.css` reference absent from the provided single-file source. No main executable application script/module entrypoint was found; the only executable script tags load Google Identity and v86. The HTML alone should not be assumed to contain a functioning workstation application.
- Across all ten files, 77 executable inline script blocks were parsed with `node --check` without executing them. 76 parsed, one failed (R14 above). JSON/import-map/non-JavaScript blocks were not treated as executable code. Syntax success is not operational validation.
- Except HCF, no external script-source or linked stylesheet dependency was observed in the parsed documents. Dynamic URLs, embedded payloads, and generated frames require separate runtime inspection; this is not a full security audit.
- AetherOS uses local/session storage, boot timers, a simulated desktop, and a control-driven browser/frame navigation feature. No direct fetch/WebSocket/Worker call or mining/payment marker was found.
- R14 auto-runs boot, restore and self-test paths and uses browser storage. Its WebSocket and Worker constructors are within the malformed host-adapter script. The WebSocket method takes an explicit endpoint; no startup endpoint was observed. Mining/wallet mentions in executable blocks were display/failure-register checks, not observed payment or mining actions.

## Entry points and safe test plan

Open the working HTML files through a loopback HTTP server in fresh, ephemeral browser profiles. Block outbound connections, external WebSockets, workers and downloads for initial observation; apply a process time cap. Do not sign in, provide credentials, activate payment/mining controls, or connect host actuators during baseline testing.

- AetherOS: `runBootStep`, `initDesktop`; inspect boot-to-desktop and console failures.
- R14: DOMContentLoaded/load handlers, boot/self-test/restore code; capture parse errors and availability of expected globals separately from displayed PASS text.
- Launchpad: `bootReal`, `init`, `runReady`, `runLocal`; its filename says v11 but page title still says V8.
- V76 and R14 share a legacy v24/P18/A18 document title; record source filename/hash when comparing versions.
- UserSpace v11 has a v9 page title; inspect event handlers and ledger/render functionality without treating the label as version proof.
- KEX developer runtime: `boot`, `initSyscalls`, `runDeveloperProgram`; worker execution needs a later explicit isolated test.
- Warehouse: `boot`, `render`.
- Governed estate: `renderLogical`, `renderCarriers`.
- CasePath: DOMContentLoaded and `keddeh:booted` listeners; use empty test state only.
- HCF: preserve as incomplete input until its missing main app/CSS sources are recovered or deliberately rebuilt.

Detailed script counts, handlers, API markers and function candidates are in `drive-static-inventory.json`. Source-inspection utility: `inspect_drive_static.py`. No browser runtime execution or source modification was performed during acquisition/static review.
