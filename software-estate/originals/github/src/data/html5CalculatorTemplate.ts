export const HTML5_CALCULATOR_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AetherOS Scientific Calculator</title>
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
      user-select: none;
    }
    #calc-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      max-width: 480px;
      width: 100%;
      margin: 0 auto;
      padding: 16px;
      gap: 12px;
    }
    #screen {
      background: #040711;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: flex-end;
      min-height: 90px;
    }
    #history-line {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: #64748b;
      min-height: 18px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 100%;
      text-align: right;
    }
    #display {
      font-family: 'JetBrains Mono', monospace;
      font-size: 28px;
      font-weight: 700;
      color: #38bdf8;
      overflow-x: auto;
      white-space: nowrap;
      width: 100%;
      text-align: right;
    }
    #keypad {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
      flex: 1;
    }
    button.key {
      background: #1e293b;
      color: #e2e8f0;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.1s;
      outline: none;
    }
    button.key:hover { background: #334155; border-color: rgba(255, 255, 255, 0.2); }
    button.key:active { transform: scale(0.96); }
    button.key.func { background: #0f172a; color: #94a3b8; font-size: 12px; font-family: monospace; }
    button.key.op { background: #0c4a6e; color: #38bdf8; font-weight: 700; font-size: 16px; }
    button.key.op:hover { background: #0284c7; color: #fff; }
    button.key.eq { background: #0284c7; color: #ffffff; font-weight: 700; font-size: 18px; }
    button.key.eq:hover { background: #0369a1; }
    button.key.danger { color: #f87171; }
    button.key.danger:hover { background: #7f1d1d; color: #fecaca; }

    #tape-drawer {
      height: 70px;
      background: #060913;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
      padding: 6px 12px;
      overflow-y: auto;
      font-family: monospace;
      font-size: 11px;
      color: #94a3b8;
    }
    .tape-entry {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px dashed rgba(255, 255, 255, 0.05);
      padding: 2px 0;
    }
  </style>
</head>
<body>
  <div id="calc-container">
    <div id="screen">
      <div id="history-line"></div>
      <div id="display">0</div>
    </div>

    <div id="keypad">
      <!-- Row 1: Sci Functions -->
      <button class="key func" onclick="inputFunc('sin')">sin</button>
      <button class="key func" onclick="inputFunc('cos')">cos</button>
      <button class="key func" onclick="inputFunc('tan')">tan</button>
      <button class="key func" onclick="inputFunc('deg')">deg</button>
      <button class="key danger" onclick="clearAll()">AC</button>

      <!-- Row 2 -->
      <button class="key func" onclick="inputFunc('ln')">ln</button>
      <button class="key func" onclick="inputFunc('log')">log</button>
      <button class="key func" onclick="inputOp('^')">x^y</button>
      <button class="key func" onclick="inputFunc('sqrt')">√</button>
      <button class="key" onclick="deleteChar()">⌫</button>

      <!-- Row 3 -->
      <button class="key func" onclick="inputConst('pi')">π</button>
      <button class="key" onclick="inputNum('7')">7</button>
      <button class="key" onclick="inputNum('8')">8</button>
      <button class="key" onclick="inputNum('9')">9</button>
      <button class="key op" onclick="inputOp('/')">÷</button>

      <!-- Row 4 -->
      <button class="key func" onclick="inputConst('e')">e</button>
      <button class="key" onclick="inputNum('4')">4</button>
      <button class="key" onclick="inputNum('5')">5</button>
      <button class="key" onclick="inputNum('6')">6</button>
      <button class="key op" onclick="inputOp('*')">×</button>

      <!-- Row 5 -->
      <button class="key func" onclick="inputParen('(')">(</button>
      <button class="key" onclick="inputNum('1')">1</button>
      <button class="key" onclick="inputNum('2')">2</button>
      <button class="key" onclick="inputNum('3')">3</button>
      <button class="key op" onclick="inputOp('-')">−</button>

      <!-- Row 6 -->
      <button class="key func" onclick="inputParen(')')">)</button>
      <button class="key" onclick="inputNum('0')">0</button>
      <button class="key" onclick="inputDot()">.</button>
      <button class="key func" onclick="inputFunc('fact')">n!</button>
      <button class="key op" onclick="inputOp('+')">+</button>
    </div>

    <div style="display: flex; gap: 8px;">
      <button class="key eq" style="flex: 1; height: 38px;" onclick="calculate()">= EVALUATE</button>
    </div>

    <div id="tape-drawer">
      <div style="color: #64748b; margin-bottom: 2px;">CALCULATION TAPE:</div>
      <div id="tape-list"></div>
    </div>
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
      console.log('[Calculator] Verifying application provenance...');
      const verified = await syscall('SYS_VERIFY_APP', [typeof APP_ID !== 'undefined' ? APP_ID : 'scientific-calc', typeof APP_HASH !== 'undefined' ? APP_HASH : 'none']);
      if (verified) {
        console.log('[Calculator] SHA-256 Provenance Ledger Match: OK');
      } else {
        console.warn('[Calculator] Warning: Provenance verification failed or ledger mismatch.');
      }
    }
    verifyIntegrity();

    let currentInput = '0';
    let historyExpr = '';
    let isDeg = true;
    const displayEl = document.getElementById('display');
    const historyEl = document.getElementById('history-line');
    const tapeList = document.getElementById('tape-list');

    function updateDisplay() {
      displayEl.textContent = currentInput;
      historyEl.textContent = historyExpr;
    }

    function inputNum(num) {
      if (currentInput === '0' || currentInput === 'Error') {
        currentInput = num;
      } else {
        currentInput += num;
      }
      updateDisplay();
    }

    function inputDot() {
      if (!currentInput.includes('.')) {
        currentInput += '.';
        updateDisplay();
      }
    }

    function inputOp(op) {
      if (currentInput === 'Error') return;
      currentInput += ' ' + op + ' ';
      updateDisplay();
    }

    function inputParen(p) {
      if (currentInput === '0') currentInput = p;
      else currentInput += p;
      updateDisplay();
    }

    function inputConst(c) {
      const val = c === 'pi' ? String(Math.PI) : String(Math.E);
      if (currentInput === '0') currentInput = val;
      else currentInput += val;
      updateDisplay();
    }

    function inputFunc(fn) {
      if (fn === 'deg') {
        isDeg = !isDeg;
        event.target.textContent = isDeg ? 'deg' : 'rad';
        return;
      }
      try {
        let n = parseFloat(currentInput);
        if (isNaN(n)) return;
        let res = 0;
        if (fn === 'sin') {
          res = isDeg ? Math.sin(n * Math.PI / 180) : Math.sin(n);
        } else if (fn === 'cos') {
          res = isDeg ? Math.cos(n * Math.PI / 180) : Math.cos(n);
        } else if (fn === 'tan') {
          res = isDeg ? Math.tan(n * Math.PI / 180) : Math.tan(n);
        } else if (fn === 'ln') {
          res = Math.log(n);
        } else if (fn === 'log') {
          res = Math.log10(n);
        } else if (fn === 'sqrt') {
          res = Math.sqrt(n);
        } else if (fn === 'fact') {
          res = 1;
          for (let i = 2; i <= Math.min(n, 120); i++) res *= i;
        }
        currentInput = String(Number(res.toFixed(8)));
        updateDisplay();
      } catch(e) {
        currentInput = 'Error';
        updateDisplay();
      }
    }

    function deleteChar() {
      if (currentInput.length > 1) {
        currentInput = currentInput.trimEnd();
        if (currentInput.endsWith('+') || currentInput.endsWith('-') || currentInput.endsWith('*') || currentInput.endsWith('/')) {
          currentInput = currentInput.slice(0, -1).trimEnd();
        } else {
          currentInput = currentInput.slice(0, -1);
        }
        if (currentInput === '') currentInput = '0';
      } else {
        currentInput = '0';
      }
      updateDisplay();
    }

    function clearAll() {
      currentInput = '0';
      historyExpr = '';
      updateDisplay();
    }

    function calculate() {
      try {
        let expr = currentInput.replace(/\\^/g, '**');
        // Sanitize: only allow numbers, math operators, parens, and decimal points
        if (!/^[0-9+\\-*\\/().\\s*]+$/.test(expr)) {
          throw new Error('Invalid Expression');
        }
        const result = Function('"use strict"; return (' + expr + ')')();
        historyExpr = currentInput + ' =';
        
        // Append to tape
        const entry = document.createElement('div');
        entry.className = 'tape-entry';
        entry.innerHTML = '<span>' + currentInput + '</span><span style="color:#38bdf8;">= ' + result + '</span>';
        tapeList.prepend(entry);

        // SYSCALL: Log math event to kernel
        syscall('SYS_WRITE_INODE', ['/var/log/math_journal.log', \`[\${new Date().toISOString()}] EVAL: \${currentInput} = \${result}\\n\`, 0o644]);

        currentInput = String(result);
        updateDisplay();
      } catch(e) {
        currentInput = 'Error';
        updateDisplay();
      }
    }

    // Keyboard support
    window.addEventListener('keydown', (e) => {
      if (e.key >= '0' && e.key <= '9') inputNum(e.key);
      else if (e.key === '.') inputDot();
      else if (e.key === '+') inputOp('+');
      else if (e.key === '-') inputOp('-');
      else if (e.key === '*') inputOp('*');
      else if (e.key === '/') inputOp('/');
      else if (e.key === 'Enter' || e.key === '=') calculate();
      else if (e.key === 'Backspace') deleteChar();
      else if (e.key === 'Escape') clearAll();
    });
  </script>
</body>
</html>`;
