import React, { useState, useRef, useMemo } from 'react';
import {
  Play,
  Code,
  Sparkles,
  ExternalLink,
  Plus,
  Cloud,
  FileCode,
  Layers,
  Cpu,
  RefreshCw,
  Folder,
  CheckCircle2,
  HardDrive,
  Search,
  Upload,
  X,
  Sliders,
  Gamepad2,
  Music,
  Box,
  Atom,
  Check,
  Zap,
  Filter,
  Terminal,
  ShieldCheck
} from 'lucide-react';
import { FileItem } from '../types';
import { formatBytes } from '../data/VfsInitialSubstrate';
import { OPEN_SOURCE_OS_HTML } from '../data/openSourceOsTemplate';
import { KEX_LINUX_TERMINAL_HTML } from '../data/kexLinuxTerminalTemplate';
import { FORTNITE_SYSTEM_HTML } from '../data/fortniteSystemTemplate';

interface Html5AppHubProps {
  files: FileItem[];
  onLaunchApp: (file: FileItem) => void;
  onInspectCode: (file: FileItem) => void;
  isDriveMode: boolean;
  onRefresh: () => void;
  isSyncing: boolean;
  onDeployTemplate?: (templateName: string, templateCode: string) => Promise<void>;
}

// Preset ready-to-launch HTML5 technologies
export const SAMPLE_HTML5_TEMPLATES = [
  {
    id: 'fortnite-system',
    name: 'Fortnite_Relational_Substrate.html',
    title: 'Fortnite · 1x Relational System',
    category: 'Sovereign Software & Games',
    description: 'Authoritative Fortnite runtime simulation by A. Keddeh. Features "Always Online" connectivity, Unreal Substrate dependency satisfaction, and 1x unit-boundary identity tracking.',
    tags: ['Fortnite', '1x Substrate', 'Always Online', 'Managed Dependencies'],
    icon: Gamepad2,
    color: 'from-blue-600 via-indigo-600 to-purple-600',
    code: FORTNITE_SYSTEM_HTML,
  },
  {
    id: 'kex-linux-terminal',
    name: 'KEX_Linux_Terminal.html',
    title: 'KEX Linux Terminal · A. Keddeh (Braink AI)',
    category: 'Operating Systems & Kernels',
    description: 'Auto-booted KEX Linux userspace emulator by A. Keddeh with live interactive shell, CPU registers, stateful filesystem tree, proof ledger, and process manager.',
    tags: ['KEX Linux', 'A. Keddeh', 'Braink AI', 'Terminal', 'CPU Registers', 'Proof Ledger'],
    icon: Terminal,
    color: 'from-cyan-500 via-teal-600 to-indigo-600',
    code: KEX_LINUX_TERMINAL_HTML,
  },
  {
    id: 'open-source-os',
    name: 'Open_Source_Operating_System.html',
    title: 'AetherOS Linux 6.12 Open-Source Kernel',
    category: 'Operating Systems & Kernels',
    description: 'Complete open-source web operating system with GRUB bootloader, windowing compositor, bash terminal, VFS, and comprehensive DOM Rigour testing lab.',
    tags: ['Linux 6.12', 'WebAssembly VFS', 'DOM Rigour Lab', 'Window Compositor'],
    icon: Terminal,
    color: 'from-blue-600 via-indigo-600 to-cyan-500',
    code: OPEN_SOURCE_OS_HTML,
  },
  {
    id: 'physics-lab',
    name: 'HTML5_Particle_Physics_Lab.html',
    title: 'HTML5 Particle & Vortex Physics Lab',
    category: 'Simulation & Canvas',
    description: 'High-performance interactive 2D physics simulation with particle vortex dynamics, gravity fields, and mouse interaction.',
    tags: ['HTML5 Canvas', 'Physics 2D', 'Animation Loop'],
    icon: Sparkles,
    color: 'from-cyan-500 to-blue-600',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HTML5 Particle Physics Lab</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #090d16; overflow: hidden; color: #fff; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
    canvas { display: block; width: 100vw; height: 100vh; }
    #ui {
      position: absolute;
      top: 16px;
      left: 16px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(12px);
      padding: 16px;
      border-radius: 12px;
      font-size: 13px;
      max-width: 280px;
    }
    h2 { font-size: 14px; font-weight: 700; color: #38bdf8; margin-bottom: 6px; }
    p { font-size: 11px; color: #94a3b8; margin-bottom: 12px; }
    .btn {
      background: #0284c7;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 11px;
      margin-right: 6px;
      transition: background 0.2s;
    }
    .btn:hover { background: #0369a1; }
  </style>
</head>
<body>
  <div id="ui">
    <h2>⚡ HTML5 Particle Vortex Lab</h2>
    <p>Move mouse to attract particles. Click to blast a vortex shockwave.</p>
    <button class="btn" onclick="toggleColorMode()">Cycle Color</button>
    <button class="btn" onclick="burst()">Vortex Shockwave</button>
  </div>
  <canvas id="c"></canvas>
  <script>
    console.log('HTML5 Particle Physics Engine Booted.');
    const c = document.getElementById('c');
    const ctx = c.getContext('2d');
    let w = c.width = window.innerWidth;
    let h = c.height = window.innerHeight;
    window.addEventListener('resize', () => { w = c.width = window.innerWidth; h = c.height = window.innerHeight; });

    const particles = [];
    const count = 350;
    let mouse = { x: w / 2, y: h / 2, down: false };
    let hueOffset = 180;

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.radius = Math.random() * 2.5 + 1;
        this.hue = (Math.random() * 60 + hueOffset) % 360;
      }
      update() {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist < 300) {
          const force = (300 - dist) / 300;
          this.vx += (dx / dist) * force * 0.45;
          this.vy += (dy / dist) * force * 0.45;
        }
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'hsl(' + this.hue + ', 90%, 65%)';
        ctx.shadowColor = 'hsl(' + this.hue + ', 90%, 65%)';
        ctx.shadowBlur = 8;
        ctx.fill();
      }
    }

    for (let i = 0; i < count; i++) particles.push(new Particle());

    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mousedown', () => burst());

    function burst() {
      console.log('Shockwave triggered at', mouse.x, mouse.y);
      particles.forEach(p => {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        p.vx += (dx / dist) * 15;
        p.vy += (dy / dist) * 15;
      });
    }

    function toggleColorMode() {
      hueOffset = (hueOffset + 60) % 360;
      particles.forEach(p => p.hue = (Math.random() * 60 + hueOffset) % 360);
      console.log('Palette shifted to hue offset', hueOffset);
    }

    function loop() {
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(9, 13, 22, 0.2)';
      ctx.fillRect(0, 0, w, h);

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      requestAnimationFrame(loop);
    }
    loop();
  </script>
</body>
</html>`
  },
  {
    id: 'arcade-game',
    name: 'HTML5_Retro_Arcade_Breakout.html',
    title: 'HTML5 Retro Cyber Breakout Game',
    category: 'Game & Web Audio',
    description: 'Playable retro cyber arcade game with dynamic ball physics, paddle deflection, score streaks, and synthetic Web Audio sound effects.',
    tags: ['HTML5 Game', 'Web Audio API', 'Arcade Physics'],
    icon: Play,
    color: 'from-purple-500 to-pink-600',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HTML5 Cyber Breakout</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #030712; color: #f9fafb; font-family: 'Courier New', monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
    #game-container { position: relative; border: 2px solid #8b5cf6; border-radius: 12px; box-shadow: 0 0 30px rgba(139, 92, 246, 0.3); overflow: hidden; }
    canvas { display: block; background: #090d16; }
    #score-bar { width: 100%; max-width: 600px; display: flex; justify-content: space-between; padding: 12px 16px; font-weight: bold; font-size: 14px; color: #a78bfa; }
    #instructions { font-size: 11px; color: #6b7280; margin-top: 8px; }
  </style>
</head>
<body>
  <div id="score-bar">
    <div>SCORE: <span id="score" style="color: #ec4899">0</span></div>
    <div>LIVES: <span id="lives" style="color: #10b981">❤❤❤</span></div>
  </div>
  <div id="game-container">
    <canvas id="c" width="600" height="420"></canvas>
  </div>
  <p id="instructions">Use Mouse or Left/Right Arrow Keys to move paddle. Click to launch.</p>

  <script>
    console.log('HTML5 Cyber Breakout Engine Initialized');
    const c = document.getElementById('c');
    const ctx = c.getContext('2d');
    const scoreEl = document.getElementById('score');
    const livesEl = document.getElementById('lives');

    // Web Audio Synthesizer
    let audioCtx = null;
    function playBeep(freq, type = 'sine', duration = 0.08) {
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      } catch(e) {}
    }

    let score = 0;
    let lives = 3;
    let running = true;
    let ballAttached = true;

    const paddle = { x: 250, y: 390, w: 100, h: 12, speed: 8 };
    const ball = { x: 300, y: 375, r: 6, vx: 4, vy: -4 };

    const brickRowCount = 5;
    const brickColumnCount = 8;
    const brickWidth = 62;
    const brickHeight = 16;
    const brickPadding = 8;
    const brickOffsetTop = 40;
    const brickOffsetLeft = 24;

    const bricks = [];
    const colors = ['#f43f5e', '#fb923c', '#facc15', '#4ade80', '#38bdf8'];
    for (let cIndex = 0; cIndex < brickColumnCount; cIndex++) {
      bricks[cIndex] = [];
      for (let rIndex = 0; rIndex < brickRowCount; rIndex++) {
        bricks[cIndex][rIndex] = { x: 0, y: 0, status: 1, color: colors[rIndex] };
      }
    }

    let rightPressed = false;
    let leftPressed = false;

    document.addEventListener('keydown', e => {
      if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = true;
      else if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = true;
      else if (e.key === ' ' || e.key === 'Enter') {
        if (ballAttached) { ballAttached = false; playBeep(520, 'square'); }
      }
    });

    document.addEventListener('keyup', e => {
      if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = false;
      else if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = false;
    });

    c.addEventListener('mousemove', e => {
      const rect = c.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      if (relativeX > 0 && relativeX < c.width) {
        paddle.x = relativeX - paddle.w / 2;
        if (ballAttached) ball.x = paddle.x + paddle.w / 2;
      }
    });

    c.addEventListener('click', () => {
      if (ballAttached) {
        ballAttached = false;
        playBeep(640, 'square');
      }
    });

    function collisionDetection() {
      for (let cIndex = 0; cIndex < brickColumnCount; cIndex++) {
        for (let rIndex = 0; rIndex < brickRowCount; rIndex++) {
          const b = bricks[cIndex][rIndex];
          if (b.status === 1) {
            if (ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + brickHeight) {
              ball.vy = -ball.vy;
              b.status = 0;
              score += 10;
              scoreEl.textContent = score;
              playBeep(400 + (brickRowCount - rIndex) * 120, 'triangle');
            }
          }
        }
      }
    }

    function draw() {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, c.width, c.height);

      // Draw Bricks
      for (let cIndex = 0; cIndex < brickColumnCount; cIndex++) {
        for (let rIndex = 0; rIndex < brickRowCount; rIndex++) {
          if (bricks[cIndex][rIndex].status === 1) {
            const brickX = cIndex * (brickWidth + brickPadding) + brickOffsetLeft;
            const brickY = rIndex * (brickHeight + brickPadding) + brickOffsetTop;
            bricks[cIndex][rIndex].x = brickX;
            bricks[cIndex][rIndex].y = brickY;
            ctx.fillStyle = bricks[cIndex][rIndex].color;
            ctx.shadowColor = bricks[cIndex][rIndex].color;
            ctx.shadowBlur = 6;
            ctx.fillRect(brickX, brickY, brickWidth, brickHeight);
          }
        }
      }

      // Draw Paddle
      ctx.fillStyle = '#8b5cf6';
      ctx.shadowColor = '#8b5cf6';
      ctx.shadowBlur = 12;
      ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);

      // Draw Ball
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.closePath();
      ctx.shadowBlur = 0;

      collisionDetection();

      // Ball movement
      if (!ballAttached) {
        if (ball.x + ball.vx > c.width - ball.r || ball.x + ball.vx < ball.r) {
          ball.vx = -ball.vx;
          playBeep(320);
        }
        if (ball.y + ball.vy < ball.r) {
          ball.vy = -ball.vy;
          playBeep(320);
        } else if (ball.y + ball.vy > paddle.y - ball.r && ball.y < paddle.y + paddle.h) {
          if (ball.x > paddle.x && ball.x < paddle.x + paddle.w) {
            const hitPoint = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
            ball.vx = hitPoint * 6;
            ball.vy = -Math.abs(ball.vy);
            playBeep(580, 'square');
          }
        } else if (ball.y + ball.vy > c.height - ball.r) {
          lives--;
          livesEl.textContent = '❤'.repeat(Math.max(0, lives));
          playBeep(180, 'sawtooth', 0.3);
          if (!lives) {
            alert('Game Over! Final Score: ' + score);
            document.location.reload();
          } else {
            ballAttached = true;
            ball.x = paddle.x + paddle.w / 2;
            ball.y = paddle.y - 12;
            ball.vx = 4;
            ball.vy = -4;
          }
        }
        ball.x += ball.vx;
        ball.y += ball.vy;
      }

      if (rightPressed && paddle.x < c.width - paddle.w) paddle.x += paddle.speed;
      else if (leftPressed && paddle.x > 0) paddle.x -= paddle.speed;

      requestAnimationFrame(draw);
    }
    draw();
  </script>
</body>
</html>`
  },
  {
    id: 'audio-synth',
    name: 'HTML5_Audio_Synthesizer.html',
    title: 'HTML5 Web Audio Synthesizer & Visualizer',
    category: 'Audio & DSP',
    description: 'Real-time multi-waveform sound synthesizer with interactive piano keys, filter envelope, and dynamic FFT frequency visualizer canvas.',
    tags: ['Web Audio API', 'FFT Visualizer', 'Synthesizer'],
    icon: Cpu,
    color: 'from-amber-500 to-rose-600',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HTML5 Web Audio Synthesizer</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0f172a; color: #f8fafc; font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
    .synth-box { width: 100%; max-width: 680px; background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    h1 { font-size: 18px; font-weight: 700; color: #fbbf24; margin-bottom: 4px; }
    p { font-size: 12px; color: #94a3b8; margin-bottom: 16px; }
    canvas { width: 100%; height: 120px; background: #090d16; border-radius: 8px; margin-bottom: 20px; display: block; }
    .controls { display: flex; gap: 12px; margin-bottom: 20px; }
    select, button { background: #334155; color: white; border: 1px solid #475569; padding: 8px 14px; border-radius: 8px; font-size: 12px; cursor: pointer; }
    .keys { display: flex; gap: 6px; justify-content: center; }
    .key { width: 44px; height: 130px; background: #f8fafc; border-radius: 0 0 6px 6px; color: #334155; font-size: 11px; font-weight: bold; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 8px; cursor: pointer; user-select: none; transition: transform 0.05s, background 0.1s; }
    .key:active, .key.active { background: #fbbf24; transform: translateY(4px); }
  </style>
</head>
<body>
  <div class="synth-box">
    <h1>🎹 HTML5 Web Audio Synth & Spectrum</h1>
    <p>Click keys to generate sound. The real-time FFT visualizer maps frequency spectrums.</p>
    <canvas id="scope"></canvas>
    <div class="controls">
      <select id="waveform">
        <option value="sine">Sine Wave (Pure)</option>
        <option value="square">Square Wave (Retro 8-bit)</option>
        <option value="sawtooth">Sawtooth Wave (Brass)</option>
        <option value="triangle">Triangle Wave (Mellow)</option>
      </select>
      <button onclick="playDemoChord()">Play Chord Arpeggio</button>
    </div>
    <div class="keys">
      <div class="key" data-freq="261.63">C4</div>
      <div class="key" data-freq="293.66">D4</div>
      <div class="key" data-freq="329.63">E4</div>
      <div class="key" data-freq="349.23">F4</div>
      <div class="key" data-freq="392.00">G4</div>
      <div class="key" data-freq="440.00">A4</div>
      <div class="key" data-freq="493.88">B4</div>
      <div class="key" data-freq="523.25">C5</div>
    </div>
  </div>

  <script>
    console.log('Web Audio Synthesizer ready.');
    let ctx = null;
    let analyser = null;
    const canvas = document.getElementById('scope');
    const cCtx = canvas.getContext('2d');
    canvas.width = 680;
    canvas.height = 120;

    function initAudio() {
      if (!ctx) {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        analyser.connect(ctx.destination);
      }
    }

    function playNote(freq) {
      initAudio();
      const type = document.getElementById('waveform').value;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(analyser);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
      console.log('Playing frequency:', freq, 'Hz', type);
    }

    document.querySelectorAll('.key').forEach(k => {
      k.addEventListener('mousedown', () => {
        k.classList.add('active');
        playNote(parseFloat(k.dataset.freq));
      });
      k.addEventListener('mouseup', () => k.classList.remove('active'));
    });

    function playDemoChord() {
      const notes = [261.63, 329.63, 392.00, 523.25];
      notes.forEach((f, i) => {
        setTimeout(() => playNote(f), i * 150);
      });
    }

    function renderScope() {
      requestAnimationFrame(renderScope);
      cCtx.fillStyle = '#090d16';
      cCtx.fillRect(0, 0, canvas.width, canvas.height);
      if (!analyser) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      const barWidth = (canvas.width / bufferLength) * 2;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        cCtx.fillStyle = 'hsl(' + (i * 4 + 40) + ', 100%, 55%)';
        cCtx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }
    }
    renderScope();
  </script>
</body>
</html>`
  },
  {
    id: '3d-isometric-matrix',
    name: 'HTML5_3D_Isometric_Matrix.html',
    title: 'HTML5 3D Isometric Wireframe Engine',
    category: '3D Graphics & Canvas',
    description: 'Real-time 3D rotation engine rendering a mathematical matrix of points and wireframe meshes with interactive orbital drag controls.',
    tags: ['3D Engine', 'HTML5 Canvas', 'Mathematics'],
    icon: Box,
    color: 'from-fuchsia-500 to-pink-600',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HTML5 3D Isometric Engine</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { background: #070913; overflow: hidden; color: #fff; font-family: monospace; }
    canvas { display: block; width: 100vw; height: 100vh; }
    .hud { position: absolute; top: 16px; left: 16px; background: rgba(15,23,42,0.85); backdrop-filter: blur(8px); padding: 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); }
    h1 { font-size: 14px; color: #f43f5e; margin-bottom: 4px; }
    p { font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="hud">
    <h1>3D Wireframe Matrix Engine</h1>
    <p>Drag with mouse to rotate orbital projection</p>
  </div>
  <canvas id="c"></canvas>
  <script>
    console.log('[3D Engine] Initializing isometric matrix canvas...');
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    let width, height;
    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    let rotX = 0.5, rotY = 0.5;
    let isDragging = false, lastX = 0, lastY = 0;
    window.addEventListener('mousedown', e => { isDragging = true; lastX = e.clientX; lastY = e.clientY; });
    window.addEventListener('mousemove', e => {
      if (isDragging) {
        rotY += (e.clientX - lastX) * 0.005;
        rotX += (e.clientY - lastY) * 0.005;
        lastX = e.clientX;
        lastY = e.clientY;
      }
    });
    window.addEventListener('mouseup', () => isDragging = false);

    const nodes = [];
    const size = 3;
    const spacing = 70;
    for (let x = -size; x <= size; x++) {
      for (let y = -size; y <= size; y++) {
        for (let z = -size; z <= size; z++) {
          nodes.push({ x: x * spacing, y: y * spacing, z: z * spacing });
        }
      }
    }

    function render() {
      ctx.fillStyle = '#070913';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const fov = 400;

      if (!isDragging) {
        rotY += 0.005;
        rotX += 0.002;
      }

      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);

      nodes.forEach(node => {
        let x1 = node.x * cosY - node.z * sinY;
        let z1 = node.z * cosY + node.x * sinY;

        let y1 = node.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + node.y * sinX;

        let scale = fov / (fov + z2 + 300);
        if (scale > 0) {
          let px = cx + x1 * scale;
          let py = cy + y1 * scale;
          let alpha = Math.max(0.1, Math.min(1, scale * 1.5));
          let radius = Math.max(1.5, scale * 3.5);

          ctx.fillStyle = 'rgba(244, 63, 94, ' + alpha + ')';
          ctx.beginPath();
          ctx.arc(px, py, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      requestAnimationFrame(render);
    }
    render();
    console.log('[3D Engine] Render pipeline operational with ' + nodes.length + ' vertices.');
  </script>
</body>
</html>`
  }
];

export const Html5AppHub: React.FC<Html5AppHubProps> = ({
  files,
  onLaunchApp,
  onInspectCode,
  isDriveMode,
  onRefresh,
  isSyncing,
  onDeployTemplate,
}) => {
  const [deployingId, setDeployingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'sim' | 'games' | 'audio' | '3d'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newAppName, setNewAppName] = useState('My_Interactive_App.html');
  const [selectedTemplateId, setSelectedTemplateId] = useState('physics-lab');
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter out any HTML5 apps (from Drive or local)
  const allHtml5Files = useMemo(() => {
    return files.filter(
      (f) =>
        !f.inTrash &&
        (f.isHtml5App ||
          f.name.toLowerCase().endsWith('.html') ||
          f.name.toLowerCase().endsWith('.htm') ||
          f.mimeType === 'text/html' ||
          f.tags.includes('HTML5 App'))
    );
  }, [files]);

  // Filtered by Search & Category
  const filteredHtml5Files = useMemo(() => {
    return allHtml5Files.filter((f) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        f.name.toLowerCase().includes(q) ||
        (f.description && f.description.toLowerCase().includes(q)) ||
        f.tags.some((t) => t.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (activeCategory === 'all') return true;
      const lowerName = f.name.toLowerCase();
      const lowerDesc = (f.description || '').toLowerCase();
      const lowerTags = f.tags.join(' ').toLowerCase();
      const combined = `${lowerName} ${lowerDesc} ${lowerTags}`;

      if (activeCategory === 'games') return combined.includes('game') || combined.includes('arcade') || combined.includes('play');
      if (activeCategory === 'sim') return combined.includes('physic') || combined.includes('simulat') || combined.includes('particle');
      if (activeCategory === 'audio') return combined.includes('audio') || combined.includes('sound') || combined.includes('synth');
      if (activeCategory === '3d') return combined.includes('3d') || combined.includes('matrix') || combined.includes('webgl') || combined.includes('mesh');
      return true;
    });
  }, [allHtml5Files, searchQuery, activeCategory]);

  const handleDeploy = async (template: typeof SAMPLE_HTML5_TEMPLATES[0]) => {
    if (!onDeployTemplate) return;
    setDeployingId(template.id);
    try {
      await onDeployTemplate(template.name, template.code);
    } finally {
      setDeployingId(null);
    }
  };

  const handleCreateCustomApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim()) return;

    let finalName = newAppName.trim();
    if (!finalName.toLowerCase().endsWith('.html') && !finalName.toLowerCase().endsWith('.htm')) {
      finalName += '.html';
    }

    const template = SAMPLE_HTML5_TEMPLATES.find((t) => t.id === selectedTemplateId) || SAMPLE_HTML5_TEMPLATES[0];

    setIsCreating(true);
    try {
      if (onDeployTemplate) {
        await onDeployTemplate(finalName, template.code);
      } else {
        onLaunchApp({
          id: `file-custom-${Date.now()}`,
          name: finalName,
          folderId: null,
          category: 'code',
          size: template.code.length,
          mimeType: 'text/html',
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          starred: true,
          inTrash: false,
          rawContent: template.code,
          isHtml5App: true,
          tags: ['HTML5 App', 'Custom'],
          description: `Custom created HTML5 technology from ${template.title}`,
        });
      }
      setIsCreateModalOpen(false);
      setNewAppName('My_Interactive_App.html');
    } catch (err) {
      console.error('Failed to create custom HTML5 app:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDirectFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    try {
      const textContent = await uploadedFile.text();
      if (onDeployTemplate) {
        await onDeployTemplate(uploadedFile.name, textContent);
      } else {
        onLaunchApp({
          id: `file-uploaded-${Date.now()}`,
          name: uploadedFile.name,
          folderId: null,
          category: 'code',
          size: uploadedFile.size,
          mimeType: 'text/html',
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          starred: true,
          inTrash: false,
          rawContent: textContent,
          isHtml5App: true,
          tags: ['HTML5 App', 'Direct Upload'],
          description: `Directly uploaded HTML5 technology`,
        });
      }
    } catch (err) {
      console.error('Failed to read or deploy uploaded HTML file:', err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const driveSyncedCount = allHtml5Files.filter((f) => f.isDriveFile).length;

  return (
    <div id="html5-hub-root" className="p-6 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Hidden file input for direct HTML upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".html,.htm,text/html"
        className="hidden"
        onChange={handleDirectFileUpload}
      />

      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-blue-950/70 via-indigo-950/50 to-slate-900 border border-blue-900/40 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>HTML5 Runtime & Technologies</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isDriveMode ? 'Google Drive HTML5 Software Hub' : 'HTML5 Software & Web Technologies'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Directly launch, run, test, and edit your HTML5 web applications, interactive tools,
              canvas simulations, and games stored in your{' '}
              <span className="text-blue-400 font-medium">
                {isDriveMode ? 'Google Drive account' : 'Storage Vault'}
              </span>
              .
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New HTML5 App</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Upload an HTML file from your device"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Upload .HTML</span>
            </button>

            <button
              onClick={onRefresh}
              disabled={isSyncing}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sync Drive</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Technology Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <FileCode className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-white font-mono">{allHtml5Files.length}</div>
            <div className="text-[11px] text-slate-400">Detected Apps</div>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Cloud className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-white font-mono">{driveSyncedCount}</div>
            <div className="text-[11px] text-slate-400">Drive Synced</div>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-white font-mono">{SAMPLE_HTML5_TEMPLATES.length}</div>
            <div className="text-[11px] text-slate-400">Ready Starters</div>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Engine</span>
            </div>
            <div className="text-[11px] text-slate-400">Split & Run</div>
          </div>
        </div>
      </div>

      {/* Featured: KEX Linux Terminal & Open Source Operating Systems */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/80 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-500/10 via-pink-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>KEX LINUX TERMINAL</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 text-xs font-mono font-semibold">
                KEXW://V6
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-semibold">
                BRAINK AI · A. KEDDEH
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              KEX Linux Terminal: Booted Userspace OS & Ledger
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Auto-boots a Linux-like userspace filesystem, starts virtual services, and delivers a communicative shell with CPU registers, stateful VFS tree, SHA-256 cryptographic proof ledger, and process manager.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {['Auto-Boot Shell', 'CPU Registers & Ticks', 'SHA-256 Proof Ledger', '/kex-volume VFS', 'systemctl / ps / top', 'A. Keddeh Auth'].map((tag) => (
                <span key={tag} className="text-[11px] font-mono text-cyan-200/90 bg-slate-950/70 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => {
                const fortniteTemplate = SAMPLE_HTML5_TEMPLATES.find((t) => t.id === 'fortnite-system')!;
                onLaunchApp({
                  id: 'file-html5-fortnite-system',
                  name: fortniteTemplate.name,
                  folderId: null,
                  category: 'code',
                  size: fortniteTemplate.code.length,
                  mimeType: 'text/html',
                  updatedAt: new Date().toISOString(),
                  createdAt: new Date().toISOString(),
                  starred: true,
                  inTrash: false,
                  rawContent: fortniteTemplate.code,
                  tags: ['Fortnite', '1x Substrate', 'Always Online'],
                  isHtml5App: true,
                  description: fortniteTemplate.description,
                });
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer ring-1 ring-blue-400/50"
            >
              <Gamepad2 className="w-4 h-4 text-white" />
              <span>Deploy Fortnite System</span>
            </button>

            <button
              onClick={() => {
                const kexTemplate = SAMPLE_HTML5_TEMPLATES.find((t) => t.id === 'kex-linux-terminal') || SAMPLE_HTML5_TEMPLATES[0];
                onLaunchApp({
                  id: 'file-html5-kex-linux-terminal',
                  name: kexTemplate.name,
                  folderId: null,
                  category: 'code',
                  size: kexTemplate.code.length,
                  mimeType: 'text/html',
                  updatedAt: new Date().toISOString(),
                  createdAt: new Date().toISOString(),
                  starred: true,
                  inTrash: false,
                  rawContent: kexTemplate.code,
                  tags: ['KEX Linux', 'A. Keddeh', 'Braink AI', 'Terminal', 'CPU Registers'],
                  isHtml5App: true,
                  description: kexTemplate.description,
                });
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer ring-1 ring-cyan-400/50"
            >
              <Play className="w-4 h-4 fill-current text-white" />
              <span>Connect KEX Linux Terminal</span>
            </button>

            <button
              onClick={() => {
                const osTemplate = SAMPLE_HTML5_TEMPLATES.find((t) => t.id === 'open-source-os') || SAMPLE_HTML5_TEMPLATES[1];
                onLaunchApp({
                  id: 'file-html5-open-source-os',
                  name: osTemplate.name,
                  folderId: null,
                  category: 'code',
                  size: osTemplate.code.length,
                  mimeType: 'text/html',
                  updatedAt: new Date().toISOString(),
                  createdAt: new Date().toISOString(),
                  starred: true,
                  inTrash: false,
                  rawContent: osTemplate.code,
                  tags: ['Operating System', 'Linux Kernel', 'DOM Rigour', 'Open Source'],
                  isHtml5App: true,
                  description: osTemplate.description,
                });
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              <span>Access AetherOS Linux</span>
            </button>

            {onDeployTemplate && (
              <button
                onClick={() => {
                  const kexTemplate = SAMPLE_HTML5_TEMPLATES.find((t) => t.id === 'kex-linux-terminal') || SAMPLE_HTML5_TEMPLATES[0];
                  handleDeploy(kexTemplate);
                }}
                disabled={deployingId === 'kex-linux-terminal'}
                className="px-5 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-slate-300 border border-slate-800 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {deployingId === 'kex-linux-terminal' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    <span>Saving to Drive Vault...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Save KEX to Drive Vault</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Discovered HTML5 Applications Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span>Discovered HTML5 Applications</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-mono font-normal">
                {filteredHtml5Files.length} of {allHtml5Files.length}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Interactive HTML5 technologies ready to run directly in the browser
            </p>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search apps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 outline-none w-44 sm:w-56"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeCategory === 'all' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveCategory('sim')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeCategory === 'sim' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Physics
              </button>
              <button
                onClick={() => setActiveCategory('games')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeCategory === 'games' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Games
              </button>
              <button
                onClick={() => setActiveCategory('audio')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeCategory === 'audio' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Audio
              </button>
              <button
                onClick={() => setActiveCategory('3d')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeCategory === '3d' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                3D
              </button>
            </div>
          </div>
        </div>

        {filteredHtml5Files.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
              <Code className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-200">
                {allHtml5Files.length === 0
                  ? 'No HTML5 applications detected in the current folder'
                  : 'No matching HTML5 applications found'}
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {allHtml5Files.length === 0
                  ? 'Upload your .html files to Google Drive, or deploy one of the interactive templates below to start running and testing your HTML5 technologies right away.'
                  : 'Try clearing your search query or selecting a different category filter.'}
              </p>
            </div>
            {allHtml5Files.length === 0 && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create First HTML5 App</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHtml5Files.map((file) => (
              <div
                key={file.id}
                className="group bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-5 transition-all shadow-md flex flex-col justify-between gap-4 relative overflow-hidden"
              >
                {/* Glowing subtle gradient header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-tr from-blue-600/20 to-cyan-500/20 border border-blue-500/30 text-blue-400 shrink-0">
                    <Code className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-medium">
                      Runnable
                    </span>
                    {file.isDriveFile && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[10px] font-mono font-medium flex items-center gap-1">
                        <Cloud className="w-2.5 h-2.5" />
                        <span>Drive</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5">
                  <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                    {file.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {file.description || 'HTML5 application with embedded scripting and interactive UI.'}
                  </p>
                  <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-slate-500">
                    <span>{formatBytes(file.size)}</span>
                    <span>•</span>
                    <span>{new Date(file.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => onLaunchApp(file)}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Launch App</span>
                  </button>
                  <button
                    onClick={() => onInspectCode(file)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition-colors cursor-pointer"
                    title="Inspect & Edit Source Code"
                  >
                    <Code className="w-4 h-4" />
                  </button>
                  {file.webViewLink && (
                    <a
                      href={file.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition-colors cursor-pointer"
                      title="Open in Google Drive"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ready-to-deploy HTML5 templates */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Interactive HTML5 Technology Starters</span>
          </h2>
          <p className="text-xs text-slate-400">
            {isDriveMode
              ? 'One-click deploy verified HTML5 applications directly into your Google Drive'
              : 'Launch and explore pre-built interactive HTML5 applications'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SAMPLE_HTML5_TEMPLATES.map((tmpl) => {
            const Icon = tmpl.icon;
            const isDeploying = deployingId === tmpl.id;

            return (
              <div
                key={tmpl.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${tmpl.color} text-white shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {tmpl.category}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{tmpl.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tmpl.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tmpl.tags.map((t) => (
                      <span key={t} className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-900/40">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() =>
                      onLaunchApp({
                        id: tmpl.id,
                        name: tmpl.name,
                        folderId: null,
                        category: 'code',
                        size: tmpl.code.length,
                        mimeType: 'text/html',
                        updatedAt: new Date().toISOString(),
                        createdAt: new Date().toISOString(),
                        starred: false,
                        inTrash: false,
                        rawContent: tmpl.code,
                        tags: tmpl.tags,
                        isHtml5App: true,
                        description: tmpl.description,
                      })
                    }
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Run Now</span>
                  </button>

                  {isDriveMode && onDeployTemplate && (
                    <button
                      onClick={() => handleDeploy(tmpl)}
                      disabled={isDeploying}
                      className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-colors"
                      title="Save to your Google Drive"
                    >
                      <Cloud className="w-3.5 h-3.5" />
                      <span>{isDeploying ? 'Saving...' : 'Deploy'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create New HTML5 App Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Create New HTML5 Application</h3>
                  <p className="text-xs text-slate-400">
                    {isDriveMode ? 'Saves directly to your Google Drive' : 'Stores in your storage vault'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomApp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Application File Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={newAppName}
                    onChange={(e) => setNewAppName(e.target.value)}
                    placeholder="e.g. My_Particle_Lab.html"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono placeholder-slate-600 focus:border-blue-500 outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-slate-500">
                    .html
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Choose Starter Technology & Engine
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SAMPLE_HTML5_TEMPLATES.map((t) => {
                    const isSelected = selectedTemplateId === t.id;
                    const Icon = t.icon;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTemplateId(t.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                          isSelected
                            ? 'bg-blue-600/15 border-blue-500 text-white ring-1 ring-blue-500'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                        </div>
                        <div>
                          <div className="text-xs font-semibold line-clamp-1">{t.title}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{t.category}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md transition-colors cursor-pointer"
                >
                  {isCreating ? (
                    <span>Deploying...</span>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Create & Launch</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
