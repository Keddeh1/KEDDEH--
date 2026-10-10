"""Opt-in sealed writer for new isolated roots; never fabricates legacy history."""
import hashlib
import os
from pathlib import Path
try:
    from .serverspace_substrate import secure_root, private_open, lock, atomic, encoded, read_json, validate
except ImportError:
    from serverspace_substrate import secure_root, private_open, lock, atomic, encoded, read_json, validate
import json
import zlib

LEDGER = 'LINEAGE_AUDIT_LEDGER.jsonl'
PENDING = 'pending-lineage.json'
LIMIT = 16 * 1024 * 1024
ZERO = '0' * 64


def digest(value): return hashlib.sha256(encoded(value)).hexdigest()


def seal(value): return {**value, 'seal': digest(value)}


def checked(value):
    if not isinstance(value, dict) or not isinstance(value.get('seal'), str): raise ValueError('INVALID_LINEAGE_SCHEMA')
    body = {k: v for k, v in value.items() if k != 'seal'}
    if digest(body) != value['seal']: raise ValueError('LINEAGE_SEAL_MISMATCH')
    return body


def raw(path):
    fd = private_open(path, os.O_RDONLY)
    with os.fdopen(fd, 'rb') as stream: data = stream.read(LIMIT + 1)
    if len(data) > LIMIT: raise ValueError('LINEAGE_SIZE_LIMIT')
    return data


def flush_directory(root):
    fd = os.open(root, os.O_DIRECTORY)
    try: os.fsync(fd)
    finally: os.close(fd)


def read_ledger(root, namespace, pending=None):
    path = root / LEDGER
    data = raw(path) if path.exists() else b''
    # Repair only the exact incomplete append authorized by a durable pending WAL.
    if data and not data.endswith(b'\n'):
        complete, _, tail = data.rpartition(b'\n')
        prefix = complete + b'\n' if complete else b''
        expected = encoded(pending['record']) + b'\n' if pending else b''
        if not expected or not expected.startswith(tail): raise ValueError('UNAUTHORIZED_PARTIAL_LEDGER')
        fd = private_open(path, os.O_RDWR)
        try: os.ftruncate(fd, len(prefix)); os.fsync(fd)
        finally: os.close(fd)
        flush_directory(root); data = prefix
    entries = [json.loads(line) for line in data.splitlines()]
    previous = ZERO; previous_state = None; requests = set()
    for index, entry in enumerate(entries, 1):
        body = checked(entry)
        if body['namespace'] != namespace or body['revision'] != index or body['previous_seal'] != previous or body['previous_state_digest'] != previous_state:
            raise ValueError('LINEAGE_CHAIN_MISMATCH')
        if body['request_id'] in requests: raise ValueError('DUPLICATE_LINEAGE_REQUEST')
        requests.add(body['request_id']); previous = entry['seal']; previous_state = body['state_digest']
    return entries


def append(root, record, boundary):
    packet = encoded(record) + b'\n'; path = root / LEDGER
    if path.exists() and path.stat().st_size + len(packet) > LIMIT: raise ValueError('LINEAGE_SIZE_LIMIT')
    fd = private_open(path, os.O_WRONLY | os.O_APPEND | os.O_CREAT)
    def write_all(data):
        while data:
            count = os.write(fd, data)
            if count <= 0: raise OSError('LINEAGE_APPEND_FAILED')
            data = data[count:]
    try:
        split = len(packet)//2; write_all(packet[:split]); boundary('ledger_partial')
        write_all(packet[split:]); os.fsync(fd)
    finally: os.close(fd)
    flush_directory(root)


def current(root, namespace):
    path = root/'canonical-state.json'
    if not path.exists(): return None
    return validate(read_json(path), namespace)


def recover_locked(root, namespace, boundary):
    pending_path = root/PENDING
    pending = checked(read_json(pending_path)) if pending_path.exists() else None
    if pending:
        state = validate(pending['state'], namespace); record = pending['record']; body = checked(record)
        if body['namespace'] != namespace or body['state_digest'] != state['digest'] or body['revision'] != state['revision'] or body['byte_digest'] != hashlib.sha256(encoded(state)).hexdigest():
            raise ValueError('PENDING_STATE_RECORD_MISMATCH')
    entries = read_ledger(root, namespace, pending)
    observed = current(root, namespace)
    if pending:
        last = entries[-1] if entries else None
        recorded = last == record
        if not recorded and (body['revision'] != len(entries)+1 or body['previous_seal'] != (last['seal'] if last else ZERO) or body['previous_state_digest'] != (last['state_digest'] if last else None)):
            raise ValueError('PENDING_LINEAGE_CONFLICT')
        if observed != state:
            if (observed['digest'] if observed else None) != body['previous_state_digest']:
                raise ValueError('PENDING_CANONICAL_CONFLICT')
            atomic(root,'canonical-state.json',state)
        actual = raw(root/'canonical-state.json')
        if actual != encoded(state) or hashlib.sha256(actual).hexdigest() != body['byte_digest']:
            raise ValueError('PHYSICAL_READBACK_MISMATCH')
        boundary('state_persisted')
        if not recorded: append(root,record,boundary); entries.append(record)
        if read_ledger(root, namespace, pending) != entries: raise ValueError('LEDGER_READBACK_MISMATCH')
        boundary('ledger_persisted')
        pending_path.unlink(); flush_directory(root); boundary('pending_cleared')
        observed = state
    if observed is not None and not entries: raise ValueError('UNSEALED_LEGACY_STATE_REQUIRES_REVIEWED_MIGRATION')
    if entries and (observed is None or entries[-1]['state_digest'] != observed['digest'] or entries[-1]['byte_digest'] != hashlib.sha256(raw(root/'canonical-state.json')).hexdigest()):
        raise ValueError('CANONICAL_LINEAGE_READBACK_MISMATCH')
    return observed, entries


def recover(root, namespace):
    root = secure_root(root)
    with lock(root,'writer.lock'): return recover_locked(root,namespace,lambda stage:None)


def commit(root, namespace, datasets, expected_revision, request_id, *, boundary=None):
    if not isinstance(request_id,str) or not 1 <= len(request_id) <= 128: raise ValueError('STABLE_REQUEST_ID_REQUIRED')
    root = secure_root(root); boundary = boundary or (lambda stage:None)
    with lock(root,'writer.lock'):
        observed, entries = recover_locked(root,namespace,boundary)
        payload = {name:{'hex':content.hex(),'crc32':zlib.crc32(content)&0xffffffff} for name,content in datasets.items()}
        request_digest = digest({'namespace':namespace,'datasets':payload,'expected_revision':expected_revision})
        for entry in entries:
            if entry['request_id'] == request_id:
                if entry['request_digest'] != request_digest: raise ValueError('REQUEST_ID_CONFLICT')
                return entry
        revision = observed['revision'] if observed else 0
        if type(expected_revision) is not int or expected_revision != revision: raise ValueError('REVISION_CONFLICT')
        state = {'namespace':namespace,'revision':revision+1,'datasets':payload}; state['digest']=digest(state)
        record = seal({'namespace':namespace,'revision':revision+1,'request_id':request_id,'request_digest':request_digest,'previous_seal':entries[-1]['seal'] if entries else ZERO,'previous_state_digest':observed['digest'] if observed else None,'state_digest':state['digest'],'byte_digest':hashlib.sha256(encoded(state)).hexdigest()})
        atomic(root,PENDING,seal({'state':state,'record':record})); boundary('wal_persisted')
        _, updated = recover_locked(root,namespace,boundary)
        return updated[-1]
