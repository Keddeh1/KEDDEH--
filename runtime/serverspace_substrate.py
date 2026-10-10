"""Isolated POSIX substrate; never imports or executes supplied administrative text."""
import argparse
import contextlib
import fcntl
import hashlib
import hmac
import json
import mmap
import os
from pathlib import Path
import resource
import secrets
import signal
import socket
import stat
import struct
import subprocess
import sys
import time
import zlib

MAX_FRAME = 65536
MEMORY_BYTES = 1048576


def encoded(value):
    return json.dumps(value, sort_keys=True, separators=(',', ':'), allow_nan=False).encode()


def secure_root(path):
    path = Path(os.path.abspath(path))
    for ancestor in [path, *path.parents]:
        if ancestor.is_symlink():
            raise ValueError('SYMLINK_RUNTIME_DIRECTORY')
    path.mkdir(mode=0o700, parents=True, exist_ok=True)
    info = path.stat()
    if info.st_uid != os.getuid() or stat.S_IMODE(info.st_mode) != 0o700:
        raise ValueError('RUNTIME_DIRECTORY_MUST_BE_OWNER_ONLY')
    return path


def private_open(path, flags):
    fd = os.open(path, flags | os.O_NOFOLLOW, 0o600)
    info = os.fstat(fd)
    if not stat.S_ISREG(info.st_mode) or info.st_uid != os.getuid() or stat.S_IMODE(info.st_mode) != 0o600 or info.st_nlink != 1:
        os.close(fd)
        raise ValueError('UNSAFE_RUNTIME_FILE')
    return fd


@contextlib.contextmanager
def lock(root, name, nonblocking=False):
    fd = private_open(root / name, os.O_CREAT | os.O_RDWR)
    try:
        fcntl.flock(fd, fcntl.LOCK_EX | (fcntl.LOCK_NB if nonblocking else 0))
        yield
    finally:
        os.close(fd)


def read_json(path):
    fd = private_open(path, os.O_RDONLY)
    with os.fdopen(fd, 'rb') as stream:
        return json.load(stream)


def atomic(root, name, value):
    temporary = root / ('.' + name + '.' + secrets.token_hex(8))
    fd = private_open(temporary, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
    try:
        with os.fdopen(fd, 'wb') as stream:
            stream.write(encoded(value)); stream.flush(); os.fsync(stream.fileno())
        os.replace(temporary, root / name)
        directory = os.open(root, os.O_DIRECTORY)
        try: os.fsync(directory)
        finally: os.close(directory)
    finally:
        temporary.unlink(missing_ok=True)


def validate(state, namespace):
    if not isinstance(state, dict) or not all(k in state for k in ('namespace', 'revision', 'datasets', 'digest')):
        raise ValueError('INVALID_STATE_SCHEMA')
    if type(state['revision']) is not int or state['revision'] < 1 or not isinstance(state['datasets'], dict) or not isinstance(state['digest'], str):
        raise ValueError('INVALID_STATE_SCHEMA')
    if state['namespace'] != namespace:
        raise ValueError('CONTEXT_IDENTITY_MISMATCH')
    body = {key: value for key, value in state.items() if key != 'digest'}
    if not hmac.compare_digest(state['digest'], hashlib.sha256(encoded(body)).hexdigest()):
        raise ValueError('STATE_DIGEST_MISMATCH')
    for item in state['datasets'].values():
        if not isinstance(item, dict) or not isinstance(item.get('hex'), str) or type(item.get('crc32')) is not int:
            raise ValueError('INVALID_DATASET_SCHEMA')
        payload = bytes.fromhex(item['hex'])
        if zlib.crc32(payload) & 0xffffffff != item['crc32']:
            raise ValueError('DATASET_CRC_MISMATCH')
    return state


def write_state(root, namespace, datasets, expected_revision):
    with lock(root, 'writer.lock'):
        path = root / 'canonical-state.json'
        previous = validate(read_json(path), namespace) if path.exists() else None
        revision = previous['revision'] if previous else 0
        if expected_revision != revision:
            raise ValueError('REVISION_CONFLICT')
        state = {'namespace': namespace, 'revision': revision + 1,
                 'datasets': {name: {'hex': content.hex(), 'crc32': zlib.crc32(content) & 0xffffffff}
                              for name, content in datasets.items()}}
        state['digest'] = hashlib.sha256(encoded(state)).hexdigest()
        atomic(root, 'canonical-state.json', state)
        observed = validate(read_json(path), namespace)
        if observed != state:
            raise ValueError('STATE_READBACK_MISMATCH')
        return observed


def receive_exact(connection, count):
    value = bytearray()
    while len(value) < count:
        chunk = connection.recv(count - len(value))
        if not chunk: raise ConnectionError('TRUNCATED_FRAME')
        value.extend(chunk)
    return bytes(value)


def send_frame(connection, value):
    data = encoded(value)
    if len(data) > MAX_FRAME: raise ValueError('FRAME_TOO_LARGE')
    connection.sendall(struct.pack('!II', len(data), zlib.crc32(data) & 0xffffffff) + data)


def receive_frame(connection):
    size, crc = struct.unpack('!II', receive_exact(connection, 8))
    if size > MAX_FRAME: raise ValueError('FRAME_TOO_LARGE')
    payload = receive_exact(connection, size)
    if zlib.crc32(payload) & 0xffffffff != crc: raise ValueError('FRAME_CRC_MISMATCH')
    return json.loads(payload)


def secret(root):
    path = root / 'peer.key'
    try:
        fd = private_open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL)
    except FileExistsError:
        pass
    else:
        with os.fdopen(fd, 'wb') as stream:
            stream.write(secrets.token_bytes(32)); stream.flush(); os.fsync(stream.fileno())
    fd = private_open(path, os.O_RDONLY)
    with os.fdopen(fd, 'rb') as stream: key = stream.read()
    if len(key) != 32: raise ValueError('INVALID_PEER_KEY')
    return key


def sign(key, message):
    return hmac.new(key, encoded(message), hashlib.sha256).hexdigest()


def peer(connection):
    pid, uid, gid = struct.unpack('3i', connection.getsockopt(socket.SOL_SOCKET, socket.SO_PEERCRED, 12))
    if uid != os.getuid(): raise PermissionError('PEER_UID_DENIED')
    return pid


def discovered_endpoint(root, namespace):
    metadata = read_json(root / 'daemon.json')
    if not isinstance(metadata, dict) or metadata.get('namespace') != namespace or metadata.get('ready') is not True:
        raise ValueError('ENDPOINT_CONTEXT_OR_READINESS_REJECTED')
    if not isinstance(metadata.get('uds'), str) or type(metadata.get('pid')) is not int:
        raise ValueError('INVALID_ENDPOINT_METADATA')
    endpoint = Path(metadata['uds'])
    if not endpoint.is_absolute() or endpoint.parent != root or endpoint.is_symlink():
        raise ValueError('ENDPOINT_ESCAPES_RUNTIME_DIRECTORY')
    info = endpoint.stat()
    if not stat.S_ISSOCK(info.st_mode) or info.st_uid != os.getuid() or stat.S_IMODE(info.st_mode) != 0o600:
        raise ValueError('UNSAFE_DISCOVERED_ENDPOINT')
    return endpoint, metadata['pid']


def probe(root, namespace):
    root = secure_root(root); key = secret(root)
    endpoint, expected_pid = discovered_endpoint(root, namespace)
    with socket.socket(socket.AF_UNIX) as connection:
        connection.settimeout(2); connection.connect(str(endpoint)); peer_pid = peer(connection)
        if peer_pid != expected_pid: raise ValueError('METADATA_PEER_PID_MISMATCH')
        request = {'namespace': namespace, 'nonce': secrets.token_hex(24), 'op': 'readiness'}
        send_frame(connection, {'payload': request, 'signature': sign(key, request)})
        response = receive_frame(connection)
        if not hmac.compare_digest(response['signature'], sign(key, response['payload'])):
            raise ValueError('PEER_AUTHENTICATION_FAILED')
        observed = response['payload']
        if observed['nonce'] != request['nonce'] or observed['namespace'] != namespace:
            raise ValueError('HANDSHAKE_CONTEXT_MISMATCH')
        if observed['pid'] != peer_pid: raise ValueError('PEER_PID_MISMATCH')
        if time.monotonic() - observed['monotonic'] > 2: raise ValueError('STALE_HEARTBEAT')
        if observed['mask'] != 7: raise ValueError('SUBSTRATE_NOT_READY')
        state = validate(read_json(root / 'canonical-state.json'), namespace)
        if observed['digest'] != state['digest']: raise ValueError('STATE_HANDSHAKE_MISMATCH')
        if read_json(root / 'daemon.json').get('sealed_lineage') is True:
            from canonical_lineage import recover
            sealed_state, records = recover(root, namespace)
            if sealed_state['digest'] != observed['digest'] or records[-1]['seal'] != observed.get('lineage_seal'):
                raise ValueError('LINEAGE_HANDSHAKE_MISMATCH')
        return observed


def daemon(root, namespace, sealed_lineage=False):
    root = secure_root(root); key = secret(root)
    with lock(root, 'daemon.lock', True):
        path = root / 'canonical-state.json'
        if sealed_lineage:
            from canonical_lineage import commit, recover
            if not path.exists(): commit(root, namespace, {}, 0, 'substrate-initialization')
            recover(root, namespace)
        else:
            if not path.exists(): write_state(root, namespace, {}, 0)
            validate(read_json(path), namespace)
        fd = private_open(root / 'shared-memory.bin', os.O_RDWR | os.O_CREAT)
        if os.fstat(fd).st_size == 0: os.ftruncate(fd, MEMORY_BYTES)
        if os.fstat(fd).st_size != MEMORY_BYTES: raise ValueError('SHARED_MEMORY_SIZE_MISMATCH')
        memory = mmap.mmap(fd, MEMORY_BYTES); os.close(fd)
        endpoint = root / 'readiness.sock'
        if endpoint.exists() or endpoint.is_symlink():
            info = endpoint.lstat()
            if not stat.S_ISSOCK(info.st_mode) or info.st_uid != os.getuid(): raise ValueError('UNSAFE_UDS_PATH')
            endpoint.unlink()
        running = True
        def stop(*args):
            nonlocal running
            running = False
        signal.signal(signal.SIGTERM, stop); signal.signal(signal.SIGINT, stop)
        with socket.socket(socket.AF_UNIX) as server:
            server.bind(str(endpoint)); os.chmod(endpoint, 0o600); server.listen(16); server.settimeout(.2)
            atomic(root, 'daemon.json', {'namespace': namespace, 'pid': os.getpid(), 'uds': str(endpoint), 'ready': True, 'protocol': 'length-crc-hmac-v1', 'sealed_lineage': sealed_lineage})
            try:
                while running:
                    lineage = None
                    if sealed_lineage:
                        state, records = recover(root, namespace); lineage = records[-1]['seal']
                    else: state = validate(read_json(path), namespace)
                    heartbeat = {'namespace': namespace, 'pid': os.getpid(), 'monotonic': time.monotonic(), 'mask': 7, 'digest': state['digest']}
                    if lineage: heartbeat['lineage_seal'] = lineage
                    with lock(root, 'memory.lock'):
                        payload = encoded(heartbeat); memory[:4] = struct.pack('!I', len(payload)); memory[4:4+len(payload)] = payload; memory.flush()
                    try: connection, _ = server.accept()
                    except socket.timeout: continue
                    with connection:
                        connection.settimeout(1)
                        try:
                            peer(connection); incoming = receive_frame(connection)
                            if not isinstance(incoming, dict) or not isinstance(incoming.get('payload'), dict) or not isinstance(incoming.get('signature'), str):
                                raise ValueError('INVALID_FRAME_SCHEMA')
                            request = incoming['payload']
                            if not isinstance(request.get('nonce'), str) or not 1 <= len(request['nonce']) <= 128:
                                raise ValueError('INVALID_NONCE')
                            if not hmac.compare_digest(incoming['signature'], sign(key, request)): raise ValueError('PEER_AUTHENTICATION_FAILED')
                            if request.get('namespace') != namespace or request.get('op') != 'readiness': raise ValueError('CONTEXT_IDENTITY_MISMATCH')
                            response = {**heartbeat, 'nonce': request['nonce']}
                            send_frame(connection, {'payload': response, 'signature': sign(key, response)})
                        except (ValueError, KeyError, OSError, json.JSONDecodeError) as error:
                            from incident_ledger import record
                            try:
                                incident = record(root, 'IPC', {'failure': type(error).__name__, 'namespace': namespace})
                                print(json.dumps({'rejected': type(error).__name__, 'incident_id': incident['incident_id']}), file=sys.stderr, flush=True)
                            except (OSError, ValueError) as audit_error:
                                print(json.dumps({'rejected': type(error).__name__, 'incident_record_failed': type(audit_error).__name__}), file=sys.stderr, flush=True)
            finally:
                atomic(root, 'daemon.json', {'namespace': namespace, 'pid': os.getpid(), 'ready': False})
                endpoint.unlink(missing_ok=True); memory.close()


def watchdog(root, namespace, sealed_lineage=False):
    root = secure_root(root)
    with lock(root, 'watchdog.lock', True):
        stopping = False; child = None; delay = .2
        def stop(*args):
            nonlocal stopping
            stopping = True
        signal.signal(signal.SIGTERM, stop); signal.signal(signal.SIGINT, stop)
        while not stopping:
            started = time.monotonic()
            child = subprocess.Popen([sys.executable, __file__, 'daemon', '--root', str(root), '--namespace', namespace, *(['--sealed-lineage'] if sealed_lineage else [])])
            unhealthy = 0
            while not stopping and child.poll() is None:
                time.sleep(.2)
                try: probe(root, namespace); unhealthy = 0
                except (OSError, ValueError, KeyError): unhealthy += 1
                if unhealthy >= 10: break
            if child.poll() is None:
                child.terminate()
                try: child.wait(timeout=3)
                except subprocess.TimeoutExpired: child.kill(); child.wait()
            if stopping: break
            print(json.dumps({'event': 'SUBSTRATE_RESTART', 'exit': child.returncode}), file=sys.stderr, flush=True)
            if time.monotonic() - started > 30: delay = .2
            deadline = time.monotonic() + delay
            while not stopping and time.monotonic() < deadline: time.sleep(.1)
            delay = min(delay * 2, 5)


def gate(root, namespace, command, timeout):
    deadline = time.monotonic() + timeout
    while True:
        try: observed = probe(root, namespace); break
        except (OSError, ValueError, KeyError):
            if time.monotonic() >= deadline: raise TimeoutError('SUBSTRATE_HANDSHAKE_TIMEOUT')
            time.sleep(.1)
    if not command: raise ValueError('API_COMMAND_REQUIRED')
    print(json.dumps({'event': 'API_STARTUP_RELEASED', 'mask': observed['mask']}), file=sys.stderr, flush=True)
    os.execvp(command[0], command)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('mode', choices=['daemon', 'watchdog', 'probe', 'gate'])
    parser.add_argument('--root', required=True); parser.add_argument('--namespace', required=True)
    parser.add_argument('--timeout', type=float, default=30)
    parser.add_argument('--sealed-lineage', action='store_true')
    args, command = parser.parse_known_args()
    if command[:1] == ['--']: command = command[1:]
    os.umask(0o077)
    resource.setrlimit(resource.RLIMIT_NOFILE, (256, 256))
    resource.setrlimit(resource.RLIMIT_AS, (512 * 1024 * 1024, 512 * 1024 * 1024))
    if args.mode == 'daemon': daemon(args.root, args.namespace, args.sealed_lineage)
    elif args.mode == 'watchdog': watchdog(args.root, args.namespace, args.sealed_lineage)
    elif args.mode == 'probe': print(json.dumps(probe(args.root, args.namespace)))
    else: gate(args.root, args.namespace, command, args.timeout)


if __name__ == '__main__': main()
