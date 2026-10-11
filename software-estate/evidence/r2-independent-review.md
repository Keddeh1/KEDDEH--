# R2 independent AI engineering review

Reviewer: a separate OpenAI ChatGPT worker who did not author the implementation or dossier. This is a scoped engineering review, not external human peer review, scientific validation or release approval.

## Independently repeated outcome

The strengthened priority suite passed **15 checks with zero failures** in Chromium 151.0.7922.173. The [final independent receipt](r2-browser-independent/results.json) records tested working-file hashes. The [pre-strengthening receipt](r2-browser-independent-pre-strengthening/results.json) remains separate. This is an independent execution of an actor-authored suite, not a claim that the entire suite was independently designed.

[Custody checks](r2-independent-custody.json) independently match all 27 originals and all 17 Git blob identities against source commit `09f45187dbec29ebe63153f916b67505452dc136`. Large originals are present. R14 and managed AetherOS patches remain bounded; no original-source edit was found.

## Findings and disposition

| ID | Finding | Disposition | Evidence |
| --- | --- | --- | --- |
| RV-01 | Checkpoint test could pass no-op restore | closed | Actor added mkdir mutation and exact snapshot restoration; independent final rerun passes. |
| RV-02 | Worker-denial label lacked worker assertion | closed | Actor added E_WORKER_NOT_STARTED, unavailable worker and zero pending assertions; independent rerun passes. |
| RV-03 | Repeated editor cycles only counted nodes | closed | Actor added saved-text readback across three cycles; independent rerun passes. |
| RV-04 | Documentation claimed AetherOS denied-storage test | closed | Author removed unsupported claim; AetherOS quota/denial remains NOT_RUN. |
| RV-05 | R1 adapter link could obscure current R2 source | closed | Author explicitly distinguishes R1 and R2 adapter source. |
| RV-06 | Mandatory monograph sections mixed with metadata levels | closed | Exact eight main sections confirmed; metadata separate. |
| RV-07 | HTML lacked section IDs and evidence table broken | closed | All thirteen views have unique section IDs and no scripts; evidence table repaired. |
| RV-08 | HCF candidate digest/frontage reference ambiguity | closed | Candidate now has digest; frontage commit identified as source subset reference. |
| RV-09 | Concrete next experiments and canonical-source HTML links | closed | Five experiments include observable acceptance; all 13 views link canonical Markdown. 143 rendered local links resolve. |
| RV-10 | Four broad-family runtime/isolation errors | closed-bounded | Three source fixes reviewed; four carriers independently pass 8 assertions, zero runtime errors and four registration-denial probes. |

## Evidence quality and substantive documentation

Real IndexedDB is read independently before reload; localStorage values and exported Markdown/CSV bytes are externally asserted. Worker output is compared to expected values, and pending requests are checked after interruption. The improved restore test first creates a distinct VFS directory, proves the snapshot changed, then compares the restored snapshot to the saved snapshot. Three editor reopen cycles each read saved text. No application PASS label is the sole test oracle.

The documentation contains a substantive mechanism account rather than headings alone: resident-carrier projection, linguistic/contextual state, canonical DOM state geometry, managed VFS overlays, P19 persistence/worker contracts, extraction boundaries and incomplete recovery. Glossary entries preserve the user's terms and distinguish source declarations from findings. Matrices cover requirements, claims, interfaces, dependencies, failure modes, authority and changes. The eight mandatory monograph sections are present. Source inspection is sampled and targeted, not exhaustive review of every embedded payload. Sources are primary project artifacts, not fabricated academic references or experimental validation.

Isolation uses disposable browser contexts, exact loopback GET/HEAD routing, denied outbound connections/forms, blocked service workers and WebSocket interception. Blob workers are permitted by the focused suite's CSP, not enforced by a source whitelist; reviewed R14 worker behavior is the exercised case. This is a controlled application harness, not a hostile-code security certification.

## Retained failures and limits

Initial failures remain in the actor's evidence directory. IndexedDB getter containment and editor/window lifecycle problems were actual bounded repair targets. KEX host command expectations, SQL CRLF expectations, large-carrier navigation timing and overlaid navigation selectors required harness correction; those corrections are not software capability fixes.

AetherOS quota/denial feedback, interrupted disk transactions, browser crash durability, cross-browser compatibility, external host adapters and network services remain unqualified. P19 blocked IndexedDB open/versionchange and WebSocket early-close behavior remain disclosed. HCF lacks eleven dependencies and exact lineage; StoreSpace and ServerSpace originals are absent. Exact DOCX template fidelity is not established. The four affected family carriers were independently rerun after repair: eight assertions passed with zero runtime errors. Launchpad restores state projections without invoking runtime/host operations; V76 records the missing optional dock while keeping its runtime export; IL-LLM decodes six JSON blocks without changing their decoded values and defers its resolver until later binding markup exists. Bootchain source is unchanged: its reported serviceWorker exception came from Playwright’s injected unguarded getter in an opaque frame. The corrected harness uses guarded registration denial plus the existing worker-denying CSP and verifies denial explicitly. This is not qualification of boot execution or every IL-LLM route.

The machine-readable [review record](r2-independent-review.json) supplies the current disposition and harness digest. The [family followup source review](r2-family-independent-source.json) and individual receipts in [r2-family-independent](r2-family-independent/) record those additional reviewed changes. Independently rerunning the documentation validator checked 273 links and rendered 13 HTML views with no missing targets, horizontal overflow or external scripts. Thirteen canonical Markdown links and unique section IDs were separately checked. The listed findings are closed within these bounded scopes; retained limitations are not release approval.
