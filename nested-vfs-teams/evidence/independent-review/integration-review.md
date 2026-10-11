# Independent ingestion integration review

The actual supplied ingestion source was exercised with the independently rerun beta team export, synthetic conversations and a disposable local account registry. Its declared source commit is `f48a019b5ec3b9b31a4c0672db43a1e2482a143e`; this declaration is not a separately verified Git remote commit. The received archive SHA256 is independently confirmed as `d2964b2cb661a5c37a3cad1684d5725092f8c0d1b8f0df6f02040511d2e290ae`. All **51 archive files match extracted source byte-for-byte** after execution; Python cache outputs are not source edits.

The integration script rerun passed **19 checks** against that source. It validates the actual ingestion schema, rejects extra composition fields, cross-project and duplicate member scopes, missing permission and stale version, confirms idempotent replay and rejects a changed duplicate. Registry content survives close/reopen and matches a fresh read-only SQLite connection. A second conversation cannot reuse the manager, and cross-account reads are denied.

The initial direct manager UUID is rejected by the native module's `DOT_MANAGER_REQUIRED` rule. The adapter requires an explicit `dot.local-beta` registry handle and preserves the original manager UUID as `workerInstanceId`. This handle is a synthetic local registry assignment, not an authenticated native identity. All five member instance/template/VFS references and the team instance/template identity remain intact. Independently authored supplementary probes passed **8 checks**, including adapter path mismatch, permission escalation and unqualified manager-handle rejection.

The terminal registry state is **assigned**, with `locallyVerified:false`, `workerRunning:false`, `executionId:null` and no actor-process, receiver or transport references. Attempting admission without native evidence returns `NATIVE_EVIDENCE_REQUIRED`. The known local canary executions remain valid separate evidence; reference registration does not transform them into native dispatch or account-platform execution. The supplied principal/capability identifier is a synthetic fixture only, never a native grant.

No additional integration finding remains open in this bounded reference-assignment scope. This review does not qualify real-account ingestion, live native admission, authenticated manager mappings, different-model assessment or remote process confinement. Source hashes, commands' machine outputs and custody evidence accompany this report.

Reproduce from repository root:

```sh
python3 nested-vfs-teams/integration_roundtrip.py --ingestion-source /workspace/keddeh-imports/ingestion-qualified/source/keddeh-account-data --export nested-vfs-teams/evidence/independent-review/fixed/team-interface.json --evidence nested-vfs-teams/evidence/independent-review/ingestion-roundtrip.json
python3 nested-vfs-teams/evidence/independent-review/integration-checks.py
```
