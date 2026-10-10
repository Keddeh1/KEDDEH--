import json,sys,tempfile,copy
from pathlib import Path
import unittest
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'runtime'))
import cell_registers as m
import canonical_lineage as ledger
class RegisterTests(unittest.TestCase):
    def setUp(self):self.context=m.Context('custody-A','whole-A','X','environment-A','family-A','parent-A')
    def resolve(self,**kwargs):return json.loads(m.resolve_registers(self.context,kwargs.pop('cells',{'C':'-1','D':'0.297','Target':'0','Hash':'1'}),[2,4],**kwargs)['snapshot'])
    def test_exact_polarity_and_signed_delta_preserve_source(self):
        cells={'C':'-1','D':'0.297','Target':'0','Hash':'1','formula':'=C*D'};before=copy.deepcopy(cells)
        out=self.resolve(cells=cells)
        self.assertEqual(out['registers']['E']['value'],{'numerator':-297,'denominator':1000});self.assertEqual(out['registers']['delta']['value']['numerator'],-1);self.assertEqual(cells,before)
    def test_absence_is_not_numeric_zero(self):
        self.assertEqual(m.NullableState.from_cell(None).snapshot(),{'kind':'ABSENCE_APERTURE'})
        self.assertEqual(m.NullableState.from_cell('0').snapshot(),{'kind':'PRESENT','value':{'numerator':0,'denominator':1}})
        out=self.resolve(cells={'C':None,'D':'2','Target':'0','Hash':'0'});self.assertEqual(out['registers']['E']['kind'],'ABSENCE_APERTURE');self.assertEqual(out['registers']['delta']['value']['numerator'],0)
    def test_invalid_polarity_and_opaque_numeric_hash_fail(self):
        for cells in [{'C':'0','D':'1'},{'C':'1','D':'0'},{'C':'1','D':'1','Hash':'abcdef'},{'C':True,'D':'1'},{'C':'1','D':0.297}]:
            with self.assertRaises(ValueError):self.resolve(cells=cells)
    def test_unassigned_alternatives_and_contradictions(self):
        self.assertEqual(self.resolve()['X']['status'],'UNASSIGNED');self.assertEqual(self.resolve(X_candidates=[])['X']['status'],'CONTRADICTION');self.assertEqual(self.resolve(X_candidates=['1','2'])['X']['status'],'ALTERNATIVES');self.assertEqual(self.resolve(X_candidates=['1'])['X']['status'],'RESOLVED')
    def test_different_wholes_stay_distinct_at_local_unity(self):
        other=m.Context('custody-B','whole-B','X','environment-A','family-A','parent-A')
        self.assertNotEqual(m.resolve_X(self.context,['1']),m.resolve_X(other,['1']))
    def test_parent_context_is_explicit_and_distinct(self):
        other=m.Context('custody-A','whole-A','X','environment-A','family-A','parent-B')
        self.assertNotEqual(m.resolve_X(self.context,['1']),m.resolve_X(other,['1']))
        with self.assertRaises(TypeError):m.Context('custody-A','whole-A','X','environment-A','family-A')
        with self.assertRaises(ValueError):m.Context('custody-A','whole-A','X','environment-A','family-A','')
    def test_integrity_persistence_does_not_upgrade_authority(self):
        candidate=m.resolve_registers(self.context,{'C':'1','D':'2'},[4])
        with tempfile.TemporaryDirectory() as root:
            receipt=ledger.commit(Path(root),'register-canary',{'provisional-registers':candidate['snapshot']},0,'register-1');state,records=ledger.recover(Path(root),'register-canary')
            persisted=json.loads(bytes.fromhex(state['datasets']['provisional-registers']['hex']))
            self.assertEqual(persisted['epistemic_status'],'PROVISIONAL_R1');self.assertEqual(persisted['durability_status_at_resolution'],'NOT_COMMITTED');self.assertEqual(receipt,records[-1])
            # Snapshot records its provisional creation-time status; receipt is separate.
if __name__=='__main__':unittest.main()
