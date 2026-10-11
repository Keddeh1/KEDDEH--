# Local HTML development R2

Sources remain attributed to Aboudy Keddeh and their existing rights holders. These are bounded local development repairs, not a replacement architecture or a full application qualification.

| Working component | Reproduced problem | Repair | Independent oracle |
| --- | --- | --- | --- |
| BRAINK R14 P19 persistence | Accessing a denied IndexedDB getter escaped the exception boundary and prevented fallback | Include API access inside the existing try/catch; keep schema and host API unchanged | Real browser denial injection followed by exact-value localStorage read and reload |
| Managed-VFS AetherOS editor | A 50 ms initialization callback could overwrite a user's fresh input | Initialize after synchronous window insertion; focus existing editor without reinitialization | Edited text survives repeated launch; saved overlay bytes and reloaded editor equal expected content |
| Managed-VFS AetherOS window controls | Header drag shield consumed Close button click | Ignore window-control targets and non-primary buttons in drag start | Three actual Close-button cycles remove the editor DOM |

`*-r2-change.json` record R1 and R2 carrier hashes. `*-original-to-r2.patch` contain complete original-to-current diffs; the R14 diff also includes R1 changes. The R1 development directory remains a historical implementation and regression suite. `p19-host-adapter-runtime.js` here is the current extracted P19 script. Filenames, original bytes, resident payloads, schemas and application identities are preserved.

Run `python3 tests/verify-estate.py` and `node tests/r2-browser.cjs` from the estate root. Browser assertions are external to application receipt labels. The separate reviewer rerun is recorded under `evidence/r2-browser-independent` when present.

Failure history is retained in `evidence/r2-browser/`. Initial reports include actual defects above and corrected harness assumptions: SQL's valid CRLF output, KEX's host-bound `cat`, AetherOS's preopened terminal, R14's stacked research overlays, and overly short load-event navigation waits. None is silently relabelled as an application pass.

Not addressed: full host integration, R14 IndexedDB blocked-open/version-change timeouts and WebSocket pre-open close settlement, AetherOS quota-error atomicity and app-level authority hardening, missing HCF dependencies, and any host integrations not exercised by this increment. The later [family repair increment](../r2-family/README.md) separately closes three source startup defects and the harness-origin sandbox exception.
