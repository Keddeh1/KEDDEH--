"""Bounded canary API: signed readiness precedes binding and every request."""
import argparse
import http.client
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import resource
import socket
import threading
import time
from serverspace_substrate import call

MAX_RESPONSE_BYTES = 1024 * 1024
MAX_REQUEST_WORKERS = 16

class BoundedServer(ThreadingHTTPServer):
    daemon_threads = True
    def __init__(self, *args):
        self.slots = threading.BoundedSemaphore(MAX_REQUEST_WORKERS)
        super().__init__(*args)
    def get_request(self):
        request, address = super().get_request()
        request.settimeout(5)
        return request, address
    def process_request(self, request, address):
        if not self.slots.acquire(blocking=False):
            try:
                request.sendall(b'HTTP/1.0 503 Service Unavailable\r\nContent-Length: 0\r\nConnection: close\r\n\r\n')
            finally:
                self.shutdown_request(request)
            return
        try:
            super().process_request(request, address)
        except Exception:
            self.slots.release()
            raise
    def process_request_thread(self, request, address):
        try:
            super().process_request_thread(request, address)
        finally:
            self.slots.release()

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, required=True)
    parser.add_argument('--port', type=int, default=8795)
    parser.add_argument('--upstream-port', type=int, default=3000)
    args = parser.parse_args()
    resource.setrlimit(resource.RLIMIT_AS, (256*1024*1024, 256*1024*1024))
    resource.setrlimit(resource.RLIMIT_NOFILE, (128, 128))
    resource.setrlimit(resource.RLIMIT_CORE, (0, 0))
    threading.stack_size(512*1024)
    while True:
        try:
            if call(args.root)['readiness_mask'] == 7:
                break
        except Exception:
            pass
        time.sleep(.1)

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *args):
            pass
        def reply(self, code, body):
            self.send_response(code)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        def do_GET(self):
            try:
                status = call(args.root)
                if status['readiness_mask'] != 7:
                    raise ValueError('Substrate unavailable')
            except Exception:
                self.reply(503, b'{"error":"SUBSTRATE_UNAVAILABLE"}')
                return
            if self.path == '/health':
                self.reply(200, json.dumps({'status':'ok', **status}).encode())
                return
            if self.path not in ['/api/mining/telemetry', '/api/mining/viabtc/config']:
                self.reply(404, b'{"error":"NOT_FOUND"}')
                return
            client = http.client.HTTPConnection('127.0.0.1', args.upstream_port, timeout=3)
            try:
                client.request('GET', self.path)
                response = client.getresponse()
                body = response.read(MAX_RESPONSE_BYTES + 1)
                if len(body) > MAX_RESPONSE_BYTES:
                    self.reply(502, b'{"error":"UPSTREAM_RESPONSE_TOO_LARGE"}')
                    return
                self.reply(response.status, body)
            except (TimeoutError, socket.timeout):
                self.reply(504, b'{"error":"UPSTREAM_TIMEOUT"}')
            except (OSError, http.client.HTTPException):
                self.reply(502, b'{"error":"UPSTREAM_UNAVAILABLE"}')
            finally:
                client.close()
    BoundedServer(('127.0.0.1', args.port), Handler).serve_forever()

if __name__ == '__main__':
    main()
