# Isolated HTML baseline QA

R2 setup: run `npm ci --ignore-scripts` from the estate root. Node >=22, Python 3, Playwright 1.62.1 and an installed Chromium are required. Set `CHROMIUM_PATH` when Chromium is not `/usr/bin/chromium`.

Run `npm run test:browser` for the priority external assertions, `npm run test:families` for reviewed non-priority controls, and `npm run test:integrity` for preserved-byte verification. These are the current R2 qualification runners. `baseline.cjs` below is the inherited startup/inventory runner: its restrictive Playwright service-worker policy can itself report an opaque-frame getter exception; the R2 family runner uses a guarded deny hook plus CSP and a negative registration test. Such instrumentation exceptions are not app defects.

The R2 blob worker policy permits source-reviewed worker code in the priority context; it is not a worker-code whitelist. No live host adapter or provider is loaded.

1. Run `node software-estate/tests/baseline.cjs` for static-only findings.
2. Inspect `software-estate/evidence/baseline/preflight.json` and the actual source before execution, especially automatic mining/financial work, intervals and external calls. The heuristic scanner is evidence, not a safety approval.
3. Execute only reviewed apps:

```
node software-estate/tests/baseline.cjs --file software-estate/originals/drive/APP.html --execute-reviewed
```

Select another input tree or evidence directory with `--root DIR --out DIR`. Test repaired copies with their own output directory; keep baseline evidence intact. Each run replaces the selected output directory's preflight and summary JSON; individual app evidence names include a stable relative-path hash.

## Evidence and guardrails

- Preserves input SHA256 before and after execution; never writes originals.
- A separate Chromium process, fresh ephemeral browser context and loopback-only read-only HTTP server per app; no cookies or authenticated user profile.
- Exact temporary server origin GET/HEAD only. External and mutation HTTP requests aborted, external DNS disabled, WebSockets blocked, service workers blocked, CSP disables connect/worker/form/object calls.
- Browser context has no permissions granted. Downloads canceled, dialogs dismissed. No app control is activated.
- App subprocess has a 22-second hard timeout (process-group kill), 7-second initial navigation and bounded interaction/screenshot timeouts.
- Captures console, JavaScript errors, requests/isolation blocks, DOM/control inventory, storage keys/lengths, IndexedDB database/store names and record counts, initial viewport screenshot.
- No financial, mining or transactional functions are deliberately invoked. Source-review step must exclude automatic high-cost computation before opting in.
- Isolation can prevent remote dependencies and integrations from working. Record that as a test limitation, not as an application defect. Startup without errors does not establish functional correctness.
- Static source context and screenshots are internal QA evidence; inspect for sensitive information before sharing externally.

## Self-test

`node software-estate/tests/baseline.cjs --root software-estate/tests/fixtures --out software-estate/evidence/harness-selftest --execute-reviewed`

The fixture deliberately emits EXPECTED_FIXTURE_EXCEPTION, creates ephemeral storage, attempts blocked example.com HTTP/WebSocket traffic, and includes a disabled control. Those expected errors must appear in evidence. The harness does not activate the control.
