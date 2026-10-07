#!/usr/bin/env python3
"""Keddeh TL2 carrier bridge.

Host-owned bridge between isolated guest-lane Unix sockets and the single
Stratum TCP carrier. No mock success: every command returns JSON with explicit
exit_code and observed socket/error state.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import socket
import sys
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Optional

DEFAULT_POOL_HOST = "bitcoin.viabtc.io"
DEFAULT_POOL_PORT = 3333
DEFAULT_GUEST_SOCK = "/tmp/keddeh_guest_lane_001.sock"
SUBSCRIBE = {"id": 1, "method": "mining.subscribe", "params": ["KEDDEH-TL2/1.0"]}


@dataclass
class StratumVerdict:
    valid_json: bool
    valid_submit: bool
    method: Optional[str]
    id: Any
    error: Optional[str]
    raw_sha256: str


def emit(obj: dict[str, Any], exit_code: int = 0) -> int:
    obj.setdefault("exit_code", exit_code)
    print(json.dumps(obj, sort_keys=True, separators=(",", ":")))
    return exit_code


def sha256_text(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def validate_line(raw: bytes) -> StratumVerdict:
    digest = sha256_text(raw)
    try:
        message = json.loads(raw.decode("utf-8"))
    except Exception as exc:
        return StratumVerdict(False, False, None, None, f"{type(exc).__name__}: {exc}", digest)
    method = message.get("method")
    params = message.get("params")
    valid_submit = method == "mining.submit" and isinstance(params, list) and len(params) >= 5
    return StratumVerdict(True, valid_submit, method, message.get("id"), None, digest)


def probe_pool(host: str, port: int, timeout: float) -> int:
    result: dict[str, Any] = {
        "pool_host": host,
        "pool_port": port,
        "resolved": False,
        "addresses": [],
        "connected": False,
        "subscribe_sent": False,
        "raw_response_text": None,
        "raw_response_hex": None,
        "error_type": None,
        "error": None,
    }
    try:
        infos = socket.getaddrinfo(host, port, socket.AF_UNSPEC, socket.SOCK_STREAM)
        result["resolved"] = True
        result["addresses"] = sorted({item[4][0] for item in infos})
    except Exception as exc:
        result["error_type"] = type(exc).__name__
        result["error"] = str(exc)
        return emit(result, 2)

    try:
        with socket.create_connection((host, port), timeout=timeout) as sock:
            sock.settimeout(timeout)
            sock.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
            result["connected"] = True
            line = (json.dumps(SUBSCRIBE, separators=(",", ":")) + "\n").encode("utf-8")
            sock.sendall(line)
            result["subscribe_sent"] = True
            response = sock.recv(4096)
            result["raw_response_hex"] = response.hex()
            result["raw_response_text"] = response.decode("utf-8", errors="replace")
    except Exception as exc:
        result["error_type"] = type(exc).__name__
        result["error"] = str(exc)
        return emit(result, 3)
    return emit(result, 0)


def serve_once(sock_path: str) -> int:
    path = Path(sock_path)
    if path.exists():
        path.unlink()
    server = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    server.bind(sock_path)
    os.chmod(sock_path, 0o600)
    server.listen(1)
    try:
        conn, _ = server.accept()
        with conn:
            raw = conn.recv(65536)
            verdict = validate_line(raw)
            accepted = verdict.valid_json and verdict.valid_submit
            payload = {"accepted_for_forwarding": accepted, "verdict": asdict(verdict)}
            conn.sendall((json.dumps(payload, sort_keys=True, separators=(",", ":")) + "\n").encode())
            return 0
    finally:
        server.close()
        try:
            path.unlink()
        except FileNotFoundError:
            pass


def send_lane(sock_path: str, payload: str) -> int:
    with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as client:
        client.connect(sock_path)
        client.sendall(payload.encode("utf-8"))
        data = client.recv(65536)
    sys.stdout.write(data.decode("utf-8", errors="replace"))
    return 0


def main(argv: Optional[list[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Keddeh TL2 carrier bridge")
    sub = parser.add_subparsers(dest="cmd", required=True)
    probe = sub.add_parser("probe-pool")
    probe.add_argument("--host", default=DEFAULT_POOL_HOST)
    probe.add_argument("--port", type=int, default=DEFAULT_POOL_PORT)
    probe.add_argument("--timeout", type=float, default=7.0)
    serve = sub.add_parser("serve-once")
    serve.add_argument("--sock", default=DEFAULT_GUEST_SOCK)
    send = sub.add_parser("send-lane")
    send.add_argument("--sock", default=DEFAULT_GUEST_SOCK)
    send.add_argument("--payload", required=True)
    args = parser.parse_args(argv)
    if args.cmd == "probe-pool":
        return probe_pool(args.host, args.port, args.timeout)
    if args.cmd == "serve-once":
        return serve_once(args.sock)
    if args.cmd == "send-lane":
        return send_lane(args.sock, args.payload)
    raise AssertionError(args.cmd)


if __name__ == "__main__":
    raise SystemExit(main())
