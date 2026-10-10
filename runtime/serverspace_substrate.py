"""Isolated ServerSpace canary: atomic canonical state and shared mmap carrier."""
import argparse
import base64
import fcntl
import hashlib
import json
import mmap
import os
from pathlib import Path
import socket
import stat
import struct
import tempfile
import threading
import uuid
import zlib
from contextlib import contextmanager
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey, Ed25519PublicKey
from cryptography.hazmat.primitives import serialization

CAPACITY=65536

def canonical(value):return json.dumps(value,sort_keys=True,separators=(',',':'),allow_nan=False).encode()
def digest(value):return hashlib.sha256(canonical(value)).hexdigest()
def secured(root):
    root=Path(root)
    if root.is_symlink():raise ValueError('Runtime directory cannot be a symlink')
    root=root.resolve()
    info=root.stat()
    if not stat.S_ISDIR(info.st_mode) or info.st_uid!=os.getuid() or info.st_mode&0o077:raise ValueError('Runtime directory must be owner-only')
    for name in ['canonical.lock','canonical.json','substrate.shm','ready.sock','worker.lock','watchdog.lock','server.key','server.pub','client.key','client.pub']:
        if (root/name).is_symlink():raise ValueError('Runtime entry cannot be a symlink')
    return root

def private_file(path,data):
    fd=os.open(path,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
    with os.fdopen(fd,'wb') as stream:stream.write(data);stream.flush();os.fsync(stream.fileno())

def provision(root,identity):
    root=Path(root);root.mkdir(mode=0o700,parents=True,exist_ok=False);secured(root)
    for name in ['server','client']:
        key=Ed25519PrivateKey.generate()
        private_file(root/(name+'.key'),key.private_bytes(serialization.Encoding.Raw,serialization.PrivateFormat.Raw,serialization.NoEncryption()))
        private_file(root/(name+'.pub'),key.public_key().public_bytes(serialization.Encoding.Raw,serialization.PublicFormat.Raw))
    store=CanonicalState(root)
    store.initialize({'identity':identity,'origin':'symbolic://serverspace/canary','domains':{},'counter':0,'datasets':{}})
    return root

class CanonicalState:
    def __init__(self,root):self.root=secured(root)
    @contextmanager
    def lock(self):
        fd=os.open(self.root/'canonical.lock',os.O_RDWR|os.O_CREAT|os.O_NOFOLLOW,0o600)
        with os.fdopen(fd,'r+b') as lock:
            fcntl.flock(lock,fcntl.LOCK_EX)
            yield
    def _read(self):
        record=json.loads((self.root/'canonical.json').read_bytes())
        body=record['body']
        if record['sha256']!=digest(body) or record['crc32']!=format(zlib.crc32(canonical(body))&0xffffffff,'08x'):raise ValueError('Canonical state checksum mismatch')
        for dataset in body['payload']['datasets'].values():
            raw=base64.b64decode(dataset['content_b64'],validate=True)
            if hashlib.sha256(raw).hexdigest()!=dataset['sha256'] or format(zlib.crc32(raw)&0xffffffff,'08x')!=dataset['crc32']:raise ValueError('Cached dataset checksum mismatch')
        return record
    def _write(self,body):
        record={'body':body,'sha256':digest(body),'crc32':format(zlib.crc32(canonical(body))&0xffffffff,'08x')}
        raw=canonical(record)
        if len(raw)>CAPACITY-8:raise ValueError('Shared carrier capacity exceeded')
        fd,name=tempfile.mkstemp(prefix='.canonical-',dir=self.root)
        try:
            with os.fdopen(fd,'wb') as stream:stream.write(raw);stream.flush();os.fsync(stream.fileno())
            os.replace(name,self.root/'canonical.json')
            directory=os.open(self.root,os.O_RDONLY|os.O_DIRECTORY)
            try:os.fsync(directory)
            finally:os.close(directory)
            self._mirror(raw)
        finally:
            if os.path.exists(name):os.unlink(name)
        return record
    def _mirror(self,raw):
        fd=os.open(self.root/'substrate.shm',os.O_RDWR|os.O_CREAT|os.O_NOFOLLOW,0o600)
        try:
            os.ftruncate(fd,CAPACITY)
            with mmap.mmap(fd,CAPACITY,flags=mmap.MAP_SHARED,prot=mmap.PROT_READ|mmap.PROT_WRITE) as memory:
                memory[:8]=struct.pack('>Q',len(raw));memory[8:8+len(raw)]=raw;memory.flush()
            os.fsync(fd)
        finally:os.close(fd)
    def initialize(self,payload):
        with self.lock():
            if (self.root/'canonical.json').exists():raise ValueError('Canonical state already exists')
            return self._write({'version':1,'payload':payload,'continuations':{}})
    def read(self):
        with self.lock():return self._read()
    def rehydrate(self):
        with self.lock():
            record=self._read();self._mirror(canonical(record));return record
    def read_shared(self):
        with self.lock():
            with open(self.root/'substrate.shm','rb') as stream:
                with mmap.mmap(stream.fileno(),CAPACITY,access=mmap.ACCESS_READ) as memory:
                    size=struct.unpack('>Q',memory[:8])[0]
                    if not 0<size<=CAPACITY-8:raise ValueError('Invalid shared frame length')
                    record=json.loads(memory[8:8+size])
            if record!=self._read():raise ValueError('Shared carrier differs from canonical state')
            return record
    def project(self,view_identity,domain_names):
        if type(view_identity) is not str or not view_identity or type(domain_names) is not list or any(type(x) is not str for x in domain_names) or len(set(domain_names))!=len(domain_names):raise ValueError('Invalid isolated projection')
        payload=self.read()['body']['payload']
        return {'view_identity':view_identity,'parent_identity':payload['identity'],'parent_origin':payload['origin'],'domains':{name:payload['domains'][name] for name in domain_names}}
    def commit(self,request_id,expected_version,changes):
        if type(request_id) is not str or not request_id or len(request_id)>128 or type(expected_version) is not int or type(changes) is not dict or changes.keys()-{'domains','counter','datasets'}:raise ValueError('Invalid canonical update')
        request_digest=digest({'expected_version':expected_version,'changes':changes})
        with self.lock():
            current=self._read();body=current['body']
            prior=body['continuations'].get(request_id)
            if prior:
                if prior['request_digest']!=request_digest:raise ValueError('Continuation conflict')
                return prior
            if body['version']!=expected_version:raise ValueError('Stale generation')
            payload=dict(body['payload'],**changes)
            if type(payload['domains']) is not dict or type(payload['counter']) is not int or type(payload['datasets']) is not dict:raise ValueError('Invalid payload types')
            # A domain has its own identity/context. Equal unity values do not merge it.
            for domain in payload['domains'].values():
                if type(domain) is not dict or not all(type(domain.get(k)) is str and domain[k] for k in ('identity','origin')):raise ValueError('Domain identity/origin required')
            for key,old in body['payload']['domains'].items():
                new=payload['domains'].get(key)
                if new is None or (new['identity'],new['origin'])!=(old['identity'],old['origin']):raise ValueError('Domain identity cannot merge or erase')
            next_body={'version':body['version']+1,'payload':payload,'continuations':dict(body['continuations'])}
            receipt={'request_digest':request_digest,'version':next_body['version'],'payload_sha256':digest(payload)}
            next_body['continuations'][request_id]=receipt
            # Validate all caches before committing the canonical file.
            for dataset in payload['datasets'].values():
                raw=base64.b64decode(dataset['content_b64'],validate=True)
                if dataset['sha256']!=hashlib.sha256(raw).hexdigest() or dataset['crc32']!=format(zlib.crc32(raw)&0xffffffff,'08x'):raise ValueError('Dataset checksum mismatch')
            self._write(next_body);return receipt

def receive(sock):
    def exact(size):
        chunks=[]
        while size:
            chunk=sock.recv(size)
            if not chunk:raise ConnectionError('Incomplete IPC frame')
            chunks.append(chunk);size-=len(chunk)
        return b''.join(chunks)
    size=struct.unpack('>I',exact(4))[0]
    if not 0<size<=CAPACITY:raise ValueError('IPC frame budget exceeded')
    return json.loads(exact(size))

def send(sock,value):
    raw=canonical(value)
    if len(raw)>CAPACITY:raise ValueError('IPC frame budget exceeded')
    sock.sendall(struct.pack('>I',len(raw))+raw)

def signed(root,name,body):
    key=Ed25519PrivateKey.from_private_bytes((root/(name+'.key')).read_bytes())
    return {'body':body,'signature':base64.b64encode(key.sign(b'keddeh.serverspace.canary.v1\0'+canonical(body))).decode()}

def verify(root,name,message):
    Ed25519PublicKey.from_public_bytes((root/(name+'.pub')).read_bytes()).verify(base64.b64decode(message['signature'],validate=True),b'keddeh.serverspace.canary.v1\0'+canonical(message['body']))
    return message['body']

def call(root,op='health',args=None,timeout=1):
    root=secured(root);nonce=uuid.uuid4().hex
    body={'nonce':nonce,'op':op,'args':args or {}}
    with socket.socket(socket.AF_UNIX,socket.SOCK_STREAM) as sock:
        sock.settimeout(timeout);sock.connect(str(root/'ready.sock'));send(sock,signed(root,'client',body));reply=verify(root,'server',receive(sock))
    if reply['nonce']!=nonce:raise ValueError('Handshake nonce mismatch')
    if reply.get('error'):raise ValueError(reply['error'])
    return reply['result']

def serve(root):
    root=secured(root);store=CanonicalState(root)
    lock=open(root/'worker.lock','a');fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
    store.rehydrate()
    path=root/'ready.sock';path.unlink(missing_ok=True)
    with socket.socket(socket.AF_UNIX,socket.SOCK_STREAM) as listener:
        listener.bind(str(path));os.chmod(path,0o600);listener.listen(16)
        while True:
            connection,_=listener.accept()
            with connection:
                connection.settimeout(1)
                try:
                    pid,uid,gid=struct.unpack('3i',connection.getsockopt(socket.SOL_SOCKET,socket.SO_PEERCRED,12))
                    if uid!=os.getuid():raise PermissionError('Peer UID mismatch')
                    request=verify(root,'client',receive(connection));nonce=request['nonce']
                    if request['op']=='health':
                        current=store.read_shared()
                        # Bits: canonical/cache integrity; writer serialization; signed IPC.
                        mask=(1 if current['sha256']==digest(current['body']) else 0)|2|4
                        result={'readiness_mask':mask,'version':current['body']['version'],'sha256':current['sha256'],'crc32':current['crc32'],'peer_public_key_sha256':hashlib.sha256((root/'server.pub').read_bytes()).hexdigest(),'datasets_verified':len(current['body']['payload']['datasets'])}
                    elif request['op']=='project':result=store.project(**request['args'])
                    elif request['op']=='commit':result=store.commit(**request['args'])
                    elif request['op']=='echo':result={'sequence':request['args']['sequence'],'sha256':digest(request['args']['payload']),'crc32':format(zlib.crc32(canonical(request['args']['payload']))&0xffffffff,'08x')}
                    else:raise ValueError('Unsupported IPC operation')
                    send(connection,signed(root,'server',{'nonce':nonce,'result':result}))
                except Exception:
                    # Unauthenticated or malformed frames receive no reflected payload.
                    continue

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--root',type=Path,required=True)
    parser.add_argument('--health',action='store_true')
    parser.add_argument('--provision',action='store_true');parser.add_argument('--identity',default='serverspace://canary/local')
    args=parser.parse_args()
    if args.health:print(json.dumps(call(args.root)))
    elif args.provision:provision(args.root,args.identity)
    else:serve(args.root)
if __name__=='__main__':main()
