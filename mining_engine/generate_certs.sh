#!/bin/bash

# Stratum Control Centre - TLS Certificate Generator
# Generates a self-signed RSA 4096 certificate for HTTPS interface protection.

echo "[TLS_PROVISIONING] Generating self-signed certificate and private key..."

openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -sha256 -days 365 -nodes \
  -subj "/C=US/ST=Cloud/L=Virtual/O=Braink/OU=StratumEngine/CN=localhost"

if [ $? -eq 0 ]; then
    chmod 600 key.pem
    chmod 644 cert.pem
    echo "[SUCCESS] key.pem and cert.pem generated successfully."
else
    echo "[FAILURE] Failed to generate certificates. Ensure OpenSSL is installed."
    exit 1
fi
