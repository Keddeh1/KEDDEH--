# KEDDEH SYSTEMS — HTML Software Development Workspace

ENGINEER · AUTOMATE · SCALE

- Package revision: local development R1, 2026-10-10 UTC
- Status: sources preserved; bounded repairs implemented and component-tested; browser qualification incomplete
- Source attribution: supplied Keddeh Drive software and Keddeh1/KEDDEH-- repository, with exact identities in source manifests
- Engineering contributions: dot, under Aboudy Keddeh's instruction
- Publisher/enterprise identity: Keddeh Systems; local development copy, unpublished
- Rights: existing source copyright and licence notices remain in force; all otherwise applicable rights reserved. No new distribution licence is granted.
- Classification: private development material

## What is saved

Ten complete Drive HTML originals (33,927,993 bytes), plus seventeen GitHub source files pinned to commit `09f45187dbec29ebe63153f916b67505452dc136`. Sources remain distinct; extracted catalog HTMLs are derivatives, not additional original apps. Original source hashes and sizes were independently checked. The preservation-only local Git commit is `b949edc`.

`originals/` holds source snapshots and provenance. `working/drive` and `working/github` hold development copies. `working/html5` contains thirteen catalog examples plus KexLinux extracted from the preserved TypeScript/HTML sources. `development/r14`, `tools`, `tests`, `reports`, and `evidence` contain reproducible patches and validation.

StoreSpace and ServerSpace were located as separate Library packages but could not be downloaded because their folders were not selected for this conversation. Neither application is represented by a substituted runtime.

## Implemented repairs

1. BRAINK R14: repair malformed P19 host-adapter JavaScript; await persistence readiness; bound worker startup/error/stop cleanup; contain storage denial. Embedded software payloads and unrelated scripts are preserved.
2. KEX Linux Terminal: correct nested template escaping that prevented generated JavaScript from parsing.
3. Markdown Studio: correct code-fence/backtick escaping in generated HTML.
4. SQL Studio: preserve zero and false during CSV export and correctly quote delimiters, quotes and line breaks in headers and cells.

## Evidence boundaries

`evidence/independent-verdict.json` records independent reruns: 27 original files match hashes/sizes; 91 classic scripts across 24 working HTMLs compile; eleven R14 Node VM component tests pass with browser APIs mocked; nineteen CSV serialization checks pass and sixteen fields survive Python CSV parser round-trip.

These results are not browser qualification. No application control was tested in a real browser, and real IndexedDB/localStorage reload persistence was not demonstrated. Standalone Chromium launch failed on an OS socket restriction; the available cloud browser could not reach the local HTTP test origin; file URLs were denied by that browser. No security restriction was bypassed. These are execution-environment boundaries, not evidence that the Keddeh architecture cannot perform those operations.

The local test harness is prepared but its browser self-test remains incomplete. It must not be described as a verified browser test framework.

## Run the verified component checks

Run from the parent of `software-estate`:

```
node software-estate/development/r14/regression.cjs
node software-estate/tools/test-sql-csv.cjs
python3 software-estate/tools/test-sql-csv-roundtrip.py
node software-estate/tests/static-verify.cjs
```

See `tests/README.md` for isolated browser testing. Use fresh browser profiles, block outbound effects, and do not activate financial/mining integrations during a local walkthrough. Do not mistake displays or actor-produced PASS flags for independent execution receipts.

## Next bounded verification

- R14: boot, visible error containment, worker degradation, checkpoint/restore and actual reload persistence.
- AetherOS: VFS create/edit/save/reload and repeated window/navigation flows.
- KEX Terminal: host-bridge-aware command execution and interrupted calls.
- Markdown and SQL: real editor/preview/export interactions.
- HCF: recover and establish the lineage of its missing main entrypoint and stylesheet before claiming the saved HTML is a standalone application.
- Mining/Mesh displays: establish actual backend evidence before presenting synthetic telemetry as live results.

No repository push, public deployment, payment, mining submission, account change or live host mutation was performed.

---
KEDDEH SYSTEMS · ENGINEER · AUTOMATE · SCALE · Private local development R1

## HCF recovery addendum

A separate older standalone confirms that the missing entrypoint was `/index.tsx`. A saved HCF codebase capture supplied CSS and a source map containing 709,628 bytes of original TypeScript. It is preserved under `originals/hcf-recovery` and as a candidate under `working/hcf-recovered`. The candidate has eleven missing local source/config dependencies and no matching package metadata; DOM and entrypoint differences prevent treating it as the exact newer standalone version. It is not a runnable reconstruction, and it has not replaced the original HCF working copy. See `reports/hcf-recovery.md` for source links and `evidence/hcf-recovery.json` for precise gaps.
