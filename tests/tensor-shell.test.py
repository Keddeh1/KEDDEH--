import copy
import json
from pathlib import Path
import sys
import unittest
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'runtime'))
from tensor_shell import validate_shell, transition, norm_shell_count
SHELL = json.loads((ROOT / 'runtime/shells/tetrahedron.json').read_text())

class TensorShell(unittest.TestCase):
    def test_exact_closed_tetrahedron(self):
        result = validate_shell(SHELL)
        self.assertEqual(result['euler_characteristic'], 2)
        self.assertEqual(result['signed_volume_times_six'], 1)
        self.assertEqual(result['oriented_area_vector_twice'], [0,0,0])
    def test_orientation_involution(self):
        shell = copy.deepcopy(SHELL)
        shell['faces'] = [list(reversed(f)) for f in shell['faces']]
        self.assertEqual(validate_shell(shell)['signed_volume_times_six'], -1)
        shell['faces'] = [list(reversed(f)) for f in shell['faces']]
        self.assertEqual(validate_shell(shell), validate_shell(SHELL))
    def test_open_shell(self):
        with self.assertRaises(ValueError):
            validate_shell(dict(SHELL, faces=SHELL['faces'][:-1]))
    def test_bad_orientation(self):
        shell = copy.deepcopy(SHELL)
        shell['faces'][0].reverse()
        with self.assertRaises(ValueError):
            validate_shell(shell)
    def test_duplicate_face(self):
        with self.assertRaises(ValueError):
            validate_shell(dict(SHELL, faces=SHELL['faces']+[SHELL['faces'][0]]))
    def test_disconnected_closed_components_rejected(self):
        second = [[x+3,y,z] for x,y,z in SHELL['vertices']]
        shell=dict(SHELL, vertices=SHELL['vertices']+second, faces=SHELL['faces']+[[v+4 for v in f] for f in SHELL['faces']])
        with self.assertRaises(ValueError): validate_shell(shell)
    def test_zero_origin_vertex_is_retained(self):
        self.assertEqual(validate_shell(SHELL)['vertices'], 4)
    def test_zero_crossing_preserves_context(self):
        state={'identity':'object://1','origin':'symbolic://1','orientation':[1,-1,1],'coordinate':[1,-1,0],'tick':7}
        result=transition(state,[-1,1,0])
        self.assertEqual(result['coordinate'], [0,0,0])
        self.assertEqual(result['identity'],state['identity'])
        self.assertEqual(result['origin'],state['origin'])
        self.assertEqual(result['orientation'],state['orientation'])
        self.assertEqual(result['tick'],8)
        self.assertEqual(state['tick'],7)
    def test_signed_reversal_involution(self):
        state={'identity':'object://1','origin':'symbolic://1','orientation':[1,-1,1],'coordinate':[2,-3,0],'tick':0}
        result=transition(transition(state,[0,0,0],reverse=True),[0,0,0],reverse=True)
        self.assertEqual(result['coordinate'],state['coordinate'])
        self.assertEqual(result['orientation'],state['orientation'])
        self.assertEqual(result['tick'],2)
    def test_norm_counts_match_enumeration(self):
        for radius in range(1,8):
            points=[(x,y) for x in range(-radius,radius+1) for y in range(-radius,radius+1)]
            self.assertEqual(sum(abs(x)+abs(y)==radius for x,y in points),norm_shell_count('L1',radius))
            self.assertEqual(sum(max(abs(x),abs(y))==radius for x,y in points),norm_shell_count('Linf',radius))
    def test_one_origin_reference_enforced(self):
        shell=copy.deepcopy(SHELL); shell['faces'][0][0]=0
        with self.assertRaises(ValueError): validate_shell(shell)
    def test_overflow_transition_rejected(self):
        state={'identity':'object://1','origin':'symbolic://1','orientation':[1,1,1],'coordinate':[2**63-1,0,0],'tick':0}
        with self.assertRaises(ValueError): transition(state,[1,0,0])

if __name__ == '__main__': unittest.main()
