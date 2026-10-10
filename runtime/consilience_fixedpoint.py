"""Deterministic integer arithmetic; caller owns evidence warrants and authority."""
# floor(2**32 * ln(r)), independently reproducible at high decimal precision.
LOG_Q32 = {1: 0, 2: 2977044471, 3: 4718503850, 4: 5954088943}
MAX_I64 = (1 << 63) - 1


def consilience_sum(warrants):
    total = 0
    for warrant in warrants:
        if type(warrant) is not int or warrant not in range(5):
            raise ValueError('INVALID_EPISTEMIC_WARRANT')
        if warrant == 0:
            raise ValueError('UNVERIFIED_EVIDENCE_ISOLATED_LOG_ZERO_UNDEFINED')
        total += LOG_Q32[warrant]
        if total > MAX_I64:
            raise OverflowError('SIGNED_Q32_32_OVERFLOW')
    return total
