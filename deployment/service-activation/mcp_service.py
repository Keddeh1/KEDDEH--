"""Official MCP SDK surface for owner service activation and runtime readback."""
import argparse
import json
from pathlib import Path
import fcntl
from mcp.server.fastmcp import FastMCP
from activate import activate

parser=argparse.ArgumentParser();parser.add_argument('--manifest',type=Path,required=True);args=parser.parse_args()
mcp=FastMCP('Keddeh service activation')

@mcp.tool()
def service_status() -> dict:
    """Read the observed startup receipt; includes timestamp and unresolved dependencies."""
    state=Path(json.loads(args.manifest.read_text())['state_root'])
    return json.loads((state/'readback.json').read_text())

@mcp.tool()
def activate_services() -> dict:
    """Activate configured owner services, retaining existing processes and state."""
    state=Path(json.loads(args.manifest.read_text())['state_root']);state.mkdir(parents=True,exist_ok=True)
    with (state/'activation.lock').open('a') as lock:
        fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
        return activate(args.manifest)

if __name__=='__main__':mcp.run(transport='stdio')
