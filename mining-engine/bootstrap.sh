#!/usr/bin/env bash
# =====================================================================
# SYSTEM DEPLOYMENT BOOTSTRAP ENVIRONMENT SCRIPT | PROFILE: keddeh
# Verification Timestamp: Saturday, 26 September 2026
# =====================================================================
set -euo pipefail

TARGET_DIR="/opt/stratum_engine"
SERVICE_NAME="stratum.service"

echo "[*] Step 1/5: Verifying absolute directory pathways..."
sudo mkdir -p "${TARGET_DIR}"
sudo chown -R "$(id -u):$(id -g)" "${TARGET_DIR}"

echo "[*] Step 2/5: Provisioning isolated Python virtual environment context..."
python3 -m venv "${TARGET_DIR}/.venv"

echo "[*] Step 3/5: Syncing non-stubbed python source assets into execution directory..."
cp main.py stratum_engine.py control_server.py "${TARGET_DIR}/"

echo "[*] Step 4/5: Re-generating self-signed TLS 1.3 cryptographic key specifications..."
openssl req -x509 -newkey rsa:4096 \
  -keyout "${TARGET_DIR}/key.pem" \
  -out "${TARGET_DIR}/cert.pem" \
  -sha256 -days 365 -nodes \
  -subj "/CN=localhost" 2>/dev/null

echo "[*] Step 5/5: Enforcing file permissions boundaries over keys and binaries..."
chmod 755 "${TARGET_DIR}/main.py" "${TARGET_DIR}/stratum_engine.py" "${TARGET_DIR}/control_server.py"
chmod 600 "${TARGET_DIR}/key.pem" "${TARGET_DIR}/cert.pem"

echo "[*] Writing systemd initialization configuration profile..."
sudo tee "/etc/systemd/system/${SERVICE_NAME}" > /dev/null <<EOF
[Unit]
Description=KEX BRAINK VFS Core Stratum Engine Platform (keddeh Engine)
After=network.target network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$(whoami)
WorkingDirectory=${TARGET_DIR}
ExecStart=${TARGET_DIR}/.venv/bin/python3 ${TARGET_DIR}/main.py
Environment=PYTHONUNBUFFERED=1
Environment=STRATUM_HOST=bitcoin.viabtc.io
Environment=STRATUM_PORT=3333
Environment=STRATUM_WORKER=keddeh.001
Environment=HTTPS_PORT=8443
Environment=TLS_CERT_PATH=${TARGET_DIR}/cert.pem
Environment=TLS_KEY_PATH=${TARGET_DIR}/key.pem
Environment=CONTROL_USER=admin
Environment=CONTROL_PASS=HardenYourPassword2026
Restart=always
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF

echo "[*] Triggering system control daemon matrix reload..."
sudo systemctl daemon-reload
sudo systemctl enable "${SERVICE_NAME}"
sudo systemctl restart "${SERVICE_NAME}"

echo "[+] Success! Service engine initialized under profile: keddeh"
echo "[+] Verify unbuffered log stream analytics output via: sudo journalctl -u ${SERVICE_NAME} -f"
