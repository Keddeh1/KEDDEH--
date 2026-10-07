import json
import base64
import os
from http.server import BaseHTTPRequestHandler

class EncryptedControlCentreHandler(BaseHTTPRequestHandler):
    client_node = None
    firmware_service = None

    def log_message(self, format, *args):
        return

    def _authenticate_request(self) -> bool:
        """Parses and validates explicit Base64 transmission payloads against system environment locks."""
        auth_username = os.getenv("CONTROL_USER", "admin")
        auth_password = os.getenv("CONTROL_PASS", "HardenYourPassword2026")
        
        auth_header = self.headers.get("Authorization")
        if not auth_header:
            return False
            
        if not auth_header.startswith("Basic "):
            return False
            
        try:
            encoded_credentials = auth_header.split(" ", 1)[1]
            decoded_bytes = base64.b64decode(encoded_credentials)
            decoded_str = decoded_bytes.decode("utf-8")
            username, password = decoded_str.split(":", 1)
            return (username == auth_username) and (password == auth_password)
        except Exception:
            return False

    def _send_unauthorized_response(self):
        self.send_response(401)
        self.send_header("WWW-Authenticate", 'Basic realm="Stratum Secure Control Centre Profile"')
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"error": "Access Denied: Invalid Security Credentials"}).encode("utf-8"))

    def do_GET(self):
        if not self._authenticate_request():
            self._send_unauthorized_response()
            return
            
        if self.path == "/api/telemetry":
            self._render_json_payload()
        elif self.path == "/api/firmware/state":
            self._render_firmware_payload()
        elif self.path == "/":
            self._render_secure_html_ui()
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if not self._authenticate_request():
            self._send_unauthorized_response()
            return
            
        if self.path == "/api/control/reconnect":
            EncryptedControlCentreHandler.client_node.force_network_reconnect()
            self._send_action_executed("reconnect")
        elif self.path == "/api/firmware/check":
            EncryptedControlCentreHandler.firmware_service.check_for_updates()
            self._send_action_executed("firmware_check")
        elif self.path == "/api/firmware/update":
            success = EncryptedControlCentreHandler.firmware_service.start_update_sequence()
            self._send_action_executed("firmware_update" if success else "firmware_skipped")
        elif self.path == "/api/firmware/reboot":
            EncryptedControlCentreHandler.firmware_service.perform_system_reboot()
            self._send_action_executed("system_reboot")
        else:
            self.send_response(404)
            self.end_headers()

    def _send_action_executed(self, action: str):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"action": action, "status": "executed"}).encode('utf-8'))

    def _render_firmware_payload(self):
        data = EncryptedControlCentreHandler.firmware_service.get_state()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def _render_json_payload(self):
        data = EncryptedControlCentreHandler.client_node.get_live_diagnostics()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def _render_secure_html_ui(self):
        d = EncryptedControlCentreHandler.client_node.get_live_diagnostics()
        status_color = "#10b981" if d["status"] == "AUTHORIZED" else "#f59e0b" if d["status"] == "CONNECTING" else "#ef4444"
        
        html_payload = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Secure Stratum Control Centre</title>
    <style>
        :root {{
            --bg-base: #0b0f19;
            --bg-surface: #151f32;
            --text-main: #f1f5f9;
            --text-muted: #64748b;
            --accent-primary: #0ea5e9;
            --border-color: #1e293b;
            --btn-danger: #dc2626;
            --btn-danger-hover: #b91c1c;
        }}
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{ background-color: var(--bg-base); color: var(--text-main); font-family: sans-serif; padding: 2rem; }}
        .container {{ max-width: 1200px; margin: 0 auto; }}
        header {{ display: flex; justify-content: space-between; align-items: center; padding-bottom: 2rem; border-bottom: 1px solid var(--border-color); margin-bottom: 2rem; }}
        .status-badge {{ background-color: {status_color}; color: #ffffff; padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }}
        .grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem; }}
        .card {{ background-color: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.5rem; }}
        .card-label {{ font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; margin-bottom: 0.5rem; }}
        .card-value {{ font-size: 1.75rem; font-weight: 700; }}
        .accent {{ color: var(--accent-primary); }}
        .control-panel {{ display: flex; align-items: center; justify-content: space-between; background-color: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; }}
        .btn {{ background-color: var(--btn-danger); color: #ffffff; border: none; padding: 0.75rem 1.5rem; font-weight: 600; border-radius: 6px; cursor: pointer; }}
        .btn:hover {{ background-color: var(--btn-danger-hover); }}
        .btn:disabled {{ background-color: var(--text-muted); cursor: not-allowed; }}
    </style>
    <script>
        setInterval(async () => {
            try {
                const res = await fetch('/api/telemetry');
                if (res.status === 401) { window.location.reload(); return; }
                const d = await res.json();
                document.getElementById('status').innerText = d.status;
                document.getElementById('hash_rate').innerText = d.hash_rate_ghs.toFixed(2) + ' GH/s';
                document.getElementById('efficiency').innerText = d.efficiency_pct.toFixed(2) + '%';
                document.getElementById('accepted').innerText = d.accepted;
                document.getElementById('rejected').innerText = d.rejected;
                document.getElementById('latency').innerText = d.latency_ms.toFixed(1) + ' ms';
                document.getElementById('frames').innerText = d.frames_io;
                document.getElementById('uptime').innerText = Math.floor(d.uptime_seconds) + 's';
            } catch(e) { console.error("Sync loop broken", e); }
        }, 1000);

        setInterval(async () => {
            try {
                const res = await fetch('/api/firmware/state');
                const f = await res.json();
                document.getElementById('fw_version').innerText = f.current_version;
                document.getElementById('fw_status').innerText = f.status;
                
                const updatePanel = document.getElementById('update_panel');
                if (f.available_update) {
                    updatePanel.style.display = 'block';
                    document.getElementById('new_fw_ver').innerText = f.available_update.version;
                } else {
                    updatePanel.style.display = 'none';
                }

                const rebootBtn = document.getElementById('reboot_btn');
                if (f.status === 'REBOOT_REQUIRED') {
                    rebootBtn.style.display = 'block';
                } else {
                    rebootBtn.style.display = 'none';
                }

                if (['DOWNLOADING', 'VERIFYING', 'APPLYING'].includes(f.status)) {
                    document.getElementById('fw_progress_container').style.display = 'block';
                    document.getElementById('fw_progress_bar').style.width = f.progress + '%';
                } else {
                    document.getElementById('fw_progress_container').style.display = 'none';
                }
            } catch(e) {}
        }, 2000);

        async function triggerReconnect() {
            const btn = document.getElementById('reconnect_btn');
            btn.disabled = true;
            btn.innerText = "RECONNECTING...";
            try { await fetch('/api/control/reconnect', { method: 'POST' }); } catch(e) { console.error(e); }
            setTimeout(() => { btn.disabled = false; btn.innerText = "FORCE POOL RECONNECT"; }, 3000);
        }

        async function checkFirmware() {
            document.getElementById('fw_check_btn').innerText = "CHECKING...";
            await fetch('/api/firmware/check', { method: 'POST' });
            setTimeout(() => { document.getElementById('fw_check_btn').innerText = "CHECK FOR UPDATES"; }, 2000);
        }

        async function startUpdate() {
            await fetch('/api/firmware/update', { method: 'POST' });
        }

        async function rebootSystem() {
            await fetch('/api/firmware/reboot', { method: 'POST' });
        }
    </script>
</head>
<body>
    <div class="container">
        <header>
            <div>
                <h1>Encrypted Stratum Node Control Centre</h1>
                <p style="color: var(--text-muted); font-size: 0.825rem;">🔒 TLSv1.3 Secure Routing Active | User Authentication Locked</p>
            </div>
            <div id="status" class="status-badge">{d["status"]}</div>
        </header>

        <div class="control-panel">
            <div>
                <h3 style="font-size: 1rem; font-weight: 600;">Hardware Command Interface</h3>
                <p style="color: var(--text-muted); font-size: 0.825rem; margin-top: 0.25rem;">Execute safe real-time system state mutations.</p>
            </div>
            <button id="reconnect_btn" class="btn" onclick="triggerReconnect()">FORCE POOL RECONNECT</button>
        </div>
        
        <div class="grid">
            <div class="card"><div class="card-label">Calculated Hash Rate</div><div id="hash_rate" class="card-value accent">{d["hash_rate_ghs"]:.2f} GH/s</div></div>
            <div class="card"><div class="card-label">Share Efficiency</div><div id="efficiency" class="card-value" style="color: #a855f7;">{d["efficiency_pct"]:.2f}%</div></div>
            <div class="card"><div class="card-label">Endpoint Profile</div><div class="card-value" style="font-size: 1.1rem; word-break: break-all;">{d["target_host"]}:{d["target_port"]}</div></div>
        </div>

        <div class="grid">
            <div class="card"><div class="card-label">Accepted Shares</div><div id="accepted" class="card-value" style="color: #10b981;">{d["accepted"]}</div></div>
            <div class="card"><div class="card-label">Rejected Shares</div><div id="rejected" class="card-value" style="color: #ef4444;">{d["rejected"]}</div></div>
            <div class="card"><div class="card-label">Current Difficulty</div><div class="card-value">{d["difficulty"]}</div></div>
        </div>

        <div class="grid">
            <div class="card">
                <div class="card-label">Firmware Engine</div>
                <div id="fw_version" class="card-value">{EncryptedControlCentreHandler.firmware_service.current_version}</div>
                <div id="fw_status" style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;">{EncryptedControlCentreHandler.firmware_service.status}</div>
                <div id="fw_progress_container" style="display: none; height: 4px; background: #1e293b; border-radius: 2px; margin-top: 10px;">
                    <div id="fw_progress_bar" style="height: 100%; width: 0%; background: var(--accent-primary); border-radius: 2px; transition: width 0.3s;"></div>
                </div>
                <button id="fw_check_btn" style="margin-top: 1rem; width: 100%; padding: 0.5rem; background: var(--bg-base); border: 1px solid var(--border-color); color: var(--text-main); font-size: 0.7rem; font-weight: 700; cursor: pointer; border-radius: 4px;" onclick="checkFirmware()">CHECK FOR UPDATES</button>
            </div>
            <div id="update_panel" class="card" style="display: none; border-color: var(--accent-amber);">
                <div class="card-label" style="color: var(--accent-amber);">Update Available</div>
                <div id="new_fw_ver" class="card-value">--</div>
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;">ISO-compliant binary distribution ready.</p>
                <button class="btn" style="background-color: #f59e0b; margin-top: 1rem; width: 100%;" onclick="startUpdate()">INSTALL FIRMWARE NOW</button>
            </div>
            <div id="reboot_btn" class="card" style="display: none; border-color: #10b981;">
                <div class="card-label" style="color: #10b981;">Finalization Required</div>
                <div class="card-value">REBOOT</div>
                <button class="btn" style="background-color: #10b981; margin-top: 1rem; width: 100%;" onclick="rebootSystem()">REBOOT KERNEL NOW</button>
            </div>
        </div>

        <div class="grid">
            <div class="card"><div class="card-label">Last Network Latency</div><div id="latency" class="card-value">{d["latency_ms"]:.1f} ms</div></div>
            <div class="card"><div class="card-label">Inbound IO Frames</div><div id="frames" class="card-value">{d["frames_io"]}</div></div>
            <div class="card"><div class="card-label">System Node Uptime</div><div id="uptime" class="card-value">{int(d["uptime_seconds"])}s</div></div>
        </div>
    </div>
</body>
</html>
"""
        self.send_response(200)
        self.send_header("Content-Type", "text/html")
        self.end_headers()
        self.wfile.write(html_payload.encode('utf-8'))
