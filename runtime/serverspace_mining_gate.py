"""Canary API gate: bind only after signed substrate readiness, recheck per request."""
import argparse
import http.client
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
import time
from serverspace_substrate import call
parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--root',type=Path,required=True);parser.add_argument('--port',type=int,default=8795);parser.add_argument('--upstream-port',type=int,default=3000);args=parser.parse_args()
while True:
    try:
        if call(args.root)['readiness_mask']==7:break
    except Exception:pass
    time.sleep(.1)
class Handler(BaseHTTPRequestHandler):
    def log_message(self,*args):pass
    def do_GET(self):
        try:
            status=call(args.root)
            if status['readiness_mask']!=7:raise ValueError('Substrate unavailable')
        except Exception:
            self.send_response(503);self.end_headers();return
        if self.path=='/health':
            import json
            body=json.dumps({'status':'ok',**status}).encode();code=200
        elif self.path in ['/api/mining/telemetry','/api/mining/viabtc/config']:
            client=http.client.HTTPConnection('127.0.0.1',args.upstream_port,timeout=3)
            try:
                client.request('GET',self.path);response=client.getresponse();code=response.status;body=response.read()
            finally:client.close()
        else:self.send_response(404);self.end_headers();return
        self.send_response(code);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body)
ThreadingHTTPServer(('127.0.0.1',args.port),Handler).serve_forever()
