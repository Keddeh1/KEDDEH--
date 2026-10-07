import { rejectStandaloneZero, sha256, canonical } from './common.mjs';

function normalize(x) {
  const address = String(x?.address ?? '').trim();
  const state = String(x?.state ?? '').trim();
  rejectStandaloneZero(address, 'ADDRESS');
  rejectStandaloneZero(state, 'STATE');
  return {
    address,
    state,
    revisionId: String(x?.revisionId ?? ''),
    evidence: Array.isArray(x?.evidence) ? x.evidence.map(String).filter(Boolean) : [],
    supersedes: Array.isArray(x?.supersedes) ? x.supersedes.map(String) : [],
    authority: String(x?.authority ?? ''),
    payload: x?.payload ?? null,
  };
}

export class Layer2Reconciler {
  reconcile(leftInput, rightInput) {
    const left = normalize(leftInput);
    const right = normalize(rightInput);
    if (!left.address || !right.address || left.address !== right.address) {
      return this.#receipt('REJECTED', 'ADDRESS_MISMATCH', left, right, null);
    }
    if (!left.revisionId || !right.revisionId) return this.#receipt('REJECTED', 'REVISION_ID_REQUIRED', left, right, null);
    if (left.evidence.length === 0 || right.evidence.length === 0) return this.#receipt('REJECTED', 'EVIDENCE_REQUIRED', left, right, null);

    const leftDigest = sha256(canonical(left));
    const rightDigest = sha256(canonical(right));
    if (leftDigest === rightDigest) return this.#receipt('CONVERGED', 'IDENTICAL', left, right, left);
    if (right.supersedes.includes(left.revisionId)) return this.#receipt('PROMOTE_RIGHT', 'EXPLICIT_SUPERSESSION', left, right, right);
    if (left.supersedes.includes(right.revisionId)) return this.#receipt('PROMOTE_LEFT', 'EXPLICIT_SUPERSESSION', left, right, left);
    return this.#receipt('CONFLICT_UNRESOLVED', 'NO_PROVABLE_ORDER', left, right, null);
  }

  #receipt(status, reason, left, right, selected) {
    const body = { schema:'kex.layer2.reconciliation.receipt.v1', status, reason, left, right, selected };
    return { ...body, digest: sha256(canonical(body)) };
  }
}
