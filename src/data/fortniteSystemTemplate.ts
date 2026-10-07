export const FORTNITE_SYSTEM_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Fortnite · 1x Relational System Substrate</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0b0e14; color: #fff; font-family: 'Segoe UI', system-ui, sans-serif; overflow: hidden; }
    #vantage-root { width: 100vw; height: 100vh; display: flex; flex-direction: column; }
    
    header { background: #1a1d23; border-bottom: 2px solid #3b82f6; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; }
    .brand { display: flex; items-center; gap: 12px; }
    .logo { width: 32px; height: 32px; background: #3b82f6; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; }
    
    main { flex: 1; position: relative; overflow: hidden; background: radial-gradient(circle at center, #1a2235 0%, #0b0e14 100%); }
    
    .hud-overlay { position: absolute; inset: 0; pointer-events: none; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; }
    .top-stats { display: flex; gap: 20px; }
    .stat-card { background: rgba(0,0,0,0.6); border: 1px solid rgba(59, 130, 246, 0.4); padding: 10px 15px; border-radius: 12px; backdrop-filter: blur(8px); }
    .stat-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }
    .stat-value { font-size: 18px; font-weight: bold; font-family: monospace; color: #3b82f6; }
    
    .center-sim { flex: 1; display: flex; align-items: center; justify-content: center; position: relative; }
    .crosshair { width: 40px; height: 40px; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; position: relative; }
    .crosshair::after { content: ''; position: absolute; width: 4px; height: 4px; background: #fff; border-radius: 50%; top: 50%; left: 50%; transform: translate(-50%, -50%); }
    
    .bottom-bar { display: flex; justify-content: space-between; align-items: flex-end; }
    .identity-plane { background: rgba(0,0,0,0.8); border: 1px solid rgba(139, 92, 246, 0.4); padding: 15px; border-radius: 16px; width: 320px; }
    
    .dependency-list { margin-top: 10px; display: flex; flex-direction: column; gap: 5px; }
    .dep-item { font-size: 11px; display: flex; align-items: center; justify-content: space-between; color: #cbd5e1; }
    .dep-status { color: #10b981; font-weight: bold; }
    
    .console { background: rgba(15, 23, 42, 0.9); border-top: 1px solid #1e293b; height: 180px; padding: 15px; font-family: monospace; font-size: 12px; overflow-y: auto; color: #60a5fa; }
    .log-entry { margin-bottom: 4px; }
    .log-ts { color: #475569; margin-right: 8px; }
    .log-addr { color: #f59e0b; margin-right: 8px; }
  </style>
</head>
<body>
  <div id="vantage-root">
    <header>
      <div class="brand">
        <div class="logo">F</div>
        <div>
          <div style="font-weight: bold; font-size: 14px;">Fortnite Relational Substrate</div>
          <div style="font-size: 10px; color: #94a3b8;">kex::1x9F2C_AUTHORIZED_RUNNABLE</div>
        </div>
      </div>
      <div id="connection-status" style="font-size: 11px; font-weight: bold; color: #10b981;">CONNECTED · ALWAYS ONLINE</div>
    </header>

    <main>
      <canvas id="world-sim" style="width: 100%; height: 100%;"></canvas>
      
      <div class="hud-overlay">
        <div class="top-stats">
          <div class="stat-card">
            <div class="stat-label">System FPS</div>
            <div class="stat-value" id="fps-val">60.0</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Substrate Latency</div>
            <div class="stat-value" id="latency-val">0.42ms</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Injective Sync</div>
            <div class="stat-value">100%</div>
          </div>
        </div>

        <div class="center-sim">
          <div class="crosshair"></div>
        </div>

        <div class="bottom-bar">
          <div class="identity-plane">
            <div style="font-weight: bold; font-size: 12px; border-bottom: 1px solid #334155; padding-bottom: 5px; margin-bottom: 10px;">AUTHORITATIVE IDENTITY MANIFOLD</div>
            <div style="font-size: 11px; font-family: monospace; color: #f59e0b;">ADDR: kex::1x7B2D9E4A</div>
            
            <div class="dependency-list">
              <div class="dep-item">
                <span>Unreal Substrate v5.2</span>
                <span class="dep-status">SATISFIED</span>
              </div>
              <div class="dep-item">
                <span>EAC Anti-Cheat Mesh</span>
                <span class="dep-status">CONNECTED</span>
              </div>
              <div class="dep-item">
                <span>Relational DirectX 1x</span>
                <span class="dep-status">HARDWARE_LATCHED</span>
              </div>
            </div>
          </div>
          
          <div class="stat-card" style="width: 200px;">
            <div class="stat-label">SRAM Reservation</div>
            <div class="stat-value">128 KB</div>
            <div style="width: 100%; height: 4px; background: #1e293b; border-radius: 2px; margin-top: 8px;">
              <div style="width: 68%; height: 100%; background: #3b82f6; border-radius: 2px;"></div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div class="console" id="console">
      <div class="log-entry"><span class="log-ts">[00:00:00]</span> <span class="log-addr">1x0400</span> [BOOT] Fortnite System Ingestion Initializing...</div>
      <div class="log-entry"><span class="log-ts">[00:00:01]</span> <span class="log-addr">1x0800</span> [MESH] Resolving dependencies via 1x Boundary...</div>
      <div class="log-entry"><span class="log-ts">[00:00:02]</span> <span class="log-addr">1x1400</span> [SATISFY] Unreal Engine Substrate latched.</div>
      <div class="log-entry"><span class="log-ts">[00:00:03]</span> <span class="log-addr">1x7400</span> [ONLINE] Establishing Always-Online connection to Epic Mesh...</div>
    </div>
  </div>

  <script>
    const canvas = document.getElementById('world-sim');
    const ctx = canvas.getContext('2d');
    const consoleEl = document.getElementById('console');
    
    let w, h;
    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const logs = [
      "[IO] Ingesting asset manifest...",
      "[AUTH] Logical identity validated (1x Proof).",
      "[NET] Synchronizing relational state vector...",
      "[MESH] Admitting Fortnite process to Layer 1 Root...",
      "[OS] System threads latched to Lane 18/19/20."
    ];

    let logIndex = 0;
    setInterval(() => {
      if (logIndex < logs.length) {
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        const ts = new Date().toLocaleTimeString().split(' ')[0];
        entry.innerHTML = \`<span class="log-ts">[\${ts}]</span> <span class="log-addr">1x\${(Math.random()*0xFFFF).toString(16).substring(0,4).toUpperCase()}</span> \${logs[logIndex]}\`;
        consoleEl.appendChild(entry);
        consoleEl.scrollTop = consoleEl.scrollHeight;
        logIndex++;
      }
    }, 1500);

    // Particle Sim for background "World"
    const particles = [];
    for(let i=0; i<50; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1
      });
    }

    function animate() {
      ctx.fillStyle = 'rgba(11, 14, 20, 0.1)';
      ctx.fillRect(0, 0, w, h);
      
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.lineWidth = 1;
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        if(p.x < 0 || p.x > w) p.vx *= -1;
        if(p.y < 0 || p.y > h) p.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.5)';
        ctx.fill();
        
        // Connections
        particles.forEach(p2 => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if(dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });
      
      requestAnimationFrame(animate);
    }
    animate();

    // Stats variation
    setInterval(() => {
      document.getElementById('fps-val').innerText = (58 + Math.random() * 4).toFixed(1);
      document.getElementById('latency-val').innerText = (0.35 + Math.random() * 0.15).toFixed(2) + 'ms';
    }, 1000);
  </script>
</body>
</html>`;
