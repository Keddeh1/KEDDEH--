export const HTML5_AUDIO_SYNTHESIZER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML5 Web Audio Synthesizer & Spectrum Workstation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #090d16;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px 16px;
      user-select: none;
    }
    .synth-frame {
      width: 100%;
      max-width: 780px;
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(56, 189, 248, 0.08);
    }
    .top-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .synth-title {
      font-size: 16px;
      font-weight: 800;
      color: #38bdf8;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .preset-selector {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      color: #94a3b8;
    }
    select, button {
      background: #1f2937;
      color: #f8fafc;
      border: 1px solid #374151;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      outline: none;
      transition: all 0.15s;
    }
    select:hover, button:hover {
      background: #374151;
      border-color: #4b5563;
    }
    button.active-mode {
      background: #0284c7;
      border-color: #38bdf8;
      color: white;
    }
    /* Visualizer Canvas */
    .vis-box {
      position: relative;
      margin-bottom: 20px;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: #050811;
    }
    canvas#visCanvas {
      width: 100%;
      height: 120px;
      display: block;
    }
    .vis-mode-switch {
      position: absolute;
      top: 8px;
      right: 8px;
      display: flex;
      gap: 4px;
    }
    .vis-btn {
      font-size: 9px;
      padding: 3px 8px;
      border-radius: 4px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #94a3b8;
    }
    .vis-btn.active {
      background: #38bdf8;
      color: #030712;
      font-weight: 700;
    }
    /* Control Sections Grid */
    .controls-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
      background: rgba(15, 23, 42, 0.6);
      padding: 16px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.04);
    }
    .control-panel-title {
      font-size: 10px;
      font-weight: 700;
      color: #a78bfa;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 12px;
    }
    .knob-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 10px;
    }
    .knob-label-val {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #94a3b8;
    }
    input[type="range"] {
      width: 100%;
      height: 4px;
      background: #374151;
      border-radius: 2px;
      outline: none;
      -webkit-appearance: none;
    }
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #38bdf8;
      cursor: pointer;
    }
    /* Keyboard Section */
    .keyboard-wrapper {
      position: relative;
      display: flex;
      justify-content: center;
      height: 140px;
      padding-top: 6px;
      background: #050811;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.06);
      overflow-x: auto;
    }
    .white-keys {
      display: flex;
      position: relative;
    }
    .white-key {
      width: 44px;
      height: 126px;
      background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
      border: 1px solid #94a3b8;
      border-radius: 0 0 6px 6px;
      color: #475569;
      font-size: 10px;
      font-weight: 700;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
      padding-bottom: 8px;
      cursor: pointer;
      position: relative;
      transition: background 0.08s, transform 0.05s;
    }
    .white-key.active, .white-key:active {
      background: linear-gradient(180deg, #38bdf8 0%, #0284c7 100%);
      color: white;
      transform: translateY(2px);
    }
    .black-keys {
      position: absolute;
      top: 6px;
      left: 0;
      display: flex;
      pointer-events: none;
      width: 100%;
      height: 80px;
    }
    .black-key {
      position: absolute;
      width: 26px;
      height: 80px;
      background: linear-gradient(180deg, #1e293b 0%, #020617 100%);
      border: 1px solid #0f172a;
      border-radius: 0 0 4px 4px;
      color: #94a3b8;
      font-size: 9px;
      font-weight: 700;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
      padding-bottom: 6px;
      cursor: pointer;
      pointer-events: auto;
      z-index: 2;
      box-shadow: 0 4px 8px rgba(0,0,0,0.5);
      transition: background 0.08s, transform 0.05s;
    }
    .black-key.active, .black-key:active {
      background: #8b5cf6;
      color: white;
      transform: translateY(2px);
    }
    .key-hint {
      font-size: 9px;
      opacity: 0.6;
      font-family: monospace;
      margin-top: 2px;
    }
    .bottom-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16px;
      font-size: 11px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="synth-frame">
    <div class="top-header">
      <div class="synth-title">
        <span>🎹 Modular Web Audio Synthesizer</span>
      </div>
      <div class="preset-selector">
        <span>PATCH:</span>
        <select id="patch-select" onchange="loadPreset(this.value)">
          <option value="cyberpunk">Cyberpunk Bass 2077</option>
          <option value="neonlead">Neon 80s Lead</option>
          <option value="ambient">Cosmic Ambient Pad</option>
          <option value="chiptune">Retro 8-Bit Chiptune</option>
          <option value="crystal">Glass Crystal Pluck</option>
        </select>
        <button onclick="playArpeggio()">Play Arp</button>
      </div>
    </div>

    <!-- Visualizer Canvas -->
    <div class="vis-box">
      <canvas id="visCanvas" width="730" height="120"></canvas>
      <div class="vis-mode-switch">
        <button class="vis-btn active" id="btn-fft" onclick="setVisMode('fft')">FFT SPECTRUM</button>
        <button class="vis-btn" id="btn-wave" onclick="setVisMode('wave')">OSCILLOSCOPE</button>
      </div>
    </div>

    <!-- Controls Grid -->
    <div class="controls-grid">
      <!-- Oscillator & Filter -->
      <div>
        <div class="control-panel-title">1. OSCILLATOR &amp; FILTER</div>
        <div class="knob-row">
          <div class="knob-label-val"><span>Waveform</span></div>
          <select id="osc-wave">
            <option value="sawtooth">Sawtooth (Aggressive)</option>
            <option value="square">Square (Hollow/8-Bit)</option>
            <option value="sine">Sine (Pure Harmonic)</option>
            <option value="triangle">Triangle (Mellow)</option>
          </select>
        </div>
        <div class="knob-row">
          <div class="knob-label-val"><span>Filter Cutoff</span><span id="val-cutoff">2400 Hz</span></div>
          <input type="range" id="slider-cutoff" min="200" max="8000" step="50" value="2400">
        </div>
        <div class="knob-row">
          <div class="knob-label-val"><span>Filter Resonance (Q)</span><span id="val-q">3.5</span></div>
          <input type="range" id="slider-q" min="0.1" max="15" step="0.5" value="3.5">
        </div>
      </div>

      <!-- ADSR Envelope -->
      <div>
        <div class="control-panel-title">2. ADSR ENVELOPE</div>
        <div class="knob-row">
          <div class="knob-label-val"><span>Attack</span><span id="val-attack">0.02s</span></div>
          <input type="range" id="slider-attack" min="0.005" max="1.5" step="0.01" value="0.02">
        </div>
        <div class="knob-row">
          <div class="knob-label-val"><span>Decay</span><span id="val-decay">0.30s</span></div>
          <input type="range" id="slider-decay" min="0.05" max="2.0" step="0.05" value="0.30">
        </div>
        <div class="knob-row">
          <div class="knob-label-val"><span>Sustain Level</span><span id="val-sustain">0.40</span></div>
          <input type="range" id="slider-sustain" min="0" max="1" step="0.05" value="0.40">
        </div>
        <div class="knob-row">
          <div class="knob-label-val"><span>Release</span><span id="val-release">0.45s</span></div>
          <input type="range" id="slider-release" min="0.05" max="3.0" step="0.05" value="0.45">
        </div>
      </div>

      <!-- Effects & Delay -->
      <div>
        <div class="control-panel-title">3. TIME EFFECTS</div>
        <div class="knob-row">
          <div class="knob-label-val"><span>Echo / Delay Time</span><span id="val-delay">0.25s</span></div>
          <input type="range" id="slider-delay" min="0.05" max="0.8" step="0.05" value="0.25">
        </div>
        <div class="knob-row">
          <div class="knob-label-val"><span>Feedback Mix</span><span id="val-feedback">35%</span></div>
          <input type="range" id="slider-feedback" min="0" max="0.8" step="0.05" value="0.35">
        </div>
        <div class="knob-row">
          <div class="knob-label-val"><span>Master Gain</span><span id="val-gain">70%</span></div>
          <input type="range" id="slider-gain" min="0.1" max="1" step="0.05" value="0.7">
        </div>
      </div>
    </div>

    <!-- 2-Octave Keyboard -->
    <div class="keyboard-wrapper" id="keyboard">
      <div class="white-keys" id="white-keys-container"></div>
      <div class="black-keys" id="black-keys-container"></div>
    </div>

    <div class="bottom-bar">
      <span>Play with Mouse or Computer Keyboard (A-K lower octave, Q-U upper octave)</span>
      <span>Polyphonic Voice Architecture · Web Audio API</span>
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
      console.log('[Audio Synth] Verifying application provenance...');
      const verified = await syscall('SYS_VERIFY_APP', [typeof APP_ID !== 'undefined' ? APP_ID : 'audio-synth', typeof APP_HASH !== 'undefined' ? APP_HASH : 'none']);
      if (verified) {
        console.log('[Audio Synth] SHA-256 Provenance Ledger Match: OK');
      } else {
        console.warn('[Audio Synth] Warning: Provenance verification failed or ledger mismatch.');
      }
    }
    verifyIntegrity();

    // Audio Context and Nodes
    let audioCtx = null;
    let masterGainNode = null;
    let filterNode = null;
    let delayNode = null;
    let delayGainNode = null;
    let analyserNode = null;
    let visMode = 'fft';

    function initAudioEngine() {
      if (audioCtx) return;
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      masterGainNode = audioCtx.createGain();
      masterGainNode.gain.value = 0.7;

      filterNode = audioCtx.createBiquadFilter();
      filterNode.type = 'lowpass';
      filterNode.frequency.value = 2400;
      filterNode.Q.value = 3.5;

      delayNode = audioCtx.createDelay(2.0);
      delayNode.delayTime.value = 0.25;

      delayGainNode = audioCtx.createGain();
      delayGainNode.gain.value = 0.35;

      analyserNode = audioCtx.createAnalyser();
      analyserNode.fftSize = 256;

      // Routing: Synth Voice -> Filter -> MasterGain -> Analyser -> Destination
      // Filter -> Delay -> DelayGain -> Delay (feedback loop) & DelayGain -> MasterGain
      filterNode.connect(masterGainNode);
      filterNode.connect(delayNode);
      delayNode.connect(delayGainNode);
      delayGainNode.connect(delayNode);
      delayGainNode.connect(masterGainNode);

      masterGainNode.connect(analyserNode);
      analyserNode.connect(audioCtx.destination);
    }

    // Active Note Voices
    const activeVoices = {};

    function triggerNoteOn(noteName, freq) {
      initAudioEngine();
      if (activeVoices[noteName]) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      const waveType = document.getElementById('osc-wave').value;
      const attack = parseFloat(document.getElementById('slider-attack').value);
      const decay = parseFloat(document.getElementById('slider-decay').value);
      const sustain = parseFloat(document.getElementById('slider-sustain').value);

      osc.type = waveType;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      // ADSR Attack and Decay to Sustain
      const now = audioCtx.currentTime;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.35, now + attack);
      gain.gain.linearRampToValueAtTime(0.35 * sustain, now + attack + decay);

      osc.connect(gain);
      gain.connect(filterNode);

      osc.start(now);
      activeVoices[noteName] = { osc, gain };

      // SYSCALL: Report DSP Load to Kernel
      const voiceCount = Object.keys(activeVoices).length;
      syscall('SYS_WRITE_INODE', ['/var/log/audio_load.log', \`[\${new Date().toISOString()}] Voice Trigger: \${noteName} (\${freq}Hz). Active Voices: \${voiceCount}\\n\`, 0o644]);

      highlightKey(noteName, true);
    }

    function triggerNoteOff(noteName) {
      if (!activeVoices[noteName]) return;
      const voice = activeVoices[noteName];
      const release = parseFloat(document.getElementById('slider-release').value);
      const now = audioCtx.currentTime;

      voice.gain.gain.cancelScheduledValues(now);
      voice.gain.gain.setValueAtTime(voice.gain.gain.value, now);
      voice.gain.gain.exponentialRampToValueAtTime(0.0001, now + release);

      voice.osc.stop(now + release + 0.05);
      delete activeVoices[noteName];

      highlightKey(noteName, false);
    }

    // Notes Data: 2 Octaves (C4 to C6)
    const NOTES = [
      { name: 'C4', freq: 261.63, isBlack: false, key: 'a' },
      { name: 'C#4', freq: 277.18, isBlack: true, key: 'w', offset: 28 },
      { name: 'D4', freq: 293.66, isBlack: false, key: 's' },
      { name: 'D#4', freq: 311.13, isBlack: true, key: 'e', offset: 74 },
      { name: 'E4', freq: 329.63, isBlack: false, key: 'd' },
      { name: 'F4', freq: 349.23, isBlack: false, key: 'f' },
      { name: 'F#4', freq: 369.99, isBlack: true, key: 't', offset: 162 },
      { name: 'G4', freq: 392.00, isBlack: false, key: 'g' },
      { name: 'G#4', freq: 415.30, isBlack: true, key: 'y', offset: 208 },
      { name: 'A4', freq: 440.00, isBlack: false, key: 'h' },
      { name: 'A#4', freq: 466.16, isBlack: true, key: 'u', offset: 254 },
      { name: 'B4', freq: 493.88, isBlack: false, key: 'j' },

      { name: 'C5', freq: 523.25, isBlack: false, key: 'k' },
      { name: 'C#5', freq: 554.37, isBlack: true, key: 'o', offset: 348 },
      { name: 'D5', freq: 587.33, isBlack: false, key: 'l' },
      { name: 'D#5', freq: 622.25, isBlack: true, key: 'p', offset: 394 },
      { name: 'E5', freq: 659.25, isBlack: false, key: ';' },
      { name: 'F5', freq: 698.46, isBlack: false, key: "'" },
      { name: 'F#5', freq: 739.99, isBlack: true, key: ']', offset: 482 },
      { name: 'G5', freq: 783.99, isBlack: false, key: 'z' },
      { name: 'G#5', freq: 830.61, isBlack: true, key: 'x', offset: 528 },
      { name: 'A5', freq: 880.00, isBlack: false, key: 'c' },
      { name: 'A#5', freq: 932.33, isBlack: true, key: 'v', offset: 574 },
      { name: 'B5', freq: 987.77, isBlack: false, key: 'b' },
      { name: 'C6', freq: 1046.50, isBlack: false, key: 'n' }
    ];

    const whiteContainer = document.getElementById('white-keys-container');
    const blackContainer = document.getElementById('black-keys-container');

    NOTES.forEach(note => {
      if (!note.isBlack) {
        const el = document.createElement('div');
        el.className = 'white-key';
        el.id = 'key-' + note.name.replace('#', 's');
        el.innerHTML = '<span>' + note.name + '</span><span class="key-hint">' + note.key.toUpperCase() + '</span>';
        el.addEventListener('mousedown', () => triggerNoteOn(note.name, note.freq));
        el.addEventListener('mouseup', () => triggerNoteOff(note.name));
        el.addEventListener('mouseleave', () => triggerNoteOff(note.name));
        whiteContainer.appendChild(el);
      } else {
        const el = document.createElement('div');
        el.className = 'black-key';
        el.id = 'key-' + note.name.replace('#', 's');
        el.style.left = note.offset + 'px';
        el.innerHTML = '<span>' + note.name + '</span><span class="key-hint">' + note.key.toUpperCase() + '</span>';
        el.addEventListener('mousedown', (e) => { e.stopPropagation(); triggerNoteOn(note.name, note.freq); });
        el.addEventListener('mouseup', (e) => { e.stopPropagation(); triggerNoteOff(note.name); });
        el.addEventListener('mouseleave', () => triggerNoteOff(note.name));
        blackContainer.appendChild(el);
      }
    });

    function highlightKey(noteName, active) {
      const el = document.getElementById('key-' + noteName.replace('#', 's'));
      if (el) {
        if (active) el.classList.add('active');
        else el.classList.remove('active');
      }
    }

    // Keyboard bindings map
    const keyMap = {};
    NOTES.forEach(n => { keyMap[n.key.toLowerCase()] = n; });

    window.addEventListener('keydown', e => {
      if (e.repeat) return;
      const n = keyMap[e.key.toLowerCase()];
      if (n) triggerNoteOn(n.name, n.freq);
    });

    window.addEventListener('keyup', e => {
      const n = keyMap[e.key.toLowerCase()];
      if (n) triggerNoteOff(n.name);
    });

    // Preset Manager
    const PRESETS = {
      cyberpunk: { wave: 'sawtooth', cutoff: 1800, q: 6.0, attack: 0.01, decay: 0.25, sustain: 0.3, release: 0.2, delay: 0.2, fb: 0.4 },
      neonlead: { wave: 'square', cutoff: 3800, q: 3.0, attack: 0.03, decay: 0.4, sustain: 0.6, release: 0.4, delay: 0.3, fb: 0.35 },
      ambient: { wave: 'triangle', cutoff: 1200, q: 1.5, attack: 0.6, decay: 0.8, sustain: 0.8, release: 1.2, delay: 0.4, fb: 0.6 },
      chiptune: { wave: 'square', cutoff: 7500, q: 0.5, attack: 0.005, decay: 0.15, sustain: 0.1, release: 0.08, delay: 0.1, fb: 0.1 },
      crystal: { wave: 'sine', cutoff: 5500, q: 4.0, attack: 0.01, decay: 0.5, sustain: 0.2, release: 0.8, delay: 0.35, fb: 0.45 }
    };

    function loadPreset(name) {
      const p = PRESETS[name];
      if (!p) return;
      document.getElementById('osc-wave').value = p.wave;
      document.getElementById('slider-cutoff').value = p.cutoff;
      document.getElementById('val-cutoff').textContent = p.cutoff + ' Hz';
      document.getElementById('slider-q').value = p.q;
      document.getElementById('val-q').textContent = p.q;
      document.getElementById('slider-attack').value = p.attack;
      document.getElementById('val-attack').textContent = p.attack + 's';
      document.getElementById('slider-decay').value = p.decay;
      document.getElementById('val-decay').textContent = p.decay + 's';
      document.getElementById('slider-sustain').value = p.sustain;
      document.getElementById('val-sustain').textContent = p.sustain;
      document.getElementById('slider-release').value = p.release;
      document.getElementById('val-release').textContent = p.release + 's';
      document.getElementById('slider-delay').value = p.delay;
      document.getElementById('val-delay').textContent = p.delay + 's';
      document.getElementById('slider-feedback').value = p.fb;
      document.getElementById('val-feedback').textContent = Math.round(p.fb * 100) + '%';

      if (filterNode) {
        filterNode.frequency.value = p.cutoff;
        filterNode.Q.value = p.q;
      }
      if (delayNode) delayNode.delayTime.value = p.delay;
      if (delayGainNode) delayGainNode.gain.value = p.fb;
    }

    // Sliders Live Binding
    document.getElementById('slider-cutoff').addEventListener('input', e => {
      const v = parseFloat(e.target.value);
      document.getElementById('val-cutoff').textContent = v + ' Hz';
      if (filterNode) filterNode.frequency.value = v;
    });
    document.getElementById('slider-q').addEventListener('input', e => {
      const v = parseFloat(e.target.value);
      document.getElementById('val-q').textContent = v;
      if (filterNode) filterNode.Q.value = v;
    });
    document.getElementById('slider-attack').addEventListener('input', e => {
      document.getElementById('val-attack').textContent = parseFloat(e.target.value).toFixed(2) + 's';
    });
    document.getElementById('slider-decay').addEventListener('input', e => {
      document.getElementById('val-decay').textContent = parseFloat(e.target.value).toFixed(2) + 's';
    });
    document.getElementById('slider-sustain').addEventListener('input', e => {
      document.getElementById('val-sustain').textContent = parseFloat(e.target.value).toFixed(2);
    });
    document.getElementById('slider-release').addEventListener('input', e => {
      document.getElementById('val-release').textContent = parseFloat(e.target.value).toFixed(2) + 's';
    });
    document.getElementById('slider-delay').addEventListener('input', e => {
      const v = parseFloat(e.target.value);
      document.getElementById('val-delay').textContent = v.toFixed(2) + 's';
      if (delayNode) delayNode.delayTime.value = v;
    });
    document.getElementById('slider-feedback').addEventListener('input', e => {
      const v = parseFloat(e.target.value);
      document.getElementById('val-feedback').textContent = Math.round(v * 100) + '%';
      if (delayGainNode) delayGainNode.gain.value = v;
    });
    document.getElementById('slider-gain').addEventListener('input', e => {
      const v = parseFloat(e.target.value);
      document.getElementById('val-gain').textContent = Math.round(v * 100) + '%';
      if (masterGainNode) masterGainNode.gain.value = v;
    });

    function playArpeggio() {
      const arpNotes = [
        { name: 'C4', freq: 261.63 },
        { name: 'E4', freq: 329.63 },
        { name: 'G4', freq: 392.00 },
        { name: 'B4', freq: 493.88 },
        { name: 'C5', freq: 523.25 },
        { name: 'E5', freq: 659.25 },
        { name: 'G5', freq: 783.99 },
        { name: 'C6', freq: 1046.50 }
      ];
      arpNotes.forEach((n, idx) => {
        setTimeout(() => {
          triggerNoteOn(n.name, n.freq);
          setTimeout(() => triggerNoteOff(n.name), 160);
        }, idx * 140);
      });
    }

    // Visualizer Canvas Loop
    const vCanvas = document.getElementById('visCanvas');
    const vCtx = vCanvas.getContext('2d');

    function setVisMode(m) {
      visMode = m;
      document.getElementById('btn-fft').className = 'vis-btn ' + (m === 'fft' ? 'active' : '');
      document.getElementById('btn-wave').className = 'vis-btn ' + (m === 'wave' ? 'active' : '');
    }

    function renderVisualizer() {
      requestAnimationFrame(renderVisualizer);
      vCtx.fillStyle = '#050811';
      vCtx.fillRect(0, 0, vCanvas.width, vCanvas.height);

      if (!analyserNode) {
        // Subtle idle grid line
        vCtx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
        vCtx.lineWidth = 1;
        vCtx.beginPath();
        vCtx.moveTo(0, vCanvas.height / 2);
        vCtx.lineTo(vCanvas.width, vCanvas.height / 2);
        vCtx.stroke();
        return;
      }

      if (visMode === 'fft') {
        const bufferLength = analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserNode.getByteFrequencyData(dataArray);

        const barWidth = (vCanvas.width / bufferLength) * 2.2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * vCanvas.height;
          const hue = 190 + (i / bufferLength) * 120;
          vCtx.fillStyle = "hsl(" + hue + ", 90%, 55%)";
          vCtx.fillRect(x, vCanvas.height - barHeight, barWidth - 1, barHeight);
          x += barWidth;
        }
      } else {
        const bufferLength = analyserNode.fftSize;
        const dataArray = new Uint8Array(bufferLength);
        analyserNode.getByteTimeDomainData(dataArray);

        vCtx.lineWidth = 2;
        vCtx.strokeStyle = '#38bdf8';
        vCtx.shadowColor = '#38bdf8';
        vCtx.shadowBlur = 8;
        vCtx.beginPath();

        const sliceWidth = vCanvas.width * 1.0 / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = v * vCanvas.height / 2;
          if (i === 0) vCtx.moveTo(x, y);
          else vCtx.lineTo(x, y);
          x += sliceWidth;
        }
        vCtx.lineTo(vCanvas.width, vCanvas.height / 2);
        vCtx.stroke();
        vCtx.shadowBlur = 0;
      }
    }

    renderVisualizer();
  </script>
</body>
</html>`;
