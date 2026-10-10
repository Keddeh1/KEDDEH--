"""Contract tests; mocks are test fixtures, never production adapters."""
import importlib.util
from pathlib import Path
import struct
import unittest
from unittest.mock import Mock

spec = importlib.util.spec_from_file_location('admission', Path(__file__).resolve().parents[1] / 'runtime/web4_admission.py')
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


class AdmissionContract(unittest.TestCase):
    def setUp(self):
        self.context = struct.pack('>4sQ4sI32s', b'KEX!', 2, b'ARM8', 3, bytes(range(32)))
        self.wire = self.context + bytes(64)
        self.exchange = Mock()
        self.exchange.receive.return_value = (self.wire, b'abc')
        self.verifier = Mock()
        self.verifier.verify.return_value = True
        self.kex = Mock()
        self.kex.validate.return_value = True
        self.ledger = Mock()
        self.ledger.epoch_floor.return_value = 1
        self.ledger.accept.return_value = 'test-only-receipt'
        self.runtime = m.Web4Runtime(b'ARM8', self.exchange, self.verifier, self.kex, self.ledger)

    def test_canonical_architecture(self):
        for value in (bytearray(b'ARM8'), b'ARM', b'ARM88', 'ARM8'):
            with self.assertRaises(ValueError):
                m.Web4Runtime(value)

    def test_unbound_runtime(self):
        runtime = m.Web4Runtime(b'ARM8')
        with self.assertRaisesRegex(m.AdmissionError, 'UNBOUND'):
            runtime.receive_update()

    def test_exact_context_and_commit_arguments(self):
        self.assertEqual(self.runtime.receive_update(), 'test-only-receipt')
        self.verifier.verify.assert_called_once_with(bytes(64), self.context)
        self.kex.validate.assert_called_once_with(self.context, bytes(range(32)), b'abc')
        self.ledger.accept.assert_called_once_with(1, 2, self.wire, b'abc')
        self.assertEqual(self.runtime.state, 'IDLE')

    def test_wire_length(self):
        self.exchange.receive.return_value = (self.wire[:-1], b'abc')
        self.reject('WIRE_LENGTH_MUST_BE_116')

    def test_architecture_mismatch(self):
        self.runtime.architecture = b'X648'
        self.reject('MAGIC_OR_ARCHITECTURE_REJECTED')

    def test_invalid_floor(self):
        self.ledger.epoch_floor.return_value = True
        self.reject('INVALID_LEDGER_FLOOR')

    def test_replay(self):
        self.ledger.epoch_floor.return_value = 2
        self.reject('REPLAY_OR_DOWNGRADE')

    def test_signature_requires_literal_true(self):
        self.verifier.verify.return_value = 1
        self.reject('ED25519_VERIFICATION_FAILED')

    def test_payload_length(self):
        self.exchange.receive.return_value = (self.wire, b'ab')
        self.reject('PAYLOAD_LENGTH_MISMATCH')

    def test_kex_rejection(self):
        self.kex.validate.return_value = False
        self.reject('KEX_SUBSTRATE_REJECTED')

    def test_concurrent_ledger_change(self):
        self.ledger.accept.side_effect = m.AdmissionError('CONCURRENT_EPOCH_CHANGE')
        with self.assertRaisesRegex(m.AdmissionError, 'CONCURRENT_EPOCH_CHANGE'):
            self.runtime.receive_update()
        self.assertEqual(self.runtime.state, 'HALTED')

    def test_uncertain_commit_cannot_restart(self):
        self.ledger.accept.return_value = None
        with self.assertRaisesRegex(m.AdmissionError, 'DURABLE_RECEIPT_MISSING'):
            self.runtime.receive_update()
        with self.assertRaisesRegex(m.AdmissionError, 'HALTED'):
            self.runtime.receive_update()
        self.ledger.accept.assert_called_once()

    def reject(self, reason):
        with self.assertRaisesRegex(m.AdmissionError, reason):
            self.runtime.receive_update()
        self.ledger.accept.assert_not_called()
        self.assertEqual(self.runtime.state, 'HALTED')
        with self.assertRaisesRegex(m.AdmissionError, 'HALTED'):
            self.runtime.receive_update()
        self.exchange.receive.assert_called_once()


if __name__ == '__main__':
    unittest.main()
