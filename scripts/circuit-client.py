"""Submit a circuit through verified TLS and check its durable registry readback."""
import argparse
import http.client
import json
from pathlib import Path
import ssl

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--deployment', type=Path, required=True)
parser.add_argument('--port', type=int, default=8444)
parser.add_argument('--job', required=True)
parser.add_argument('--circuit', type=Path, required=True)
args = parser.parse_args()
context = ssl.create_default_context(cafile=str(args.deployment / 'tls.crt'))
headers = {'Authorization': 'Bearer ' + (args.deployment / 'registry.token').read_text().strip(), 'Content-Type': 'application/json'}
def request(method, path, body=None):
    client = http.client.HTTPSConnection('127.0.0.1', args.port, timeout=10, context=context)
    try:
        client.request(method, path, body=json.dumps(body) if body is not None else None, headers=headers)
        response = client.getresponse()
        result = json.loads(response.read())
        if response.status not in (200, 201):
            raise RuntimeError(f'HTTP {response.status}: {result}')
        return result
    finally:
        client.close()
result = request('POST', '/circuits', {'job_id': args.job, 'circuit': json.loads(args.circuit.read_text())})
readback = request('GET', '/generations?path=runtime/keddeh/quantum-computer/jobs/' + result['job_id'])
if readback['generation']['desired_state']['result'] != result['result'] or readback['head']['receipt'] != result['receipt']['receipt']:
    raise RuntimeError('Execution/readback mismatch')
print(json.dumps({'verified_readback': True, **result}))
