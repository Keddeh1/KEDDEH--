"""JSON request bridge to the existing resident transactional family workflow."""
import argparse
import json
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'runtime'))
from braink_family import resident_module, run_family
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--state',required=True,type=Path)
args=parser.parse_args()
request=json.load(sys.stdin)
if type(request) is not dict or not {'family_id','goal'} <= request.keys() or request.keys()-{'family_id','goal','learning_preferences','circuit','shell'}:
    raise ValueError('Invalid family request')
store=resident_module().EnterpriseStore(args.state)
try:
    result=run_family(store,request['family_id'],request['goal'],request.get('learning_preferences'),circuit=request.get('circuit'),shell=request.get('shell'))
    print(json.dumps(result))
finally:
    store.close()
