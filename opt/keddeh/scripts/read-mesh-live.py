#!/usr/bin/env python3
"""
Direct reader for the live running keddeh-mesh service.
Reads from /dev/shm/keddeh_spatial_telemetry directly.
"""

import os
import sys
import mmap
import struct

SHM_PATH = "/dev/shm/keddeh_spatial_telemetry"

if not os.path.exists(SHM_PATH):
    print(f"[-] Service not running: {SHM_PATH} not found.")
    sys.exit(1)

with open(SHM_PATH, "rb") as f:
    mm = mmap.mmap(f.fileno(), 128 * 1024, prot=mmap.PROT_READ)
    print(f"{'LANE':<8} | {'NONCE':<12} | {'GATE 5 DIGEST':<15} | {'LATENCY':<10} | {'STATUS'}")
    print("-" * 65)
    for i in range(20):
        off = i * 64
        # Format: < (little endian) I (u32 block_height) I (u32 base_nonce) H (u16 prev_hash) H (u16 merkle) I (u32 g5) B (u8 trig) B (u8 state) H (u16 latency)
        # Note: Struct unpack needs to match the C SpatialLanePacket layout exactly
        h, n, p, m, g5, trig, state, lat = struct.unpack_from("<IIHHIBBH", mm, off)
        lane_id = mm[off + 32]
        status = "BLOCK SOLVED" if trig == 1 else "HASHING"
        print(f"LANE-{lane_id:02d}  | {n:<12} | {g5:<15} | {lat} ns{'':<5} | {status}")
