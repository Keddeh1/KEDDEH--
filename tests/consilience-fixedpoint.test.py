import importlib.util
from decimal import Decimal, localcontext, ROUND_FLOOR
from pathlib import Path
import unittest
spec=importlib.util.spec_from_file_location('math_engine',Path(__file__).resolve().parents[1]/'runtime/consilience_fixedpoint.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class MathTests(unittest.TestCase):
    def test_constants_against_two_independent_precision_settings(self):
        for precision in (80,120):
            with localcontext() as context:
                context.prec=precision
                for warrant,expected in m.LOG_Q32.items():
                    self.assertEqual(int((Decimal(warrant).ln()*Decimal(2**32)).to_integral_value(rounding=ROUND_FLOOR)),expected)
    def test_bit_exact_integer_sum(self):
        self.assertEqual(m.consilience_sum([1,2,3,4]),13649637264)
    def test_zero_has_no_log_or_authority(self):
        with self.assertRaisesRegex(ValueError,'LOG_ZERO_UNDEFINED'):m.consilience_sum([4,0])
    def test_invalid_and_boolean_warrants_fail(self):
        for value in (True,-1,5,1.0,'4'):
            with self.assertRaises(ValueError):m.consilience_sum([value])
    def test_overflow_is_explicit(self):
        original=m.MAX_I64
        try:
            m.MAX_I64=m.LOG_Q32[4]
            with self.assertRaises(OverflowError):m.consilience_sum([4,4])
        finally:m.MAX_I64=original
if __name__=='__main__':unittest.main()
