# REPORT 03 — Missing Engineering Layer: Execution, Falsification, MCP/Runtime Ingestion

**Repository:** `aboudykeddeh276-stack/NEW-ENV-APP`  
**Observed date:** 2026-09-29  
**Evidence basis:** repository inspection, local execution of the added engineering modules, local stdio MCP smoke execution, committed-source readback, standards comparison.  
**Truth rule:** implementation is not promoted to external proof; a committed workflow is not treated as executed until a run is observed.

## 1. Executive result

The previously missing engineering layer has been implemented and ingested into both resident runtime surfaces:

```text
explicit action
→ ToT safety kernel
→ authority/evidence/invariant gate
→ distributed-coordinate contract
→ Layer-2 state reconciliation
→ evidence receipt
→ MCP tool/resource surface
→ HTTP runtime surface
```

"ToT" here is implemented as a **trace-of-transition safety boundary**: explicit action, authority, invariants, evidence, decision and receipt. It deliberately does not expose private model chain-of-thought.

Observed local qualification:

```text
engineering fault tests    12 / 12 PASS
MCP stdio smoke             4 / 4 observed as expected
zero assessment             3 + (-3) = 0 PASS
zero address rejection      PASS
zero state rejection        PASS
mutation without evidence   DENIED
silent overwrite            PREVENTED
explicit supersession       REQUIRED
unresolved conflict         PRESERVED
capability escalation       DENIED
```

The engineering layer is therefore **implemented, locally executed, falsified across the listed cases, committed, and MCP/runtime-ingested**. It is not evidence of network-wide distributed operation, production security, official MCP conformance certification, or DO-178C certification.

## 2. Observed baseline before the change

The repository already contained two runtime surfaces.

1. `server.ts` provided the browser/Vite/Express runtime and MCP-labelled HTTP routes for qualification, challenge and self-test.
2. `mcp/server.mjs` provided a real stdio JSON-RPC/MCP dispatcher with qualification, TL2 bridge and Moebius memory-contract tools, legacy `initialize`, tools/resources listing and tool invocation.

What was absent from those runtime paths:

- no safety kernel gating mutating actions by authority + evidence + invariants;
- no first-class coordinate directory with explicit conflict preservation;
- no Layer-2 reconciler;
- no runtime enforcement of the rule that zero is assessment-only and never an address/state;
- no MCP tools for the above;
- no fault-injection suite covering the above.

That is the missing engineering layer built in this change.

## 3. Implemented engineering layer

### 3.1 ToT safety kernel

File: `runtime/engineering/tot-safety-kernel.mjs`

The kernel records only explicit operational facts:

- action;
- target;
- authority;
- mutation flag;
- requested state;
- computed assessment;
- evidence references;
- declared invariants;
- allow/deny decision;
- reasons;
- previous receipt digest;
- current receipt digest.

Mutation without evidence is denied. Capability escalation is denied when presented as an invariant violation. A zero target/address or zero requested state is rejected.

This does **not** expose or depend on hidden model reasoning.

### 3.2 Zero assessment invariant

File: `runtime/engineering/common.mjs`

Governing rule:

```text
ZERO_IS_COMPUTED_ASSESSMENT_ONLY_NOT_ADDRESS_OR_STATE
```

Observed valid case:

```text
+3 + (-3) = 0
```

Observed invalid cases:

```text
address = 0     → ZERO_NOT_PERMITTED_AS_ADDRESS
state   = ZERO  → ZERO_NOT_PERMITTED_AS_STATE
```

The rule is scoped to **ontological/addressable state**, not to arbitrary numeric storage bytes. Existing memory buffers, counters, binary payloads and arithmetic may contain numeric zero. Treating every machine zero as prohibited would be a category error and would destroy ordinary computing semantics.

### 3.3 Distributed coordinate directory contract

File: `runtime/engineering/distributed-coordinate-directory.mjs`

Each record carries:

- address;
- state;
- revision ID;
- authority;
- evidence;
- target context;
- observer relation;
- attribution;
- integration edges;
- explicit supersession list;
- deterministic digest.

Behavior observed:

- identical registration is idempotent;
- a different revision at the same address is returned as `CONFLICT`, not overwritten;
- promotion fails without explicit supersession naming the current revision;
- a correctly evidenced successor may be promoted;
- listing is deterministic by address.

The current implementation is a **distributed-coordinate contract**, not proof of multi-host directory federation. That distinction is central to the remaining-deficiency analysis below.

### 3.4 Layer-2 reconciler

File: `runtime/engineering/layer2-reconciler.mjs`

Rules implemented:

```text
same digest
→ CONVERGED

right explicitly supersedes left
→ PROMOTE_RIGHT

left explicitly supersedes right
→ PROMOTE_LEFT

different states with no provable order
→ CONFLICT_UNRESOLVED
```

There is deliberately no timestamp-based last-writer-wins fallback. A missing ordering relation remains missing evidence.

"Layer-2" in this component means the project's second reconciliation layer over coordinate state. It is not claimed to implement IEEE Ethernet MAC/LLC framing.

## 4. Runtime ingestion

### Browser/server runtime

`server.ts` now exposes:

- `POST /api/mcp/safety/evaluate`
- `POST /api/mcp/coordinates/register`
- `POST /api/mcp/coordinates/promote`
- `GET /api/mcp/coordinates/resolve`
- `GET /api/mcp/coordinates`
- `POST /api/mcp/layer2/reconcile`
- `POST /api/mcp/polarity/assess`
- `GET /api/mcp/engineering/self-test`

### Stdio MCP runtime

`mcp/server.mjs` retains the pre-existing qualification/TL2/Moebius tools and now additionally exposes:

- `tot_safety_evaluate`
- `coordinate_register`
- `coordinate_resolve`
- `coordinate_list`
- `coordinate_promote`
- `layer2_reconcile`
- `polarity_assess`

It now also implements `server/discover`, deterministic tool/resource list ordering, and list/read cache hints.

### MCP metadata

Updated:

- `mcp/runtime-manifest.json`
- `mcp/server.json`
- `package.json`
- `mcp/tools/engineering_layer.json`

Commands:

```text
npm run test:engineering
npm run mcp:stdio
npm run mcp:self-test
```

## 5. Fault-injection results

| Falsifier | Expected | Observed |
|---|---|---|
| opposing polarity sums to zero | assessment 0 allowed | PASS |
| coordinate address `0` | reject | PASS |
| stored state `ZERO` | reject | PASS |
| mutating action without evidence | deny | PASS |
| assessment=0 with nonzero state | allow | PASS |
| duplicate identical registration | idempotent | PASS |
| conflicting revision same address | preserve conflict | PASS |
| promotion without supersession | reject | PASS |
| identical Layer-2 records | converge | PASS |
| unordered Layer-2 revisions | unresolved conflict | PASS |
| explicit successor | promote successor | PASS |
| capability escalation | deny | PASS |

Node test runner result: **12 passed, 0 failed**.

A separate stdio smoke run observed:

1. `server/discover` response;
2. `tools/list` response containing the engineering tools;
3. `polarity_assess(3,-3)` returning assessment `0`;
4. coordinate registration with address `0` returning `ZERO_NOT_PERMITTED_AS_ADDRESS`.

## 6. Current standards comparison

### 6.1 Model Context Protocol, 2026-07-28

Current MCP moved to a stateless lifecycle: no protocol session/handshake is required, `server/discover` is available, each request carries version/client context, and list/read results carry cache semantics. The 2026 release also moved tasks to an extension and deprecated several older server-initiated patterns.

Observed alignment:

- executable stdio tool/resource server exists;
- `server/discover` exists;
- engineering tools are callable through `tools/call`;
- deterministic tool/resource ordering exists;
- `ttlMs:0` and `cacheScope:'private'` are returned;
- legacy `initialize` is retained for older clients.

Not proven/conformant:

- no official MCP SDK conformance harness was executed;
- per-request modern envelope/version validation is not complete;
- no `subscriptions/listen` implementation;
- no MRTR/`input_required` implementation;
- no extension negotiation implementation;
- authorization behavior is not implemented to current MCP OAuth guidance;
- error and schema behavior has not been exhaustively checked against every normative MCP case.

**Classification:** MCP-callable and locally smoke-tested; full 2026-07-28 conformance **UNPROVEN**.

Sources consulted:
- https://blog.modelcontextprotocol.io/posts/2026-07-28/
- https://ts.sdk.modelcontextprotocol.io/v2/
- https://ts.sdk.modelcontextprotocol.io/v2/migration/support-2026-07-28

### 6.2 JSON-RPC 2.0

Observed alignment:

- `jsonrpc:"2.0"`;
- request IDs;
- result/error envelopes;
- parse error `-32700`;
- invalid request/method behavior;
- tool call dispatch.

Remaining gaps:

- exhaustive invalid-parameter classification is not standardized across every tool path;
- batch behavior is not implemented;
- notification handling is only inherited from the pre-existing server behavior and has not been exhaustively falsified.

Source:
- https://www.jsonrpc.org/specification

### 6.3 RFC 3986 URI syntax

The system uses `kex://...` identifiers and keeps address identity separate from implementation.

Unproven:

- `kex` is not shown here as an IANA-registered URI scheme;
- the coordinate directory currently treats address strings as opaque identifiers and does not perform RFC 3986 normalization;
- equivalent URI representations are therefore not proven to collapse to one canonical identity.

Source:
- https://www.rfc-editor.org/info/rfc3986/

### 6.4 NIST SP 800-207 Zero Trust Architecture

The new safety gate improves explicit authorization/evidence discipline and avoids implicit trust based on local placement.

It does **not** establish NIST ZTA conformance. Missing architecture includes:

- identity provider / credential validation;
- device identity/posture;
- policy decision point;
- policy enforcement point around every protected resource;
- authenticated service-to-service requests;
- continuous access evaluation.

Source:
- https://csrc.nist.gov/pubs/sp/800/207/final

### 6.5 W3C PROV-O

The coordinate/node contracts already distinguish attribution roles and evidence references. That is structurally compatible with provenance modelling.

Missing:

- PROV Entity/Activity/Agent mapping;
- PROV serialization;
- cross-system provenance interchange;
- provenance query/validation.

Source:
- https://www.w3.org/TR/prov-o/

### 6.6 W3C Trace Context

No `traceparent`/`tracestate` propagation is currently bound through the HTTP/MCP calls. This matters because distributed execution evidence without cross-service trace correlation becomes much harder to falsify across process boundaries.

Source:
- https://www.w3.org/TR/trace-context/

### 6.7 DO-178C / FAA AC 20-115D

The repository contains statements/log text referring to DO-178C/DAL-A. The observed repository does **not** contain sufficient evidence to substantiate an airborne software certification claim.

Absent or unobserved here include, at minimum:

- certification planning data;
- requirements-based traceability across high-level requirements, low-level requirements, source and tests;
- independence evidence appropriate to the software level;
- structural coverage evidence;
- verification procedures/results across the certification baseline;
- configuration management and quality assurance data supporting the certification objective set;
- tool-qualification evidence where applicable;
- certification authority acceptance.

FAA AC 20-115D remains active and recognizes DO-178C and related supplements. Therefore the repository text must not be treated as certification evidence.

Source:
- https://www.faa.gov/airports/resources/advisory_circulars/index.cfm/go/document.information/documentNumber/20-115D

## 7. What advanced

The following deficiencies were materially reduced:

1. **No safety gate** → explicit safety kernel implemented and callable.
2. **No zeroless runtime enforcement** → address/state invariant implemented and fault-tested.
3. **No coordinate conflict contract** → idempotency/conflict/supersession behavior implemented.
4. **No reconciliation layer** → explicit convergence/supersession/unresolved-conflict rules implemented.
5. **No MCP exposure** → engineering tools exposed through existing stdio server and HTTP runtime.
6. **No test surface** → Node-native falsification suite implemented.
7. **MCP lifecycle lag** → `server/discover`, deterministic lists and cache hints added without removing legacy compatibility.

## 8. What remains unproven, why, why it remains unaddressed, and the missing architecture

### 8.1 Actual distributed coordinate federation

**Unproven:** multiple independent hosts can converge on the same directory state under loss, delay, duplication, partition and restart.

**Why unproven:** all observed coordinate tests execute in one Node process with one in-memory map.

**Why that why remains unaddressed:** the repository does not currently expose a peer-replication transport bound to this directory, a durable directory backing store, or a multi-host test substrate.

**Missing supporting architecture:**

- peer identity and authenticated peer transport;
- discovery/admission binding to the existing BRAINK mesh rather than an invented central resolver;
- durable append-only coordinate/event storage;
- replay and snapshot contract;
- anti-entropy/state-exchange protocol;
- duplicate delivery and partition handling;
- explicit conflict-order policy grounded in project semantics;
- multi-host fault harness with independent process clocks and storage;
- readback proving post-restart convergence.

Until these exist and execute, "distributed coordinate directory" describes the contract/interface, not proven distributed operation.

### 8.2 Layer-2 distributed reconciliation

**Unproven:** reconciliation operates across real independent nodes and transport faults.

**Why unproven:** current tests call the reconciler directly with two objects.

**Why unaddressed:** no transport adapter currently feeds independently observed peer states into this reconciler with authenticated provenance.

**Missing architecture:**

- peer-state ingestion adapter;
- source/peer identity binding;
- durable reconciliation ledger;
- retry/idempotency contract across network duplication;
- partition/rejoin test harness;
- independent observer receipts;
- policy for histories that cannot be ordered by explicit supersession.

The current implementation correctly refuses to invent an ordering rule for the last case.

### 8.3 Runtime-wide safety-kernel enforcement

**Unproven:** every mutating operation in NEW-ENV-APP passes through the safety kernel.

**Why unproven:** the kernel is bound to the new MCP/HTTP engineering endpoints, but the repository contains older mutation paths, mesh worker creation, mining/session state mutation and other runtime methods.

**Why unaddressed:** those paths pre-existed the kernel and have not yet been dependency-traced one by one.

**Missing architecture/work required:**

- mutation inventory;
- authority/evidence contract per mutator;
- common gate binding before mutation;
- negative test proving direct bypass is impossible or explicitly classified;
- receipt propagation from gate to resulting state mutation.

### 8.4 Durable state

**Unproven:** coordinate/safety state survives process restart.

**Why:** engineering directory and kernel receipts are in memory.

**Why unaddressed:** no resident VFS/durable-store binding for these components was selected from existing runtime mechanisms during this change.

**Missing architecture:**

- existing VFS/storage adapter selection;
- atomic append contract;
- crash/restart recovery;
- hash-chain readback;
- corrupted/partial record falsifiers.

### 8.5 Full MCP 2026 conformance

**Unproven:** official client/server interoperability across the full 2026-07-28 normative surface.

**Why:** local JSON-RPC smoke tests are not a protocol conformance suite.

**Why unaddressed:** the repository currently uses a custom stdio server and does not contain the Tier-1 MCP v2 SDK or an official conformance harness.

**Missing architecture/work:**

- bind the stable MCP v2 SDK or an equivalent fully specified codec;
- request-envelope version validation;
- standardized modern error behavior;
- extension negotiation;
- MRTR where required;
- subscriptions if required;
- auth profile for remote transport;
- official/multi-client interoperability tests.

### 8.6 HTTP endpoint authorization

**Unproven:** an unauthorized caller cannot invoke mutation endpoints.

**Why:** the observed Express engineering endpoints have no authentication middleware.

**Why unaddressed:** repository identity/authentication policy is not bound to these endpoints.

**Missing architecture:**

- authenticated principal;
- authority claims;
- policy enforcement middleware;
- replay protection where state mutation requires it;
- audit link from principal to safety receipt.

### 8.7 Provenance interoperability

**Unproven:** receipts can be interchanged/query-validated as standard provenance.

**Why:** current receipts are project JSON structures.

**Why unaddressed:** no PROV mapping/serialization layer exists.

**Missing architecture:**

- deterministic mapping to Entity/Activity/Agent;
- provenance identifiers;
- serialization profile;
- provenance validation;
- cross-receipt derivation linkage.

### 8.8 Distributed trace correlation

**Unproven:** one action can be traced coherently across HTTP, MCP, peer transport and storage.

**Why:** no W3C Trace Context propagation exists.

**Why unaddressed:** tracing was not present as a resident shared service.

**Missing architecture:**

- trace context ingress validation;
- propagation through MCP/HTTP/peer/storage boundaries;
- receipt-to-trace linkage;
- collector/export or resident trace store;
- negative tests for forged trace context.

### 8.9 DO-178C/DAL-A claims

**Unproven:** certification or DAL-A compliance.

**Why:** labels and deterministic tests are not certification evidence.

**Why the deficiency remains:** the repository is an engineering runtime, not an observed certification data package or certification process.

**Architectures/processes absent for that claim:**

- certification planning/configuration/QA framework;
- requirements hierarchy and bidirectional trace database;
- verification independence model;
- structural coverage toolchain and evidence;
- tool qualification where relied upon;
- certification baseline/change-control process;
- authority review/acceptance evidence.

The correct current classification is **engineering implementation with local evidence**, not DAL-A certification.

### 8.10 Exact committed-repo CI execution

**Unproven at report-writing time:** the GitHub Actions workflow had executed the committed bytes.

**Why:** immediately after workflow creation, GitHub returned no workflow run for that commit.

**Why unaddressed:** execution scheduling is external to the source mutation and no run result existed at readback time.

**Required evidence:** workflow run ID, job status, step outputs and commit SHA match.

## 9. Evidence boundary

What can be claimed now:

```text
ENGINEERING LAYER IMPLEMENTED
LOCAL FAULT TESTS 12/12 PASS
LOCAL MCP STDIO SMOKE PASS
HTTP RUNTIME BOUND
MCP STDIO RUNTIME BOUND
SOURCE COMMITTED
ZERO ASSESSMENT INVARIANT EXECUTED
CONFLICT PRESERVATION EXECUTED
EXPLICIT SUPERSESSION EXECUTED
```

What cannot be claimed from current evidence:

```text
MULTI-HOST DISTRIBUTED DIRECTORY PROVEN
NETWORK PARTITION CONVERGENCE PROVEN
PRODUCTION AUTHORIZATION PROVEN
DURABLE RESTART RECOVERY PROVEN
FULL MCP 2026 CONFORMANCE CERTIFIED
W3C PROV INTEROPERABILITY PROVEN
W3C TRACE CONTEXT INTEGRATED
DO-178C / DAL-A CERTIFIED
COMMITTED-REPO CI PASS (until workflow run is observed)
```

## 10. Conclusion

The missing engineering layer is no longer missing as code or as a callable runtime surface. The safety, coordinate and reconciliation mechanics exist, execute, fail closed on the tested negative cases, and are ingested into NEW-ENV-APP's resident MCP and HTTP runtime paths.

The remaining deficiencies are not "future architecture" placeholders. They are specific absent execution substrates: multi-host replication, durable backing, universal mutation gating, authenticated policy enforcement, protocol-conformance validation, provenance/trace interoperability, and certification evidence structures. Each of those requires a concrete supporting architecture before its associated claim can be promoted.
