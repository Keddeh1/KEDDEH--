export const HTML5_SQL_STUDIO_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML5 Relational SQL Query Studio</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #090d16;
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
      font-size: 13px;
    }
    #kernel-membrane-header {
      background: #000;
      color: #22d3ee;
      font: 10px monospace;
      padding: 4px 12px;
      border-bottom: 1px solid #22d3ee44;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 10000;
    }
    body { padding-top: 22px; }
    /* Left Sidebar: Schema Inspector */
    #sidebar {
      width: 260px;
      background: #0d1322;
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }
    .sidebar-header {
      padding: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      font-weight: 700;
      color: #38bdf8;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .schema-tree {
      flex: 1;
      overflow-y: auto;
      padding: 12px 14px;
    }
    .table-group { margin-bottom: 14px; }
    .table-name {
      font-weight: 700;
      color: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      padding: 4px 6px;
      border-radius: 4px;
      transition: background 0.15s;
    }
    .table-name:hover { background: rgba(56, 189, 248, 0.1); color: #38bdf8; }
    .table-count { font-size: 10px; color: #64748b; font-weight: normal; }
    .col-list {
      margin-left: 14px;
      padding-left: 8px;
      border-left: 1px solid rgba(255, 255, 255, 0.08);
      margin-top: 4px;
    }
    .col-item {
      font-size: 11px;
      color: #94a3b8;
      padding: 2px 0;
      font-family: monospace;
      display: flex;
      justify-content: space-between;
    }
    .col-type { color: #64748b; font-size: 10px; }

    /* Main Workspace */
    #workspace {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .top-toolbar {
      padding: 10px 16px;
      background: #0d1322;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .preset-label { font-size: 11px; color: #94a3b8; font-weight: 600; margin-right: 4px; }
    button {
      background: #1e293b;
      color: #e2e8f0;
      border: 1px solid #334155;
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }
    button:hover { background: #334155; border-color: #475569; }
    button.primary { background: #0284c7; border-color: #0284c7; color: white; }
    button.primary:hover { background: #0369a1; }

    /* Editor Box */
    .editor-section {
      height: 150px;
      background: #080c18;
      position: relative;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    textarea#sqlInput {
      width: 100%;
      height: 100%;
      background: transparent;
      border: none;
      padding: 14px 16px;
      color: #38bdf8;
      font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
      font-size: 13px;
      line-height: 1.5;
      resize: none;
      outline: none;
    }

    /* Results Header & Grid */
    .results-bar {
      padding: 8px 16px;
      background: #0f172a;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #94a3b8;
    }
    .status-badge {
      color: #22c55e;
      font-weight: 700;
    }
    .table-container {
      flex: 1;
      overflow: auto;
      background: #060913;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-family: monospace;
      font-size: 12px;
      text-align: left;
    }
    th {
      background: #0d1322;
      color: #38bdf8;
      font-weight: 700;
      padding: 10px 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      position: sticky;
      top: 0;
      z-index: 1;
    }
    td {
      padding: 8px 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      color: #cbd5e1;
    }
    tr:hover td { background: rgba(56, 189, 248, 0.04); }
    .error-box {
      padding: 20px;
      color: #f87171;
      font-family: monospace;
      background: rgba(239, 68, 68, 0.05);
      border: 1px dashed rgba(239, 68, 68, 0.3);
      margin: 16px;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <!-- Sidebar -->
  <aside id="sidebar">
    <div class="sidebar-header">
      <span>🗄️ Relational Schema</span>
    </div>
    <div class="schema-tree" id="schemaTree"></div>
  </aside>

  <!-- Workspace -->
  <main id="workspace">
    <div class="top-toolbar">
      <button class="primary" onclick="executeCurrentQuery()">▶ Run SQL (Ctrl+Enter)</button>
      <button onclick="formatQuery()">Format</button>
      <span class="preset-label" style="margin-left: 10px;">PRESETS:</span>
      <button onclick="loadPreset('topUsers')">Top Consumers</button>
      <button onclick="loadPreset('auditEvents')">Recent Audit Log</button>
      <button onclick="loadPreset('deptQuota')">Dept Quotas</button>
      <button onclick="loadPreset('activeVolumes')">Active Volumes</button>
      <button onclick="exportCSV()" style="margin-left: auto;">Export CSV</button>
    </div>

    <div class="editor-section">
      <textarea id="sqlInput" spellcheck="false"></textarea>
    </div>

    <div class="results-bar">
      <div>
        <span class="status-badge" id="statusBadge">QUERY SUCCESS</span>
        <span id="timingBadge" style="margin-left: 12px;">0.42 ms</span>
      </div>
      <div id="rowCountBadge">4 rows returned</div>
    </div>

    <div class="table-container" id="resultsGrid"></div>
  </main>

  <script>
    // ==========================================
    // KERNEL SYSCALL BRIDGE (Parent Membrane)
    // ==========================================
    const pendingSyscalls = new Map();
    window.addEventListener('message', (e) => {
      if (e.data && e.data.__kernel_syscall_response) {
        const { id, result } = e.data.__kernel_syscall_response;
        if (pendingSyscalls.has(id)) {
          pendingSyscalls.get(id)(result);
          pendingSyscalls.delete(id);
        }
      }
    });

    async function syscall(call, args = []) {
      const id = Math.random().toString(36).substring(2, 11);
      return new Promise((resolve) => {
        pendingSyscalls.set(id, resolve);
        window.parent.postMessage({ __kernel_syscall: { call, args, id } }, '*');
      });
    }

    // BOOT INTEGRITY CHECK (PROVENANCE VERIFICATION)
    async function verifyIntegrity() {
      console.log('[SQL Studio] Verifying application provenance...');
      const verified = await syscall('SYS_VERIFY_APP', [typeof APP_ID !== 'undefined' ? APP_ID : 'sql-studio', typeof APP_HASH !== 'undefined' ? APP_HASH : 'none']);
      if (verified) {
        console.log('[SQL Studio] SHA-256 Provenance Ledger Match: OK');
      } else {
        console.warn('[SQL Studio] Warning: Provenance verification failed or ledger mismatch.');
      }
    }
    verifyIntegrity();

    // In-memory Database Tables
    const DB = {
      users: [
        { id: 1, name: "Dr. Aboudy Keddeh", email: "aboudykeddeh276@gmail.com", department: "Engineering", role: "Root Admin", storage_quota_gb: 2048 },
        { id: 2, name: "Elena Rostova", email: "elena@braink.ai", department: "Neural Research", role: "Lead Scientist", storage_quota_gb: 1024 },
        { id: 3, name: "Marcus Vance", email: "marcus.vance@company.com", department: "Operations", role: "DevOps Lead", storage_quota_gb: 512 },
        { id: 4, name: "Sofia Chen", email: "sofia.chen@company.com", department: "Product", role: "Architect", storage_quota_gb: 256 },
        { id: 5, name: "KEX Service Daemon", email: "system-daemon@kex.local", department: "Infrastructure", role: "Machine Carrier", storage_quota_gb: 4096 }
      ],
      cloud_volumes: [
        { id: "vol-001", user_id: 1, volume_name: "production-vfs-nvme", provider: "Google Drive Enterprise", used_gb: 842.5, status: "ACTIVE", created_at: "2026-07-01" },
        { id: "vol-002", user_id: 1, volume_name: "kex-bootchain-blobs", provider: "Local NVMe Vault", used_gb: 340.2, status: "ACTIVE", created_at: "2026-07-15" },
        { id: "vol-003", user_id: 2, volume_name: "neural-embeddings-1536", provider: "Google Drive Enterprise", used_gb: 612.0, status: "ACTIVE", created_at: "2026-07-10" },
        { id: "vol-004", user_id: 3, volume_name: "docker-backups-tar", provider: "Cold Storage Archive", used_gb: 215.8, status: "ACTIVE", created_at: "2026-06-20" },
        { id: "vol-005", user_id: 4, volume_name: "design-figma-exports", provider: "Google Drive Enterprise", used_gb: 78.4, status: "IDLE", created_at: "2026-07-18" },
        { id: "vol-006", user_id: 5, volume_name: "ring0-kernel-dumps", provider: "Local NVMe Vault", used_gb: 1240.0, status: "ACTIVE", created_at: "2026-07-22" }
      ],
      audit_ledger: [
        { id: 101, action: "AUTH_OAUTH_TOKEN_EXCHANGE", timestamp: "2026-07-22 08:30:12", authority: "A.KEDDEH", ip_address: "192.168.1.104", status: "SUCCESS" },
        { id: 102, action: "VFS_BLOCK_SYNC", timestamp: "2026-07-22 08:32:00", authority: "A.KEDDEH", ip_address: "192.168.1.104", status: "SUCCESS" },
        { id: 103, action: "VOLUME_QUOTA_INCREASE", timestamp: "2026-07-22 09:15:45", authority: "ROOT", ip_address: "10.0.0.1", status: "SUCCESS" },
        { id: 104, action: "KERNEL_INODE_AUDIT", timestamp: "2026-07-22 10:04:18", authority: "KEX_DAEMON", ip_address: "127.0.0.1", status: "SUCCESS" },
        { id: 105, action: "SECURITY_SCAN_COMPLETED", timestamp: "2026-07-22 11:20:00", authority: "ROOT", ip_address: "10.0.0.1", status: "SUCCESS" }
      ],
      storage_analytics: [
        { metric_name: "total_allocated_gb", value: 7936, unit: "GB", recorded_at: "2026-07-22" },
        { metric_name: "total_used_gb", value: 3328.9, unit: "GB", recorded_at: "2026-07-22" },
        { metric_name: "dedup_efficiency_pct", value: 34.2, unit: "%", recorded_at: "2026-07-22" },
        { metric_name: "active_iops", value: 14200, unit: "IOPS", recorded_at: "2026-07-22" }
      ]
    };

    // Render Schema Sidebar
    function renderSchemaSidebar() {
      const container = document.getElementById('schemaTree');
      container.innerHTML = "";
      Object.keys(DB).forEach(tblName => {
        const rows = DB[tblName];
        const cols = Object.keys(rows[0] || {});

        const grp = document.createElement('div');
        grp.className = 'table-group';

        const head = document.createElement('div');
        head.className = 'table-name';
        head.innerHTML = '<span>📄 ' + tblName + '</span><span class="table-count">' + rows.length + ' rows</span>';
        head.onclick = () => {
          document.getElementById('sqlInput').value = "SELECT * FROM " + tblName + " LIMIT 10;";
          executeCurrentQuery();
        };

        const colList = document.createElement('div');
        colList.className = 'col-list';

        cols.forEach(c => {
          const val = rows[0][c];
          const type = typeof val === 'number' ? (Number.isInteger(val) ? 'INT' : 'FLOAT') : 'TEXT';
          const item = document.createElement('div');
          item.className = 'col-item';
          item.innerHTML = '<span>' + c + '</span><span class="col-type">' + type + '</span>';
          colList.appendChild(item);
        });

        grp.appendChild(head);
        grp.appendChild(colList);
        container.appendChild(grp);
      });
    }

    // SQL Engine Parser & Executor
    let lastResultSet = [];

    function executeCurrentQuery() {
      const sql = document.getElementById('sqlInput').value.trim();
      const t0 = performance.now();

      try {
        const results = runSql(sql);
        const dur = (performance.now() - t0).toFixed(2);
        lastResultSet = results;

        document.getElementById('statusBadge').textContent = 'QUERY SUCCESS';
        document.getElementById('statusBadge').style.color = '#22c55e';
        document.getElementById('timingBadge').textContent = dur + ' ms';
        document.getElementById('rowCountBadge').textContent = results.length + ' rows returned';

        renderTable(results);
      } catch (err) {
        document.getElementById('statusBadge').textContent = 'SYNTAX ERROR';
        document.getElementById('statusBadge').style.color = '#f87171';
        document.getElementById('resultsGrid').innerHTML = '<div class="error-box">⚠️ SQL Execution Error:\\n' + err.message + '</div>';
      }
    }

    function runSql(rawSql) {
      const sql = rawSql.replace(/;$/, '').trim();
      const match = sql.match(/SELECT\\s+(.+?)\\s+FROM\\s+(\\w+)(.*)/i);
      if (!match) throw new Error("Only SELECT queries are supported in this browser sandbox.");

      const selectClause = match[1].trim();
      const fromTable = match[2].trim().toLowerCase();
      const rest = match[3] || "";

      if (!DB[fromTable]) throw new Error("Table '" + fromTable + "' not found in relational catalog.");

      let dataset = JSON.parse(JSON.stringify(DB[fromTable]));

      // Check for JOIN
      const joinMatch = rest.match(/\\s+JOIN\\s+(\\w+)\\s+ON\\s+(\\w+)\\.(\\w+)\\s*=\\s*(\\w+)\\.(\\w+)/i);
      if (joinMatch) {
        const joinTable = joinMatch[1].toLowerCase();
        const t1 = joinMatch[2].toLowerCase(), c1 = joinMatch[3];
        const t2 = joinMatch[4].toLowerCase(), c2 = joinMatch[5];

        if (!DB[joinTable]) throw new Error("Join table '" + joinTable + "' not found.");

        const joined = [];
        dataset.forEach(row1 => {
          DB[joinTable].forEach(row2 => {
            const val1 = t1 === fromTable ? row1[c1] : row2[c1];
            const val2 = t2 === joinTable ? row2[c2] : row1[c2];
            if (val1 == val2) {
              const combined = {};
              Object.keys(row1).forEach(k => combined[fromTable + "_" + k] = row1[k]);
              Object.keys(row2).forEach(k => combined[joinTable + "_" + k] = row2[k]);
              joined.push(combined);
            }
          });
        });
        dataset = joined;
      }

      // Check WHERE
      const whereMatch = rest.match(/WHERE\\s+(.+?)(?:\\s+ORDER|\\s+LIMIT|$)/i);
      if (whereMatch) {
        const cond = whereMatch[1].trim();
        const eqMatch = cond.match(/(\\w+)\\s*(=|!=|>|<)\\s*['"]?([^'"]+)['"]?/i);
        if (eqMatch) {
          const col = eqMatch[1];
          const op = eqMatch[2];
          const val = isNaN(eqMatch[3]) ? eqMatch[3] : parseFloat(eqMatch[3]);

          dataset = dataset.filter(row => {
            const actual = row[col];
            if (op === '=') return String(actual).toLowerCase() === String(val).toLowerCase();
            if (op === '!=') return String(actual).toLowerCase() !== String(val).toLowerCase();
            if (op === '>') return Number(actual) > Number(val);
            if (op === '<') return Number(actual) < Number(val);
            return true;
          });
        }
      }

      // Check ORDER BY
      const orderMatch = rest.match(/ORDER\\s+BY\\s+(\\w+)(?:\\s+(ASC|DESC))?/i);
      if (orderMatch) {
        const col = orderMatch[1];
        const dir = (orderMatch[2] || 'ASC').toUpperCase();
        dataset.sort((a, b) => {
          if (a[col] < b[col]) return dir === 'ASC' ? -1 : 1;
          if (a[col] > b[col]) return dir === 'ASC' ? 1 : -1;
          return 0;
        });
      }

      // Check LIMIT
      const limitMatch = rest.match(/LIMIT\\s+(\\d+)/i);
      if (limitMatch) {
        const limit = parseInt(limitMatch[1], 10);
        dataset = dataset.slice(0, limit);
      }

      // Select Projection
      if (selectClause === '*') {
        return dataset;
      } else {
        const fields = selectClause.split(',').map(s => s.trim());
        return dataset.map(row => {
          const projected = {};
          fields.forEach(f => {
            if (row[f] !== undefined) projected[f] = row[f];
          });
          return projected;
        });
      }
    }

    function renderTable(rows) {
      const container = document.getElementById('resultsGrid');
      if (!rows || rows.length === 0) {
        container.innerHTML = '<div style="padding: 24px; color: #64748b; text-align: center;">No records matched query.</div>';
        return;
      }

      const cols = Object.keys(rows[0]);
      let html = '<table><thead><tr>';
      cols.forEach(c => { html += '<th>' + c + '</th>'; });
      html += '</tr></thead><tbody>';

      rows.forEach(r => {
        html += '<tr>';
        cols.forEach(c => {
          const v = r[c] !== null && r[c] !== undefined ? r[c] : 'NULL';
          html += '<td>' + v + '</td>';
        });
        html += '</tr>';
      });

      html += '</tbody></table>';
      container.innerHTML = html;
    }

    function loadPreset(name) {
      const presets = {
        topUsers: "SELECT * FROM cloud_volumes WHERE status = 'ACTIVE' ORDER BY used_gb DESC;",
        auditEvents: "SELECT * FROM audit_ledger WHERE status = 'SUCCESS' ORDER BY id DESC LIMIT 10;",
        deptQuota: "SELECT name, email, department, storage_quota_gb FROM users ORDER BY storage_quota_gb DESC;",
        activeVolumes: "SELECT * FROM cloud_volumes JOIN users ON cloud_volumes.user_id = users.id;"
      };
      if (presets[name]) {
        document.getElementById('sqlInput').value = presets[name];
        executeCurrentQuery();
      }
    }

    function formatQuery() {
      const val = document.getElementById('sqlInput').value;
      const formatted = val
        .replace(/\\s+/g, ' ')
        .replace(/\\bSELECT\\b/gi, '\\nSELECT')
        .replace(/\\bFROM\\b/gi, '\\nFROM')
        .replace(/\\bJOIN\\b/gi, '\\nJOIN')
        .replace(/\\bWHERE\\b/gi, '\\nWHERE')
        .replace(/\\bORDER BY\\b/gi, '\\nORDER BY')
        .replace(/\\bLIMIT\\b/gi, '\\nLIMIT')
        .trim();
      document.getElementById('sqlInput').value = formatted;
    }

    function exportCSV() {
      if (!lastResultSet || lastResultSet.length === 0) return;
      const cols = Object.keys(lastResultSet[0]);
      let csv = cols.join(",") + "\\n";
      lastResultSet.forEach(row => {
        csv += cols.map(c => JSON.stringify(row[c] || "")).join(",") + "\\n";
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'query_export_' + Date.now() + '.csv';
      a.click();
    }

    window.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        executeCurrentQuery();
      }
    });

    async function initSqlStudio() {
      // Sync with Host Kernel VFS
      try {
        const procs = await syscall('SYS_GET_PROCS');
        DB['system_processes'] = procs.map(p => ({
          pid: p.pid,
          ppid: p.ppid,
          command: p.command,
          state: p.state,
          uid: p.uid
        }));
      } catch (e) {
        console.warn('Kernel sync failed');
      }

      renderSchemaSidebar();
      loadPreset('topUsers');
    }

    initSqlStudio();
  </script>
</body>
</html>`;
