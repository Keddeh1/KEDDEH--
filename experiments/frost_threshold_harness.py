#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# frost_threshold_harness.py
# EXPERIMENTAL, variable-time educational implementation. Not a production signer.
# Corrected against RFC 9591 section 6.1 and appendix E.1. Trusted dealer, not DKG.

import os
import secrets
import threading
import hashlib
import struct
from typing import List, Tuple, Dict

# Ed25519 Curve Parameters
P = 2**255 - 19
L = 2**252 + 27742317777372353535851937790883648493  # Subgroup order

def inv_l(x: int) -> int:
    return pow(x, L - 2, L)

def inv_p(x: int) -> int:
    return pow(x, P - 2, P)

def sha512(b: bytes) -> bytes:
    return hashlib.sha512(b).digest()

def sha256(b: bytes) -> bytes:
    return hashlib.sha256(b).digest()

# Curve d coefficient modulo P
d_coeff = (-121665 * inv_p(121666)) % P

def point_add(P1: Tuple[int, int], P2: Tuple[int, int]) -> Tuple[int, int]:
    x1, y1 = P1
    x2, y2 = P2
    x3 = (x1*y2 + y1*x2) * inv_p(1 + d_coeff*x1*x2*y1*y2) % P
    y3 = (y1*y2 + x1*x2) * inv_p(1 - d_coeff*x1*x2*y1*y2) % P
    return (x3 % P, y3 % P)

def recover_x(y: int, sign: int) -> int:
    if y >= P:
        return None
    u = (y*y - 1) % P
    v = (d_coeff*y*y + 1) % P
    if u == 0 and sign == 0:
        return 0
    x = (u * pow(v, 3, P) * pow(u * pow(v, 7, P), (P - 5) // 8, P)) % P
    if (v * x * x - u) % P != 0:
        if (v * x * x + u) % P != 0:
            return None
        x = (x * pow(2, (P - 1) // 4, P)) % P
    if x == 0 and sign == 1:
        return None
    if x % 2 != sign:
        x = P - x
    return x

# Recover Base Point G
Gy = (4 * inv_p(5)) % P
Gx = recover_x(Gy, 0)
G = (Gx, Gy)

def scalar_mult(P_pt: Tuple[int, int], e: int) -> Tuple[int, int]:
    if type(e) is not int or e < 0: raise ValueError("INVALID_SCALAR")
    if e == 0:
        return (0, 1)
    Q = (0, 1)
    for bit in bin(e)[2:]:
        Q = point_add(Q, Q)
        if bit == '1':
            Q = point_add(Q, P_pt)
    return Q

def point_encode(P_pt: Tuple[int, int]) -> bytes:
    x, y = P_pt
    if not (0 <= x < P and 0 <= y < P) or (-x*x+y*y-1-d_coeff*x*x*y*y)%P:
        raise ValueError("INVALID_CURVE_POINT")
    s = bytearray(y.to_bytes(32, 'little'))
    if x % 2 != 0:
        s[31] |= 0x80
    return bytes(s)

def point_decode(b: bytes) -> Tuple[int, int]:
    if type(b) is not bytes or len(b) != 32:
        return None
    y = int.from_bytes(bytes(list(b[:31]) + [b[31] & 0x7f]), 'little')
    sign = (b[31] >> 7) & 1
    x = recover_x(y, sign)
    if x is None:
        return None
    point = (x, y)
    if point == (0, 1) or scalar_mult(point, L) != (0, 1):
        return None
    return point

CONTEXT = b"FROST-ED25519-SHA512-v1"

def checked_commitments(entries):
    result = sorted(entries, key=lambda entry: entry[0])
    ids = [entry[0] for entry in result]
    if not result or len(set(ids)) != len(ids) or any(type(i) is not int or not 0 < i < L for i in ids):
        raise ValueError("INVALID_COMMITMENT_IDENTIFIERS")
    if any(point_decode(D) is None or point_decode(E) is None for _,D,E in result):
        raise ValueError("INVALID_COMMITMENT_POINT")
    return result

def commitment_bytes(entries):
    return b"".join(i.to_bytes(32,'little') + D + E for i,D,E in entries)

def binding_factor(i, message, B, public_key):
    prefix = point_encode(public_key) + sha512(CONTEXT+b"msg"+message) + sha512(CONTEXT+b"com"+B)
    return int.from_bytes(sha512(CONTEXT+b"rho"+prefix+i.to_bytes(32,'little')),'little') % L

def nonce_scalar(secret_share, randomness=None):
    random = os.urandom(32) if randomness is None else randomness
    if type(random) is not bytes or len(random) != 32: raise ValueError("INVALID_NONCE_RANDOMNESS")
    return int.from_bytes(sha512(CONTEXT+b"nonce"+random+secret_share.to_bytes(32,'little')),'little') % L

def lagrange(i, ids):
    numerator, denominator = 1, 1
    for j in ids:
        if i != j: numerator = numerator*(-j)%L; denominator = denominator*(i-j)%L
    return numerator*inv_l(denominator)%L

class FROSTDealer:
    """Local trusted dealer polynomial sharing. Not distributed key generation."""
    def __init__(self, t: int, n: int):
        if type(t) is not int or type(n) is not int or not 2 <= t <= n < L:
            raise ValueError("INVALID_THRESHOLD_CONFIGURATION")
        self.t = t
        self.n = n
        # Generate random group secret s in [1, L-1]
        self.group_secret = secrets.randbelow(L - 1) + 1
        self.group_public_key = scalar_mult(G, self.group_secret)
        
        # Generate random polynomial coefficients a_1 ... a_{t-1}
        self.coeffs = [self.group_secret] + [secrets.randbelow(L - 1) + 1 for _ in range(t - 1)]
        
        # Evaluate shares s_i = f(i) for i in 1..n
        self.secret_shares: Dict[int, int] = {}
        self.public_shares: Dict[int, Tuple[int, int]] = {}
        for i in range(1, n + 1):
            val = 0
            for deg, c in enumerate(self.coeffs):
                val = (val + c * pow(i, deg, L)) % L
            self.secret_shares[i] = val
            self.public_shares[i] = scalar_mult(G, val)

    def lagrange_coefficient(self, i: int, participant_indices: List[int]) -> int:
        if len(set(participant_indices)) != len(participant_indices) or i not in participant_indices or any(type(j) is not int or not 1 <= j <= self.n for j in participant_indices):
            raise ValueError("INVALID_PARTICIPANT_SUBSET")
        num = 1
        den = 1
        for j in participant_indices:
            if j == i:
                continue
            num = (num * (-j)) % L
            den = (den * (i - j)) % L
        return (num * inv_l(den)) % L

class FROSTParticipant:
    """Represents a single threshold signer participant."""
    def __init__(self, index: int, secret_share: int, group_public_key: Tuple[int, int]):
        if type(index) is not int or not 0 < index < L or type(secret_share) is not int or not 0 <= secret_share < L or point_decode(point_encode(group_public_key)) is None:
            raise ValueError("INVALID_SIGNER_CONFIGURATION")
        self._lock = threading.Lock()
        self.index = index
        self.secret_share = secret_share
        self.group_public_key = group_public_key
        self.d_i = None
        self.e_i = None
        self.D_i = None
        self.E_i = None

    def round_1_generate_nonces(self):
        with self._lock:
            if self.d_i is not None: raise ValueError("NONCES_ALREADY_PENDING")
            return self._round_1_generate_nonces()

    def _round_1_generate_nonces(self):
        self.d_i = nonce_scalar(self.secret_share)
        self.e_i = nonce_scalar(self.secret_share)
        self.D_i = scalar_mult(G, self.d_i)
        self.E_i = scalar_mult(G, self.e_i)
        return (self.index, point_encode(self.D_i), point_encode(self.E_i))

    def round_2_sign_share(self, message: bytes, nonce_commitments: List[Tuple[int, bytes, bytes]], participant_indices: List[int], dealer: FROSTDealer) -> int:
        with self._lock:
            if self.d_i is None or self.e_i is None: raise ValueError("NONCES_ALREADY_CONSUMED")
            d_i, e_i = self.d_i, self.e_i
            self.d_i = self.e_i = None  # burn before any fallible transcript handling
            sorted_commitments = checked_commitments(nonce_commitments)
            ids = [entry[0] for entry in sorted_commitments]
            if ids != sorted(participant_indices) or len(ids) < dealer.t or self.index not in ids:
                raise ValueError("INVALID_SIGNER_SET")
            own = next(entry for entry in sorted_commitments if entry[0] == self.index)
            if own[1:] != (point_encode(self.D_i), point_encode(self.E_i)):
                raise ValueError("OWN_COMMITMENT_MISMATCH")
            return self._sign_share(message, sorted_commitments, participant_indices, dealer, d_i, e_i)

    def _sign_share(self, message, sorted_commitments, participant_indices, dealer, d_i, e_i):
        # Construct commitment list B
        B = commitment_bytes(sorted_commitments)
        
        # Compute binding factor rho_i = H_binding(i, message, B)
        rho_i = binding_factor(self.index, message, B, self.group_public_key)
        
        # Compute group commitment R = sum_{j} (D_j + rho_j * E_j)
        R = (0, 1)
        for idx, D_bytes, E_bytes in sorted_commitments:
            D_j = point_decode(D_bytes)
            E_j = point_decode(E_bytes)
            if D_j is None or E_j is None:
                raise ValueError("Invalid commitment point decoded")
            
            rho_j = binding_factor(idx, message, B, self.group_public_key)
            
            rho_E_j = scalar_mult(E_j, rho_j)
            R_j = point_add(D_j, rho_E_j)
            R = point_add(R, R_j)
        
        # Compute challenge c = H_challenge(R, Y, message)
        R_bytes = point_encode(R)
        Y_bytes = point_encode(self.group_public_key)
        c_input = R_bytes + Y_bytes + message
        c = int.from_bytes(sha512(c_input), 'little') % L
        
        # Compute Lagrange coefficient lambda_i
        lambda_i = dealer.lagrange_coefficient(self.index, participant_indices)
        
        # Compute signature share z_i = d_i + rho_i * e_i + c * lambda_i * s_i mod L
        z_i = (d_i + rho_i * e_i + c * lambda_i * self.secret_share) % L
        return z_i

class SignatureShareError(ValueError):
    def __init__(self, participant_id, reason):
        self.participant_id = participant_id
        self.reason = reason
        super().__init__(f'{reason}:participant={participant_id}')


class FROSTAggregator:
    """Aggregates threshold signature shares into a single standard Ed25519 group signature."""
    @staticmethod
    def aggregate(message: bytes, nonce_commitments: List[Tuple[int, bytes, bytes]], z_shares: Dict[int, int], group_public_key: Tuple[int, int], public_shares: dict, threshold: int) -> bytes:
        sorted_commitments = checked_commitments(nonce_commitments)
        ids = [entry[0] for entry in sorted_commitments]
        if type(threshold) is not int or threshold < 2 or len(ids) < threshold or set(z_shares) != set(ids) or any(i not in public_shares for i in ids):
            raise ValueError("THRESHOLD_OR_SHARE_SET_REJECTED")
        # Compute group commitment R
        B = commitment_bytes(sorted_commitments)
        R = (0, 1)
        for idx, D_bytes, E_bytes in sorted_commitments:
            D_j = point_decode(D_bytes)
            E_j = point_decode(E_bytes)
            if D_j is None or E_j is None:
                raise ValueError("Invalid commitment point decoded during aggregation")
            rho_j = binding_factor(idx, message, B, group_public_key)
            R_j = point_add(D_j, scalar_mult(E_j, rho_j))
            R = point_add(R, R_j)
        
        # Sum z = sum(z_i) mod L
        c = int.from_bytes(sha512(point_encode(R) + point_encode(group_public_key) + message), 'little') % L
        for idx, D_bytes, E_bytes in sorted_commitments:
            z_i = z_shares[idx]
            if type(z_i) is not int or not 0 <= z_i < L: raise SignatureShareError(idx, "INVALID_SIGNATURE_SCALAR")
            public = public_shares[idx]
            if point_decode(point_encode(public)) is None: raise SignatureShareError(idx, "INVALID_PUBLIC_SHARE")
            coefficient = lagrange(idx, ids)
            expected = point_add(point_add(point_decode(D_bytes), scalar_mult(point_decode(E_bytes), binding_factor(idx, message, B, group_public_key))), scalar_mult(public, (c * coefficient) % L))
            if scalar_mult(G, z_i) != expected: raise SignatureShareError(idx, "INVALID_SIGNATURE_SHARE")
        z = sum(z_shares.values()) % L
        
        # Format 64-byte signature: [R_bytes (32B) | z_bytes (32B)]
        R_bytes = point_encode(R)
        z_bytes = z.to_bytes(32, 'little')
        return R_bytes + z_bytes

    @staticmethod
    def verify(message: bytes, signature_64b: bytes, group_public_key: Tuple[int, int]) -> bool:
        if len(signature_64b) != 64:
            return False
        R_bytes = signature_64b[:32]
        z_bytes = signature_64b[32:]
        
        R = point_decode(R_bytes)
        # Reject invalid points and neutral identity point (0, 1)
        if R is None or R == (0, 1):
            return False
        z = int.from_bytes(z_bytes, 'little')
        if z >= L:
            return False
        
        Y_bytes = point_encode(group_public_key)
        # Reject invalid group public keys and identity point keys
        if point_decode(Y_bytes) is None or group_public_key == (0, 1):
            return False

        c_input = R_bytes + Y_bytes + message
        c = int.from_bytes(sha512(c_input), 'little') % L
        
        # Check z * G == R + c * Y
        zG = scalar_mult(G, z)
        cY = scalar_mult(group_public_key, c)
        R_plus_cY = point_add(R, cY)
        
        return point_encode(zG) == point_encode(R_plus_cY)

def run_frost_harness_test():
    print("=====================================================================")
    print(" EXPERIMENTAL THRESHOLD Ed25519 LOCAL HARNESS")
    print("=====================================================================")
    
    # Setup 2-of-3 threshold signing parameters
    t, n = 2, 3
    dealer = FROSTDealer(t, n)
    print(f"[DKG] Group Public Key (32B): {point_encode(dealer.group_public_key).hex()[:24]}...")
    
    # Select participants 1 and 3 (threshold t=2)
    p_indices = [1, 3]
    participants = [FROSTParticipant(i, dealer.secret_shares[i], dealer.group_public_key) for i in p_indices]
    
    # Round 1: Nonce Generation
    commitments = [p.round_1_generate_nonces() for p in participants]
    
    # Message = 52-byte signed context frame
    message_52b = b"KEX!" + struct.pack(">Q", 105) + b"ARM6" + struct.pack(">I", 512) + hashlib.sha256(b"TARGET_HMAC_CONTEXT").digest()
    
    # Round 2: Signature Share Generation
    z_shares = [p.round_2_sign_share(message_52b, commitments, p_indices, dealer) for p in participants]
    
    # Aggregation into standard 64-byte Ed25519 signature
    sig_64b = FROSTAggregator.aggregate(message_52b, commitments, dict(zip(p_indices,z_shares)), dealer.group_public_key, dealer.public_shares, dealer.t)
    print(f"[AGGREGATE] Generated 64B Ed25519 Group Signature: {sig_64b.hex()[:32]}...")
    
    # Verification against group public key
    is_valid = FROSTAggregator.verify(message_52b, sig_64b, dealer.group_public_key)
    print(f"[VERIFY] Standard Ed25519 Group Verification Result: {is_valid}")
    
    # Identity key rejection check
    identity_key = (0, 1)
    is_identity_rejected = not FROSTAggregator.verify(message_52b, sig_64b, identity_key)
    print(f"[SECURITY] Identity Group Key Rejection Check: {is_identity_rejected}")

    # Tamper test
    corrupted_msg = message_52b[:-1] + b"\x00"
    is_valid_tampered = FROSTAggregator.verify(corrupted_msg, sig_64b, dealer.group_public_key)
    print(f"[TAMPER] Corrupted Message Rejection Result: {is_valid_tampered}")
    
    assert is_valid == True, "FROST Verification failed!"
    assert is_identity_rejected == True, "Identity key was improperly accepted!"
    assert is_valid_tampered == False, "Tampered message was improperly accepted!"
    print("\n -> LOCAL HARNESS ASSERTIONS PASSED; NOT PRODUCTION QUALIFICATION")
    print("=====================================================================")

if __name__ == "__main__":
    run_frost_harness_test()