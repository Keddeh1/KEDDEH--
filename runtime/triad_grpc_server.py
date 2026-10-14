"""Authenticated gRPC canary over existing MCP/BRAINK/VFS durable contracts."""
import argparse
import base64
from concurrent import futures
from contextlib import contextmanager
import hashlib
import json
import math
from pathlib import Path
import re
import resource
import signal
import sqlite3
import subprocess
import sys
import threading
import time
import grpc
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'runtime/triad'))
from calibration import Calibration
import triad_mesh_pb2 as pb
import triad_mesh_pb2_grpc as rpc
from serverspace_substrate import call,secured

SIGNING_CONTEXT=b'keddeh.triad.v1.request\x00'
def signing_bytes(request):
    copy=pb.TriadMatrixHopRequest();copy.CopyFrom(request);copy.authority_signature=''
    return SIGNING_CONTEXT+copy.SerializeToString(deterministic=True)

def sdk(config,request,timeout=45):
    result=subprocess.run([config['node'],str(ROOT/'scripts/triad-sdk-request.mjs'),config['mcp_config']],input=json.dumps(request),capture_output=True,text=True,timeout=timeout)
    if result.returncode!=0:raise RuntimeError('MCP_BACKING_UNAVAILABLE_RETRY_SAME_REQUEST')
    return json.loads(result.stdout)

class Service(rpc.TriadMeshOrchestratorServicer):
    def __init__(self,config):
        self.config=config;self.root=secured(config['runtime_root']);self.revision=config['revision']
        self.authority=Ed25519PublicKey.from_public_bytes((self.root/'authority.pub').read_bytes())
        self.authority_id=hashlib.sha256((self.root/'authority.pub').read_bytes()).hexdigest()
        self.lock=threading.Lock();self.active_lock=threading.Lock();self.active=0
        self.calibration=Calibration();self.db=self.root/'triad.sqlite3'
        if self.db.is_symlink():raise ValueError('Ledger symlink rejected')
        with self.connect() as db:
            db.execute('CREATE TABLE IF NOT EXISTS requests (id TEXT PRIMARY KEY, digest TEXT NOT NULL, response BLOB NOT NULL, response_digest TEXT NOT NULL)')
        self.db.chmod(0o600)
    @contextmanager
    def connect(self):
        db=sqlite3.connect(self.db,timeout=2)
        try:
            db.execute('PRAGMA synchronous=FULL');db.execute('PRAGMA journal_mode=WAL')
            yield db
            db.commit()
        except BaseException:
            db.rollback()
            raise
        finally:
            db.close()
    def validate(self,request,context):
        if request.authority_key_id!=self.authority_id:
            context.abort(grpc.StatusCode.UNAUTHENTICATED,'PINNED_AUTHORITY_REJECTED')
        try:self.authority.verify(base64.b64decode(request.authority_signature,validate=True),signing_bytes(request))
        except Exception:context.abort(grpc.StatusCode.UNAUTHENTICATED,'ED25519_SIGNATURE_REJECTED')
        if not re.fullmatch(r'[A-Za-z0-9_-]{1,64}',request.request_id):context.abort(grpc.StatusCode.INVALID_ARGUMENT,'REQUEST_ID_REQUIRED')
        if not request.raw_word_input.strip() or len(request.raw_word_input.encode())>4096:context.abort(grpc.StatusCode.INVALID_ARGUMENT,'BOUNDED_INPUT_REQUIRED')
        if not math.isfinite(request.current_load_factor) or request.current_load_factor<0:context.abort(grpc.StatusCode.INVALID_ARGUMENT,'INVALID_DECLARED_LOAD')
        if not re.fullmatch(r'[0-9a-f]{40}',request.target_git_revision):context.abort(grpc.StatusCode.INVALID_ARGUMENT,'FULL_REVISION_REQUIRED')
        return hashlib.sha256(signing_bytes(request)).hexdigest()
    def read(self,db,request,digest,context):
        row=db.execute('SELECT digest,response,response_digest FROM requests WHERE id=?',(self.authority_id+':'+request.request_id,)).fetchone()
        if not row:return None
        if row[0]!=digest:context.abort(grpc.StatusCode.ALREADY_EXISTS,'REQUEST_ID_CONTEXT_CONFLICT')
        if hashlib.sha256(row[1]).hexdigest()!=row[2]:context.abort(grpc.StatusCode.DATA_LOSS,'DURABLE_RESPONSE_DIGEST_MISMATCH')
        return pb.TriadMatrixHopResponse.FromString(row[1])
    def probe(self):
        with self.active_lock:contention=self.active/4
        for _ in range(8):
            start=time.perf_counter_ns();state=call(Path(self.config['substrate_root']))
            if state['readiness_mask']!=7:raise RuntimeError('SUBSTRATE_NOT_READY')
            latency=(time.perf_counter_ns()-start)/1e6
            self.calibration.observe(latency,contention,self.calibration.disk_busy())
        return state
    def Readiness(self,request,context):
        with self.active_lock:self.active+=1
        try:
            self.probe();sdk(self.config,{'operation':'health'},10)
            with self.connect() as db:
                for wire,digest in db.execute('SELECT response,response_digest FROM requests'):
                    if hashlib.sha256(wire).hexdigest()!=digest:
                        context.abort(grpc.StatusCode.DATA_LOSS,'DURABLE_RESPONSE_DIGEST_MISMATCH')
            return pb.TriadReadinessResponse(readiness_mask=7,node_identity=self.config['node_identity'],source_git_revision=self.revision,ledger_integrity=True)
        except (RuntimeError,OSError,subprocess.TimeoutExpired,sqlite3.Error):
            context.abort(grpc.StatusCode.UNAVAILABLE,'BACKING_NOT_READY')
        finally:
            with self.active_lock:self.active-=1
    def TraversalMatrixHop(self,request,context):
        digest=self.validate(request,context)
        with self.active_lock:self.active+=1
        locked=False
        try:
            remaining=context.time_remaining()
            if remaining is not None and remaining<=0:context.abort(grpc.StatusCode.DEADLINE_EXCEEDED,'REQUEST_DEADLINE_EXPIRED')
            locked=self.lock.acquire(timeout=min(2,remaining) if remaining is not None else 2)
            if not locked:context.abort(grpc.StatusCode.RESOURCE_EXHAUSTED,'RETRY_SAME_REQUEST')
            with self.connect() as db:
                db.execute('BEGIN IMMEDIATE')
                prior=self.read(db,request,digest,context)
                if prior:return prior
                if request.target_git_revision!=self.revision:context.abort(grpc.StatusCode.FAILED_PRECONDITION,'TARGET_REVISION_NOT_DEPLOYED')
                self.probe()
                family_id='triad-'+hashlib.sha256((self.authority_id+':'+request.request_id).encode()).hexdigest()
                remaining=context.time_remaining()
                if remaining is not None and remaining<=0:context.abort(grpc.StatusCode.DEADLINE_EXCEEDED,'REQUEST_DEADLINE_EXPIRED')
                backed=sdk(self.config,{'operation':'commit','family_id':family_id,'goal':request.raw_word_input,'revision':self.revision},min(45,remaining) if remaining is not None else 45)
                result=pb.TriadMatrixHopResponse(status=pb.MATRIX_STATUS_VERIFIED_OPERATIONAL,authority_lock=self.authority_id,
                    timestamp_epoch_ns=time.time_ns(),request_id=request.request_id,readiness_mask=backed['readiness_mask'],
                    receipt_digests=backed['family']['receipt_digests'],measured_metrics=pb.CalibrationMetrics(**self.calibration.snapshot()),
                    registrar_constraint=pb.RegistrarConstraint(verified=False,status='UNCONFIGURED_ISOLATED',affects_braink_admission=False))
                result.concept.word_processed=request.raw_word_input
                result.concept.assigned_node_id=self.config['node_identity']
                result.concept.vfs_mount_path=backed['artifact']['path']
                result.execution.il_llm_state=backed['family']['claim']['status']
                result.execution.braink_verdict='DURABLE_FAMILY_COMMITTED_SIGNATURE_VERIFIED'
                result.integration.sdk_commit_verified=True
                result.integration.mcp_transport_version=backed['protocol_version']
                result.integration.provenance.source_git_revision=self.revision
                result.vfs_receipt_digest=backed['receipt']['receipt_digest']
                result.vfs_artifact_digest=backed['artifact']['digest']
                result.declared_load_factor=request.current_load_factor
                wire=result.SerializeToString(deterministic=True)
                db.execute('INSERT INTO requests VALUES (?,?,?,?)',(self.authority_id+':'+request.request_id,digest,wire,hashlib.sha256(wire).hexdigest()))
                db.commit()
                return result
        except (subprocess.TimeoutExpired,RuntimeError,OSError,sqlite3.Error,ValueError):
            context.abort(grpc.StatusCode.UNAVAILABLE,'BACKING_FAILURE_RECONCILE_SAME_REQUEST')
        finally:
            if locked:self.lock.release()
            with self.active_lock:self.active-=1
    def StreamMatrixTelemetry(self,request,context):
        digest=self.validate(request,context)
        with self.active_lock:self.active+=1
        try:
            with self.connect() as db:prior=self.read(db,request,digest,context)
            if prior is None:context.abort(grpc.StatusCode.NOT_FOUND,'COMMIT_REQUIRED_BEFORE_TELEMETRY')
            deadline=time.monotonic()+30
            while context.is_active() and time.monotonic()<deadline:
                response=pb.TriadMatrixHopResponse();response.CopyFrom(prior)
                try:
                    self.probe();response.readiness_mask=7
                    response.measured_metrics.CopyFrom(pb.CalibrationMetrics(**self.calibration.snapshot()))
                except Exception:
                    response.status=pb.MATRIX_STATUS_PENDING;response.readiness_mask=0
                response.timestamp_epoch_ns=time.time_ns()
                yield response
                # Bound stream occupation and permit cancellation without a long blocking sleep.
                for _ in range(10):
                    if not context.is_active():return
                    time.sleep(.1)
        finally:
            with self.active_lock:self.active-=1

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--config',type=Path,required=True);args=parser.parse_args()
    config=json.loads(args.config.read_text());root=secured(config['runtime_root'])
    # V8 backing clients reserve virtual address space; this is not a resident-memory limit.
    resource.setrlimit(resource.RLIMIT_AS,(32*1024**3,32*1024**3))
    resource.setrlimit(resource.RLIMIT_NOFILE,(256,256))
    resource.setrlimit(resource.RLIMIT_CORE,(0,0))
    service=Service(config)
    credentials=grpc.ssl_server_credentials([( (root/'server.key').read_bytes(),(root/'server.crt').read_bytes())],root_certificates=(root/'ca.crt').read_bytes(),require_client_auth=True)
    server=grpc.server(futures.ThreadPoolExecutor(max_workers=4),maximum_concurrent_rpcs=4,
        options=[('grpc.max_receive_message_length',16384),('grpc.max_send_message_length',1024*1024)])
    rpc.add_TriadMeshOrchestratorServicer_to_server(service,server)
    if not server.add_secure_port('127.0.0.1:'+str(config['port']),credentials):raise RuntimeError('GRPC_BIND_FAILED')
    # Actual substrate handshake occurs before accepting requests.
    while True:
        try:
            service.probe();sdk(config,{'operation':'health'});break
        except Exception:time.sleep(.5)
    server.start()
    signal.signal(signal.SIGTERM,lambda *_:server.stop(3))
    server.wait_for_termination()

if __name__=='__main__':main()
