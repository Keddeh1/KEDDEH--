# HCF source recovery — incomplete candidate

This directory preserves recovered original source, not a finished app and not a replacement implementation. Do not count it as runnable or mix it into the newer standalone HCF file without additional version evidence.

`index.ts` is the exact `sourcesContent[0]` decoded from the inline source map of a saved Google AI Studio served module. `index.css` and `saved_resource.reference.html` are byte-preserved files from the same saved-page asset folder. The reference HTML retains the saved browser's relative asset links; many are absent here. No application code was executed.

## Missing source dependencies

- `src/substrate_memory.ts`
- `src/apex_processor`
- `substrate_effect`
- `src/pixel-analyzer`
- `src/governance-scheduler`
- `src/provider-hypervisor`
- `firebase-setup`
- `firebase-applet-config.json`
- `src/braink-sectors`
- `src/topology-validator`
- `src/adr-registry`

Package imports also require React, React DOM, recharts, d3, and v86; no matching package manifest or lockfile was recovered. The saved served module instead imports `/src/governance-scheduler.ts`, `/firebase-setup.ts`, and five `/node_modules/.vite/deps/` bundles. Those are absent too. Do not supply invented implementations or point it at unrelated authenticated services.

## Verification and lineage

- Served JavaScript passes `node --input-type=module --check`; this is parsing only.
- Source map names the source `index.ts`, with generated file `/app/applet/index.ts`.
- Saved page title matches `ONE (OS 1) Workstation`; 65 of the standalone page's 96 DOM IDs appear in the saved capture, while 31 do not. This supports lineage, not exact-version identity.
- An older standalone HTML is byte-identical to the acquired 103,660-byte HCF file except for a 49-byte line restoring `<script type="module" src="/index.tsx"></script>`. Its expected extension differs from the captured `index.ts`.
- Source pattern scanning found no Google API-key strings, GitHub tokens, private-key headers, or JWT signatures. This is not a comprehensive credential audit; saved browser material remains untrusted.

Evidence and file hashes: `../../evidence/hcf-recovery.json`. Byte-preserved recovery sources: `../../originals/hcf-recovery/`.
