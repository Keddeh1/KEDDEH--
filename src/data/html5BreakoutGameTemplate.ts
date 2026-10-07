export const HTML5_BREAKOUT_GAME_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML5 Retro Cyber Breakout</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #030712;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      overflow: hidden;
      user-select: none;
    }
    #game-wrapper {
      position: relative;
      border: 2px solid #8b5cf6;
      border-radius: 16px;
      box-shadow: 0 0 40px rgba(139, 92, 246, 0.25), 0 20px 50px rgba(0,0,0,0.8);
      overflow: hidden;
      background: #080c18;
    }
    canvas {
      display: block;
      background: #080c18;
    }
    #hud-bar {
      width: 100%;
      max-width: 640px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 18px;
      font-weight: 700;
      font-size: 13px;
      font-family: monospace;
      letter-spacing: 0.5px;
      background: rgba(15, 23, 42, 0.7);
      border-radius: 12px;
      margin-bottom: 12px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .hud-val { color: #f8fafc; font-weight: 800; }
    .overlay-modal {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(8, 12, 24, 0.88);
      backdrop-filter: blur(8px);
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 10;
      text-align: center;
      padding: 20px;
    }
    .modal-title {
      font-size: 28px;
      font-weight: 900;
      color: #38bdf8;
      margin-bottom: 8px;
      text-shadow: 0 0 20px rgba(56, 189, 248, 0.5);
    }
    .modal-sub {
      font-size: 14px;
      color: #94a3b8;
      margin-bottom: 20px;
    }
    .btn-action {
      background: linear-gradient(135deg, #8b5cf6, #3b82f6);
      color: white;
      border: none;
      padding: 10px 24px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
      transition: transform 0.1s, box-shadow 0.2s;
    }
    .btn-action:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(139, 92, 246, 0.6);
    }
    #controls-hint {
      margin-top: 10px;
      font-size: 11px;
      color: #64748b;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div id="hud-bar">
    <div>SCORE: <span id="val-score" class="hud-val" style="color: #ec4899;">0</span></div>
    <div>COMBO: <span id="val-combo" class="hud-val" style="color: #38bdf8;">1x</span></div>
    <div>HIGH: <span id="val-high" class="hud-val" style="color: #facc15;">0</span></div>
    <div>STAGE: <span id="val-stage" class="hud-val" style="color: #a78bfa;">1/3</span></div>
    <div>SHIELDS: <span id="val-lives" style="color: #22c55e;">❤❤❤</span></div>
  </div>

  <div id="game-wrapper">
    <canvas id="gameCanvas" width="640" height="460"></canvas>

    <div id="overlay" class="overlay-modal">
      <div id="overlay-title" class="modal-title">MISSION COMPLETE</div>
      <div id="overlay-sub" class="modal-sub">Final Score: 4,820</div>
      <button id="overlay-btn" class="btn-action" onclick="restartOrNext()">LAUNCH NEXT SECTOR</button>
    </div>
  </div>

  <div id="controls-hint">
    Mouse / Left &amp; Right Arrows to Move Paddle · Click or Space to Launch Ball &amp; Fire Lasers
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
      console.log('[Breakout] Verifying application provenance...');
      const verified = await syscall('SYS_VERIFY_APP', [typeof APP_ID !== 'undefined' ? APP_ID : 'breakout-game', typeof APP_HASH !== 'undefined' ? APP_HASH : 'none']);
      if (verified) {
        console.log('[Breakout] SHA-256 Provenance Ledger Match: OK');
      } else {
        console.warn('[Breakout] Warning: Provenance verification failed or ledger mismatch.');
      }
    }
    verifyIntegrity();

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const overlay = document.getElementById('overlay');
    const overlayTitle = document.getElementById('overlay-title');
    const overlaySub = document.getElementById('overlay-sub');
    const overlayBtn = document.getElementById('overlay-btn');

    const scoreEl = document.getElementById('val-score');
    const comboEl = document.getElementById('val-combo');
    const highEl = document.getElementById('val-high');
    const stageEl = document.getElementById('val-stage');
    const livesEl = document.getElementById('val-lives');

    // High score from localStorage
    let highScore = parseInt(localStorage.getItem('cyber_breakout_high') || '0', 10);
    highEl.textContent = highScore;

    // Web Audio Synthesizer
    let audioCtx = null;
    function playBeep(freq, type = 'sine', duration = 0.08, gainVal = 0.15) {
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      } catch(e) {}
    }

    // Game State
    let currentStage = 1;
    let score = 0;
    let combo = 1;
    let lives = 3;
    let isGameOver = false;
    let isVictory = false;

    // Paddle
    const paddle = {
      x: 270,
      y: 425,
      w: 100,
      h: 12,
      baseW: 100,
      hasLaser: false,
      laserTimer: 0,
      hasShield: false
    };

    // Balls list (supports multi-ball power-up)
    let balls = [{
      x: 320,
      y: 410,
      r: 6,
      vx: 4,
      vy: -4,
      attached: true
    }];

    // Lasers, Powerups, and Particles
    let lasers = [];
    let powerUps = [];
    let sparks = [];

    // Bricks Grid
    let bricks = [];
    const BRICK_ROWS = 6;
    const BRICK_COLS = 9;
    const BRICK_W = 60;
    const BRICK_H = 18;
    const BRICK_PAD = 8;
    const BRICK_OFFSET_TOP = 40;
    const BRICK_OFFSET_LEFT = 20;

    function initBricksForStage(stage) {
      bricks = [];
      const colors = ['#f43f5e', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#a855f7'];
      for (let c = 0; c < BRICK_COLS; c++) {
        bricks[c] = [];
        for (let r = 0; r < BRICK_ROWS; r++) {
          let health = 1;
          let isExplosive = false;
          let isGold = false;

          if (stage === 2 && (r === 0 || r === 1)) health = 2;
          if (stage === 3 && (r === 0 || r === 1 || r === 2)) health = 2;
          if (Math.random() < 0.08) isExplosive = true;
          if (Math.random() < 0.06) isGold = true;

          bricks[c][r] = {
            x: 0,
            y: 0,
            health: health,
            maxHealth: health,
            color: isGold ? '#eab308' : isExplosive ? '#ec4899' : colors[r % colors.length],
            isExplosive,
            isGold
          };
        }
      }
    }

    function createSparks(x, y, color, count = 8) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        sparks.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color,
          alpha: 1,
          decay: Math.random() * 0.03 + 0.02
        });
      }
    }

    function spawnPowerUp(x, y) {
      const types = ['multi', 'laser', 'wide', 'shield'];
      const type = types[Math.floor(Math.random() * types.length)];
      powerUps.push({ x, y, vy: 2, type });
    }

    // Input
    let rightPressed = false;
    let leftPressed = false;

    window.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'd') rightPressed = true;
      if (e.key === 'ArrowLeft' || e.key === 'a') leftPressed = true;
      if (e.key === ' ' || e.key === 'Enter') {
        launchOrFire();
      }
    });

    window.addEventListener('keyup', e => {
      if (e.key === 'ArrowRight' || e.key === 'd') rightPressed = false;
      if (e.key === 'ArrowLeft' || e.key === 'a') leftPressed = false;
    });

    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      paddle.x = Math.max(0, Math.min(canvas.width - paddle.w, relX - paddle.w / 2));
      for (const b of balls) {
        if (b.attached) b.x = paddle.x + paddle.w / 2;
      }
    });

    canvas.addEventListener('click', () => {
      launchOrFire();
    });

    function launchOrFire() {
      let anyAttached = false;
      for (const b of balls) {
        if (b.attached) {
          b.attached = false;
          anyAttached = true;
        }
      }
      if (anyAttached) {
        playBeep(520, 'triangle');
      } else if (paddle.hasLaser) {
        // Fire dual lasers
        lasers.push({ x: paddle.x + 10, y: paddle.y, vy: -7 });
        lasers.push({ x: paddle.x + paddle.w - 10, y: paddle.y, vy: -7 });
        playBeep(780, 'square', 0.05, 0.1);
      }
    }

    function detonateBrick(col, row) {
      for (let dc = -1; dc <= 1; dc++) {
        for (let dr = -1; dr <= 1; dr++) {
          const nc = col + dc;
          const nr = row + dr;
          if (nc >= 0 && nc < BRICK_COLS && nr >= 0 && nr < BRICK_ROWS) {
            const nb = bricks[nc][nr];
            if (nb && nb.health > 0) {
              nb.health = 0;
              score += 20;
              createSparks(nb.x + BRICK_W / 2, nb.y + BRICK_H / 2, nb.color, 6);
            }
          }
        }
      }
      playBeep(220, 'sawtooth', 0.2);
    }

    function checkCollisions() {
      // Check balls against bricks
      for (const b of balls) {
        if (b.attached) continue;

        for (let c = 0; c < BRICK_COLS; c++) {
          for (let r = 0; r < BRICK_ROWS; r++) {
            const brick = bricks[c][r];
            if (brick.health > 0) {
              if (b.x > brick.x && b.x < brick.x + BRICK_W && b.y > brick.y && b.y < brick.y + BRICK_H) {
                b.vy = -b.vy;
                brick.health--;
                createSparks(b.x, b.y, brick.color);

                if (brick.health <= 0) {
                  score += (brick.isGold ? 50 : 15) * combo;
                  combo++;
                  comboEl.textContent = combo + 'x';
                  playBeep(440 + r * 60, 'triangle');

                  if (brick.isExplosive) detonateBrick(c, r);
                  if (Math.random() < 0.18) spawnPowerUp(brick.x + BRICK_W / 2, brick.y + BRICK_H / 2);
                } else {
                  score += 5;
                  playBeep(320, 'square');
                }

                scoreEl.textContent = score;
                if (score > highScore) {
                  highScore = score;
                  highEl.textContent = highScore;
                  localStorage.setItem('cyber_breakout_high', String(highScore));
                  // SYSCALL: Persist to host VFS
                  syscall('SYS_WRITE_INODE', ['/home/ak/scores/breakout.json', JSON.stringify({ highScore, updatedAt: new Date().toISOString() }), 0o644]);
                }
              }
            }
          }
        }
      }

      // Check lasers against bricks
      for (let i = lasers.length - 1; i >= 0; i--) {
        const l = lasers[i];
        l.y += l.vy;
        let laserHit = false;

        for (let c = 0; c < BRICK_COLS; c++) {
          for (let r = 0; r < BRICK_ROWS; r++) {
            const brick = bricks[c][r];
            if (brick.health > 0) {
              if (l.x > brick.x && l.x < brick.x + BRICK_W && l.y > brick.y && l.y < brick.y + BRICK_H) {
                brick.health--;
                laserHit = true;
                createSparks(l.x, l.y, '#38bdf8', 4);
                if (brick.health <= 0) {
                  score += 15;
                  scoreEl.textContent = score;
                }
                break;
              }
            }
          }
          if (laserHit) break;
        }

        if (laserHit || l.y < 0) {
          lasers.splice(i, 1);
        }
      }

      // Check powerups against paddle
      for (let i = powerUps.length - 1; i >= 0; i--) {
        const p = powerUps[i];
        p.y += p.vy;

        if (p.y >= paddle.y && p.y <= paddle.y + paddle.h && p.x >= paddle.x && p.x <= paddle.x + paddle.w) {
          playBeep(880, 'sine', 0.15);
          if (p.type === 'wide') {
            paddle.w = 140;
            setTimeout(() => { paddle.w = paddle.baseW; }, 10000);
          } else if (p.type === 'laser') {
            paddle.hasLaser = true;
            setTimeout(() => { paddle.hasLaser = false; }, 8000);
          } else if (p.type === 'multi') {
            balls.push({ x: paddle.x + 20, y: paddle.y - 10, r: 6, vx: -3, vy: -4, attached: false });
            balls.push({ x: paddle.x + paddle.w - 20, y: paddle.y - 10, r: 6, vx: 3, vy: -4, attached: false });
          } else if (p.type === 'shield') {
            paddle.hasShield = true;
          }
          powerUps.splice(i, 1);
        } else if (p.y > canvas.height) {
          powerUps.splice(i, 1);
        }
      }

      // Check if all bricks cleared
      let remaining = 0;
      for (let c = 0; c < BRICK_COLS; c++) {
        for (let r = 0; r < BRICK_ROWS; r++) {
          if (bricks[c][r].health > 0) remaining++;
        }
      }
      if (remaining === 0) {
        onStageComplete();
      }
    }

    function onStageComplete() {
      if (currentStage < 3) {
        currentStage++;
        stageEl.textContent = currentStage + '/3';
        overlayTitle.textContent = 'SECTOR CLEARED';
        overlaySub.textContent = 'Advancing to Sector ' + currentStage;
        overlayBtn.textContent = 'BEGIN SECTOR ' + currentStage;
        overlay.style.display = 'flex';
      } else {
        isVictory = true;
        overlayTitle.textContent = 'SYSTEM LIBERATED';
        overlaySub.textContent = 'Flawless Victory! Final Score: ' + score;
        overlayBtn.textContent = 'PLAY AGAIN';
        overlay.style.display = 'flex';
      }
    }

    function onGameOver() {
      isGameOver = true;
      overlayTitle.textContent = 'CYBER BREACH';
      overlayTitle.style.color = '#ef4444';
      overlaySub.textContent = 'Shields Depleted. Final Score: ' + score;
      overlayBtn.textContent = 'RETRY MISSION';
      overlay.style.display = 'flex';
    }

    function restartOrNext() {
      overlay.style.display = 'none';
      if (isGameOver || isVictory) {
        currentStage = 1;
        score = 0;
        lives = 3;
        isGameOver = false;
        isVictory = false;
        scoreEl.textContent = '0';
        stageEl.textContent = '1/3';
        livesEl.textContent = '❤❤❤';
      }
      resetBoard();
    }

    function resetBoard() {
      combo = 1;
      comboEl.textContent = '1x';
      paddle.w = paddle.baseW;
      paddle.hasLaser = false;
      paddle.hasShield = false;
      balls = [{
        x: paddle.x + paddle.w / 2,
        y: paddle.y - 12,
        r: 6,
        vx: 4,
        vy: -4,
        attached: true
      }];
      lasers = [];
      powerUps = [];
      initBricksForStage(currentStage);
    }

    // Main Draw Loop
    function draw() {
      ctx.fillStyle = '#080c18';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle Background Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }

      // Draw Bricks
      for (let c = 0; c < BRICK_COLS; c++) {
        for (let r = 0; r < BRICK_ROWS; r++) {
          const b = bricks[c][r];
          if (b.health > 0) {
            b.x = c * (BRICK_W + BRICK_PAD) + BRICK_OFFSET_LEFT;
            b.y = r * (BRICK_H + BRICK_PAD) + BRICK_OFFSET_TOP;

            ctx.fillStyle = b.color;
            ctx.shadowColor = b.color;
            ctx.shadowBlur = b.health === 2 ? 10 : 4;
            ctx.fillRect(b.x, b.y, BRICK_W, BRICK_H);

            // Armored brick cracks
            if (b.maxHealth === 2 && b.health === 1) {
              ctx.strokeStyle = 'rgba(255,255,255,0.7)';
              ctx.beginPath();
              ctx.moveTo(b.x + 10, b.y + 2);
              ctx.lineTo(b.x + BRICK_W / 2, b.y + BRICK_H - 2);
              ctx.stroke();
            }
          }
        }
      }
      ctx.shadowBlur = 0;

      // Draw Paddle
      ctx.fillStyle = paddle.hasLaser ? '#ec4899' : '#8b5cf6';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 12;
      ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
      ctx.shadowBlur = 0;

      // Draw Shield Line if active
      if (paddle.hasShield) {
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - 4);
        ctx.lineTo(canvas.width, canvas.height - 4);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Draw Lasers
      ctx.fillStyle = '#38bdf8';
      for (const l of lasers) {
        ctx.fillRect(l.x - 2, l.y, 4, 10);
      }

      // Draw PowerUps
      for (const p of powerUps) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = p.type === 'laser' ? '#ec4899' : p.type === 'wide' ? '#facc15' : p.type === 'multi' ? '#38bdf8' : '#22c55e';
        ctx.fill();
      }

      // Draw Sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= s.decay;
        if (s.alpha <= 0) {
          sparks.splice(i, 1);
        } else {
          ctx.fillStyle = s.color;
          ctx.globalAlpha = s.alpha;
          ctx.fillRect(s.x, s.y, 2.5, 2.5);
          ctx.globalAlpha = 1;
        }
      }

      // Update & Draw Balls
      for (let i = balls.length - 1; i >= 0; i--) {
        const b = balls[i];

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (!b.attached && !isGameOver && !isVictory) {
          // Wall collisions
          if (b.x + b.vx > canvas.width - b.r || b.x + b.vx < b.r) {
            b.vx = -b.vx;
            playBeep(320);
          }
          if (b.y + b.vy < b.r) {
            b.vy = -b.vy;
            playBeep(320);
          } else if (b.y + b.vy > paddle.y - b.r && b.y < paddle.y + paddle.h) {
            // Paddle collision
            if (b.x > paddle.x && b.x < paddle.x + paddle.w) {
              const hitOffset = (b.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
              b.vx = hitOffset * 6.5;
              b.vy = -Math.abs(b.vy);
              playBeep(580, 'square');
            }
          } else if (b.y + b.vy > canvas.height - b.r) {
            if (paddle.hasShield) {
              b.vy = -Math.abs(b.vy);
              paddle.hasShield = false;
              playBeep(440, 'triangle');
            } else {
              balls.splice(i, 1);
              if (balls.length === 0) {
                lives--;
                combo = 1;
                comboEl.textContent = '1x';
                livesEl.textContent = '❤'.repeat(Math.max(0, lives));
                playBeep(180, 'sawtooth', 0.25);
                if (lives <= 0) {
                  onGameOver();
                } else {
                  balls.push({
                    x: paddle.x + paddle.w / 2,
                    y: paddle.y - 12,
                    r: 6,
                    vx: 4,
                    vy: -4,
                    attached: true
                  });
                }
              }
            }
          }

          b.x += b.vx;
          b.y += b.vy;
        }
      }

      // Paddle Keyboard movement
      if (rightPressed && paddle.x < canvas.width - paddle.w) paddle.x += 7;
      if (leftPressed && paddle.x > 0) paddle.x -= 7;

      checkCollisions();
      requestAnimationFrame(draw);
    }

    initBricksForStage(1);
    requestAnimationFrame(draw);
  </script>
</body>
</html>`;
