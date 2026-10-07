#!/bin/bash
# Production Deployment Script for Stratum Mining Engine
# Target: /opt/stratum_engine

set -e

echo "🚀 Starting Production Stratum Engine Deployment..."

# 1. Provision Directory Structure
sudo mkdir -p /opt/stratum_engine
sudo chown $USER:$USER /opt/stratum_engine

# 2. Setup Virtual Environment
echo "📦 Initializing Python 3.12 Virtual Environment..."
python3 -m venv /opt/stratum_engine/.venv
source /opt/stratum_engine/.venv/bin/activate

# 3. Install Requirements (if any)
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
fi

# 4. Copy Engine Artifacts
echo "📄 Deploying Core Client and Modular Logic..."
cp stratum_engine.py control_server.py main.py /opt/stratum_engine/
if [ -f "rolling_logger.py" ]; then
    cp rolling_logger.py /opt/stratum_engine/
fi

# 4.5 Generate TLS Certificates
echo "🔒 Securing Control Centre with TLS..."
bash generate_certs.sh
cp cert.pem key.pem /opt/stratum_engine/

# 5. Setup Systemd Service
echo "⚙️  Installing Systemd Service..."
sudo cp stratum.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable stratum.service

echo "✅ Deployment Complete."
echo "Use 'sudo systemctl start stratum.service' to launch the engine."
echo "Monitor logs with 'journalctl -u stratum -f'"
