# R2 bounded family repairs

Scope: three working Drive HTMLs only. Original archives and originals/ remain untouched. [changes.json](changes.json) records pre/post SHA-256. Each `.before` file is the exact working preimage; its sibling `.patch` is the unified diff. Prior browser errors are retained under [evidence/r2-family-before-repair](../../evidence/r2-family-before-repair/).

1. Launchpad: missing global projection helpers prevented startup and receipt readback. Restore DOM rendering/logging only, using textContent/createElement. Display unbound state and existing recorded values; do not add a Linux runtime, host bridge implementation, consensus verification or mining capability. The existing unbooted Linux status path returns BLOCKED_LINUX_NOT_BOOTED and logs it correctly.
2. V76: retained R4 runtime tried to bind a dock whose markup is not in this carrier. Require the complete optional mount before binding, publish the missing IDs as BRAINK_R4_UI, and preserve the BRAINK_R4 API. This is not a new dock or a claim that the missing UI exists.
3. IL-LLM: six application/json blocks contain HTML entities inappropriate for script raw-text. Decode once in source, validate JSON and preserve values. Start the legacy v9 resolver after DOMContentLoaded because its v10 binding script follows it in the document. This repairs actual data and dependency order, not a caught-and-ignored parsing exception.

Bootchain application/template sources were not changed. Its SecurityError came from Playwright's injected service-worker blocker reading a forbidden getter in an opaque iframe. tests/r2-family-controls.cjs now uses a guarded rejection hook plus the existing worker-src none CSP. A browser negative test verifies registration rejects with SecurityError. Exact-loopback route enforcement and websocket denial remain in place. Parent-controlled baseline harness may still reproduce the older tool-injection error; use the repaired family runner for closure evidence.

Current aggregate: [r2-family-controls.json](../../evidence/r2-family-controls.json). Independent source and browser review is owned separately and is not inferred from this repair note.
