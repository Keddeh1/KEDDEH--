# KEDDEH SYSTEMS — HTML Software Estate R2

ENGINEER · AUTOMATE · SCALE

Preserved software sources, bounded working repairs, reproducible browser evidence and a controlled engineering monograph. **Draft engineering deliverable; the complete software estate is not fully qualified.**

Start with the [master index](docs/index.md), [formal introduction](docs/introduction.md), [monograph](docs/monograph.md), and [offline HTML reading edition](docs/index.html). The [component index](docs/components.json) preserves source and derivative identities. [R1 README](reports/R1_WORKSPACE_README.md) is historical; its browser-not-run status is superseded only by the bounded R2 evidence below.

## Document control

| Field | Value |
| --- | --- |
| Document ID | KEDDEH-ENG-HTML-ESTATE-001 |
| Version/date | R2 / 2026-10-11 UTC |
| Author and role | Aboudy Keddeh — Systems Architect |
| Publisher | Keddeh Systems |
| Rights holder | Aboudy Keddeh; third-party material retains its own rights |
| Licence / classification / status | KEDDEH-RESERVED-1.0 / Private development material / Draft |
| Legal context | The Layna Company Pty Limited, user-stated parent |
| Assessor / publication approval receipt | Unrecorded; separate AI engineering review is not release approval |

Architecture and research direction: Aboudy Keddeh. AI-assisted drafting and source synthesis: OpenAI ChatGPT. No independent approval is implied.

## Sources and changes

All ten Drive HTML originals and seventeen GitHub sources are included byte-for-byte, including the 21.6 MB BRAINK R14 carrier. GitHub source commit: `09f45187dbec29ebe63153f916b67505452dc136`. The preexisting checkout matched that commit and was clean before this branch. Hash manifests remain in `originals/drive` and `originals/github`; [custody evidence](evidence/r2-source-integrity.json) reconciles source bytes with the checkout.

- R1 repairs: R14 parsing/readiness/worker containment, KEX Terminal and Markdown template escaping, SQL CSV fidelity.
- R2 repairs: R14 IndexedDB denial fallback; managed-VFS AetherOS editor initialization and window-control click handling; Launchpad projection helpers, V76 optional-dock containment and IL-LLM JSON/DOM readiness. [Priority change records](development/r2/README.md) and [family repairs](development/r2-family/README.md).
- Originals are under `originals/`; editable successors under `working/`. `working/html5` contains catalog derivatives. The repository public frontage remains separate and unchanged.

## Observed validation

| Evidence | Result and limit |
| --- | --- |
| [Priority browser tests](evidence/r2-browser/results.json) | 15 bounded assertions: R14 persistence/workers/checkpoint/UI, managed AetherOS, KEX nano persistence, Markdown, SQL |
| [Broad family controls](evidence/r2-family-controls.json) | 33 assertions across 23 HTML identities; zero runtime errors in the current bounded runs |
| [Family verdict](evidence/R2_FAMILY_BROWSER_VERDICT.md) | Source errors, host dependencies and intentionally untested operations |
| [Independent review](evidence/r2-independent-review.md) | Separate AI reviewer scope, findings and dispositions; not human peer review |
| [Static compilation](evidence/independent-static-verification.json) | 91 classic scripts in 24 working HTMLs compile; not runtime qualification |
| Component suites | 11 mocked R14 tests; 19 CSV checks; 16 fields independently round-trip through Python CSV |
| [HCF recovery](evidence/independent-hcf-recovery-verdict.json) | 16 preservation/lineage checks; eleven dependencies absent; candidate not runnable |

Environment: Chromium 151.0.7922.173, Playwright 1.62.1, Node 24.19.0, Python 3.12.14. Disposable contexts, exact-loopback static HTTP, blocked outbound connections, no live credentials. Application PASS labels do not determine results. Initial failures and corrected harness assumptions are retained. Screenshots were internal QA only and are excluded from repository/package.

## Reproduce

From this directory, with Node >=22, Python 3 and Chromium installed:

```sh
npm ci --ignore-scripts
npm run test:integrity
npm run test:static
npm run test:r14
npm run test:csv
npm run test:browser
npm run test:families
npm run test:hcf
```

`CHROMIUM_PATH` selects Chromium (default `/usr/bin/chromium`); `PLAYWRIGHT_MODULE` optionally selects an installed module. Read [development](docs/development.md) before execution. Only disposable static test servers are started; do not start the parent repository production/mining services for HTML QA.

## Open boundaries

StoreSpace and ServerSpace **original packages are pending**, never replaced by BRAINK. HCF is incomplete with uncertain exact lineage. The three recoverable broad-family source defects were repaired; the opaque-frame service-worker exception was traced to Playwright instrumentation and corrected in the family harness, without changing Bootchain source or weakening iframe sandboxing. V76’s optional R4 dock remains absent with an explicit diagnostic. Host-bound syscalls, provider backends, mining and payments remain unqualified. Markdown standalone export works; durable host saving needs its adapter. No live mining, payments, external messages, credential changes, merge or deployment were performed.

## Authorship and licensing

All rights reserved. No licence is granted by this document. Separate written permission governs reuse, redistribution and implementation, subject to applicable law. Third-party material retains its own rights.

## Publication identity and visual attribution

KEDDEH SYSTEMS | RESEARCH AND FORMAL PUBLISHING | ENGINEER · AUTOMATE · SCALE

© 2026 Aboudy Keddeh | Keddeh Systems | All rights reserved · KEDDEH-ENG-HTML-ESTATE-001 · R2 · Private development material · Draft
