KEDDEH SYSTEMS | RESEARCH AND FORMAL PUBLISHING | ENGINEER · AUTOMATE · SCALE

### Document control

| Field | Value |
| --- | --- |
| Title | Architectural monograph |
| Document ID | KEDDEH-ENG-MONOGRAPH-001 |
| Version / date | R2 / 2026-10-11 UTC |
| Classification / status | Private development material / Draft |
| Assessor / approval receipt | Unrecorded / Unrecorded |

### Authorship and licensing

Author: Aboudy Keddeh — Systems Architect. Rights holder: Aboudy Keddeh. Publisher: Keddeh Systems. Legal context: The Layna Company Pty Limited, user-stated parent. Licence profile: KEDDEH-RESERVED-1.0.

Architecture and research direction: Aboudy Keddeh. AI-assisted drafting and source synthesis: OpenAI ChatGPT. No independent approval is implied.

All rights reserved. No licence is granted by this document. Separate written permission governs reuse, redistribution and implementation, subject to applicable law. Third-party material retains its own rights.

### Publication identity and visual attribution

KEDDEH SYSTEMS · ENGINEER · AUTOMATE · SCALE. Local repository research and engineering edition. Source identities and original third-party notices remain preserved. See [publication controls](publication-controls.md) for reference access and layout verification limits.

# Architectural monograph: identities, carriers and execution boundaries

## Abstract

This monograph examines a preserved set of browser-carried software as distinct logical identities, executable carriers, state models and host boundaries. Static and component evidence supports bounded repairs to BRAINK R14, generated Terminal/Markdown code and CSV fidelity. Current browser work adds independently observed persistence and failure-path evidence, with unresolved application errors retained. The contribution is a reproducible engineering account and controlled source inventory, not a general claim of architecture qualification. StoreSpace and ServerSpace inputs and complete HCF lineage remain unresolved.


## Scope and definitions

### Scope and method

The architectural unit is an identified component backed by preserved source bytes, not a screen title or a PASS indicator. The [machine-readable index](components.json) binds each preserved file to a hash, source channel, working counterpart and, for GitHub, the pinned commit. Inspection was bounded to supplied software and selected runtime mechanisms. This document does not infer that all embedded applications or every repository backend were executed.

The principal sources are the [Drive manifest](../originals/drive/manifest.json), [GitHub manifest](../originals/github/manifest.json), [R14 repair account](../development/r14/README.md), extracted adapter code and the complete working HTMLs. The [evidence register](evidence-register.md) gives the authority and limits of each test result. Statements below describing code are inspection findings; outcome claims need their own test receipts.

## Architecture and mechanism

### BRAINK: resident carrier and projection runtime

R14 carries registries, resident applications, encoded payloads, resources and a fabric. `KEDDEHVolume` resolves and opens resident applications. `KEDDEHProjectionBus` maps logical route names to resident HTML, resources and subprojections. The shell decodes resident content and assigns it to an iframe's `srcdoc`. This permits traversal within a volume while retaining named application identities; decoding and showing a carrier does not prove its host-dependent operations succeeded.

Fifteen resident HTML entries are described in the inspected R14 repair record, including ClaimPath, CasePath, BRAINK workbooks, K-OS/BOS, KEX Computer/state tools, Hybrid OS, virtual infrastructure and a presence mesh. Their payloads and historical manifests were intentionally preserved by the R1 bounded repair. A resident program is not an additional independently acquired original. Its location within the parent carrier and its own logical identity should both be recorded when testing it.

The source distinguishes P07 `KEXVolumeFS`, P08 `KEXNetwork.fabric`, P12 `KEXHosting.manager` and P19 host adapters. P07 provides the resident volume model and checkpoints, P08 logical routing topology, and P12 hosting contracts. P19 supplies browser-facing persistence, worker compute and an explicit WebSocket connection boundary. These planes are complementary; none establishes a real external server merely by being registered.

### IL-LLM: linguistic objects and contextual projections

The V11-named user-space file includes a historical V9 title and later binding manifests. Its source registers visible lexical tokens as addressable linguistic objects, records transitions in a ledger, maintains logical time and working memory, and resolves application routes. `project(mode)` selects human, machine, proof or source views while retaining the current application's logical key. State is read from `KEX_V9_STATE` in localStorage in the inspected shell.

These are concrete contextual and interface semantics. They must not be translated without evidence into a claim of trained language-model inference, autonomous reasoning, authenticated identity or tamper-proof history. The ledger's append behavior within this carrier is inspectable; independent durability, completeness and authenticity require additional checks. BRAINK is a runtime/application identity in these bindings, while IL-LLM names the linguistic and contextual plane. Preserve both.

### KEX state geometry and actuation

The Computer Stack v10 and Active Warehouse Fabric v7.1 explicitly declare DOM/table state authoritative. Custom `kex-x` nodes hold addressable state; references, axes, origin, lane, extent and revisions encode relationships. JavaScript acts on the live DOM and produces projections rather than replacing it with an authoritative detached runtime object. A selection checks the referenced element's type before marking it active. Computer Stack addresses combine node identity, fabric geometry and revision.

This architecture makes the distinction between a source node and its projection an invariant. A view clone must not silently become the machine's canonical state. It also makes serialization and restoration significant: a checkpoint must preserve identities, references and state transitions, not merely visual similarity. Source self-tests describe nine live KEX-X nodes, but that self-report is not our qualification of all operations.

The developer workbench distinguishes source text from an execution provider. KEX Assembly is parsed into the declared instruction representation; JavaScript uses the browser runtime. Python, C and C++ are registered source languages whose semantics require bound providers. An unbound compiler bridge is a dependency boundary, not proof that the source language executed or proof that the entire architecture is unusable. Logical clock activity likewise does not establish physical hardware speed.

### VFS and managed AetherOS

The Drive managed-VFS AetherOS contains a base `VFS` plus `VFS_OVERLAY` with files, deleted paths and directories. `vfsNormalize` resolves relative paths beneath `/home/engineer`, removes dot segments and processes parent segments. Helpers maintain parent listings when creating and writing files. The overlay and a state summary use separate localStorage keys under `keddeh.aetheros.vfs.*.v2`; this is browser-origin storage, not a host disk mount.

The managed runtime policy separates protected prefixes such as `/etc`, `/bin` and app/package registries from ordinary app state. `aetherAuthorize` checks application groups, and receipts record actor, action, target and result. The source itself describes this as an application/runtime authority boundary, not Unix kernel privilege. The default engineer user belongs to owner/admin/wheel; a declared identity-provider string is not independently established authentication.

A critical distinction is successful in-memory mutation versus durable persistence. The inspected `vfsPersist` catches storage exceptions and returns false; callers and receipts require browser tests to determine what users see after a failed or interrupted save. A successful screen update alone cannot prove reload persistence. Tests should write a distinctive value, reload the same disposable origin and read the bytes through the application, then repeat with denied storage and inspect failure containment.

The smaller GitHub `src/assets/os/AetherOS.html` is separately preserved and supplies the Open Source Operating System catalog entry. It must not inherit the managed-VFS version's capabilities or test results by name similarity.

### P19 host contracts and bounded repair

The [R1 adapter source](../development/r14/p19-host-adapter-runtime.js) and [R2 successor](../development/r2/p19-host-adapter-runtime.js) exposes `KEXHostAdapters` with persistence, worker, WebSocket, checkpoint, restore, boot, receipts and capabilities. Persistence probes IndexedDB first, then localStorage, otherwise reports memory-only unavailability. A shared readiness promise gates get/put so an immediate restore does not race an unfinished probe. JSON serialization is part of this contract; arbitrary host objects are not promised to persist.

Worker requests are correlated by identifiers and held in a pending map. Startup failure reports a blocked worker while permitting usable persistence to remain available. Stop, worker failure, message decoding failure and synchronous cloning failure reject pending promises and clear resources. Operations include JSON round-trip and an `INTEGRITY32` calculation. The latter is a small integrity checksum mechanism, not a qualified cryptographic primitive.

Checkpoint captures the available VFS checkpoint plus hardware and network summaries, stores it under a label and emits a receipt. Restore retrieves the record and invokes VFS restoration when available. A receipt that state was fetched does not prove every captured hardware/network field was replayed: the inspected restore specifically applies VFS. Missing checkpoints are distinct from failed persistence.

The R1 repair fixes malformed literal line separators and an over-escaped URL regular expression only within P19, adds readiness and failure containment, and changes the R14 local version string. It does not rewrite embedded payloads. Deferred limits include blocked IndexedDB opens/version-change handling and WebSocket closure before opening potentially leaving a connection promise unsettled. No real WebSocket endpoint is automatically connected by this repair.

### Catalog tools and public frontage

The GitHub catalog references TypeScript template literals and HTML assets. [Extraction](../tools/extract-html5.cjs) permits a single literal without live interpolation, evaluates that literal in a bounded VM context, copies the selected assets and emits derivative HTML. There are thirteen catalog examples plus a separately copied KexLinux. These are reproducible working artifacts, not seventeen new standalone originals.

KEX Terminal and Markdown Studio required escaping repairs because an outer TypeScript literal must preserve valid inner JavaScript and Markdown backticks. Static compilation of the generated HTML is therefore part of the build contract. A correctly parsed terminal still needs its intended host bridge for host-dependent commands; an absent bridge must not be disguised as successful host execution.

SQL Studio CSV serialization now preserves numeric zero and boolean false and quotes commas, quotes and line breaks in headers and cells. Pure serializer tests and an independent Python parser establish a narrower property than a browser SQL engine, editor or download workflow. Markdown editor/preview/export, SQL controls, Paint, Calculator, Breakout, Particle Physics, Synthesizer, Chrome, Mesh, Mining and bootchain tools each retain separate test scopes. Synthetic display telemetry is not evidence of live infrastructure.

The repository's public frontage and server application are a separate deployment surface. The inspected root package includes Vite/React, TypeScript tooling, Express, Firebase and additional runtime/test scripts. This dossier does not qualify that deployment from standalone HTML checks. Mining/pool/submission scripts exist and are excluded from the local walkthrough.

### Recovery, evidence and next development

StoreSpace and ServerSpace originals remain inaccessible in this authorized input set. Their absence is recorded as two independent blockers; no BRAINK, VFS or HCF carrier substitutes for them. HCF's captured source map yields a candidate TypeScript body, but eleven local imports/configuration dependencies remain absent, package metadata is missing, and DOM/entrypoint differences leave exact lineage uncertain. See [recovery](recovery.md).

Promotion of any change requires source custody, an isolated environment, externally observed controls and persistence, fault/interruption checks, and a reviewer who can trace the evidence to the tested bytes. An application-produced PASS can assist diagnosis but cannot close that chain. The inherited R1 checks are useful component evidence; R2 browser results must be read separately and must retain blocked, failed and unexecuted cases. Future work should prioritize exact host contracts and reproducible failure behavior before expanding claims.


## Method and evaluation

### Prior and contextual work

The contextual works are the user's preserved R14/IL-LLM/KEX carriers, managed AetherOS, the pinned GitHub catalog, and the supplied Keddeh publishing and normalisation standards. They are cited as primary project artifacts [S1–S6 below], not as peer-reviewed validation. No uninspected academic literature or external benchmark is invoked. The first engine is user-identified as KRF-HTML-1.1; its implementation has not been inspected in this documentation pass and supplies no execution finding here.

### Evaluation design

| Dimension | Definition |
| --- | --- |
| Hypothesis | Bounded fixes restore the named local behavior while preserving original source custody and host contracts |
| Source / workload | R14 boot/checkpoint/worker; AetherOS VFS editing and reload; Terminal local editing; Markdown preview; SQL serialization/export; passive broader-family startup |
| Baseline | Exact preserved originals and R1 independent component verdict; retain R2 initial failures before repair |
| Environment | Disposable browser contexts, loopback origin and blocked outbound effects; final runner receipts determine actual versions |
| Repetitions | Explicit repeated operations and reloads in each test case; no statistical sample-size claim; read raw runner steps for counts |
| Acceptance | Independent state/byte readback matches expected value; promises settle and failures remain contained; original hashes unchanged |
| Failure analysis | Separate actor defect, unavailable adapter, isolation-blocked dependency and wrong test oracle; preserve corrections and initial receipts |

Tests are implemented outside the application. Application receipts inform diagnosis but are not accepted as the sole oracle. A mocked VM test verifies selected adapter logic, not the browser implementation of IndexedDB. A parser round-trip verifies CSV fields, not an entire SQL workstation. Reload persistence requires the same browser origin/context across save and reload; an unrelated fresh profile is not a persistence test.

## Results and evidence

R1 independently recorded 27 matching source files, 91 compiling scripts across 24 working HTMLs, eleven mocked R14 cases, nineteen CSV cases and sixteen round-tripped fields. Those results remain historical evidence [S3]. R2 browser verification is a separate evidence series described in [the evidence register](evidence-register.md); [Priority receipts](../evidence/r2-browser/results.json) record 15 checks passed and zero failed. [Family receipts](../evidence/r2-family-controls.json) record 33 passing assertions, zero failed assertions and zero runtime errors across 23 separately loaded file identities. Four initial runtime/isolation cases are preserved separately and addressed in the bounded repair pass. Chromium 151.0.7922.173 and Playwright 1.62.1 were used.

Current browser investigation reported real R14 IndexedDB reload, worker stop/restart and checkpoint behavior. It also reproduced a throwing IndexedDB getter outside the intended exception boundary and managed AetherOS window-close/editor lifecycle defects. These yielded bounded working-copy repairs. Initial KEX host-bound `cat` expectations and SQL line-ending expectations required test-oracle correction; they must not be presented as product defects. The subsequent bounded repair pass addresses Launchpad missing render/log helpers, V76 attachment to an absent optional R4 dock, and IL-LLM encoded JSON plus premature legacy binding. The V76 guard emits an explicit diagnostic instead of fabricating the missing dock. The bootchain application source remains unchanged: its service-worker getter error arose from Playwright blocking instrumentation, repaired in the harness with guarded service-worker blocking and CSP. A negative service-worker test verifies the blocker. The [change manifest](../development/r2-family/changes.json) records source preimages, patches and hashes; [final family evidence](../evidence/r2-family-controls.json) and its [verdict](../evidence/R2_FAMILY_BROWSER_VERDICT.md) record affected reruns. These changes close the observed failures without claiming missing host dependencies were supplied. Read the per-case receipts for exact assertions and isolation limitations; they do not qualify all controls.

### Discussion and conclusion

The useful engineering increment is narrower than a universal readiness claim: source custody and specific behaviors can be established while other carriers or host boundaries remain unresolved. Preserving failed and blocked cases makes that increment auditable. The distinction between canonical state and projection, and between runtime receipt and observed readback, is central to the architecture and to its evaluation. The next work should close reproduced errors and acquire missing authorized sources without replacing the user's component identities.

## Limitations and open questions

Browser coverage is bounded by explicit tested actions, not every control in every embedded payload. Missing adapters may prevent host execution while local tools remain usable. HCF candidate dependencies and exact lineage remain incomplete; StoreSpace and ServerSpace originals remain unavailable. External network operations, real mining/payments and deployment are excluded. Template layout fidelity is subject to [publication controls](publication-controls.md). No cryptographic qualification, production security certification, performance scaling or trained language-model inference is established by this work.

### Next bounded experiments

| Experiment | Setup and observable acceptance | Dependency |
| --- | --- | --- |
| IndexedDB blocked open/version change | Hold a competing connection; demonstrate a bounded visible result rather than an indefinitely pending restore | Browser test fixture; no real user data |
| AetherOS quota/storage denial | Inject failed writes after editing; assert editable bytes remain and save feedback accurately reports nondurability; reload exposes expected persisted baseline | Disposable storage and explicit UI oracle |
| Host contract fixture | Supply a local deterministic adapter for a named terminal syscall; verify request/response/error and cancellation separately from local nano/VFS | Recorded host contract, no real endpoint |
| IL-LLM route recovery | After any parse repair, select logical routes and projection modes; assert stable identity and ledger transition without accepting UI PASS alone | Exact working carrier and independent browser checks |
| HCF recovery | Acquire the eleven exact dependencies and matching package metadata, reconcile entrypoint/DOM lineage, then compile before attempting isolated execution | Authorized missing sources; no substituted modules |

## References

- S1. Aboudy Keddeh, preserved Drive software carriers, acquired snapshot dated 2026-10-10: [manifest](../originals/drive/manifest.json) and [component hashes](components.json). Primary source; dates/versions vary by carrier.
- S2. Keddeh1/KEDDEH--, HTML source subset, commit `09f45187dbec29ebe63153f916b67505452dc136`: [manifest](../originals/github/manifest.json). Primary source, seventeen files.
- S3. Independent local verification, 2026-10-10: [R1 verdict](../evidence/independent-verdict.json). Reproduced static/component evidence with explicit browser exclusion.
- S4. Independent HCF recovery verification, 2026-10-10: [verdict](../evidence/independent-hcf-recovery-verdict.json). Custody and partial lineage, not application execution.
- S5. Aboudy Keddeh, KEDDEH-STD-PUBLISHING-001 v1.0 and KEDDEH-TPL-PUBLISHING-001 v1.0. Parent worker supplied verified requirements; direct bundled resource reads failed. See [publication controls](publication-controls.md).
- S6. User-supplied normalisation document, source ID `1KwjWMGS_nv_7p4IXStZNshn6vpXn23IcvsKePaslliQ`. Semantics relayed by coordinating worker; not evidence of uniform implementation. See [normalisation](normalisation.md).

## Revision history

| Edition | Change | Evidence / approval |
| --- | --- | --- |
| R1 source package | Preserved originals and bounded repair/component baseline | S1–S4; no browser qualification |
| R2 dossier | Source inventory, mechanism account, glossary, evaluation and governance matrices; new browser evidence integration | Local engineering draft; assessor/approval receipt unrecorded |

Appendices are the [control matrices](control-matrices.md), [glossary](glossary.md), [component index](components.json), and [recovery guide](recovery.md).


Independent review identified weak initial checkpoint, worker-denial and repeated-editor assertions. The strengthened suite now mutates VFS state before restoring and checks exact equality, asserts unavailable worker/error/zero pending requests, and reads saved editor text in each of three cycles. The [independent final rerun](../evidence/r2-browser-independent/results.json) passes all 15 checks. The [review report](../evidence/r2-independent-review.md) distinguishes independently executed actor-authored tests from independently designed tests. Earlier receipts remain historical; their assertion weaknesses do not describe the final strengthened run.

---
© 2026 Aboudy Keddeh | Keddeh Systems | All rights reserved  
KEDDEH-ENG-MONOGRAPH-001 | R2 | Private development material | Draft  
[Master index](index.md) · [Publication controls](publication-controls.md)
