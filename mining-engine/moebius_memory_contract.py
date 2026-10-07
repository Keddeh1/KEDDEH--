#!/usr/bin/env python3
"""Verify the 128KB memory map and 124-byte Moebius packet region."""
from __future__ import annotations

import json
from dataclasses import asdict, dataclass

TOTAL_BYTES = 0x22000
PACKET_BYTES = 124
ZEROL_CONTINUUM_INDEX = 0x0000
SEGMENTS = [
    ("kernel", 0x0000, 0x3FFF),
    ("workspace", 0x4000, 0x7FFF),
    ("static_config", 0x8000, 0x98FF),
    ("telemetry", 0x9900, 0x9FFF),
    ("moebius_ring", 0xA000, 0x1FFFF),
    ("ui_scratchpad", 0x20000, 0x21FFF),
]


@dataclass
class SegmentReceipt:
    name: str
    start: str
    end: str
    size_bytes: int
    aligned_64b: bool


class MoebiusMemoryContract:
    """Moebius memory layout and boundary contract for KEX/BRAINK substrate."""
    TOTAL_BYTES = TOTAL_BYTES
    PACKET_BYTES = PACKET_BYTES
    ZEROL_CONTINUUM_INDEX = ZEROL_CONTINUUM_INDEX
    SEGMENTS = SEGMENTS

    @classmethod
    def verify_page_boundaries(cls) -> bool:
        return all(start % 64 == 0 and (end + 1) % 64 == 0 for _, start, end in cls.SEGMENTS)

    @classmethod
    def memory_mapping(cls) -> list[tuple[str, int, int]]:
        return cls.SEGMENTS


def main() -> int:
    receipts = []
    ok = True
    last_end = -1
    for name, start, end in SEGMENTS:
        size = end - start + 1
        aligned = start % 64 == 0 and (end + 1) % 64 == 0
        receipts.append(SegmentReceipt(name, hex(start), hex(end), size, aligned))
        ok = ok and aligned and start == last_end + 1
        last_end = end
    ring_size = SEGMENTS[4][2] - SEGMENTS[4][1] + 1
    obj = {
        "schema": "kex.braink.moebius.memory_contract.v1",
        "total_bytes_declared": TOTAL_BYTES,
        "segments": [asdict(x) for x in receipts],
        "contiguous": ok,
        "ring_packet_bytes": PACKET_BYTES,
        "ring_packet_capacity_floor": ring_size // PACKET_BYTES,
        "ring_remainder_bytes": ring_size % PACKET_BYTES,
        "ok": ok and last_end + 1 == TOTAL_BYTES,
    }
    print(json.dumps(obj, sort_keys=True, indent=2))
    return 0 if obj["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
