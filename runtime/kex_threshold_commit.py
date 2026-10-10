"""Opt-in KEX admission + sealed local VFS commit. No signer or network spawning."""
import hashlib
import hmac
import json
import struct
import zlib
from pathlib import Path
from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
try:
    from . import canonical_lineage as lineage
    from .serverspace_substrate import encoded, secure_root
    from .web4_admission import Web4Runtime, AdmissionError
except ImportError:
    import canonical_lineage as lineage
    from serverspace_substrate import encoded, secure_root
    from web4_admission import Web4Runtime, AdmissionError

L = 2**252 + 27742317777372353535851937790883648493


class GroupVerifier:
    def __init__(self, registered_public_key, point_validator):
        if type(registered_public_key) is not bytes or len(registered_public_key) != 32 or point_validator is None or point_validator(registered_public_key) is not True:
            raise ValueError('REGISTERED_PRIME_ORDER_GROUP_KEY_REQUIRED')
        self.public_key = registered_public_key
        self.point_validator = point_validator
        self.key = Ed25519PublicKey.from_public_bytes(registered_public_key)

    def verify(self, signature, context):
        if type(signature) is not bytes or len(signature) != 64 or type(context) is not bytes or len(context) != 52:
            return False
        if int.from_bytes(signature[32:],'little') >= L or self.point_validator(signature[:32]) is not True:
            return False
        try: self.key.verify(signature, context); return True
        except InvalidSignature: return False


class RawPayloadHMAC:
    """Explicit experimental profile. Does not substitute for owner KEX geometry."""
    profile = 'experimental-raw-payload-hmac-sha256-v1'
    def __init__(self, key):
        if type(key) is not bytes or len(key) < 32: raise ValueError('PAYLOAD_AUTHENTICATION_KEY_REQUIRED')
        self.key = key
    def validate(self, context, target, payload):
        return hmac.compare_digest(target, hmac.new(self.key,payload,hashlib.sha256).digest())


class OneEnvelope:
    def __init__(self, wire, payload): self.wire, self.payload = wire, payload
    def receive(self): return self.wire, self.payload


class EpochLedger:
    def __init__(self, root, namespace, initial_floor, request_id, verifier, payload_validator, custody):
        if type(initial_floor) is not int or not 0 <= initial_floor < 2**64: raise ValueError('INVALID_EPOCH_FLOOR')
        required={'source_custody_identity','whole_identity','variable_X','environment','family','parent_context'}
        if set(custody)!=required or any(type(x) is not str or not x for x in custody.values()): raise ValueError('EXPLICIT_CUSTODY_CONTEXT_REQUIRED')
        self.root=secure_root(root);self.namespace=namespace;self.initial_floor=initial_floor;self.request_id=request_id;self.verifier=verifier;self.payload_validator=payload_validator;self.custody=dict(custody)
        self.floor=None;self.revision=None

    def datasets(self, epoch, wire, payload):
        metadata={'epoch':epoch,'group_public_key':self.verifier.public_key.hex(),'payload_profile':self.payload_validator.profile,'custody':self.custody,'authority':'authenticated group signature; canonical consilience not asserted'}
        return {'admission':encoded(metadata),'wire':wire,'payload':payload}

    def epoch_floor(self):
        state, entries=lineage.recover(self.root,self.namespace)
        self.revision=state['revision'] if state else 0
        self.floor=self.initial_floor
        if state:
            metadata=json.loads(bytes.fromhex(state['datasets']['admission']['hex']))
            if metadata['group_public_key']!=self.verifier.public_key.hex() or metadata['payload_profile']!=self.payload_validator.profile or metadata['custody']!=self.custody:
                raise AdmissionError('DURABLE_AUTHORITY_CONTEXT_MISMATCH')
            if type(metadata['epoch']) is not int or not self.initial_floor < metadata['epoch'] < 2**64: raise AdmissionError('INVALID_DURABLE_EPOCH')
            self.floor=metadata['epoch']
        return self.floor

    def accept(self, floor, epoch, wire, payload):
        if floor!=self.floor or epoch<=floor or self.revision is None: raise AdmissionError('EPOCH_FENCE_REJECTED')
        receipt=lineage.commit(self.root,self.namespace,self.datasets(epoch,wire,payload),self.revision,self.request_id)
        return receipt['seal']

    def retry(self, epoch, wire, payload):
        self.epoch_floor()  # verifies durable custody before receipt lookup
        _,entries=lineage.recover(self.root,self.namespace)
        for record in entries:
            if record['request_id']==self.request_id:
                # canonical writer compares the full original request digest before returning.
                return lineage.commit(self.root,self.namespace,self.datasets(epoch,wire,payload),record['revision']-1,self.request_id)['seal']
        return None


class KEXVerifiedCommit:
    def __init__(self, root, namespace, architecture, initial_floor, verifier, payload_validator, custody):
        if type(architecture) is not bytes or len(architecture)!=4: raise ValueError('CANONICAL_ARCHITECTURE_REQUIRED')
        if verifier is None or payload_validator is None: raise ValueError('AUTHENTICATION_ADAPTERS_UNBOUND')
        self.root,self.namespace,self.architecture,self.initial_floor,self.verifier,self.payload_validator,self.custody=root,namespace,architecture,initial_floor,verifier,payload_validator,custody

    def commit(self, wire, payload, request_id):
        # Preflight permits exact authenticated receipt retries without lowering epoch floors.
        if type(wire) is not bytes or len(wire)!=116: raise AdmissionError('WIRE_LENGTH_MUST_BE_116')
        context=wire[:52];magic,epoch,arch,length,target=struct.unpack('>4sQ4sI32s',context)
        if magic!=b'KEX!' or arch!=self.architecture: raise AdmissionError('MAGIC_OR_ARCHITECTURE_REJECTED')
        if type(payload) is not bytes or len(payload)!=length: raise AdmissionError('PAYLOAD_LENGTH_MISMATCH')
        if self.verifier.verify(wire[52:],context) is not True: raise AdmissionError('ED25519_VERIFICATION_FAILED')
        if self.payload_validator.validate(context,target,payload) is not True: raise AdmissionError('KEX_SUBSTRATE_REJECTED')
        ledger=EpochLedger(self.root,self.namespace,self.initial_floor,request_id,self.verifier,self.payload_validator,self.custody)
        prior=ledger.retry(epoch,wire,payload)
        if prior is not None:return prior
        runtime=Web4Runtime(self.architecture,OneEnvelope(wire,payload),self.verifier,self.payload_validator,ledger)
        return runtime.receive_update()
