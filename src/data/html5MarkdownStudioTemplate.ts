export const HTML5_MARKDOWN_STUDIO_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML5 Markdown Engineering Studio</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #090d16;
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      font-size: 13px;
    }
    /* Toolbar */
    #top-bar {
      height: 48px;
      background: #0d1322;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      flex-shrink: 0;
    }
    .brand {
      font-size: 13px;
      font-weight: 700;
      color: #38bdf8;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .actions-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    select, button {
      background: #1e293b;
      color: #e2e8f0;
      border: 1px solid #334155;
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      outline: none;
      transition: all 0.15s;
    }
    select:hover, button:hover { background: #334155; border-color: #475569; }
    button.primary { background: #0284c7; border-color: #0284c7; color: white; }
    button.primary:hover { background: #0369a1; }

    /* Main Split Pane */
    #split-pane {
      flex: 1;
      display: flex;
      overflow: hidden;
    }
    .pane {
      flex: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .pane-header {
      height: 32px;
      background: #0b111e;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      padding: 0 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    #editor-box {
      flex: 1;
      position: relative;
    }
    textarea#markdownInput {
      width: 100%;
      height: 100%;
      background: #060913;
      border: none;
      padding: 16px;
      color: #e2e8f0;
      font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
      font-size: 13px;
      line-height: 1.6;
      resize: none;
      outline: none;
    }
    #preview-box {
      flex: 1;
      padding: 24px;
      background: #0a0e1a;
      border-left: 1px solid rgba(255, 255, 255, 0.08);
      overflow-y: auto;
      line-height: 1.7;
    }

    /* Markdown Styling */
    #preview-box h1 { font-size: 22px; font-weight: 800; color: #38bdf8; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
    #preview-box h2 { font-size: 17px; font-weight: 700; color: #f8fafc; margin-top: 20px; margin-bottom: 10px; }
    #preview-box h3 { font-size: 14px; font-weight: 700; color: #cbd5e1; margin-top: 14px; margin-bottom: 8px; }
    #preview-box p { margin-bottom: 12px; color: #cbd5e1; }
    #preview-box code { background: #1e293b; color: #38bdf8; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; }
    #preview-box pre { background: #060913; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; overflow-x: auto; font-family: monospace; font-size: 12px; color: #a5f3fc; }
    #preview-box blockquote { border-left: 3px solid #38bdf8; padding-left: 14px; margin-bottom: 14px; color: #94a3b8; font-style: italic; }
    #preview-box ul, #preview-box ol { margin-left: 20px; margin-bottom: 12px; }
    #preview-box li { margin-bottom: 4px; color: #cbd5e1; }
    #preview-box table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-family: monospace; font-size: 12px; }
    #preview-box th { background: #1e293b; color: #38bdf8; text-align: left; padding: 8px 12px; border: 1px solid #334155; }
    #preview-box td { padding: 8px 12px; border: 1px solid #1e293b; color: #cbd5e1; }
    #preview-box hr { border: none; border-top: 1px solid rgba(255, 255, 255, 0.08); margin: 20px 0; }

    /* Footer Stats */
    #bottom-bar {
      height: 28px;
      background: #0b111e;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      font-size: 11px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div id="top-bar">
    <div class="brand">
      <span>📝 Markdown Engineering Studio</span>
    </div>
    <div class="actions-group">
      <span style="font-size: 11px; color: #94a3b8;">TEMPLATE:</span>
      <select onchange="loadTemplate(this.value)">
        <option value="kexSpec">KEX Kernel Spec 2026</option>
        <option value="rfc">Cloud Vault RFC</option>
        <option value="runbook">DevOps Runbook</option>
      </select>
      <button onclick="downloadMarkdown()">Export .MD</button>
      <button onclick="downloadHTML()" class="primary">Export HTML</button>
    </div>
  </div>

  <div id="split-pane">
    <div class="pane">
      <div class="pane-header">
        <span>RAW MARKDOWN EDITOR</span>
        <span id="editorStats">Lines: 0</span>
      </div>
      <div id="editor-box">
        <textarea id="markdownInput" spellcheck="false"></textarea>
      </div>
    </div>

    <div class="pane">
      <div class="pane-header">
        <span>LIVE DOCUMENT PREVIEW</span>
        <span>HTML5 PARSER</span>
      </div>
      <div id="preview-box"></div>
    </div>
  </div>

  <div id="bottom-bar">
    <div id="docMetrics">0 words · 0 chars · ~0 min read</div>
    <div>UTF-8 · GitHub Flavored Markdown Engine</div>
  </div>

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
      console.log('[Markdown Studio] Verifying application provenance...');
      const verified = await syscall('SYS_VERIFY_APP', [typeof APP_ID !== 'undefined' ? APP_ID : 'markdown-studio', typeof APP_HASH !== 'undefined' ? APP_HASH : 'none']);
      if (verified) {
        console.log('[Markdown Studio] SHA-256 Provenance Ledger Match: OK');
      } else {
        console.warn('[Markdown Studio] Warning: Provenance verification failed or ledger mismatch.');
      }
    }
    verifyIntegrity();

    const input = document.getElementById('markdownInput');
    const preview = document.getElementById('preview-box');
    const docMetrics = document.getElementById('docMetrics');
    const editorStats = document.getElementById('editorStats');

    const TEMPLATES = {
      kexSpec: \`# KEX Microkernel Architecture Specification
**Document Version:** 6.0.297-RELEASE  
**Authority:** A. Keddeh // Braink AI Systems  
**Classification:** Engineering Standard (Sovereign WASM)

---

## 1. System Overview
The **KEX Microkernel** is a minimal, fault-tolerant execution container operating inside a browser WASM sandbox. It abstracts persistent Virtual Filesystem (VFS) operations and isolates user space daemons.

### 1.1 Core Tenets
* **Deterministic Bootchain**: Inode tree is mounted via cryptographic SHA-256 verification.
* **Zero Privilege Escalation**: Ring-0 memory map bounded strictly to 4MB WASM memory frames.
* **Dual Carrier Topology**: Supports execution inside local storage and Google Drive OAuth v3.

## 2. Inode Memory Allocation Table

| Region | Inode Address | Function | Write Access |
| :--- | :--- | :--- | :--- |
| \`/boot\` | 0x00010000 | Kexboot Manifest | Read-Only |
| \`/kernel\` | 0x00020000 | WASM Microkernel Bytecode | Execute-Only |
| \`/micro-os\` | 0x00040000 | Process Daemons | Superuser |
| \`/run\` | 0x00080000 | Ephemeral Sockets | Read-Write |

## 3. Daemons Configuration
\`\`\`json
{
  "authority": "A.KEDDEH",
  "daemons": [
    { "name": "kex-volume-mnt", "pid": 2, "state": "RUNNING" },
    { "name": "braink-ai-mesh", "pid": 3, "state": "RUNNING" },
    { "name": "proof-ledgerd", "pid": 4, "state": "RUNNING" }
  ]
}
\`\`\`

> **Note:** All storage transactions are verified against the Root Authority signature prior to disk commitment.
\`,

      rfc: \`# RFC 2026-04: Sovereign Cloud Storage Space
**Author:** Dr. Aboudy Keddeh  
**Status:** Accepted / Active Implementation  

---

## Abstract
This RFC outlines the architectural synchronization between client-side Web Cryptography APIs, Google Drive REST v3, and the KEX microkernel local vault.

## Motivation
Users require an offline-first storage experience that retains enterprise-grade cloud backup without exposing authentication tokens to public frontend frameworks.

## Key Architecture
1. **Local Vault**: Persistent IndexedDB / localStorage mirror for latency-free I/O.
2. **REST v3 Proxy**: Transparent synchronization with Google Workspace files.
3. **DOM Rigour**: Comprehensive in-browser test suite confirming zero layout shifts.
\`,

      runbook: \`# Production DevOps Incident Runbook
**Cluster:** \`us-central1-kex-nodes\`  
**Target:** 99.999% Service Level Objective (SLO)  

---

## Severity 1: Storage Volume Quota Breach
1. Verify free disk sectors on primary carrier:
   \`\`\`bash
   $ kex-volume-vfs --inspect /kex-volume --df -h
   \`\`\`
2. Execute automated log rotation:
   \`\`\`bash
   $ journalctl --vacuum-time=2d
   \`\`\`
3. Trigger lineage integrity check:
   \`\`\`bash
   $ proof-ledgerd --verify-all
   \`\`\`
\`
    };

    function parseMarkdown(md) {
      let html = md
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      // Code blocks
      html = html.replace(/\\\`\\\`\\\`([a-z]*)\\n([\\s\\S]*?)\\\`\\\`\\\`/g, '<pre><code>$2</code></pre>');

      // Inline code
      html = html.replace(/\\\`([^\\\`]+)\\\`/g, '<code>$1</code>');

      // Headings
      html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
      html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
      html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

      // Blockquotes
      html = html.replace(/^\\> (.*$)/gim, '<blockquote>$1</blockquote>');

      // Horizontal Rule
      html = html.replace(/^---$/gim, '<hr>');

      // Bold & Italic
      html = html.replace(/\\*\\*([^\\*]+)\\*\\*/g, '<strong>$1</strong>');
      html = html.replace(/\\*([^\\*]+)\\*/g, '<em>$1</em>');

      // Simple Table parser
      html = html.replace(/\\|(.+)\\|\\n\\|[-:\\| ]+\\|\\n((?:\\|.+\\|\\n?)+)/g, (match, header, rows) => {
        const ths = header.split('|').map(h => h.trim()).filter(h => h).map(h => '<th>' + h + '</th>').join('');
        const trs = rows.trim().split('\\n').map(row => {
          const tds = row.split('|').map(c => c.trim()).filter(c => c).map(c => '<td>' + c + '</td>').join('');
          return '<tr>' + tds + '</tr>';
        }).join('');
        return '<table><thead><tr>' + ths + '</tr></thead><tbody>' + trs + '</tbody></table>';
      });

      // Paragraphs
      html = html.split(/\\n\\n+/).map(para => {
        if (para.startsWith('<h') || para.startsWith('<pre') || para.startsWith('<table') || para.startsWith('<blockquote') || para.startsWith('<hr')) {
          return para;
        }
        return '<p>' + para.replace(/\\n/g, '<br>') + '</p>';
      }).join('\\n');

      return html;
    }

    function updateDoc() {
      const text = input.value;
      preview.innerHTML = parseMarkdown(text);

      const words = (text.match(/\\b\\S+\\b/g) || []).length;
      const chars = text.length;
      const readTime = Math.ceil(words / 200);
      const lines = text.split('\\n').length;

      docMetrics.textContent = words + ' words · ' + chars + ' chars · ~' + readTime + ' min read';
      editorStats.textContent = 'Lines: ' + lines;
    }

    input.addEventListener('input', updateDoc);

    function loadTemplate(key) {
      if (TEMPLATES[key]) {
        input.value = TEMPLATES[key];
        updateDoc();
      }
    }

    function downloadMarkdown() {
      const content = input.value;
      const blob = new Blob([content], { type: 'text/markdown' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'document.md';
      a.click();

      // SYSCALL: Persist to host VFS
      syscall('SYS_WRITE_INODE', ['/home/ak/documents/latest_spec.md', content, 0o644]);
    }

    function downloadHTML() {
      const fullHtml = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Document</title><style>body{font-family:sans-serif;max-width:800px;margin:40px auto;line-height:1.6;color:#333;}pre{background:#f4f4f5;padding:12px;border-radius:6px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;}</style></head><body>' + preview.innerHTML + '</body></html>';
      const blob = new Blob([fullHtml], { type: 'text/html' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'document.html';
      a.click();
    }

    loadTemplate('kexSpec');
  </script>
</body>
</html>`;
