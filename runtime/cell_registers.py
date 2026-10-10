"""Owner-defined register contracts; immutable provisional results, no authority upgrade."""
from dataclasses import dataclass, asdict
from fractions import Fraction
import hashlib
from types import MappingProxyType
try:
    from .consilience_fixedpoint import consilience_sum
    from .serverspace_substrate import encoded
except ImportError:
    from consilience_fixedpoint import consilience_sum
    from serverspace_substrate import encoded


def number(value):
    if type(value) is int or isinstance(value, Fraction): return Fraction(value)
    if type(value) is str:
        try: return Fraction(value)
        except (ValueError, ZeroDivisionError) as error: raise ValueError('EXACT_NUMERIC_REGISTER_REQUIRED') from error
    raise ValueError('FLOAT_BOOLEAN_OR_OPAQUE_COORDINATE_REJECTED')


def rational(value): return {'numerator': value.numerator, 'denominator': value.denominator}


@dataclass(frozen=True)
class NullableState:
    value: Fraction | None

    @classmethod
    def from_cell(cls, value):
        return cls(None if value is None or value == '' else number(value))

    def snapshot(self):
        return {'kind':'ABSENCE_APERTURE'} if self.value is None else {'kind':'PRESENT','value':rational(self.value)}


@dataclass(frozen=True)
class Context:
    source_custody_identity: str
    whole_identity: str
    variable_X: str
    environment: str
    family: str

    def __post_init__(self):
        if any(type(value) is not str or not value for value in asdict(self).values()):
            raise ValueError('EXPLICIT_CONTEXT_IDENTITY_REQUIRED')

    def snapshot(self): return asdict(self)


def resolve_X(context, candidates):
    # Environmental conditioning is supplied explicitly, not invented here.
    values=sorted(set(number(value) for value in candidates))
    return {'context':context.snapshot(),'conditioning_status':'CALLER_SUPPLIED_UNVERIFIED','status':'CONTRADICTION' if not values else 'RESOLVED' if len(values)==1 else 'ALTERNATIVES','assignments':[rational(value) for value in values]}


def resolve_registers(context, cells, warrants, *, X_candidates=None):
    # Keep source cells unchanged; this computes a separate proposed mutation.
    source=dict(cells); direction=NullableState.from_cell(source.get('C')); magnitude=NullableState.from_cell(source.get('D'))
    if direction.value is None or magnitude.value is None:
        output=NullableState(None)
    else:
        if direction.value not in (Fraction(-1),Fraction(1)): raise ValueError('POLARITY_DIRECTION_MUST_BE_SIGNED_UNIT')
        if magnitude.value<=0: raise ValueError('POLARITY_MAGNITUDE_MUST_BE_POSITIVE')
        output=NullableState(direction.value*magnitude.value)
    target=NullableState.from_cell(source.get('Target')); coordinate=NullableState.from_cell(source.get('Hash'))
    delta=NullableState(None) if target.value is None or coordinate.value is None else NullableState(target.value-coordinate.value)
    candidate={'context':context.snapshot(),'epistemic_status':'PROVISIONAL_R1','durability_status_at_resolution':'NOT_COMMITTED','canonicality_status':'NOT_EVALUATED','registers':{'C':direction.snapshot(),'D':magnitude.snapshot(),'E':output.snapshot(),'delta':delta.snapshot()},'consilience_q32_32':consilience_sum(warrants),'X':{'status':'UNASSIGNED','variable':context.variable_X} if X_candidates is None else resolve_X(context,X_candidates)}
    # Digest is a transport-integrity check, never a replacement for context custody.
    wire=encoded(candidate)
    return MappingProxyType({'snapshot':wire,'byte_digest':hashlib.sha256(wire).hexdigest(),'context':context})
