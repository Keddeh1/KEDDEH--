"""Exercise the official SDK client against the actual service-status tool."""
import asyncio
import json
from pathlib import Path
import sys
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def main():
    root=Path(__file__).resolve().parent
    params=StdioServerParameters(command=sys.executable,args=[str(root/'mcp_service.py'),'--manifest',str(root/'services.json')])
    async with stdio_client(params) as (reader,writer):
        async with ClientSession(reader,writer) as client:
            initialized=await client.initialize()
            tools=await client.list_tools()
            assert {t.name for t in tools.tools}=={'service_status','activate_services'}
            result=await client.call_tool('service_status',{})
            assert not result.isError
            receipt=json.loads(result.content[0].text)
            assert receipt['schema']=='keddeh.service-activation-receipt.v1'
            expected={'vfs-hub','protocol-mesh','serverspace-primary','serverspace-replica','braink-ide-ci-supervisor'}
            assert expected.issubset({r['id'] for r in receipt['services']})
            print(json.dumps({'sdk_handshake':initialized.serverInfo.name,'tools':[t.name for t in tools.tools],'observed_services':len(receipt['services']),'status_tool':'PASS'}))

asyncio.run(main())
