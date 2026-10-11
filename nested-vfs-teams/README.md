# Keddeh nested VFS team canary

Private local implementation of Aboudy Keddeh's worker-template → member VFS → team-template → enclosing team VFS composition. A template is a definition; an instance is durable state; a process run with observed output is an execution. No template or seeded status is treated as a running agent.

This directory is independent of the delivered HTML estate. No source originals, root application, existing CI workflows, credentials or live runtime were changed. This branch must remain local for this step.

## Run

Python 3.12 on Linux; runtime uses only the standard library. From the repository root, choose a fresh state directory:

```sh
python3 nested-vfs-teams/canary.py --state /tmp/keddeh-team-canary-example --evidence /tmp/keddeh-team-evidence
```

Existing state directories are refused by the canary so reruns cannot erase evidence. The runtime itself reopens existing state for recovery. Each subprocess has a 12-second harness timeout. Worker limits are five CPU seconds, 256 MiB address space, 64 file descriptors and 16 MiB per file. Verification processes have CPU, address-space and descriptor limits too. Input is at most 16 KiB, output/template at most 64 KiB, queued jobs at most 64 per team, claim TTL 0.05–30 seconds, attempts at most three. The queue bound includes terminal records; an owner-controlled retention/archival policy is required before continued operation at capacity.

Individual adapters can be run using identities returned by the manager:

```sh
python3 nested-vfs-teams/manager.py instantiate /tmp/team-state alpha
python3 nested-vfs-teams/manager.py enqueue /tmp/team-state TEAM_ID MANAGER_ID WORKER_ID task-1 'harmless input'
python3 nested-vfs-teams/worker.py /tmp/team-state TEAM_ID WORKER_ID
python3 nested-vfs-teams/verifier.py /tmp/team-state TEAM_ID VERIFIER_ID JOB_ID
python3 nested-vfs-teams/manager.py inspect /tmp/team-state TEAM_ID ADMINISTRATOR_ID
```

Replace uppercase placeholders with returned identities. The manager CLI is an owner-operated local API, not an authenticated network service. No credentials are created. Never expose this CLI or its underlying methods to untrusted callers without an independently authorized identity/transport adapter.

## Source reuse and lineage

`vendor/native_vfs/{store,model,__init__}.py` are unchanged source from **BRAINK-BETA-TEST commit `201e151b09c7762a1b3015ecbf4c0118f683b6a4`**, newer than the requested discovery point `b00d00924b4dbcf13ca64468aa4790ce3308faf8`. `vendor/provenance.json` records exact SHA256 values. The newer store supplies contextual binding versions, CAS, continuation replay, content-addressed objects, lineage and chained actor/observer receipts. Its HTTP server is excluded; this package makes no assertion about deployed server authorization.

The existing BRAINK host queue and lease sources at `754e2919e986ac1e1936a38d33ca343f8285b35c` were inspected. Host queue submission requires an admitted host/authority; those live bindings are not available here. Its epoch lease does not implement expiry/retry recovery. This canary adds a bounded **local queue adapter**, reusing native VFS commits and receipts, without registering fake native hosts or submitting into production. Native CI can invoke the command above and consume its JSON as test telemetry. Its result grants no authority.

The six keyed identities from the reported Drive swarm orchestrator have not been acquired or mapped in this executor. This canary uses explicitly new local instance identities and never substitutes them for those existing identities or for ChatGPT conversation IDs.

## Templates, nested state and permissions

Editable definitions are in `templates/`; JSON Schemas are in `schemas/`. Team closure SHA256 covers the team plus all worker definitions. UUIDv5 derives team instance identity from caller-owned instance key and closure digest, and member identity from team identity and role. Repeating an unchanged definition preserves identity. A version/content change produces a different instance; migration requires an explicit future operation.

Canonical template bytes are committed once to the shared native VFS. Instances hold content references, not duplicated mutable template bodies. Each team has an enclosing `teams/<team_instance_id>` directory and its native `vfs` with the instance descriptor. Every member has its own `members/<member_id>/vfs` store with identity, bindings, SQLite WAL and object storage. Identical paths or digests do not make mutable member state shared.

| Responsibility | Local adapter | Effective permission |
| --- | --- | --- |
| Manager | `local.manager.v1` | Schedule bounded work within its team |
| Administration | `local.inspector.v1` | Inspect instance/evidence state; cannot grant permissions |
| Production | `utf8.uppercase.v1` | Commit only its own task artifact |
| Specialist | `utf8.wordcount.v1` | Commit only its own task artifact |
| Verification | `sha256.readback.v1` | Read team member artifacts and record independent-process observations |

Instantiation rejects permissions outside the parent ceiling and role permissions outside the fixed tested set. The role API rejects cross-team members, sibling reads by producers, absolute/traversal paths and redirected member VFS symlinks, including nested object fanout, database and SQLite sidecar paths. These static checks do not claim resistance to a hostile same-UID process racing filesystem changes. All model bindings are null. Expertise means only the declared deterministic function tested here; no comparable LLM capability is claimed.

These are **trusted-code API boundaries and separate storage scopes**, not kernel isolation of hostile Python code. All local processes run as the executor account; code with unrestricted filesystem access could impersonate an ID or bypass the API. Before untrusted or remote adapters run, authenticated principals and OS/container/filesystem confinement must be bound and separately tested. This canary deliberately does not manufacture that authority.

## Durable scheduling and recovery

The manager persists jobs and transitions in SQLite with WAL/FULL. `(team, key)` is unique, with a request hash to reject a changed duplicate. Claims use `BEGIN IMMEDIATE`, random claim tokens, monotonic epochs and bounded expiry. The expiry clock is taken after the queue write lock is acquired, so lock waits do not consume the new lease. Only a matching unexpired claim can produce or fail work. A reclaimer restores expired work to pending or marks it terminal after three attempts.

Artifact commit is guarded by the queue transaction. Another claimant cannot supersede a writer while that transaction is active. Native VFS CAS expects binding version zero and uses stable job ID as continuation ID. A crash after VFS commit but before queue commit leaves an unacknowledged lease; after expiry, the retry reuses the original native binding and receipt. This is recovery across two databases, not a false claim of distributed atomic commit. The immutable task and continuation key must stay unchanged.

Success first becomes `PRODUCED`. The verification coordinator creates its own observer child, binds the observation to that actual child PID and checks the native receipt and current artifact before recording `VERIFIED`. Caller-supplied observations are rejected. The observer reads the binding via read-only SQLite, hashes actual object bytes, computes expected task output independently and checks binding history. It appends a native observer receipt but cannot promote queue status through the public observation API. This is separate-process deterministic verification, not a different-model assessment. A corrupted artifact fails verification and cannot advance the state. There is no claim of exactly-once general external side effects, a general dependency scheduler or remote retry safety. The tested dependency is production before verification.

## Evidence and handoff

`evidence/canary.json` contains assertions, actual process exits/stdout, artifact text/digests, claim/recovery events, native receipt references and measured resource usage. `evidence/team-interface.json` is the concrete ingestion handoff. `interface.json` defines the interface; `schemas/team-instance.schema.json` is machine-validatable.

One job is deliberately made to fail three times. Its team therefore exports `INCOMPLETE`, not a false all-success state; the other team exports `LOCAL_VERIFIED`. The report separately counts all verified artifact jobs. Negative-test failures and injected crashes are expected, recorded execution outcomes.

The parent supplied the actual ingestion Library package `libfile_9c5f6ac1aebc8191ade47c9daadbf749`, declaring commit `f48a019b5ec3b9b31a4c0672db43a1e2482a143e`. It was materialized in this executor and used unchanged for the actual cross-module round-trip; no shared filesystem was assumed. `integration_roundtrip.py` imports its real `AccountData` and `ChatManagers` modules, discovers a synthetic conversation, maps the actual beta team, assigns it, reopens storage and reads the composition through a separate SQLite mode=ro connection. Nineteen integration checks passed and were independently rerun, with eight additional reviewer-authored adapter checks; the supplied source/schema hashes and exact outcomes are in `evidence/reviewed/ingestion-roundtrip.json`.

The initial direct-UUID mapping is retained in `integration/actual-beta-assignment.json`; the actual ingestion runtime rejects it with `DOT_MANAGER_REQUIRED`. `ingestion_adapter.py` therefore accepts an **explicit** registry handle (`dot.local-beta` in the synthetic canary). It does not rename the native worker: `workerInstanceId`, member VFS, template ID and source team export keep the original UUID. The separate registry handle appears only as the ingestion role identity. The successful packet is in `integration/actual-beta-assignment-with-registry-handle.json`. No live identity or grant is created. State/scope references denote local storage and logical identity bindings, not dispatch addresses.

Composition is stored as a supplied `packaged` claim with `locallyVerified:false`, and registry state remains `assigned`. No live native admission is fabricated from a local canary. The test proves idempotent assignment, scope/permission/version rejection and one-to-one chat/manager binding. The synthetic principal is ephemeral test data; an actual operator principal must still be resolved from the owner's authoritative registry.

To reproduce against a materialized copy of that source package:

```sh
python3 nested-vfs-teams/integration_roundtrip.py --ingestion-source /path/to/keddeh-account-data --export nested-vfs-teams/evidence/reviewed/team-interface.json --evidence /tmp/team-ingestion-roundtrip.json
```

The ingestion package is not duplicated into this team package. Its Library identity, archive digest and source hashes preserve the dependency boundary.

## Review corrections

The separate reviewer reproduced incorrect promotion from a fabricated observation, object/database symlink escape, and lease expiry during lock acquisition despite the original 60 passing checks. `evidence/independent-review/original-failures.json`, the original baseline and `original-implementation.zip` (commit `e4c1f8ac9e6eda778abcc7f2a706b027b178bc28`) are retained. The corrections bind verification to coordinator-spawned execution and durable receipts, guard nested storage paths, and start TTL after lock acquisition. The reviewed canary also records Linux `getrusage(RUSAGE_CHILDREN)` peak RSS from a fresh measuring process for each command. This is a high-water mark for the child/its reaped descendants, not simultaneous aggregate memory for the team.

## Recorded qualification

The pre-review run passed **60 canary assertions**, with **11 verified jobs and one intentional terminal failure**, plus **11 schema/source-custody checks** and **16 native binding-history tests**. That pre-review state measured 1,017,016 bytes and wall time was 4.548 seconds. It did not detect the defects described above. Reviewed-run evidence is stored separately under `evidence/reviewed/`. The separate reviewer reran all 60 canary checks and ten additional probes; all four original findings were closed for the tested trusted-API scope. Its 29 measured child invocations reported 14,811,136–15,335,424 bytes peak RSS (not concurrent aggregate usage), with 11.986 seconds wall time. These are observed local results, not production capacity claims. Exact commands and exclusions are in `evidence/validation.json`. `validate.py` uses the already installed development-only `jsonschema` 4.26.0; the canary runtime has no third-party Python dependencies.

## Deployment boundary

The versioned transport boundary is `keddeh.team-transport-adapter.v1`, currently `local-process`. Native worker, host, model and live queue mappings are null. The reported mesh `/api/swarm` → `localhost:8094` routing is not activated or taken as evidence of team execution. Native different-model assessment remains outstanding.

TL2's reported 124-byte mining payload and eight-byte journal header are not reused, extended or declared compatible with teams; its zero padding is untouched. The team transport mapping needs its own exact contract and observed receipts. No mining, payment, messaging, push, deployment or account-permission operation is part of this canary.
