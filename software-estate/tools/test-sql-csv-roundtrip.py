"""Validate the actual JS serializer output with Python's independent CSV reader.

Run node tools/test-sql-csv.cjs first to refresh the generated fixture.
"""
import csv
import json
from pathlib import Path

reports = Path(__file__).resolve().parent.parent / 'reports'
with (reports / 'sql-csv-regression-output.csv').open(newline='') as source:
    rows = list(csv.DictReader(source))
expected = [
    {'zero': '0', 'bool': 'false', 'quoted': 'say "hi"', 'comma': 'a,b', 'newline': 'first\nsecond', 'crlf': 'first\r\nsecond', 'empty': '', 'unicode': 'café 日本'},
    {'zero': '-1', 'bool': 'true', 'quoted': '', 'comma': ',', 'newline': '\n', 'crlf': '\r', 'empty': '', 'unicode': 'λ'},
]
assert rows == expected, rows
(reports / 'sql-csv-roundtrip.json').write_text(json.dumps({'passed': True, 'parser': 'Python csv.DictReader', 'rows': len(rows), 'fields_verified': 16}, indent=2) + '\n')
print('Independent Python CSV round-trip: 16 fields preserved')
