# GitHub HTML5 source preservation and first development pass

Source: Keddeh1/KEDDEH--, commit `09f45187dbec29ebe63153f916b67505452dc136` (main at retrieval on 2026-10-10).

## Saved and verified

- 17 exact source files: the 13-app catalog, its 11 imported TypeScript modules, and five underlying HTML assets, including the additional KexLinux.html.
- Every original matches GitHub's Git blob SHA-1 and has a SHA256 checksum in originals/github/manifest.json and SHA256SUMS.
- Working source copies preserve repository-relative paths in working/github. 13 catalog HTMLs and the additional KexLinux.html are materialized in working/html5.
- tools/extract-html5.cjs validates TypeScript exports are single non-interpolating template literals, evaluates only the literal to preserve JavaScript escape semantics, materializes HTML, and compiles inline scripts without executing them.
- No source repository changes, deployments, credential operations, or backend requests were performed for this preservation/static pass.

## Fixed in working copies

1. KEX Linux Terminal: 22 under-escaped newline sequences and two under-escaped Python triple-quote strings made the generated JavaScript syntactically invalid. Escapes corrected in the source template and output regenerated.
2. Markdown Studio: 34 inner backticks in example documents were escaping only the outer TypeScript template. The extracted HTML script could not parse its nested template literals. Escapes corrected in source and output regenerated.

All 13 catalog inline scripts compile after these fixes. This is syntax verification, not a claim that all features work. See html5-static-baseline.json, html5-static-checks.json, html5-syntax-fixes.patch and html5-syntax-fixes.json. Independent browser checks are separate.

## Prioritized follow-on issues

### Host bridge and standalone operation

Several apps rely on parent-window `__kernel_syscall` messages. Their promises generally have no timeout and response handlers do not verify message source/origin. AetherOS initSystem awaits host verification and directory listing; SQL Studio initialization awaits the process list. An isolated standalone HTML is therefore not equivalent to its integrated host environment. Next development step: a documented, least-privilege local host bridge with explicit standalone/unavailable states, timeouts, schema checks and sender validation. Do not label local emulation as actual operating-system privileges.

### Telemetry truthfulness

- MiningOS uses randomized hashrate, CPU, RAM and latency and synthesizes accepted/rejected shares when /api/telemetry is unavailable. Fallback logs include 'Share verified by pool'. These are simulated display values, not proof of mining or earned cryptocurrency.
- KeraMeshOS prepopulates active workers, claims physical UDP multicast is active, and schedules success messages before verifying /api/kera_domain/health or /api/mesh/telemetry. Missing backend failures are swallowed. The browser HTML itself does not establish a physical UDP socket.
- A zero value is incorrectly treated as absent in MiningOS hashrate and KeraMeshOS active peer fallback logic.
- Next step: separate offline/demo/live states; blank unavailable live metrics; preserve legitimate zero values; show freshness and errors; reserve verified-success wording for evidence-backed backend responses.

### DOM safety

Mining/Mesh logs and Mesh worker cards interpolate backend data into innerHTML. VFS names also enter HTML in AetherOS and Chrome. Next step: textContent or explicit element construction for untrusted text; validate expected schemas; test markup payloads without executing them.

### Smaller correctness work

- FIXED in working copy: SQL CSV export now preserves zero/false and escapes header/value commas, quotes, CR and LF. Pure helpers are tested from actual regenerated HTML: 19 JS checks plus 16-field independent Python CSV round-trip. See sql-csv-fix.patch and regression evidence. Existing column schema and host contracts are unchanged. CSV fidelity does not sanitize spreadsheet formulas.
- Markdown blockquote matching occurs after '>' has already become '&gt;'; formatting is a small custom parser, not comprehensive GitHub-flavored Markdown.
- Many functions still assume the integrated host bridge exists. Finite-time failure handling and isolated app launch tests should precede broader feature development.

## Review examples

- working/html5/HTML5_Markdown_Notebook_Studio.html: syntax repaired, editor and rendered-document behavior ready for isolated browser tests.
- working/html5/KEX_Linux_Terminal.html: syntax repaired, shell/VFS behavior still requires host-bridge-aware testing.
- working/html5/HTML5_Scientific_Calculator.html and HTML5_Raster_Paint_Studio.html: syntax valid; useful bounded targets for arithmetic/input and drawing/undo/export tests.

Keep network requests blocked during local review unless a specific integration test is explicitly approved and its target verified.
