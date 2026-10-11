KEDDEH SYSTEMS | RESEARCH AND FORMAL PUBLISHING | ENGINEER · AUTOMATE · SCALE

### Document control

| Field | Value |
| --- | --- |
| Title | Traceability and control matrices |
| Document ID | KEDDEH-ENG-CONTROL-MATRICES-001 |
| Version / date | R2 / 2026-10-11 UTC |
| Classification / status | Private development material / Draft |
| Assessor / approval receipt | Unrecorded / Unrecorded |

### Authorship and licensing

Author: Aboudy Keddeh — Systems Architect. Rights holder: Aboudy Keddeh. Publisher: Keddeh Systems. Legal context: The Layna Company Pty Limited, user-stated parent. Licence profile: KEDDEH-RESERVED-1.0.

Architecture and research direction: Aboudy Keddeh. AI-assisted drafting and source synthesis: OpenAI ChatGPT. No independent approval is implied.

All rights reserved. No licence is granted by this document. Separate written permission governs reuse, redistribution and implementation, subject to applicable law. Third-party material retains its own rights.

### Publication identity and visual attribution

KEDDEH SYSTEMS · ENGINEER · AUTOMATE · SCALE. Local repository research and engineering edition. Source identities and original third-party notices remain preserved. See [publication controls](publication-controls.md) for reference access and layout verification limits.

# Traceability and control matrices

## Requirements, source and test traceability

| Requirement | Source / implementation | Verification | Closure |
| --- | --- | --- | --- |
| Preserve identities/bytes | Original manifests and components.json | R1 independent hash/size checks; R2 custody rerun | R1 27 verified; R2 receipt governs final |
| R14 readiness and worker containment | P19 extracted adapter and working R14 | Mocked regression + focused browser reload/worker tests | 15 priority checks pass; see E-R2-PRIORITY |
| Durable managed VFS | Drive managed AetherOS overlay/helpers | Write/read/reload; AetherOS storage denial untested | Focused checks pass; see E-R2-PRIORITY |
| Close windows without dragging; retain editor buffer | AetherOS header/editor lifecycle repairs | Browser close and repeated-open assertions | Focused checks pass; see E-R2-PRIORITY |
| Generated JS parses | Terminal/Markdown templates and extracted HTML | Static compiler + focused UI | R1 syntax pass; R2 UI evidence separate |
| CSV retains zero/false/quotes | SQL source and generated HTML | Nineteen JS cases + Python + browser export | Component pass; browser export check passes |
| Complete original StoreSpace/ServerSpace | Missing authorized packages | None available | BLOCKED, separate identities |
| Recover HCF exact app | Standalone plus candidate | Custody/source-map/DOM comparison | BLOCKED: eleven imports and uncertain lineage |

## Claims and evidence

| Claim type | Example | Permitted conclusion | Prohibited upgrade |
| --- | --- | --- | --- |
| User-supplied semantics | Normalisation child relative index | Intended relationship described by source | Uniform implementation everywhere |
| Inspected mechanism | R14 checkpoint calls persistence adapter | Call path exists in inspected bytes | Durable state restored in every browser |
| Mocked component result | Pending worker promises reject on stop | Tested VM logic settles | Browser worker lifecycle fully qualified |
| Independent browser result | Same-origin reload returns test marker | Persistence for tested file/backend/action | Entire estate persistence certified |
| Actor receipt | UI PASS | Actor reported success | Independent approval |
| Custody hash | Original digest matches manifest | Preserved bytes match reference | Scientific validation or rights grant |

## Interface matrix

| Interface | Producer → consumer | Contract | Failure boundary |
| --- | --- | --- | --- |
| KEDDEHVolume / ProjectionBus | Registry/payload → shell iframe | Logical identity resolves to resident carrier | Missing route, decode or child runtime failure |
| KEXHostAdapters.persistence | Runtime → IndexedDB/localStorage | Probe readiness; JSON get/put | Denial, abort, unavailable backend |
| KEXHostAdapters.worker | Runtime → Web Worker | Correlated request/result; stop/error settlement | Constructor, clone, decode or worker error |
| KEXHostAdapters.websocket | Runtime → explicit endpoint | Connect before send | No endpoint tested; early close deferred |
| AetherOS VFS helpers | Apps → base plus overlay | Normalize path; authorize protected mutations | Memory/disk divergence; quota/denial |
| KEX provider bridge | Language source → bound runtime | Provider must implement language semantics | Unbound provider; no false execution success |
| Template extractor | TS literal/asset → runnable HTML | No live interpolation; preserve inner syntax | Escaping or unsupported template |

## Dependency matrix

| Component | Dependency | Available evidence | Unresolved boundary |
| --- | --- | --- | --- |
| R14 persistence | Browser IndexedDB/localStorage | VM + actual browser tests in R2 | Cross-browser/blocked-open policies |
| R14 compute | Blob URLs and Worker | Failure containment and R2 lifecycle | No GPU/remote compute qualification |
| KEX Terminal | Host bridge for host commands | Local command/editor checks | Absent host adapter is explicit |
| Managed AetherOS | Browser-origin storage | R2 tests | Not a mounted host filesystem |
| HCF candidate | Eleven local imports + package/config | Independent missing-import inventory | Not runnable reconstruction |
| Documentation | Publishing standard/template | Parent verified requirements | Direct bundled resource retrieval failed; exact layout unverified |

## Risk and failure-mode matrix

| Failure mode | Impact | Containment / evidence | Residual status |
| --- | --- | --- | --- |
| Storage getter throws | Boot abort before fallback | R14 bounded catch repair and failure injection | Priority failure-containment check passes |
| Worker stops with requests pending | Awaiters hang | Reject/clear pending operations | Tested scope only |
| UI close triggers drag shield | Window remains / interaction intercepted | Exclude button from drag start | R2 bounded repair |
| Delayed/repeated editor init | Fresh or unsaved input overwritten | Preserve mounted editor buffer | R2 bounded repair |
| Source-wide escape replacement | Embedded payload corruption | Patch named script/template only; custody checks | Ongoing invariant |
| App PASS used as oracle | False qualification | External assertions and byte readback | Reviewer must enforce |
| Missing input replaced by similar carrier | Identity/lineage loss | Explicit unresolved component record | Open acquisition blockers |
| Harness expectation differs from contract | False defect report | Preserve initial result and correct oracle with rationale | KEX host cat / SQL CRLF examples |

## Authority controls

| Action | Authority in current work | Receipt / control |
| --- | --- | --- |
| Local repairs, docs, browser tests | User instruction | Versioned source and test evidence |
| Disposable local storage | Authorized isolated test state | Fresh contexts; no user profile |
| Real mining/payment/messages/credentials | Excluded | Do not invoke |
| Push / merge / deploy | Separate authority decisions | Coordinating agent owns authorized push; no authority inferred for merge/deploy |
| Independent publication approval | Unrecorded | Keep Draft metadata |

## Version/change matrix

| Layer | Baseline | Successor / change |
| --- | --- | --- |
| Source | Pinned GitHub commit plus ten Drive originals | Originals immutable |
| R1 working | P19 encoding/readiness/worker fixes; Terminal/Markdown escaping; CSV fidelity | See repair reports |
| R2 working | R1 | IndexedDB getter and AetherOS lifecycle repairs; actual browser evidence |
| Documentation | R1 README/reports | R2 complete controlled dossier and component index |

## Review closure matrix

| Review item | Required evidence | Current status |
| --- | --- | --- |
| Source/document consistency | Separate reviewer findings | [Separate review](../evidence/r2-independent-review.md); 15 strengthened checks independently pass |
| Links and index paths | Validator receipt | [Validation receipt](validation.json) |
| Rendered HTML | Browser inspection and screenshots | HTML rendered locally; review receipt separate |
| R2 evidence totals | [Independent priority results](../evidence/r2-browser-independent/results.json) and family receipts | 15 priority checks independently pass; family history and repair pass separate |
| Exact DOCX fidelity | Accessible template + rendered page inspection | Not claimed |
| Open application errors | Final broad-browser report and affected reruns | Observed four cases repaired or harness-corrected; dependencies and untested behavior remain explicit |


---
© 2026 Aboudy Keddeh | Keddeh Systems | All rights reserved  
KEDDEH-ENG-CONTROL-MATRICES-001 | R2 | Private development material | Draft  
[Master index](index.md) · [Publication controls](publication-controls.md)
