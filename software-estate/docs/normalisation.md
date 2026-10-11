KEDDEH SYSTEMS | RESEARCH AND FORMAL PUBLISHING | ENGINEER · AUTOMATE · SCALE

### Document control

| Field | Value |
| --- | --- |
| Title | Normalisation standards |
| Document ID | KEDDEH-ENG-NORMALISATION-001 |
| Version / date | R2 / 2026-10-11 UTC |
| Classification / status | Private development material / Draft |
| Assessor / approval receipt | Unrecorded / Unrecorded |

### Authorship and licensing

Author: Aboudy Keddeh — Systems Architect. Rights holder: Aboudy Keddeh. Publisher: Keddeh Systems. Legal context: The Layna Company Pty Limited, user-stated parent. Licence profile: KEDDEH-RESERVED-1.0.

Architecture and research direction: Aboudy Keddeh. AI-assisted drafting and source synthesis: OpenAI ChatGPT. No independent approval is implied.

All rights reserved. No licence is granted by this document. Separate written permission governs reuse, redistribution and implementation, subject to applicable law. Third-party material retains its own rights.

### Publication identity and visual attribution

KEDDEH SYSTEMS · ENGINEER · AUTOMATE · SCALE. Local repository research and engineering edition. Source identities and original third-party notices remain preserved. See [publication controls](publication-controls.md) for reference access and layout verification limits.

# Normalisation standards

Normalisation makes comparisons reproducible while preserving original bytes and user terminology. It does not reformat, minimize, rewrite or rename original HTML. [Components](components.json) use source filenames verbatim; logical identities and displayed historical versions remain additional fields rather than replacements.

| Object | Rule | Reason |
| --- | --- | --- |
| Original | Byte-preserve; SHA-256 and byte length; source channel and commit where applicable | Detect accidental loss, including large embedded payloads |
| Working copy | Record original relationship and bounded patch; separate working digest | A repair is not the acquired original |
| Derived catalog HTML | Record extraction input and tool; regenerate from working source | Avoid drift between template and runnable carrier |
| Logical route | Preserve scheme, case and source key | Route equivalence must be implemented, not guessed |
| VFS path | Apply the specific runtime's normalization; test dot segments and relative roots | Host paths and VFS paths are different namespaces |
| Text | UTF-8 for new documentation; no source-wide newline conversions | Escapes inside carriers may be executable syntax |
| Structured evidence | JSON, UTC timestamps, explicit outcome and evidence scope | Allow aggregation without upgrading claims |
| Numbers and CSV | Preserve zero/false; distinguish null/empty; quote embedded delimiters and line breaks | Truthiness is not data fidelity |
| Missing inputs | Explicit unresolved entries, with no invented hash or replacement | Absence must survive packaging and indexing |

The component index is an inventory, not a database migration. It retains per-file identity even where the same application is embedded in a larger carrier. Do not deduplicate carriers by similar names or merge Drive AetherOS with GitHub AetherOS. All transformations should be reversible from preserved source plus documented tooling. Regenerate outputs after template changes and rerun parsing checks on emitted scripts.


## Supplied event and spatial semantics

The coordinating worker relayed the user's normalisation source, ID `1KwjWMGS_nv_7p4IXStZNshn6vpXn23IcvsKePaslliQ`. It defines event type, source, timestamp and payload, plus an adapter `currentLine`, `distanceFromOne = currentLine − 1`, a stable child relative position, and `absolute = adapter currentLine + child relativeIndex`. These are supplied semantics to preserve and trace. This dossier does not claim that every inspected carrier implements those equations, nor impose a new representation on existing canonical DOM state without a separately reviewed change.

---
© 2026 Aboudy Keddeh | Keddeh Systems | All rights reserved  
KEDDEH-ENG-NORMALISATION-001 | R2 | Private development material | Draft  
[Master index](index.md) · [Publication controls](publication-controls.md)
