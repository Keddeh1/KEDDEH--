"""Preserve source bytes and inspect archives as data. Never extract or execute."""
import hashlib,json,os,shutil,stat,zipfile
from pathlib import Path, PurePosixPath
MAX_ARCHIVE_BYTES=256*1024*1024
MAX_TEXT_BYTES=1024*1024

def digest(path):
    value=hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda:stream.read(1024*1024),b''):value.update(block)
    return value.hexdigest()

def inspect_archive(path):
    findings=[]
    with zipfile.ZipFile(path) as archive:
        entries=archive.infolist();seen=set();total=sum(x.file_size for x in entries)
        for item in entries:
            name=item.filename;p=PurePosixPath(name.replace('\\','/'))
            if p.is_absolute() or '..' in p.parts or (p.parts and ':' in p.parts[0]):findings.append({'entry':name,'finding':'UNSAFE_PATH'})
            if name in seen:findings.append({'entry':name,'finding':'DUPLICATE_PATH'})
            seen.add(name)
            if stat.S_ISLNK(item.external_attr>>16):findings.append({'entry':name,'finding':'SYMLINK'})
            if item.flag_bits&1:findings.append({'entry':name,'finding':'ENCRYPTED_ENTRY'})
        crc='NOT_RUN_RESOURCE_LIMIT' if total>MAX_ARCHIVE_BYTES else 'PASS'
        if crc=='PASS':
            try:
                bad=archive.testzip()
                if bad:crc='FAILED';findings.append({'entry':bad,'finding':'CRC_FAILURE'})
            except (RuntimeError,zipfile.BadZipFile) as error:crc='FAILED';findings.append({'finding':'UNREADABLE_ARCHIVE','error_type':type(error).__name__})
        return {'entries':len(entries),'uncompressed_bytes':total,'crc_check':crc,'findings':findings,'instructions':'REFERENCE_ONLY_NOT_EXECUTED','extracted':False}

def preserve(source_root, custody_root):
    source_root=Path(source_root).resolve();custody_root=Path(custody_root)
    if custody_root.is_symlink():raise ValueError('SYMLINK_CUSTODY_ROOT')
    custody_root.mkdir(parents=True,exist_ok=True,mode=0o700);os.chmod(custody_root,0o700)
    records=[]
    for path in sorted(source_root.rglob('*')):
        if path.is_symlink():raise ValueError('SYMLINK_SOURCE_REJECTED')
        if not path.is_file():continue
        sha=digest(path);directory=custody_root/'originals'/sha;directory.mkdir(parents=True,exist_ok=True,mode=0o700)
        target=directory/path.name
        if target.is_symlink():raise ValueError('SYMLINK_COPY_REJECTED')
        if not target.exists():
            with path.open('rb') as src,target.open('xb') as dst:
                shutil.copyfileobj(src,dst);dst.flush();os.fsync(dst.fileno())
            os.chmod(target,0o600)
        if digest(target)!=sha or digest(path)!=sha:raise ValueError('SOURCE_OR_CUSTODY_DIGEST_CHANGED')
        record={'source_path':str(path.relative_to(source_root)),'sha256':sha,'bytes':path.stat().st_size,'custody_path':str(target.relative_to(custody_root)),'execution':'NONE','promotion':'REQUIRES_COMPONENT_REVIEW'}
        if zipfile.is_zipfile(target):record['archive']=inspect_archive(target)
        else:record['inspection']={'kind':target.suffix or 'opaque','instruction_policy':'REFERENCE_ONLY','parsed_or_executed':False}
        records.append(record)
    return {'schema':'deployment.source.custody.v1','source_files':len(records),'total_bytes':sum(x['bytes'] for x in records),'all_copies_sha256_verified':True,'originals_executed':False,'records':records}

if __name__=='__main__':
    import argparse
    parser=argparse.ArgumentParser();parser.add_argument('--source',required=True);parser.add_argument('--custody',required=True);args=parser.parse_args()
    report=preserve(args.source,args.custody);path=Path(args.custody)/'intake-inventory.json';path.write_text(json.dumps(report,indent=2)+'\n');os.chmod(path,0o600)
    print(json.dumps({key:report[key] for key in ['source_files','total_bytes','all_copies_sha256_verified','originals_executed']}))
