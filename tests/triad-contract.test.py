"""Deterministic contract tests; fixture metrics are not deployment telemetry."""
import base64
import hashlib
import math
from pathlib import Path
import sys
import unittest
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'runtime'));sys.path.insert(0,str(ROOT/'runtime/triad'))
import grpc
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.hazmat.primitives import serialization
from calibration import Calibration
from triad_grpc_server import Service,signing_bytes
import triad_mesh_pb2 as pb
class Rejected(Exception):pass
class Context:
    def abort(self,code,detail):raise Rejected(code,detail)
class ContractTests(unittest.TestCase):
    def test_unprofiled_coefficient_is_absent(self):
        result=Calibration().snapshot();self.assertFalse(result['calibrated']);self.assertNotIn('tolerance_index',result);self.assertNotIn('measured_p99_latency_ms',result)
    def test_missing_disk_observation_is_not_invented(self):
        c=Calibration()
        for _ in range(32):c.observe(1,.25,None)
        result=c.snapshot();self.assertFalse(result['calibrated']);self.assertNotIn('disk_busy_fraction',result)
    def test_measured_window_has_explicit_coefficient(self):
        c=Calibration(window=32)
        for _ in range(32):c.observe(3,.25,.5)
        result=c.snapshot();self.assertTrue(result['calibrated']);self.assertTrue(result['latency_sla_met']);self.assertAlmostEqual(result['tolerance_index'],1/1.5)
    def test_breach_is_observed_without_admission_failure(self):
        c=Calibration()
        for _ in range(32):c.observe(20,.8,.9)
        self.assertTrue(c.snapshot()['calibrated']);self.assertFalse(c.snapshot()['latency_sla_met'])
    def test_old_samples_expire(self):
        c=Calibration(window=32)
        c.observe(50,1,1)
        for _ in range(32):c.observe(1,0,0)
        self.assertEqual(c.snapshot()['measured_p99_latency_ms'],1)
    def test_invalid_metrics_fail(self):
        for values in [(math.nan,0,0),(1,2,0),(1,0,-1),(math.inf,0,None)]:
            with self.assertRaises(ValueError):Calibration().observe(*values)
    def test_ledger_connections_close_after_repeated_readback(self):
        import tempfile
        with tempfile.TemporaryDirectory() as directory:
            service=Service.__new__(Service);service.db=Path(directory)/'ledger.sqlite3'
            before=len(list(Path('/proc/self/fd').iterdir()))
            for _ in range(128):
                with service.connect() as db:self.assertEqual(db.execute('SELECT 1').fetchone()[0],1)
            after=len(list(Path('/proc/self/fd').iterdir()))
            self.assertLessEqual(after,before+2)
    def test_readiness_rejects_a_running_wrong_revision(self):
        import importlib.util
        spec=importlib.util.spec_from_file_location('triad_client_contract',ROOT/'scripts/triad-client.py')
        client=importlib.util.module_from_spec(spec);spec.loader.exec_module(client)
        config={'revision':'a'*40,'node_identity':'node://test'}
        response=pb.TriadReadinessResponse(readiness_mask=7,ledger_integrity=True,node_identity='node://test',source_git_revision='b'*40)
        with self.assertRaises(RuntimeError):client.verify_readiness(response,config)
        response.source_git_revision=config['revision'];client.verify_readiness(response,config)
    def test_schema_keeps_original_tags_and_marks_unallocated_memory_absent(self):
        r=pb.TriadMatrixHopResponse();self.assertFalse(r.execution.HasField('kex_memory_allocation_offset'));self.assertFalse(r.integration.provenance.HasField('empirical_saturation_ratio'))
        self.assertEqual(pb.TriadMatrixHopRequest.DESCRIPTOR.fields_by_name['authority_signature'].number,4)
    def test_signature_covers_all_request_fields(self):
        key=Ed25519PrivateKey.generate();pub=key.public_key().public_bytes(serialization.Encoding.Raw,serialization.PublicFormat.Raw)
        service=Service.__new__(Service);service.authority=key.public_key();service.authority_id=hashlib.sha256(pub).hexdigest()
        req=pb.TriadMatrixHopRequest(request_id='unit',raw_word_input='bounded input',target_git_revision='a'*40,current_load_factor=1e12,authority_key_id=service.authority_id)
        req.authority_signature=base64.b64encode(key.sign(signing_bytes(req))).decode()
        self.assertEqual(len(service.validate(req,Context())),64)
        req.raw_word_input='tampered'
        with self.assertRaises(Rejected) as reject:service.validate(req,Context())
        self.assertEqual(reject.exception.args[0],grpc.StatusCode.UNAUTHENTICATED)
    def test_signed_nonfinite_load_is_rejected(self):
        key=Ed25519PrivateKey.generate();pub=key.public_key().public_bytes(serialization.Encoding.Raw,serialization.PublicFormat.Raw)
        service=Service.__new__(Service);service.authority=key.public_key();service.authority_id=hashlib.sha256(pub).hexdigest()
        req=pb.TriadMatrixHopRequest(request_id='unit',raw_word_input='bounded input',target_git_revision='a'*40,current_load_factor=math.nan,authority_key_id=service.authority_id)
        req.authority_signature=base64.b64encode(key.sign(signing_bytes(req))).decode()
        with self.assertRaises(Rejected) as reject:service.validate(req,Context())
        self.assertEqual(reject.exception.args[0],grpc.StatusCode.INVALID_ARGUMENT)
if __name__=='__main__':unittest.main()
