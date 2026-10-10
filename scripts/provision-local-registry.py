"""Provision actual credentials for a private local deployment; never overwrite existing keys."""
import argparse
import base64
from datetime import datetime, timedelta, timezone
import ipaddress
import json
import os
from pathlib import Path
import secrets
from cryptography import x509
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.x509.oid import NameOID


def provision(root):
    root = Path(root)
    root.mkdir(mode=0o700, parents=True, exist_ok=False)
    def write(name, value):
        with open(root / name, 'xb') as stream:
            os.chmod(root / name, 0o600)
            stream.write(value)
            stream.flush()
            os.fsync(stream.fileno())
    tls_key = Ed25519PrivateKey.generate()
    name = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, 'localhost')])
    now = datetime.now(timezone.utc)
    cert = (x509.CertificateBuilder().subject_name(name).issuer_name(name)
            .public_key(tls_key.public_key()).serial_number(x509.random_serial_number())
            .not_valid_before(now - timedelta(minutes=1)).not_valid_after(now + timedelta(days=90))
            .add_extension(x509.SubjectAlternativeName([x509.DNSName('localhost'), x509.IPAddress(ipaddress.ip_address('127.0.0.1'))]), critical=False)
            .add_extension(x509.BasicConstraints(ca=False, path_length=None), critical=True)
            .add_extension(x509.ExtendedKeyUsage([x509.oid.ExtendedKeyUsageOID.SERVER_AUTH]), critical=False)
            .sign(tls_key, algorithm=None))
    write('tls.key', tls_key.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8, serialization.NoEncryption()))
    write('tls.crt', cert.public_bytes(serialization.Encoding.PEM))
    generator = Ed25519PrivateKey.generate()
    write('generator.key', generator.private_bytes_raw())
    executor = Ed25519PrivateKey.generate()
    write('circuit-executor.key', executor.private_bytes_raw())
    write('trust.json', json.dumps({'local-deployment-generator': {'public_key': base64.b64encode(generator.public_key().public_bytes_raw()).decode(), 'roles': ['generator'], 'runtime_ids': ['runtime://kex/core']}, 'local-circuit-executor': {'public_key': base64.b64encode(executor.public_key().public_bytes_raw()).decode(), 'roles': ['generator'], 'runtime_ids': ['runtime://keddeh/quantum-computer']}}).encode())
    write('registry.token', secrets.token_urlsafe(48).encode())
    fd = os.open(root, os.O_RDONLY | os.O_DIRECTORY)
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--deployment', required=True)
    provision(parser.parse_args().deployment)
