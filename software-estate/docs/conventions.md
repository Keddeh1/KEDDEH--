KEDDEH SYSTEMS | RESEARCH AND FORMAL PUBLISHING | ENGINEER · AUTOMATE · SCALE

### Document control

| Field | Value |
| --- | --- |
| Title | Naming, versioning, files, interfaces and receipts |
| Document ID | KEDDEH-ENG-CONVENTIONS-001 |
| Version / date | R2 / 2026-10-11 UTC |
| Classification / status | Private development material / Draft |
| Assessor / approval receipt | Unrecorded / Unrecorded |

### Authorship and licensing

Author: Aboudy Keddeh — Systems Architect. Rights holder: Aboudy Keddeh. Publisher: Keddeh Systems. Legal context: The Layna Company Pty Limited, user-stated parent. Licence profile: KEDDEH-RESERVED-1.0.

Architecture and research direction: Aboudy Keddeh. AI-assisted drafting and source synthesis: OpenAI ChatGPT. No independent approval is implied.

All rights reserved. No licence is granted by this document. Separate written permission governs reuse, redistribution and implementation, subject to applicable law. Third-party material retains its own rights.

### Publication identity and visual attribution

KEDDEH SYSTEMS · ENGINEER · AUTOMATE · SCALE. Local repository research and engineering edition. Source identities and original third-party notices remain preserved. See [publication controls](publication-controls.md) for reference access and layout verification limits.

# Naming, versioning, files, interfaces and receipts

Use existing source names exactly. New development identifiers may add a local successor suffix but must retain the parent identity. Documentation R2 describes this repository increment; it does not rename every runtime to R2. Historical R13/R14, V9/V11 and v6.12 strings are lineage evidence, not errors to normalize globally.

`originals/` contains preserved acquisition bytes and manifests; `working/` contains repaired source and generated HTML; `development/` contains targeted repair implementations; `tools/` and `tests/` contain reproducible checks; `reports/` and `evidence/` contain findings; `docs/` contains this canonical Markdown dossier. A generated HTML documentation view is derivative and must link back to Markdown.

Logical addresses, VFS paths, browser origins, repository paths and external endpoints are separate namespaces. Do not resolve `app://`, `kex://` or a VFS `/home/engineer` path as a host filesystem path without an explicit adapter. Preserve public interface names and schema identifiers. P19's `kex.host-adapter.receipt.v1`, checkpoint schema and `KEXHostAdapters` contract are distinct from AetherOS `keddeh.aetheros.admin-receipt/v1`.

A new independent test receipt should identify its schema/version, UTC time, test implementation, browser/runtime versions, tested file hash, action, expected state, observed state, result and evidence paths. Use `PASS`, `FAIL`, `BLOCKED` and `NOT_RUN` deliberately; absence of an exception alone is not a functional pass. Record storage backend and reload origin when claiming persistence. Record external requests blocked by the harness without persisting acquisition URLs or credentials.

Runtime receipts are diagnostic data produced by an actor. Independent receipts must identify their observer and scope without inventing approval. A checksum proves equality relative to its reference; a draft receipt records byte custody. Neither establishes scientific validation or rights clearance.


---
© 2026 Aboudy Keddeh | Keddeh Systems | All rights reserved  
KEDDEH-ENG-CONVENTIONS-001 | R2 | Private development material | Draft  
[Master index](index.md) · [Publication controls](publication-controls.md)
