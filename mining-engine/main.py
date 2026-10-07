import os
import sys
import time
import signal
import ssl
import threading
from http.server import HTTPServer

from stratum_engine import FullyEngineeredStratumClient
from stratum_control_gateway import EncryptedControlCentreHandler
from firmware_manager import ISOFirmwareManager

if __name__ == "__main__":
    # Force absolute injection of the validated user identity profile
    STRATUM_HOST = os.getenv("STRATUM_HOST", "bitcoin.viabtc.io")
    STRATUM_PORT = int(os.getenv("STRATUM_PORT", "3333"))
    WORKER_IDENTITY = os.getenv("STRATUM_WORKER", "keddeh.001")
    HTTPS_PORT = int(os.getenv("HTTPS_PORT", "8443"))
    
    CERT_FILE = os.getenv("TLS_CERT_PATH", "cert.pem")
    KEY_FILE = os.getenv("TLS_KEY_PATH", "key.pem")

    # 1. Instantiate Core Node Client Layer with explicitly bound username
    client_instance = FullyEngineeredStratumClient(
        host=STRATUM_HOST,
        port=STRATUM_PORT,
        worker_username=WORKER_IDENTITY
    )
    
    # 2. Initialize Firmware Management Plane (ISO Standard)
    firmware_instance = ISOFirmwareManager(base_dir=os.path.dirname(os.path.abspath(__file__)))
    
    # 3. Bind Live Engine Core Context directly to HTTPS Processing Layer
    EncryptedControlCentreHandler.client_node = client_instance
    EncryptedControlCentreHandler.firmware_service = firmware_instance

    # 3. Provision and Secure TLS Boundary Layer over Server Sockets
    https_daemon = HTTPServer(("0.0.0.0", HTTPS_PORT), EncryptedControlCentreHandler)
    ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ssl_context.load_cert_chain(certfile=CERT_FILE, keyfile=KEY_FILE)
    https_daemon.socket = ssl_context.wrap_socket(https_daemon.socket, server_side=True)
    
    http_thread = threading.Thread(target=https_daemon.serve_forever, daemon=True)
    sys.stdout.write(f"[HTTPS_SECURITY] Secure Control Centre active for user keddeh at https://0.0.0:{HTTPS_PORT}\n")
    sys.stdout.flush()
    http_thread.start()

    # 4. Trapping Signal Framework Actions for Clean Infrastructure Recycling
    def sig_handler(signum, frame):
        https_daemon.shutdown()
        client_instance.terminate_gracefully()
        sys.exit(0)

    signal.signal(signal.SIGINT, sig_handler)
    signal.signal(signal.SIGTERM, sig_handler)

    # 5. Hand Execution Focus Over to Primary Network Orchestrator Engine Loop
    client_instance.bootstrap_pipeline()
