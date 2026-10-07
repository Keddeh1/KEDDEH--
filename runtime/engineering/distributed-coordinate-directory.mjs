import { rejectStandaloneZero, sha256, canonical } from './common.mjs';

export class DistributedCoordinateDirectory {
  #records = new Map();

  register(record) {
    const address = String(record?.address ?? '').trim();
    const state = String(record?.state ?? '').trim();
    const revisionId = String(record?.revisionId ?? '').trim();
    const authority = String(record?.authority ?? '').trim();
    const evidence = Array.isArray(record?.evidence) ? record.evidence.map(String).filter(Boolean) : [];
    if (!address) throw new Error('ADDRESS_REQUIRED');
    rejectStandaloneZero(address, 'ADDRESS');
    if (!state) throw new Error('STATE_REQUIRED');
    rejectStandaloneZero(state, 'STATE');
    if (!revisionId) throw new Error('REVISION_ID_REQUIRED');
    if (!authority) throw new Error('AUTHORITY_REQUIRED');
    if (evidence.length === 0) throw new Error('EVIDENCE_REQUIRED');

    const normalized = {
      address, state, revisionId, authority, evidence,
      targetContext: String(record?.targetContext ?? 'UNBOUND_TARGET'),
      observerRelation: String(record?.observerRelation ?? 'UNBOUND_OBSERVER'),
      attribution: record?.attribution ?? {},
      integrationEdges: Array.isArray(record?.integrationEdges) ? record.integrationEdges : [],
      supersedes: Array.isArray(record?.supersedes) ? record.supersedes.map(String) : [],
    };
    const digest = sha256(canonical(normalized));
    const current = this.#records.get(address);
    if (current) {
      if (current.digest === digest) return { status: 'IDEMPOTENT', record: { ...current } };
      if (current.revisionId === revisionId) throw new Error('REVISION_COLLISION');
      return { status: 'CONFLICT', current: { ...current }, candidate: { ...normalized, digest } };
    }
    const stored = { ...normalized, digest };
    this.#records.set(address, stored);
    return { status: 'REGISTERED', record: { ...stored } };
  }

  promote(record) {
    const address = String(record?.address ?? '').trim();
    const current = this.#records.get(address);
    if (!current) return this.register(record);
    const candidate = this.registerCandidate(record);
    if (!candidate.supersedes.includes(current.revisionId)) throw new Error('EXPLICIT_SUPERSESSION_REQUIRED');
    this.#records.set(address, candidate);
    return { status: 'PROMOTED', previous: { ...current }, record: { ...candidate } };
  }

  registerCandidate(record) {
    const address = String(record?.address ?? '').trim();
    const state = String(record?.state ?? '').trim();
    rejectStandaloneZero(address, 'ADDRESS');
    rejectStandaloneZero(state, 'STATE');
    const evidence = Array.isArray(record?.evidence) ? record.evidence.map(String).filter(Boolean) : [];
    if (!String(record?.revisionId ?? '').trim()) throw new Error('REVISION_ID_REQUIRED');
    if (!String(record?.authority ?? '').trim()) throw new Error('AUTHORITY_REQUIRED');
    if (evidence.length === 0) throw new Error('EVIDENCE_REQUIRED');
    const normalized = {
      address,
      state,
      revisionId: String(record.revisionId),
      authority: String(record.authority),
      evidence,
      targetContext: String(record?.targetContext ?? 'UNBOUND_TARGET'),
      observerRelation: String(record?.observerRelation ?? 'UNBOUND_OBSERVER'),
      attribution: record?.attribution ?? {},
      integrationEdges: Array.isArray(record?.integrationEdges) ? record.integrationEdges : [],
      supersedes: Array.isArray(record?.supersedes) ? record.supersedes.map(String) : [],
    };
    return { ...normalized, digest: sha256(canonical(normalized)) };
  }

  resolve(address) {
    rejectStandaloneZero(address, 'ADDRESS');
    const record = this.#records.get(String(address));
    return record ? { status: 'FOUND', record: { ...record } } : { status: 'NOT_FOUND', address: String(address) };
  }

  list() {
    return [...this.#records.values()].sort((a,b) => a.address.localeCompare(b.address)).map(x => ({ ...x }));
  }
}
