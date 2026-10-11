export const HTML5_PARTICLE_PHYSICS_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML5 Particle & Vortex Physics Lab</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #060913;
      overflow: hidden;
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      user-select: none;
    }
    canvas {
      display: block;
      width: 100vw;
      height: 100vh;
      cursor: crosshair;
    }
    #hud {
      position: absolute;
      top: 16px;
      left: 16px;
      background: rgba(15, 23, 42, 0.88);
      border: 1px solid rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(14px);
      padding: 16px 20px;
      border-radius: 14px;
      font-size: 12px;
      width: 320px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
      transition: opacity 0.2s;
    }
    .header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .title {
      font-size: 13px;
      font-weight: 700;
      color: #38bdf8;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .badge {
      font-size: 9px;
      font-weight: 700;
      background: rgba(56, 189, 248, 0.2);
      color: #38bdf8;
      padding: 2px 6px;
      border-radius: 9999px;
      letter-spacing: 0.5px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 14px;
    }
    .stat-box {
      background: rgba(2, 6, 23, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
      padding: 6px 10px;
    }
    .stat-label { font-size: 9px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-value { font-size: 14px; font-weight: 700; color: #f8fafc; font-family: monospace; }
    .controls { display: flex; flex-direction: column; gap: 10px; }
    .slider-row { display: flex; flex-direction: column; gap: 4px; }
    .slider-label-row { display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; }
    input[type="range"] {
      width: 100%;
      height: 4px;
      background: #334155;
      border-radius: 2px;
      outline: none;
      -webkit-appearance: none;
    }
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #38bdf8;
      cursor: pointer;
    }
    .buttons-row {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-top: 6px;
    }
    button {
      flex: 1;
      min-width: 80px;
      background: #1e293b;
      color: #e2e8f0;
      border: 1px solid #334155;
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }
    button:hover { background: #334155; border-color: #475569; }
    button.primary { background: #0284c7; border-color: #0284c7; color: white; }
    button.primary:hover { background: #0369a1; }
    #instructions {
      position: absolute;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 6px 16px;
      border-radius: 9999px;
      font-size: 11px;
      color: #94a3b8;
      pointer-events: none;
      backdrop-filter: blur(8px);
    }
  </style>
</head>
<body>
  <div id="hud">
    <div class="header-row">
      <div class="title">
        <span>⚡ Particle &amp; Vortex Dynamics</span>
      </div>
      <span class="badge" id="mode-badge">VORTEX MODE</span>
    </div>

    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-label">Frame Rate</div>
        <div class="stat-value" id="val-fps">60 FPS</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Particles</div>
        <div class="stat-value" id="val-count">600</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Kinetic Energy</div>
        <div class="stat-value" id="val-energy">142 kJ</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Gravity Force G</div>
        <div class="stat-value" id="val-gravity">1.0x</div>
      </div>
    </div>

    <div class="controls">
      <div class="slider-row">
        <div class="slider-label-row">
          <span>Gravity Attraction</span>
          <span id="label-gravity">1.0</span>
        </div>
        <input type="range" id="slider-gravity" min="0.1" max="3" step="0.1" value="1.0">
      </div>

      <div class="slider-row">
        <div class="slider-label-row">
          <span>Atmospheric Drag</span>
          <span id="label-drag">0.98</span>
        </div>
        <input type="range" id="slider-drag" min="0.90" max="0.99" step="0.01" value="0.98">
      </div>

      <div class="slider-row">
        <div class="slider-label-row">
          <span>Simulation Mode</span>
        </div>
        <select id="mode-select" style="background: #1e293b; color: white; border: 1px solid #334155; padding: 6px; border-radius: 6px; font-size: 11px; outline: none;">
          <option value="vortex">Vortex Singularity</option>
          <option value="galaxy">Galaxy Spiral Arms</option>
          <option value="brownian">Quantum Brownian Diffusion</option>
          <option value="orbital">Binary Star Orbits</option>
        </select>
      </div>

      <div class="buttons-row">
        <button class="primary" onclick="triggerBlast()">Shockwave Burst</button>
        <button onclick="shiftPalette()">Shift Palette</button>
        <button onclick="togglePause()" id="pause-btn">Pause</button>
      </div>
    </div>
  </div>

  <div id="instructions">
    Move mouse to attract · Click anywhere to emit shockwave · Spacebar to burst
  </div>

  <canvas id="canvas"></canvas>

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
      console.log('[Physics Lab] Verifying application provenance...');
      const verified = await syscall('SYS_VERIFY_APP', [typeof APP_ID !== 'undefined' ? APP_ID : 'physics-lab', typeof APP_HASH !== 'undefined' ? APP_HASH : 'none']);
      if (verified) {
        console.log('[Physics Lab] SHA-256 Provenance Ledger Match: OK');
      } else {
        console.warn('[Physics Lab] Warning: Provenance verification failed or ledger mismatch.');
      }
    }
    verifyIntegrity();

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const MAX_PARTICLES = 650;
    let mouse = { x: width / 2, y: height / 2, down: false };
    let gravityScale = 1.0;
    let drag = 0.98;
    let simMode = 'vortex';
    let paletteIndex = 0;
    let isPaused = false;

    const palettes = [
      { name: "Cyber Cyan", baseHue: 195, range: 45, bg: "rgba(6, 9, 19, 0.18)" },
      { name: "Nebula Violet", baseHue: 270, range: 50, bg: "rgba(10, 6, 19, 0.18)" },
      { name: "Solar Flare", baseHue: 25, range: 45, bg: "rgba(19, 9, 6, 0.18)" },
      { name: "Emerald Matrix", baseHue: 150, range: 40, bg: "rgba(6, 19, 12, 0.18)" }
    ];

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 0.5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.radius = Math.random() * 2 + 1;
        this.mass = this.radius * 1.2;
        this.hue = (palettes[paletteIndex].baseHue + (Math.random() - 0.5) * palettes[paletteIndex].range + 360) % 360;
        this.tail = [];
      }

      update() {
        if (simMode === 'vortex') {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < 600) {
            const force = (gravityScale * 180) / (dist * 0.8 + 50);
            this.vx += (dx / dist) * force * 0.35;
            this.vy += (dy / dist) * force * 0.35;
            // Perpendicular vortex spin
            this.vx += (-dy / dist) * force * 0.25;
            this.vy += (dx / dist) * force * 0.25;
          }
        } else if (simMode === 'galaxy') {
          const dx = width / 2 - this.x;
          const dy = height / 2 - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (gravityScale * 140) / (dist * 0.5 + 40);
          this.vx += (dx / dist) * force * 0.25;
          this.vy += (dy / dist) * force * 0.25;
          this.vx += (-dy / dist) * force * 0.55;
          this.vy += (dx / dist) * force * 0.55;
        } else if (simMode === 'brownian') {
          this.vx += (Math.random() - 0.5) * 1.5;
          this.vy += (Math.random() - 0.5) * 1.5;
        } else if (simMode === 'orbital') {
          const star1 = { x: width * 0.4, y: height * 0.5 };
          const star2 = { x: width * 0.6, y: height * 0.5 };
          const d1x = star1.x - this.x, d1y = star1.y - this.y;
          const dist1 = Math.sqrt(d1x * d1x + d1y * d1y) || 1;
          const d2x = star2.x - this.x, d2y = star2.y - this.y;
          const dist2 = Math.sqrt(d2x * d2x + d2y * d2y) || 1;

          this.vx += (d1x / dist1) * (120 / (dist1 + 40)) * gravityScale * 0.2;
          this.vy += (d1y / dist1) * (120 / (dist1 + 40)) * gravityScale * 0.2;
          this.vx += (d2x / dist2) * (120 / (dist2 + 40)) * gravityScale * 0.2;
          this.vy += (d2y / dist2) * (120 / (dist2 + 40)) * gravityScale * 0.2;
        }

        this.vx *= drag;
        this.vy *= drag;
        this.x += this.vx;
        this.y += this.vy;

        // Screen wrap
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      draw() {
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const alpha = Math.min(1, Math.max(0.3, speed / 4));
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "hsla(" + this.hue + ", 90%, 65%, " + alpha + ")";
        ctx.shadowColor = "hsl(" + this.hue + ", 90%, 60%)";
        ctx.shadowBlur = speed > 3 ? 8 : 2;
        ctx.fill();
      }
    }

    for (let i = 0; i < MAX_PARTICLES; i++) {
      particles.push(new Particle());
    }

    // Event Listeners
    window.addEventListener('mousemove', e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mousedown', () => {
      triggerBlast();
    });

    window.addEventListener('keydown', e => {
      if (e.code === 'Space') {
        triggerBlast();
      }
    });

    document.getElementById('slider-gravity').addEventListener('input', e => {
      gravityScale = parseFloat(e.target.value);
      document.getElementById('label-gravity').textContent = gravityScale.toFixed(1);
      document.getElementById('val-gravity').textContent = gravityScale.toFixed(1) + 'x';
    });

    document.getElementById('slider-drag').addEventListener('input', e => {
      drag = parseFloat(e.target.value);
      document.getElementById('label-drag').textContent = drag.toFixed(2);
    });

    document.getElementById('mode-select').addEventListener('change', e => {
      simMode = e.target.value;
      document.getElementById('mode-badge').textContent = simMode.toUpperCase() + ' MODE';
    });

    function triggerBlast() {
      const originX = mouse.x;
      const originY = mouse.y;
      for (const p of particles) {
        const dx = p.x - originX;
        const dy = p.y - originY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const blastForce = Math.max(0, (500 - dist) / 500) * 22;
        p.vx += (dx / dist) * blastForce;
        p.vy += (dy / dist) * blastForce;
      }
    }

    function shiftPalette() {
      paletteIndex = (paletteIndex + 1) % palettes.length;
      const pal = palettes[paletteIndex];
      for (const p of particles) {
        p.hue = (pal.baseHue + (Math.random() - 0.5) * pal.range + 360) % 360;
      }
    }

    function togglePause() {
      isPaused = !isPaused;
      document.getElementById('pause-btn').textContent = isPaused ? 'Resume' : 'Pause';
    }

    // Telemetry and Render Loop
    let lastTime = performance.now();
    let frameCount = 0;
    let fps = 60;

    function render(now) {
      requestAnimationFrame(render);

      // Calculate FPS
      frameCount++;
      if (now - lastTime >= 500) {
        fps = Math.round((frameCount * 1000) / (now - lastTime));
        document.getElementById('val-fps').textContent = fps + ' FPS';
        frameCount = 0;
        lastTime = now;

        // Calculate kinetic energy
        let totalEnergy = 0;
        for (const p of particles) {
          totalEnergy += 0.5 * p.mass * (p.vx * p.vx + p.vy * p.vy);
        }
        document.getElementById('val-energy').textContent = Math.round(totalEnergy) + ' kJ';

        // SYSCALL: Report High-Entropy Event to Kernel
        if (totalEnergy > 1000) {
          syscall('SYS_WRITE_INODE', ['/var/log/physics_events.log', \`[\${new Date().toISOString()}] High energy burst detected: \${Math.round(totalEnergy)} kJ\\n\`, 0o644]);
        }
      }

      if (!isPaused) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = palettes[paletteIndex].bg;
        ctx.fillRect(0, 0, width, height);

        for (const p of particles) {
          p.update();
          p.draw();
        }
      }
    }

    requestAnimationFrame(render);
  </script>
</body>
</html>`;
