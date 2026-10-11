# BRAINK R14 local repair 1

## Outcome and scope

The working HTML is an additive local successor of the acquired R14 HTML. Its original is unchanged. No live transport, publication, mining, account operation, or deployment is part of this work.

Version: `KEDDEH_BRAINK_RUNTIME_R14_CONVERGED_LOCAL_FIX_1`.

This work repairs P19 startup and contains several host-adapter failure paths. It does not claim that the complete BRAINK estate or its embedded applications pass browser verification. Independent verification belongs to the separate verification worker.

## Source mechanics inspected

- The shell reads `registry`, `apps`, `payloads`, `resources`, `resource-payloads` and `fabric`. Its existing `KEDDEHVolume` API resolves and opens resident applications; `KEDDEHProjectionBus` maps the logical route namespace to resident HTML/resources/subprojections. The shell projects decoded resident HTML through its iframe's `srcdoc` and maintains source/standards views.
- Fifteen resident HTML entries include ClaimPath, CasePath, BRAINK workbooks, K-OS/BOS, KEX Computer and state tools, the Hybrid OS, virtual infrastructure, and the global-presence mesh. Base64 payloads, resident workbooks, routing tables, proofs, and historical manifests are unchanged.
- The P07 `KEXVolumeFS` is the resident volume/storage model, with VFS checkpoints and DOM-backed references; P08 `KEXNetwork.fabric` is a logical routing model; P12 `KEXHosting.manager` owns hosting contracts. The repair does not merge these planes or replace them with another application.
- P19 connects existing resident state to IndexedDB/localStorage, a Web Worker, and an explicit-endpoint WebSocket adapter. No WebSocket endpoint is introduced and none is automatically connected.
- R14 adds admission, observation, verification and successor records. Its checkpoint uses the P19 persistence adapter when present, with its original localStorage fallback otherwise.
- Original R14 manifest names `KEDDEH_BRAINK_S30_P19_HOST_ADAPTER_RUNTIME_R13_20260929-0715.html` as parent. Historical manifests remain verbatim. A new `keddeh-r14-local-fix-1-manifest` records this repair and requires independent verification.

## Reproduced defects and repairs

1. **P19 never parsed.** All 31 intended statement-line separators were literal `\\n`; the WebSocket URL regex was also over-escaped. `new vm.Script(originalP19)` raises SyntaxError. Only this script's malformed separators and regex are decoded. No blanket replacement across HTML, strings, data or payloads occurs.
2. **Persistence startup race.** Once P19 is syntactically repaired, its asynchronous probe runs concurrently with R14's immediate restore. Previously `get`/`put` could reject `E_PERSISTENCE_UNAVAILABLE` while backend was `UNPROBED`. An idempotent shared probe promise now gates both operations.
3. **Blocked worker prevented normal boot reporting.** Worker construction can throw despite API presence. Construction now returns a `BLOCKED` receipt, releases the blob URL, and boot reports `DEGRADED` while preserving usable persistence.
4. **Unsettled compute promises.** Worker stop, asynchronous failure, message-decoding failure, and synchronous cloning failure could strand pending operations. Pending promises now reject and are removed; failed workers are terminated and cleared.
5. **Storage denial escaped fallback.** A throwing `localStorage` getter is now inside the exception boundary. Failed persistence is reported as unavailable. IndexedDB transaction aborts now reject write/read promises, and non-JSON `undefined` values fail explicitly.
6. **Repeated boot duplicated resources.** `boot()` now shares one boot promise; repeated calls do not create extra workers or probes.

## Verification evidence

Run `node software-estate/development/r14/regression.cjs` from the workspace root. Results are saved in `regression-results.json`.

The developer's eleven component checks pass in Node VM with mocked browser APIs, including failure injection and a simulated fresh runtime reading shared storage. The same test checks every executable script for syntax and proves all pre-existing script bodies other than P19 and R14 remain exactly unchanged. R14's only original-code change is its version string.

This does **not** establish actual IndexedDB behavior, browser reload persistence, browser worker execution, UI navigation, all embedded apps, network services, or independent verification. Browser coverage and limitations are recorded separately by the independent verifier. Stored historical PASS receipts embedded in the source are not fresh execution evidence.

## Files

- `patch.py`: reproducible, single-application patch from the pristine R14 working copy; intentionally not idempotent and fails its encoding assertion if already applied.
- `regression.cjs`: component regression checks against original and working HTML.
- `regression-results.json`: observed developer test results.
- `script126-original.js`: exact malformed host-adapter source for reproduction.
- `p19-host-adapter-runtime.js`: repaired extracted executable source.
- `keddeh-r14-converged-runtime.js`: versioned extracted R14 source.

## Remaining limitations

IndexedDB blocked-open/version-change handling and timeout policies are unchanged. A WebSocket close before opening can still leave its connection promise unresolved. The R14 verification interface trusts the supplied verifier function and does not itself establish independent identity; it must not be used as proof of actual external verification. These are deferred issues, not claims of completion.
