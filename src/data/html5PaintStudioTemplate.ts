export const HTML5_PAINT_STUDIO_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AetherPaint Graphics Studio</title>
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
      font-size: 12px;
      user-select: none;
    }
    #toolbar {
      height: 44px;
      background: #0d1322;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      padding: 0 12px;
      gap: 12px;
      flex-shrink: 0;
    }
    .tool-group {
      display: flex;
      align-items: center;
      gap: 4px;
      padding-right: 10px;
      border-right: 1px solid rgba(255, 255, 255, 0.08);
    }
    .btn {
      background: #1e293b;
      color: #cbd5e1;
      border: 1px solid #334155;
      padding: 5px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: all 0.15s;
    }
    .btn:hover { background: #334155; color: #fff; }
    .btn.active { background: #0284c7; border-color: #38bdf8; color: #fff; }
    .btn.danger:hover { background: #dc2626; border-color: #ef4444; }

    #palette {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .color-swatch {
      width: 18px;
      height: 18px;
      border-radius: 4px;
      cursor: pointer;
      border: 2px solid transparent;
      transition: transform 0.1s;
    }
    .color-swatch:hover { transform: scale(1.15); }
    .color-swatch.active { border-color: #ffffff; box-shadow: 0 0 4px rgba(255,255,255,0.8); }

    #canvas-container {
      flex: 1;
      background: #040711;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: auto;
      padding: 16px;
    }
    canvas#paintCanvas {
      background: #ffffff;
      box-shadow: 0 8px 30px rgba(0,0,0,0.7);
      border-radius: 4px;
      cursor: crosshair;
    }

    #statusbar {
      height: 24px;
      background: #0b111e;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 12px;
      font-size: 11px;
      color: #64748b;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div id="toolbar">
    <div style="font-weight: 700; color: #38bdf8; display: flex; align-items: center; gap: 6px; padding-right: 8px;">
      <span>🎨</span> AetherPaint
    </div>

    <div class="tool-group">
      <button class="btn active" id="btn-brush" onclick="setTool('brush')">✏️ Brush</button>
      <button class="btn" id="btn-line" onclick="setTool('line')">📏 Line</button>
      <button class="btn" id="btn-rect" onclick="setTool('rect')">⬜ Rect</button>
      <button class="btn" id="btn-circle" onclick="setTool('circle')">⭕ Circle</button>
      <button class="btn" id="btn-eraser" onclick="setTool('eraser')">🧹 Eraser</button>
    </div>

    <div class="tool-group">
      <span style="color: #94a3b8; font-size: 11px;">Size:</span>
      <input type="range" id="brushSize" min="1" max="40" value="4" style="width: 70px; accent-color: #0284c7;" oninput="updateBrushSize(this.value)">
      <span id="sizeVal" style="color: #38bdf8; font-family: monospace; font-size: 11px; min-width: 24px;">4px</span>
    </div>

    <div class="tool-group">
      <div id="palette"></div>
      <input type="color" id="customColor" value="#0284c7" style="width: 24px; height: 22px; border: none; background: transparent; cursor: pointer;" onchange="setColor(this.value)">
    </div>

    <div style="display: flex; gap: 6px; margin-left: auto;">
      <button class="btn" onclick="undo()">↩️ Undo</button>
      <button class="btn danger" onclick="clearCanvas()">🗑️ Clear</button>
      <button class="btn active" onclick="saveImage()">💾 Export PNG</button>
    </div>
  </div>

  <div id="canvas-container">
    <canvas id="paintCanvas" width="800" height="520"></canvas>
  </div>

  <div id="statusbar">
    <div id="coords">X: 0, Y: 0</div>
    <div>800 × 520px · 24-bit RGB Canvas Engine</div>
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
      console.log('[Paint Studio] Verifying application provenance...');
      const verified = await syscall('SYS_VERIFY_APP', [typeof APP_ID !== 'undefined' ? APP_ID : 'paint-studio', typeof APP_HASH !== 'undefined' ? APP_HASH : 'none']);
      if (verified) {
        console.log('[Paint Studio] SHA-256 Provenance Ledger Match: OK');
      } else {
        console.warn('[Paint Studio] Warning: Provenance verification failed or ledger mismatch.');
      }
    }
    verifyIntegrity();

    const canvas = document.getElementById('paintCanvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const coordsEl = document.getElementById('coords');
    const sizeVal = document.getElementById('sizeVal');

    let currentTool = 'brush';
    let currentColor = '#0f172a';
    let currentSize = 4;
    let isDrawing = false;
    let startX = 0;
    let startY = 0;
    let snapshot = null;
    const history = [];

    const COLORS = [
      '#000000', '#475569', '#ef4444', '#f97316', '#eab308',
      '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff'
    ];

    // Build palette
    const paletteEl = document.getElementById('palette');
    COLORS.forEach(c => {
      const el = document.createElement('div');
      el.className = 'color-swatch' + (c === '#000000' ? ' active' : '');
      el.style.backgroundColor = c;
      el.onclick = () => {
        setColor(c);
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        el.classList.add('active');
      };
      paletteEl.appendChild(el);
    });

    // Fill white background initial
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();

    function setTool(tool) {
      currentTool = tool;
      document.querySelectorAll('#toolbar .btn').forEach(b => {
        if (b.id && b.id.startsWith('btn-')) b.classList.remove('active');
      });
      const targetBtn = document.getElementById('btn-' + tool);
      if (targetBtn) targetBtn.classList.add('active');
    }

    function setColor(color) {
      currentColor = color;
    }

    function updateBrushSize(val) {
      currentSize = parseInt(val, 10);
      sizeVal.textContent = currentSize + 'px';
    }

    function saveState() {
      if (history.length > 25) history.shift();
      history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    }

    function undo() {
      if (history.length > 1) {
        history.pop();
        ctx.putImageData(history[history.length - 1], 0, 0);
      }
    }

    function clearCanvas() {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveState();
    }

    function getCanvasCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: Math.round((e.clientX - rect.left) * scaleX),
        y: Math.round((e.clientY - rect.top) * scaleY)
      };
    }

    canvas.addEventListener('mousedown', (e) => {
      isDrawing = true;
      const { x, y } = getCanvasCoords(e);
      startX = x;
      startY = y;
      snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);

      ctx.beginPath();
      ctx.lineWidth = currentSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = currentTool === 'eraser' ? '#ffffff' : currentColor;
      ctx.fillStyle = currentColor;

      if (currentTool === 'brush' || currentTool === 'eraser') {
        ctx.moveTo(x, y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    });

    canvas.addEventListener('mousemove', (e) => {
      const { x, y } = getCanvasCoords(e);
      coordsEl.textContent = 'X: ' + x + ', Y: ' + y;

      if (!isDrawing) return;

      if (currentTool === 'brush' || currentTool === 'eraser') {
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (currentTool === 'line') {
        ctx.putImageData(snapshot, 0, 0);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (currentTool === 'rect') {
        ctx.putImageData(snapshot, 0, 0);
        ctx.beginPath();
        ctx.rect(startX, startY, x - startX, y - startY);
        ctx.stroke();
      } else if (currentTool === 'circle') {
        ctx.putImageData(snapshot, 0, 0);
        ctx.beginPath();
        const r = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
        ctx.arc(startX, startY, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    window.addEventListener('mouseup', () => {
      if (isDrawing) {
        isDrawing = false;
        saveState();
      }
    });

    function saveImage() {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'aether_painting.png';
      link.href = dataUrl;
      link.click();

      // SYSCALL: Persist to host VFS
      syscall('SYS_WRITE_INODE', ['/home/ak/images/latest_painting.png.b64', dataUrl, 0o644]);
    }
  </script>
</body>
</html>`;
