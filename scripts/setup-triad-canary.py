"""Provision an additive mTLS gRPC node using existing substrate/MCP backing services."""
import datetime
import argparse
import hashlib
import ipaddress
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import uuid
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'runtime'))
from serverspace_substrate import secured
from cryptography import x509
from cryptography.hazmat.primitives import hashes,serialization
from cryptography.hazmat.primitives.asymmetric import ec,ed25519
from cryptography.x509.oid import NameOID,ExtendedKeyUsageOID
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--deployments',type=Path,default=Path('/workspace/deployments'))
parser.add_argument('--port',type=int,default=8962)
parser.add_argument('--node-identity')
parser.add_argument('--configure-only',action='store_true')
args=parser.parse_args();deployments=args.deployments.resolve()
root=deployments/'serverspace/runtime/triad-v1'
root.mkdir(mode=0o700,parents=True,exist_ok=True);secured(root)
for p in root.iterdir():
    if p.is_symlink():raise RuntimeError('Runtime symlink rejected')

def private(name,data):
    fd=os.open(root/name,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
    with os.fdopen(fd,'wb') as f:f.write(data);f.flush();os.fsync(f.fileno())
# Never rotate or overwrite existing private material as a setup side effect.
materials=['ca.key','ca.crt','server.key','server.crt','client.key','client.crt','authority.key','authority.pub']
if not any((root/p).exists() for p in materials):
    now=datetime.datetime.now(datetime.timezone.utc)
    ca=ec.generate_private_key(ec.SECP256R1());name=x509.Name([x509.NameAttribute(NameOID.COMMON_NAME,'Keddeh Triad canary CA')])
    cert=(x509.CertificateBuilder().subject_name(name).issuer_name(name).public_key(ca.public_key()).serial_number(x509.random_serial_number()).not_valid_before(now-datetime.timedelta(minutes=1)).not_valid_after(now+datetime.timedelta(days=90)).add_extension(x509.BasicConstraints(ca=True,path_length=0),critical=True).sign(ca,hashes.SHA256()))
    def keybytes(key):return key.private_bytes(serialization.Encoding.PEM,serialization.PrivateFormat.PKCS8,serialization.NoEncryption())
    private('ca.key',keybytes(ca));private('ca.crt',cert.public_bytes(serialization.Encoding.PEM))
    for role,cn,usage in [('server','localhost',ExtendedKeyUsageOID.SERVER_AUTH),('client','triad-authority',ExtendedKeyUsageOID.CLIENT_AUTH)]:
        key=ec.generate_private_key(ec.SECP256R1())
        builder=x509.CertificateBuilder().subject_name(x509.Name([x509.NameAttribute(NameOID.COMMON_NAME,cn)])).issuer_name(name).public_key(key.public_key()).serial_number(x509.random_serial_number()).not_valid_before(now-datetime.timedelta(minutes=1)).not_valid_after(now+datetime.timedelta(days=30)).add_extension(x509.BasicConstraints(ca=False,path_length=None),critical=True).add_extension(x509.ExtendedKeyUsage([usage]),critical=False)
        if role=='server':builder=builder.add_extension(x509.SubjectAlternativeName([x509.DNSName('localhost'),x509.IPAddress(ipaddress.ip_address('127.0.0.1'))]),critical=False)
        private(role+'.key',keybytes(key));private(role+'.crt',builder.sign(ca,hashes.SHA256()).public_bytes(serialization.Encoding.PEM))
    authority=ed25519.Ed25519PrivateKey.generate()
    private('authority.key',authority.private_bytes(serialization.Encoding.Raw,serialization.PrivateFormat.Raw,serialization.NoEncryption()))
    private('authority.pub',authority.public_key().public_bytes(serialization.Encoding.Raw,serialization.PublicFormat.Raw))
if not all((root/p).is_file() for p in materials):raise RuntimeError('Incomplete provisioning; preserve it for reconciliation')
path=root/'config.json';old=json.loads(path.read_text()) if path.exists() else {}
identity=old.get('node_identity') or args.node_identity or 'serverspace://canary/triad/'+uuid.uuid4().hex
if args.node_identity and args.node_identity!=identity:raise RuntimeError('Existing node identity cannot be replaced by setup')
revision=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip() if (ROOT/'.git').exists() else json.loads((ROOT/'service-bundle-manifest.json').read_text())['source_revision']
config={'runtime_root':str(root),'substrate_root':str(deployments/'serverspace/runtime/canary-v1'),'mcp_config':str(deployments/'keddeh-mcp-sdk/services.json'),'port':args.port,'node':shutil.which('node'),'node_identity':identity,'revision':revision}
path.write_text(json.dumps(config,indent=2)+'\n');path.chmod(0o600)
estate=deployments/'service-estate';file=estate/'service-addons.json';addons=json.loads(file.read_text()) if file.exists() else {}
python=str(ROOT/'.triad-env/bin/python')
service={'kind':'grpc','command':[python,str(ROOT/'runtime/triad_grpc_server.py'),'--config',str(path)],'cwd':str(ROOT),'health_command':[python,str(ROOT/'scripts/triad-client.py'),'--root',str(root),'--health'],'health_interval_seconds':5,'health_timeout_seconds':12}
name='triad-grpc-canary'
if name in addons and addons[name]!=service:raise RuntimeError('Existing canary binding differs; refusing blind replacement')
addons[name]=service;file.write_text(json.dumps(addons,indent=2)+'\n');file.chmod(0o600)
subprocess.run([sys.executable,str(ROOT/'scripts/setup-service-estate.py'),'--deployments',str(deployments),*(['--configure-only'] if args.configure_only else [])],check=True)
