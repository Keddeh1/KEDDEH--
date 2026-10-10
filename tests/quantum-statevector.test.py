import importlib.util
import math
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('quantum', Path(__file__).resolve().parents[1] / 'runtime/quantum_statevector.py')
quantum = importlib.util.module_from_spec(spec)
spec.loader.exec_module(quantum)


def run(gates, count=1, **kwargs):
    return quantum.simulate_circuit(dict(schema=quantum.SCHEMA, qubits=count, gates=gates, **kwargs))


def gate(kind, target=1):
    return {'gate': kind, 'target': target}


class StatevectorPhysics(unittest.TestCase):
    def test_hadamard_inverse_preserves_interference(self):
        result = run([gate('H'), gate('H')])
        self.assertAlmostEqual(result['probabilities'][0], 1)
        self.assertAlmostEqual(result['probabilities'][1], 0)

    def test_relative_sign_changes_interference_outcome(self):
        result = run([gate('H'), gate('Z'), gate('H')])
        self.assertAlmostEqual(result['probabilities'][0], 0)
        self.assertAlmostEqual(result['probabilities'][1], 1)

    def test_complex_phase_is_retained_before_measurement(self):
        result = run([gate('H'), gate('S'), gate('H')])
        for actual, expected in zip(result['amplitudes'], [[0.5, 0.5], [0.5, -0.5]]):
            self.assertAlmostEqual(actual[0], expected[0])
            self.assertAlmostEqual(actual[1], expected[1])

    def test_bell_state_has_correlated_joint_outcomes(self):
        result = run([gate('H'), {'gate': 'CX', 'control': 1, 'target': 2}], count=2)
        for actual, expected in zip(result['probabilities'], [0.5, 0, 0, 0.5]):
            self.assertAlmostEqual(actual, expected)
        self.assertAlmostEqual(result['norm_squared'], 1)
        self.assertFalse(result['physical_hardware'])

    def test_controlled_x_inverse_restores_state(self):
        cx = {'gate': 'CX', 'control': 1, 'target': 2}
        result = run([gate('X'), cx, cx], count=2)
        self.assertAlmostEqual(result['probabilities'][1], 1)

    def test_one_origin_labels_and_little_endian_basis(self):
        result = run([gate('X', 2)], count=2)
        self.assertAlmostEqual(result['probabilities'][2], 1)
        for target in (0, -1, True, 3):
            with self.assertRaises(ValueError):
                run([gate('H', target)], count=2)

    def test_normalised_complex_initial_state(self):
        result = run([gate('H')], initial=[[1/math.sqrt(2), 0], [-1/math.sqrt(2), 0]])
        self.assertAlmostEqual(result['probabilities'][1], 1)

    def test_t_gate_composes_into_s_gate(self):
        a, b = run([gate('H'), gate('T'), gate('T')]), run([gate('H'), gate('S')])
        for actual, expected in zip(a['amplitudes'], b['amplitudes']):
            self.assertAlmostEqual(actual[0], expected[0])
            self.assertAlmostEqual(actual[1], expected[1])

    def test_invalid_states_are_rejected_without_renormalisation(self):
        for initial in ([[0, 0], [0, 0]], [[2, 0], [0, 0]], [[float('nan'), 0], [0, 0]], [[float('inf'), 0], [0, 0]], [[10**1000, 0], [0, 0]], [[True, 0], [0, 0]]):
            with self.assertRaises(ValueError):
                run([], initial=initial)

    def test_invalid_gate_and_execution_limits(self):
        for gates in ([{'gate': 'CX', 'control': 1, 'target': 1}], [gate('UNKNOWN')], [{'gate': 'H', 'target': 1, 'execute': 'ignored'}]):
            with self.assertRaises(ValueError):
                run(gates)
        with self.assertRaises(ValueError):
            run([], count=quantum.MAX_QUBITS+1)
        with self.assertRaises(ValueError):
            run([gate('H')] * 153, count=16)


if __name__ == '__main__':
    unittest.main()
