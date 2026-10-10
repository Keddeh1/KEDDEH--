"""Experimental coordinator. Invalid shares abort the entire signing session."""
from frost_threshold_harness import FROSTAggregator, SignatureShareError
from incident_ledger import record

def aggregate_and_commit(bridge, context, commitments, shares, group_key, public_shares, threshold, payload, request_id):
    try:
        signature = FROSTAggregator.aggregate(context, commitments, shares, group_key, public_shares, threshold)
    except SignatureShareError as fault:
        record(bridge.root, 'FROST_SHARE', {
            'participant_id': fault.participant_id,
            'reason': fault.reason,
            'action': 'SESSION_ABORTED',
        })
        raise
    return bridge.commit(context + signature, payload, request_id)
