KEDDEH SYSTEMS | RESEARCH AND FORMAL PUBLISHING | ENGINEER · AUTOMATE · SCALE

### Document control

| Field | Value |
| --- | --- |
| Title | Development, run and test guide |
| Document ID | KEDDEH-ENG-DEVELOPMENT-001 |
| Version / date | R2 / 2026-10-11 UTC |
| Classification / status | Private development material / Draft |
| Assessor / approval receipt | Unrecorded / Unrecorded |

### Authorship and licensing

Author: Aboudy Keddeh — Systems Architect. Rights holder: Aboudy Keddeh. Publisher: Keddeh Systems. Legal context: The Layna Company Pty Limited, user-stated parent. Licence profile: KEDDEH-RESERVED-1.0.

Architecture and research direction: Aboudy Keddeh. AI-assisted drafting and source synthesis: OpenAI ChatGPT. No independent approval is implied.

All rights reserved. No licence is granted by this document. Separate written permission governs reuse, redistribution and implementation, subject to applicable law. Third-party material retains its own rights.

### Publication identity and visual attribution

KEDDEH SYSTEMS · ENGINEER · AUTOMATE · SCALE. Local repository research and engineering edition. Source identities and original third-party notices remain preserved. See [publication controls](publication-controls.md) for reference access and layout verification limits.

# Development, run and test guide

Work from the repository root after the estate has been integrated. Preserve the original manifests and use the isolated test definitions under `software-estate/tests`; read their README before invoking execution. The repository's application dependencies and HTML-browser test dependencies are different sets. Root `package.json` defines the Vite/React/TypeScript application; do not assume installing it provides a qualified browser harness.

The established component checks are:

```sh
node software-estate/development/r14/regression.cjs
node software-estate/tools/test-sql-csv.cjs
python3 software-estate/tools/test-sql-csv-roundtrip.py
node software-estate/tests/static-verify.cjs
```

These checks require Node.js and Python 3. Browser tests additionally require the runner's declared Playwright dependency and a compatible Chromium executable. Use `npm ci` with the R2 test setup pinned to Playwright 1.62.1; `CHROMIUM_PATH` defaults to `/usr/bin/chromium`, and `PLAYWRIGHT_MODULE` can select the installed module. Consult the checked-in setup definition supplied with the R2 browser harness, record actual versions and rerun its isolation fixture first. A previous environment's inability to launch Chromium is not a restriction of every environment.

For catalog template development, edit the corresponding file under `working/github`, run `node software-estate/tools/extract-html5.cjs`, then run static verification and focused browser tests against `working/html5`. Extraction evaluates only accepted literal templates and refuses executable interpolation. Do not manually fix only a generated file and leave its template broken. The R14 patch script is intentionally not idempotent: do not apply it a second time to an already repaired carrier.

The inherited baseline tool supports static preflight and reviewed execution:

```sh
node software-estate/tests/baseline.cjs
node software-estate/tests/baseline.cjs --root software-estate/tests/fixtures --out software-estate/evidence/harness-selftest --execute-reviewed
```

Read preflight and source before selecting an application. The baseline does not activate controls and uses restrictive CSP that can intentionally block workers; use the dedicated R2 focused runner for tested worker/persistence behavior under its own documented isolation policy. Do not interpret a baseline blocked worker as a core defect without testing the intended browser capability safely.

For every focused run, use a disposable context and loopback origin, deny outbound effects, verify the isolation fixture, record original/working hashes and retain console/request evidence. Exercise R14 boot and checkpoint/restore first; then managed AetherOS create/edit/save/reload; then Terminal host-aware commands, Markdown preview and SQL export. Check repeated actions and storage/worker failures. A reload must occur in the same origin/context to test persistence; a fresh context is a different test. Keep downloads in a temporary test directory and inspect exported bytes independently.

Documentation regeneration uses `marked` 17.0.5 and the validation runner uses Playwright 1.62.1. With those modules installed on the Node resolution path, run `node software-estate/docs/render.cjs` and `node software-estate/docs/validate.cjs` from the repository root. Canonical Markdown remains authoritative; HTML is generated, self-contained and has stable heading IDs.

See the [evidence register](evidence-register.md) for final R2 reports when integrated. Not every root package script is a test: pool, mining submission and external services commands must not be run as part of this walkthrough.


---
© 2026 Aboudy Keddeh | Keddeh Systems | All rights reserved  
KEDDEH-ENG-DEVELOPMENT-001 | R2 | Private development material | Draft  
[Master index](index.md) · [Publication controls](publication-controls.md)
