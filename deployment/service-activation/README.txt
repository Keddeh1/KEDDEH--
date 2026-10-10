KEDDEH owner service activation and MCP SDK delivery

Run: python activate.py --manifest services.json
Supervise: python activate.py --manifest services.json --watch
MCP SDK stdio: python mcp_service.py --manifest services.json
Verify SDK client flow: python test_mcp.py

The manifest preserves observed deployment paths and exact existing commands.
Existing processes are adopted; no working node is killed or its data replaced.
Watch mode retries absent processes and rechecks runtime responses. A present
but unhealthy process is retained for repair rather than killed automatically.
Each owner daemon retains its existing internal locking and readiness measures.
Install requirements.txt in the selected runtime before starting the SDK surface.
Credentials remain in existing private files, not in the manifest or repository.

Nine family launchers are preserved. They require the owner's Docker daemon and
qualified images. Their current dependency failure is recorded, not replaced by
an unrelated runtime. The tensor-shell bundle is referenced at its supplied path;
it is absent in this environment. Its setup.py remains the source implementation.
VFS /status verifies HTTP response and retained counts; it does not claim a full
receipt-chain audit. Mesh /subscription reads an actual colony subscription.
ServerSpace UDS checks verify peer PID/UID, frame length, SHA256, CRC32, mask 7,
freshness and both worker readiness through the owner's existing handshake.

Managed environment configuration ID and revision are recorded in services.json.
This delivery is a GitHub-published executable configuration, not a claim that the
managed environment's configuration was published. The exposed cloud connector
only reads it. In that platform's environment configuration workflow, set startup
to the supervise command above and publish the configuration. That operation is
not available through this SDK or the exposed tools; it remains distinct from
running and publishing the software configuration here.

SDK client configuration: mcpServers.keddeh-services.command=python
mcpServers.keddeh-services.args=[mcp_service.py,--manifest,services.json]
Use absolute paths from the installed delivery directory for all three arguments.
The MCP surface is stdio; it does not introduce a public management listener.
