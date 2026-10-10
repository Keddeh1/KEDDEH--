"""Real local threshold arithmetic, independent Ed25519 backend and real disk writes."""
import importlib.util,json,sys,os,struct,tempfile,hmac,hashlib
from pathlib import Path
import unittest
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'runtime'))
spec=importlib.util.spec_from_file_location('frost',ROOT/'experiments/frost_threshold_harness.py');f=importlib.util.module_from_spec(spec);spec.loader.exec_module(f);sys.modules['frost_threshold_harness']=f;sys.path.insert(0,str(ROOT/'experiments'))
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
from kex_threshold_commit import GroupVerifier,RawPayloadHMAC,KEXVerifiedCommit
import canonical_lineage as lineage

def valid_point(data):return f.point_decode(data) is not None

def sign(dealer, message):
    ids=[1,3];participants=[f.FROSTParticipant(i,dealer.secret_shares[i],dealer.group_public_key) for i in ids]
    commitments=[p.round_1_generate_nonces() for p in participants]
    shares={p.index:p.round_2_sign_share(message,commitments,ids,dealer) for p in participants}
    return f.FROSTAggregator.aggregate(message,commitments,shares,dealer.group_public_key,dealer.public_shares,dealer.t)

class FrostTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.dealer=f.FROSTDealer(2,3);cls.public=f.point_encode(cls.dealer.group_public_key);cls.key=os.urandom(32);cls.payload=b'actual verified register transition'
        cls.target=hmac.new(cls.key,cls.payload,hashlib.sha256).digest();cls.message=struct.pack('>4sQ4sI32s',b'KEX!',105,b'ARM6',len(cls.payload),cls.target);cls.signature=sign(cls.dealer,cls.message);cls.wire=cls.message+cls.signature
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.root=Path(self.temp.name)
        self.custody={'source_custody_identity':'test-source','whole_identity':'whole-A','variable_X':'X','environment':'isolated-test','family':'family-A','parent_context':'parent-A'}
        self.bridge=KEXVerifiedCommit(self.root,'test-context',b'ARM6',100,GroupVerifier(self.public,valid_point),RawPayloadHMAC(self.key),self.custody)
    def tearDown(self):self.temp.cleanup()
    def test_01_authentic_envelope_independent_backend_and_sealed_receipt(self):
        self.assertEqual(len(self.wire),116);Ed25519PublicKey.from_public_bytes(self.public).verify(self.signature,self.message)
        receipt=self.bridge.commit(self.wire,self.payload,'command-1');state,entries=lineage.recover(self.root,'test-context')
        self.assertEqual(receipt,entries[-1]['seal']);self.assertEqual(bytes.fromhex(state['datasets']['wire']['hex']),self.wire)
        self.assertEqual(self.bridge.commit(self.wire,self.payload,'command-1'),receipt)
        self.assertEqual(len(lineage.recover(self.root,'test-context')[1]),1)
    def test_02_tampered_header_cannot_create_state(self):
        wire=bytearray(self.wire);wire[6]^=1
        with self.assertRaises(Exception):self.bridge.commit(bytes(wire),self.payload,'bad')
        self.assertFalse((self.root/'canonical-state.json').exists())
    def test_03_corrupted_signature_cannot_create_state(self):
        wire=bytearray(self.wire);wire[60]^=0xff
        with self.assertRaises(Exception):self.bridge.commit(bytes(wire),self.payload,'bad')
        self.assertFalse((self.root/'canonical-state.json').exists())
    def test_04_signed_epoch_downgrade_and_same_epoch_replay(self):
        message=struct.pack('>4sQ4sI32s',b'KEX!',95,b'ARM6',len(self.payload),self.target)
        with self.assertRaisesRegex(Exception,'REPLAY_OR_DOWNGRADE'):self.bridge.commit(message+sign(self.dealer,message),self.payload,'old')
        self.bridge.commit(self.wire,self.payload,'one')
        with self.assertRaisesRegex(Exception,'REPLAY_OR_DOWNGRADE'):self.bridge.commit(self.wire,self.payload,'different-command')
        self.assertEqual(len(lineage.recover(self.root,'test-context')[1]),1)
    def test_05_foreign_group_rejected(self):
        foreign=f.FROSTDealer(2,3);verifier=GroupVerifier(f.point_encode(foreign.group_public_key),valid_point)
        self.assertFalse(verifier.verify(self.signature,self.message))
    def test_06_payload_tamper_hmac_and_lengths(self):
        bad=b'x'*len(self.payload)
        with self.assertRaisesRegex(Exception,'KEX_SUBSTRATE_REJECTED'):self.bridge.commit(self.wire,bad,'bad')
        for wire,payload in [(self.wire[:-1],self.payload),(self.wire,self.payload+b'x')]:
            with self.assertRaises(Exception):self.bridge.commit(wire,payload,'bad')
        self.assertFalse((self.root/'canonical-state.json').exists())
    def test_07_codec_parity_subgroup_identity_and_noncanonical(self):
        for scalar in [1,2,3]:
            point=f.scalar_mult(f.G,scalar);self.assertEqual(f.point_decode(f.point_encode(point)),point)
        for data in [(1).to_bytes(32,'little'),(f.P-1).to_bytes(32,'little'),f.P.to_bytes(32,'little'),(1+(1<<255)).to_bytes(32,'little'),bytes(32)]:
            self.assertIsNone(f.point_decode(data))
        with self.assertRaises(ValueError):GroupVerifier((1).to_bytes(32,'little'),valid_point)
        self.assertFalse(GroupVerifier(self.public,valid_point).verify(self.signature[:32]+f.L.to_bytes(32,'little'),self.message))
    def test_08_nonce_one_use_and_threshold_enforcement(self):
        signer=f.FROSTParticipant(1,self.dealer.secret_shares[1],self.dealer.group_public_key);commitment=signer.round_1_generate_nonces()
        with self.assertRaisesRegex(ValueError,'NONCES_ALREADY_PENDING'):signer.round_1_generate_nonces()
        with self.assertRaises(ValueError):signer.round_2_sign_share(self.message,[commitment],[1],self.dealer)
        with self.assertRaisesRegex(ValueError,'NONCES_ALREADY_CONSUMED'):signer.round_2_sign_share(self.message,[commitment],[1],self.dealer)
        with self.assertRaises(ValueError):f.FROSTAggregator.aggregate(self.message,[commitment],{1:0},self.dealer.group_public_key,self.dealer.public_shares,2)
    def test_09_bad_share_and_duplicate_commitment_attribution(self):
        ids=[1,3];ps=[f.FROSTParticipant(i,self.dealer.secret_shares[i],self.dealer.group_public_key) for i in ids];cs=[p.round_1_generate_nonces() for p in ps];shares={p.index:p.round_2_sign_share(self.message,cs,ids,self.dealer) for p in ps};shares[1]=(shares[1]+1)%f.L
        with self.assertRaisesRegex(ValueError,'INVALID_SIGNATURE_SHARE'):f.FROSTAggregator.aggregate(self.message,cs,shares,self.dealer.group_public_key,self.dealer.public_shares,2)
        with self.assertRaises(ValueError):f.checked_commitments([cs[0],cs[0]])
    def test_11_fault_incident_blocks_commit_and_fresh_session_recovers(self):
        from frost_kex_commit import aggregate_and_commit
        import incident_ledger
        ids=[1,3];ps=[f.FROSTParticipant(i,self.dealer.secret_shares[i],self.dealer.group_public_key) for i in ids]
        cs=[p.round_1_generate_nonces() for p in ps]
        shares={p.index:p.round_2_sign_share(self.message,cs,ids,self.dealer) for p in ps}
        shares[3]=(shares[3]+1)%f.L
        with self.assertRaises(f.SignatureShareError) as caught:
            aggregate_and_commit(self.bridge,self.message,cs,shares,self.dealer.group_public_key,self.dealer.public_shares,2,self.payload,'fault')
        self.assertEqual(caught.exception.participant_id,3)
        self.assertFalse((self.root/'canonical-state.json').exists())
        self.assertFalse((self.root/'LINEAGE_AUDIT_LEDGER.jsonl').exists())
        records=[json.loads(x) for x in (self.root/'.braink/it_incidents/IT_INCIDENT_DISPATCH_LEDGER.ndjson').read_text().splitlines()]
        incident_ledger.check(records);self.assertEqual(records[-1]['details']['participant_id'],3)
        ps=[f.FROSTParticipant(i,self.dealer.secret_shares[i],self.dealer.group_public_key) for i in ids]
        cs=[p.round_1_generate_nonces() for p in ps];shares={p.index:p.round_2_sign_share(self.message,cs,ids,self.dealer) for p in ps}
        receipt=aggregate_and_commit(self.bridge,self.message,cs,shares,self.dealer.group_public_key,self.dealer.public_shares,2,self.payload,'fresh')
        self.assertEqual(receipt,lineage.recover(self.root,'test-context')[1][-1]['seal'])
    def test_10_rfc9591_appendix_e1_exact_transcript_and_signature(self):
        public=bytes.fromhex('15d21ccd7ee42959562fc8aa63224c8851fb3ec85a3faf66040d380fb9738673');Y=f.point_decode(public);message=b'test'
        commits=[(1,bytes.fromhex('b5aa8ab305882a6fc69cbee9327e5a45e54c08af61ae77cb8207be3d2ce13de3'),bytes.fromhex('67e98ab55aa310c3120418e5050c9cf76cf387cb20ac9e4b6fdb6f82a469f932')),(3,bytes.fromhex('cfbdb165bd8aad6eb79deb8d287bcc0ab6658ae57fdcc98ed12c0669e90aec91'),bytes.fromhex('7487bc41a6e712eea2f2af24681b58b1cf1da278ea11fe4e8b78398965f13552'))]
        B=f.commitment_bytes(commits)
        self.assertEqual(f.binding_factor(1,message,B,Y).to_bytes(32,'little').hex(),'f2cb9d7dd9beff688da6fcc83fa89046b3479417f47f55600b106760eb3b5603')
        self.assertEqual(f.binding_factor(3,message,B,Y).to_bytes(32,'little').hex(),'b087686bf35a13f3dc78e780a34b0fe8a77fef1b9938c563f5573d71d8d7890f')
        secrets={1:int.from_bytes(bytes.fromhex('929dcc590407aae7d388761cddb0c0db6f5627aea8e217f4a033f2ec83d93509'),'little'),3:int.from_bytes(bytes.fromhex('d3cb090a075eb154e82fdb4b3cb507f110040905468bb9c46da8bdea643a9a02'),'little')}
        shares={1:int.from_bytes(bytes.fromhex('001719ab5a53ee1a12095cd088fd149702c0720ce5fd2f29dbecf24b7281b603'),'little'),3:int.from_bytes(bytes.fromhex('bd86125de990acc5e1f13781d8e32c03a9bbd4c53539bbc106058bfd14326007'),'little')}
        sig=f.FROSTAggregator.aggregate(message,commits,shares,Y,{i:f.scalar_mult(f.G,s) for i,s in secrets.items()},2)
        expected='36282629c383bb820a88b71cae937d41f2f2adfcc3d02e55507e2fb9e2dd3cbebd9d2b0844e49ae0f3fa935161e1419aab7b47d21a37ebeae1f17d4987b3160b'
        self.assertEqual(sig.hex(),expected);Ed25519PublicKey.from_public_bytes(public).verify(sig,message)
if __name__=='__main__':unittest.main()
