"""Live mTLS gRPC qualification against the additive canary and real backing estate."""
from concurrent.futures import ThreadPoolExecutor
import json
import os
from pathlib import Path
import signal
import sqlite3
import sys
import time
import unittest
import uuid
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'scripts'));sys.path.insert(0,str(ROOT/'runtime/triad'))
import grpc
import importlib.util
spec=importlib.util.spec_from_file_location('triad_client',ROOT/'scripts/triad-client.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
channel,signed=module.channel,module.signed
import triad_mesh_pb2 as pb
import triad_mesh_pb2_grpc as rpc
RUNTIME=Path('/workspace/deployments/serverspace/runtime/triad-v1')
config=json.loads((RUNTIME/'config.json').read_text())
class LiveTests(unittest.TestCase):
    def setUp(self):
        self.connection=channel(RUNTIME);self.client=rpc.TriadMeshOrchestratorStub(self.connection)
        self.client.Readiness(pb.TriadReadinessRequest(),timeout=10,wait_for_ready=True)
        self.request=signed(RUNTIME,'qualification-'+uuid.uuid4().hex,'Qualify resident Triad continuation',config['revision'],1e12)
    def tearDown(self):self.connection.close()
    def error(self,code,fn):
        with self.assertRaises(grpc.RpcError) as exc:fn()
        self.assertEqual(exc.exception.code(),code)
    def commit(self):return self.client.TraversalMatrixHop(self.request,timeout=45,wait_for_ready=True)
    def test_real_first_commit_and_byte_identical_retry(self):
        response=self.commit();retry=self.commit()
        self.assertEqual(response.SerializeToString(deterministic=True),retry.SerializeToString(deterministic=True))
        self.assertEqual(response.status,pb.MATRIX_STATUS_VERIFIED_OPERATIONAL);self.assertEqual(response.readiness_mask,7)
        self.assertTrue(response.integration.sdk_commit_verified);self.assertTrue(response.receipt_digests)
        self.assertEqual(response.execution.il_llm_state,'RESOLVED')
        self.assertFalse(response.execution.HasField('kex_memory_allocation_offset'))
        self.assertFalse(response.integration.provenance.HasField('empirical_saturation_ratio'))
        self.assertFalse(response.registrar_constraint.verified);self.assertFalse(response.registrar_constraint.affects_braink_admission)
    def test_context_conflict_does_not_reapply(self):
        first=self.commit()
        other=signed(RUNTIME,self.request.request_id,'Different context',config['revision'],1e12)
        self.error(grpc.StatusCode.ALREADY_EXISTS,lambda:self.client.TraversalMatrixHop(other,timeout=10))
        self.assertEqual(self.commit(),first)
    def test_signature_tampering_is_rejected(self):
        self.request.raw_word_input='Tampered request'
        self.error(grpc.StatusCode.UNAUTHENTICATED,self.commit)
    def test_unpinned_authority_is_rejected(self):
        self.request.authority_key_id='0'*64
        self.error(grpc.StatusCode.UNAUTHENTICATED,self.commit)
    def test_wrong_revision_is_rejected(self):
        request=signed(RUNTIME,self.request.request_id,self.request.raw_word_input,'0'*40)
        self.error(grpc.StatusCode.FAILED_PRECONDITION,lambda:self.client.TraversalMatrixHop(request,timeout=10))
    def test_mtls_rejects_client_without_certificate(self):
        credentials=grpc.ssl_channel_credentials((RUNTIME/'ca.crt').read_bytes())
        with grpc.secure_channel('127.0.0.1:8962',credentials) as connection:
            self.error(grpc.StatusCode.UNAVAILABLE,lambda:rpc.TriadMeshOrchestratorStub(connection).Readiness(pb.TriadReadinessRequest(),timeout=2))
    def test_concurrent_retry_commits_once(self):
        with ThreadPoolExecutor(max_workers=3) as pool:results=list(pool.map(lambda _:self.commit(),range(3)))
        self.assertTrue(all(r==results[0] for r in results))
        with sqlite3.connect(RUNTIME/'triad.sqlite3') as db:
            self.assertEqual(db.execute('SELECT count(*) FROM requests WHERE id LIKE ?',('%:'+self.request.request_id,)).fetchone()[0],1)
    def test_stream_is_read_only_and_cancellable(self):
        first=self.commit()
        with sqlite3.connect(RUNTIME/'triad.sqlite3') as db:count=db.execute('SELECT count(*) FROM requests').fetchone()[0]
        stream=self.client.StreamMatrixTelemetry(self.request,timeout=5)
        sample=next(stream);self.assertEqual(sample.request_id,self.request.request_id);self.assertEqual(sample.readiness_mask,7);stream.cancel()
        with sqlite3.connect(RUNTIME/'triad.sqlite3') as db:self.assertEqual(db.execute('SELECT count(*) FROM requests').fetchone()[0],count)
        self.assertEqual(self.commit(),first)
    def test_stream_cannot_create_a_commit(self):
        self.error(grpc.StatusCode.NOT_FOUND,lambda:next(self.client.StreamMatrixTelemetry(self.request,timeout=5)))
    def test_live_calibrated_local_latency_contract(self):
        self.commit()
        stream=self.client.StreamMatrixTelemetry(self.request,timeout=5)
        try:sample=next(stream)
        finally:stream.cancel()
        metrics=sample.measured_metrics
        self.assertTrue(metrics.calibrated)
        self.assertGreaterEqual(metrics.sample_count,32)
        self.assertTrue(metrics.HasField('measured_p99_latency_ms'))
        self.assertTrue(metrics.HasField('p99_latency_ema_ms'))
        self.assertLess(metrics.measured_p99_latency_ms,15.0,'Observed local carrier exceeds the supplied latency contract; host remains running')
        self.assertTrue(metrics.latency_sla_met)
    def test_worker_crash_replays_exact_durable_response(self):
        first=self.commit();pidfile=Path('/workspace/deployments/service-estate/triad-grpc-canary.worker.pid');pid=int(pidfile.read_text())
        self.assertIn(b'triad_grpc_server.py',Path(f'/proc/{pid}/cmdline').read_bytes());os.kill(pid,signal.SIGKILL)
        for _ in range(100):
            time.sleep(.1)
            try:
                if int(pidfile.read_text())!=pid and self.client.Readiness(pb.TriadReadinessRequest(),timeout=2,wait_for_ready=True).readiness_mask==7:break
            except (OSError,grpc.RpcError):pass
        else:self.fail('Canary supervisor did not recover: old='+str(pid)+' current='+pidfile.read_text())
        self.assertEqual(self.commit(),first)
    def test_unavailable_substrate_never_returns_verified_commit(self):
        pid=int(Path('/workspace/deployments/serverspace/runtime/canary-v1/worker.pid').read_text())
        self.assertIn(b'serverspace_substrate.py',Path(f'/proc/{pid}/cmdline').read_bytes());os.kill(pid,signal.SIGSTOP)
        try:self.error(grpc.StatusCode.UNAVAILABLE,self.commit)
        finally:os.kill(pid,signal.SIGCONT)
        for _ in range(30):
            try:response=self.commit();break
            except grpc.RpcError:time.sleep(.1)
        else:self.fail('Canary did not recover')
        self.assertEqual(response.status,pb.MATRIX_STATUS_VERIFIED_OPERATIONAL)
if __name__=='__main__':unittest.main()
