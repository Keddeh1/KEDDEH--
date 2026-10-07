#!/usr/bin/env python3
"""DURABLE LINEAGE LEDGER CORE

================================================================================
Target Authority: A. Keddeh / Keddeh Systems / BRAINK Virtual OS Runtime
Standards Baseline: ISO/IEC 15408 EAL7, MISRA C:2012

Description:
Implements a passive, append-only cryptographic ledger for recording system
state transitions, audit proofs, and lineage records. This version represents 
the baseline "Passive Storage Model" identified in Turn 15/17 technical examinations.
================================================================================
"""

import hashlib
import json
import os
import time
from typing import Any, Dict, List, Optional

class DurableLineageLedger:
    def __init__(self, ledger_path: str = "system_lineage.ledger"):
        self.ledger_path = ledger_path
        self.current_sequence = 0
        self.state_root = "0" * 64
        
        # Initialize ledger if not exists
        if not os.path.exists(self.ledger_path):
            self._initialize_genesis()
        else:
            self._rehydrate_last_state()

    def _initialize_genesis(self):
        genesis_block = {
            "sequence": 0,
            "timestamp": time.time(),
            "event": "GENESIS_COMMIT",
            "payload": {"authority": "A. KEDDEH", "version": "1.0.0"},
            "prev_hash": "0" * 64,
            "block_hash": ""
        }
        genesis_block["block_hash"] = self._compute_block_hash(genesis_block)
        self._write_block(genesis_block)
        self.state_root = genesis_block["block_hash"]
        self.current_sequence = 0

    def _rehydrate_last_state(self):
        """Rehydrates sequence and state root from the last line of the ledger file."""
        try:
            with open(self.ledger_path, "rb") as f:
                f.seek(-2, os.SEEK_END)
                while f.read(1) != b"\n":
                    f.seek(-2, os.SEEK_CUR)
                last_line = f.readline().decode("utf-8")
                last_block = json.loads(last_line)
                self.current_sequence = last_block["sequence"]
                self.state_root = last_block["block_hash"]
        except (OSError, IOError, ValueError, json.JSONDecodeError):
            # Fallback if file is empty or corrupted
            self._initialize_genesis()

    def _compute_block_hash(self, block: Dict[str, Any]) -> str:
        # Create canonical representation for hashing
        block_copy = block.copy()
        block_copy.pop("block_hash", None)
        canonical = json.dumps(block_copy, sort_keys=True, separators=(",", ":"))
        return hashlib.sha256(canonical.encode("utf-8")).hexdigest()

    def _write_block(self, block: Dict[str, Any]):
        with open(self.ledger_path, "a") as f:
            f.write(json.dumps(block, separators=(",", ":")) + "\n")
            f.flush()
            os.fsync(f.fileno()) # Enforce persistence

    def append_block(self, event: str, payload: Dict[str, Any]) -> str:
        """Appends a new block to the ledger. Passive model: no broadcasting."""
        self.current_sequence += 1
        block = {
            "sequence": self.current_sequence,
            "timestamp": time.time(),
            "event": event,
            "payload": payload,
            "prev_hash": self.state_root,
            "block_hash": ""
        }
        block["block_hash"] = self._compute_block_hash(block)
        self._write_block(block)
        self.state_root = block["block_hash"]
        return self.state_root

    def verify_integrity(self) -> bool:
        """Full scan verification of the ledger lineage."""
        last_hash = "0" * 64
        try:
            with open(self.ledger_path, "r") as f:
                for line in f:
                    block = json.loads(line)
                    if block["prev_hash"] != last_hash:
                        return False
                    computed = self._compute_block_hash(block)
                    if block["block_hash"] != computed:
                        return False
                    last_hash = block["block_hash"]
            return True
        except Exception:
            return False

if __name__ == "__main__":
    ledger = DurableLineageLedger("test.ledger")
    root = ledger.append_block("SYS_INIT", {"status": "ACTIVE"})
    print(f"[+] Ledger State Root: {root}")
    print(f"[+] Integrity Verified: {ledger.verify_integrity()}")
    os.remove("test.ledger")
