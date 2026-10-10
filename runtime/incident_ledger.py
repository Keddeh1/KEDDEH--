"""Bounded, hash-chained local diagnostics; does not confer canonical authority."""
import hashlib
import json
import re
import time
try:
    from .serverspace_substrate import secure_root, lock, encoded, private_open
except ImportError:
    from serverspace_substrate import secure_root, lock, encoded, private_open

MAX_TICKETS = 200
MAX_BYTES = 5 * 1024 * 1024
MAX_RECORD = 4096


def check(records):
    previous = None
    for record in records:
        value = dict(record); digest = value.pop('record_hash', None)
        if hashlib.sha256(encoded(value)).hexdigest() != digest:
            raise ValueError('INCIDENT_RECORD_HASH_MISMATCH')
        if previous is not None and value['previous_hash'] != previous:
            raise ValueError('INCIDENT_CHAIN_DISCONTINUITY')
        previous = digest


def record(root, category, details):
    if not isinstance(category, str) or not re.fullmatch('[A-Z][A-Z0-9_-]{0,31}', category):
        raise ValueError('INVALID_INCIDENT_CATEGORY')
    directory = secure_root(secure_root(secure_root(root)/'.braink')/'it_incidents')
    path = directory/'IT_INCIDENT_DISPATCH_LEDGER.ndjson'
    with lock(directory,'incidents.lock'):
        records=[]
        if path.exists():
            import os
            fd=private_open(path,os.O_RDONLY)
            with os.fdopen(fd,'rb') as stream:
                raw=stream.read(MAX_BYTES+1)
            if len(raw)>MAX_BYTES:raise ValueError('INCIDENT_LEDGER_OVERSIZED')
            records=[json.loads(line) for line in raw.splitlines()]
            check(records)
        value={'category':category,'details':details,'time_ns':time.time_ns(),'previous_hash':records[-1]['record_hash'] if records else '0'*64}
        digest=hashlib.sha256(encoded(value)).hexdigest()
        value['incident_id']='KEX-404-INC-'+category+'-'+digest[:8]
        value['record_hash']=hashlib.sha256(encoded(value)).hexdigest()
        if len(encoded(value))>MAX_RECORD:raise ValueError('INCIDENT_RECORD_OVERSIZED')
        records.append(value);records=records[-MAX_TICKETS:]
        raw=b''.join(encoded(entry)+b'\n' for entry in records)
        if len(raw)>MAX_BYTES:raise ValueError('INCIDENT_LEDGER_OVERSIZED')
        # Atomic rolling-window replacement with file + parent-directory fsync.
        # Earlier chain roots require external custody; no unforgeability claim.
        import os,secrets
        temporary=directory/('.incidents-'+secrets.token_hex(8))
        try:
            fd=private_open(temporary,os.O_WRONLY|os.O_CREAT|os.O_EXCL)
            with os.fdopen(fd,'wb') as stream:stream.write(raw);stream.flush();os.fsync(stream.fileno())
            os.replace(temporary,path);fd=os.open(directory,os.O_DIRECTORY)
            try:os.fsync(fd)
            finally:os.close(fd)
        finally:temporary.unlink(missing_ok=True)
        return value
