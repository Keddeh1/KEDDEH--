KEDDEH SYSTEMS | RESEARCH AND FORMAL PUBLISHING | ENGINEER · AUTOMATE · SCALE

### Document control

| Field | Value |
| --- | --- |
| Title | Evidence register and qualification boundary |
| Document ID | KEDDEH-ENG-EVIDENCE-REGISTER-001 |
| Version / date | R2 / 2026-10-11 UTC |
| Classification / status | Private development material / Draft |
| Assessor / approval receipt | Unrecorded / Unrecorded |

### Authorship and licensing

Author: Aboudy Keddeh — Systems Architect. Rights holder: Aboudy Keddeh. Publisher: Keddeh Systems. Legal context: The Layna Company Pty Limited, user-stated parent. Licence profile: KEDDEH-RESERVED-1.0.

Architecture and research direction: Aboudy Keddeh. AI-assisted drafting and source synthesis: OpenAI ChatGPT. No independent approval is implied.

All rights reserved. No licence is granted by this document. Separate written permission governs reuse, redistribution and implementation, subject to applicable law. Third-party material retains its own rights.

### Publication identity and visual attribution

KEDDEH SYSTEMS · ENGINEER · AUTOMATE · SCALE. Local repository research and engineering edition. Source identities and original third-party notices remain preserved. See [publication controls](publication-controls.md) for reference access and layout verification limits.

# Evidence register and qualification boundary

| Evidence ID | Artifact | Scope and result |
| --- | --- | --- |
| E-R1-CUSTODY | [Independent verdict](../evidence/independent-verdict.json) | 27 originals verified: ten Drive and seventeen GitHub hashes/sizes match; GitHub blobs match pinned commit |
| E-R1-SYNTAX | [Independent verdict](../evidence/independent-verdict.json) | 91 classic scripts across 24 working HTMLs compile; this excludes runtime behavior and external modules |
| E-R1-R14 | [R14 regression](../development/r14/regression.cjs) | Eleven component checks independently rerun in Node VM with mocked browser APIs |
| E-R1-CSV | [CSV checks](../tools/test-sql-csv.cjs) | Nineteen serializer checks; no browser editor/download qualification |
| E-R1-CSV-PARSER | [Python round-trip](../tools/test-sql-csv-roundtrip.py) | Sixteen fields survive independent CSV parsing |
| E-HCF | [HCF verdict](../evidence/independent-hcf-recovery-verdict.json) | Custody/lineage checks pass; application not executed; eleven imports absent |
| E-R2-BROWSER | [Priority results](../evidence/r2-browser/results.json) | 15 checks passed, zero failed; Chromium 151.0.7922.173 / Playwright 1.62.1; actual browser controls and persistence, bounded scope |
| E-R2-PRIORITY | [Focused browser results](../evidence/r2-browser/results.json) | 15 passed, zero failed; R14 real IDB/localStorage reload, worker recovery/checkpoint; AetherOS editor/VFS; KEX nano; Markdown preview/export; SQL UI/export/error recovery |
| E-R2-FAMILY | [Family results](../evidence/r2-family-controls.json) and [verdict](../evidence/R2_FAMILY_BROWSER_VERDICT.md) | 33 assertions passed across 23 file identities, zero failed and zero runtime errors in final receipts; initial four error cases preserved separately; safe selected controls only |
| E-R2-FAMILY-REPAIRS | [Repair manifest](../development/r2-family/changes.json) | Three bounded carrier repairs; bootchain source unchanged, harness service-worker blocker corrected; preserved pre-repair failure receipts |
| E-R2-INDEPENDENT | [Strengthened priority rerun](../evidence/r2-browser-independent/results.json) and [review](../evidence/r2-independent-review.md) | 15 passed, zero failed; checkpoint mutation/readback, worker-denial and repeated-editor assertions strengthened |
| E-R2-PACKAGE | [Package audit](../evidence/r2-package-audit.json) | Original custody and exclusion audit; inspect report for precise checks |

The inherited verdict's `NOT RUN` browser status describes R1's environment and remains valid historical evidence. It must not be edited to describe R2. R2 is a new evidence series with actual browser version, source digests, observed controls, persistence readback and blocked/failed/not-run cases. R2 priority results now exist and are linked above. Broader [family results](../evidence/r2-family-controls.json) record 33 passing assertions, zero failed assertions and zero runtime errors across 23 separately loaded file identities. Initial receipts with four runtime/isolation error cases are preserved in `evidence/r2-family-before-repair`. Bounded repairs and affected reruns close those observed failures; missing host dependencies and untested behavior remain distinct. Passing a selected control is not complete application qualification.

The following are source declarations or actor outputs, not independent results: runtime PASS labels, embedded historical receipts, declared provider bindings, logical hosting contracts, synthetic telemetry and self-tests displayed by applications. Inspection verifies that code implements a mechanism; only the right execution/readback test can demonstrate its outcome under stated conditions.

Documentation provenance: the glossary and monograph draw from named source files, symbols and manifests, with explicit inference boundaries. Missing publishing reference/template reads are recorded in [publication controls](publication-controls.md). The machine-readable index contains no acquisition URLs and no inferred hashes for missing originals.


Independent review identified weak initial checkpoint, worker-denial and repeated-editor assertions. The strengthened suite now mutates VFS state before restoring and checks exact equality, asserts unavailable worker/error/zero pending requests, and reads saved editor text in each of three cycles. The [independent final rerun](../evidence/r2-browser-independent/results.json) passes all 15 checks. The [review report](../evidence/r2-independent-review.md) distinguishes independently executed actor-authored tests from independently designed tests. Earlier receipts remain historical; their assertion weaknesses do not describe the final strengthened run.

---
© 2026 Aboudy Keddeh | Keddeh Systems | All rights reserved  
KEDDEH-ENG-EVIDENCE-REGISTER-001 | R2 | Private development material | Draft  
[Master index](index.md) · [Publication controls](publication-controls.md)
