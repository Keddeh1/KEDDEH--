import test from 'node:test';
import assert from 'node:assert/strict';
import { ToTSafetyKernel, DistributedCoordinateDirectory, Layer2Reconciler, assessOpposingPolarities, ToTSupervisorRegistry } from '../runtime/engineering/index.mjs';

const base = { address:'kex://node/a', state:'READY', revisionId:'R1', authority:'USER_OPERATOR', evidence:['sha256:a'] };

test('zero is valid only as computed polarity assessment', () => {
  assert.equal(assessOpposingPolarities(3,-3), 0);
  assert.equal(assessOpposingPolarities(2,-1), 1);
});

test('zero address is rejected', () => {
  const d = new DistributedCoordinateDirectory();
  assert.throws(() => d.register({...base,address:'0'}), /ZERO_NOT_PERMITTED_AS_ADDRESS/);
});

test('zero state is rejected', () => {
  const d = new DistributedCoordinateDirectory();
  assert.throws(() => d.register({...base,state:'ZERO'}), /ZERO_NOT_PERMITTED_AS_STATE/);
});

test('mutating safety action requires evidence', () => {
  const k = new ToTSafetyKernel();
  const r = k.evaluate({action:'PROMOTE',target:'kex://node/a',authority:'USER_OPERATOR',mutating:true,evidence:[]});
  assert.equal(r.decision,'DENY');
  assert.ok(r.reasons.includes('MUTATION_EVIDENCE_REQUIRED'));
});

test('safety kernel preserves zero assessment without making zero state', () => {
  const k = new ToTSafetyKernel();
  const r = k.evaluate({action:'ASSESS',target:'kex://node/a',authority:'USER_OPERATOR',mutating:false,assessment:0,evidence:['receipt:a'],requestedState:'READY'});
  assert.equal(r.decision,'ALLOW');
  assert.equal(r.assessment,0);
});

test('directory registration is idempotent', () => {
  const d = new DistributedCoordinateDirectory();
  assert.equal(d.register(base).status,'REGISTERED');
  assert.equal(d.register(base).status,'IDEMPOTENT');
});

test('conflicting revision is not silently overwritten', () => {
  const d = new DistributedCoordinateDirectory();
  d.register(base);
  const c = d.register({...base,revisionId:'R2',state:'BUSY',evidence:['sha256:b']});
  assert.equal(c.status,'CONFLICT');
  assert.equal(d.resolve(base.address).record.revisionId,'R1');
});

test('promotion requires explicit supersession', () => {
  const d = new DistributedCoordinateDirectory();
  d.register(base);
  assert.throws(() => d.promote({...base,revisionId:'R2',state:'BUSY',evidence:['sha256:b']}), /EXPLICIT_SUPERSESSION_REQUIRED/);
  const p = d.promote({...base,revisionId:'R2',state:'BUSY',evidence:['sha256:b'],supersedes:['R1']});
  assert.equal(p.status,'PROMOTED');
  assert.equal(d.resolve(base.address).record.revisionId,'R2');
});

test('layer2 identical states converge', () => {
  const r = new Layer2Reconciler().reconcile(base,base);
  assert.equal(r.status,'CONVERGED');
});

test('layer2 unresolved conflict remains unresolved', () => {
  const r = new Layer2Reconciler().reconcile(base,{...base,revisionId:'R2',state:'BUSY',evidence:['sha256:b']});
  assert.equal(r.status,'CONFLICT_UNRESOLVED');
  assert.equal(r.selected,null);
});

test('layer2 explicit supersession promotes successor', () => {
  const r = new Layer2Reconciler().reconcile(base,{...base,revisionId:'R2',state:'BUSY',evidence:['sha256:b'],supersedes:['R1']});
  assert.equal(r.status,'PROMOTE_RIGHT');
  assert.equal(r.selected.revisionId,'R2');
});

test('capability escalation flag is denied by safety kernel', () => {
  const k = new ToTSafetyKernel();
  const r = k.evaluate({action:'INSTANTIATE',target:'kex://node/a',authority:'USER_OPERATOR',mutating:true,evidence:['receipt:a'],invariants:['CAPABILITY_ESCALATION']});
  assert.equal(r.decision,'DENY');
  assert.ok(r.reasons.includes('CAPABILITY_ESCALATION_REJECTED'));
});

test('tot node registers and emits chained safety receipt', () => {
  const k = new ToTSafetyKernel();
  const reg = new ToTSupervisorRegistry(k);
  const node = reg.registerNode({
    id: 'kernel-multicast-4003',
    targetUri: 'kernel://multicast/239.29.7.100:4003',
    authority: 'tot://supervisor/kernel',
    nodeType: 'MULTICAST'
  });
  assert.equal(node.state, 'BOUND');
  assert.ok(node.lastReceiptDigest);
  assert.equal(reg.getAllNodes().length, 1);
});

test('tot node mutating transition requires evidence', () => {
  const k = new ToTSafetyKernel();
  const reg = new ToTSupervisorRegistry(k);
  const node = reg.registerNode({
    id: 'triad-node-3000',
    targetUri: 'loopback://127.0.0.1:3000',
    authority: 'tot://triad/pll',
    nodeType: 'TRIAD'
  });
  // Mutating transition with evidence succeeds
  const r1 = node.transition('REHYDRATE', 'ONLINE', true, ['evidence:pll_drift_0.02']);
  assert.equal(r1.decision, 'ALLOW');
  assert.equal(node.state, 'ONLINE');

  // Mutating transition without evidence is denied
  const r2 = node.transition('REHYDRATE', 'OFFLINE', true, []);
  assert.equal(r2.decision, 'DENY');
  assert.ok(r2.reasons.includes('MUTATION_EVIDENCE_REQUIRED'));
});

test('tot supervisor registry audits all nodes with zero-assessment invariant', () => {
  const k = new ToTSafetyKernel();
  const reg = new ToTSupervisorRegistry(k);
  reg.registerNode({ id: 'srv-1', targetUri: 'server://srv-1', authority: 'tot://cloud', nodeType: 'FLEET' });
  reg.registerNode({ id: 'srv-2', targetUri: 'server://srv-2', authority: 'tot://cloud', nodeType: 'FLEET' });
  const audits = reg.auditAllNodes();
  assert.equal(audits.length, 2);
  const telemetry = reg.getTelemetry();
  assert.equal(telemetry.total_registered_nodes, 2);
  assert.equal(telemetry.online_nodes_count, 2);
  assert.equal(telemetry.all_nodes_up, true);
});

