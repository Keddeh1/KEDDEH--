"""Real mTLS gRPC client; never prints private credentials."""
import argparse
import base64
import hashlib
import json
from pathlib import Path
import sys
import grpc
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'runtime'));sys.path.insert(0,str(ROOT/'runtime/triad'))
import triad_mesh_pb2 as pb
import triad_mesh_pb2_grpc as rpc
from triad_grpc_server import signing_bytes

def channel(root,port=8962):
    credentials=grpc.ssl_channel_credentials((root/'ca.crt').read_bytes(),(root/'client.key').read_bytes(),(root/'client.crt').read_bytes())
    return grpc.secure_channel('127.0.0.1:'+str(port),credentials,options=[
        ('grpc.max_receive_message_length',1024*1024),
        ('grpc.initial_reconnect_backoff_ms',100),
        ('grpc.min_reconnect_backoff_ms',100),
        ('grpc.max_reconnect_backoff_ms',1000)])
def signed(root,request_id,goal,revision,load=0):
    request=pb.TriadMatrixHopRequest(raw_word_input=goal,target_git_revision=revision,current_load_factor=load,request_id=request_id,authority_key_id=hashlib.sha256((root/'authority.pub').read_bytes()).hexdigest())
    request.authority_signature=base64.b64encode(Ed25519PrivateKey.from_private_bytes((root/'authority.key').read_bytes()).sign(signing_bytes(request))).decode()
    return request
if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--root',type=Path,required=True);parser.add_argument('--health',action='store_true');parser.add_argument('--request-id');parser.add_argument('--goal');args=parser.parse_args()
    config=json.loads((args.root/'config.json').read_text())
    with channel(args.root,config['port']) as connection:
        client=rpc.TriadMeshOrchestratorStub(connection)
        if args.health:
            response=client.Readiness(pb.TriadReadinessRequest(),timeout=10)
            if response.readiness_mask!=7 or not response.ledger_integrity:raise RuntimeError('Readiness rejected')
            print(json.dumps({'readiness_mask':response.readiness_mask,'ledger_integrity':response.ledger_integrity,'node_identity':response.node_identity,'revision':response.source_git_revision}))
        else:
            response=client.TraversalMatrixHop(signed(args.root,args.request_id,args.goal,config['revision']),timeout=45)
            from google.protobuf.json_format import MessageToDict
            print(json.dumps(MessageToDict(response,preserving_proto_field_name=True)))
