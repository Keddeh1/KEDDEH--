"""TLS deployment of the resident namespace registry; original admission stays authoritative."""
import argparse
import json
import ssl
from pathlib import Path
from keddeh_namespace.registry_service import Registry, make_server


def make_tls_server(root, trust, token, certificate, key, host='127.0.0.1', port=8443):
    registry = Registry(root, trust)
    registry.replay()
    server = make_server(registry, token, host=host, port=port)
    try:
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.minimum_version = ssl.TLSVersion.TLSv1_2
        context.options |= ssl.OP_NO_COMPRESSION
        context.set_alpn_protocols(['http/1.1'])
        context.load_cert_chain(certificate, key)
        server.socket = context.wrap_socket(server.socket, server_side=True, do_handshake_on_connect=False)
    except BaseException:
        server.server_close()
        raise
    return server


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--deployment', required=True, type=Path)
    parser.add_argument('--port', type=int, default=8443)
    args = parser.parse_args()
    root = args.deployment
    server = make_tls_server(root / 'ledger', json.loads((root / 'trust.json').read_text()),
                             (root / 'registry.token').read_text().strip(),
                             root / 'tls.crt', root / 'tls.key', port=args.port)
    try:
        server.serve_forever()
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
