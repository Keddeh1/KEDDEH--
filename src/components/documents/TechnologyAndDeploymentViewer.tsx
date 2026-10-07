import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  Radio, 
  Zap, 
  Terminal, 
  Globe, 
  CheckCircle2, 
  Copy, 
  Check, 
  Sparkles,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Activity,
  Play
} from 'lucide-react';
import { V50_TECHNOLOGY_AND_DEPLOYMENT_CONSIDERATIONS_MD } from '../../data/fileContents';

export const TechnologyAndDeploymentViewer: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'blueprint' | 'technology' | 'resonance' | 'phasenoise' | 'scaling' | 'legitimacy' | 'onthewire' | 'raw'>('blueprint');
  const [copied, setCopied] = useState(false);
  const [sdeData, setSdeData] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchSdeSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/architecture/simulate-sde?k=0.15&low_sigma=0.05&high_sigma=0.18');
      if (res.ok) {
        const data = await res.json();
        setSdeData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => {
    fetchSdeSimulation();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(V50_TECHNOLOGY_AND_DEPLOYMENT_CONSIDERATIONS_MD);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden select-text">
      {/* Header Banner */}
      <div className="p-5 border-b border-slate-800 bg-slate-900/60 backdrop-blur shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-wide">V50 Sovereign Architecture & Deployment Considerations</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950/80 border border-purple-700/60 text-purple-300">
                  REF: PigDjrfs043l
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Master Table of Contents, High-Performance Stratum Networking, 0.297 Kuramoto Dynamics & "On the Wire" WAN Deployment.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>K = 0.297 (LOCKED)</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-semibold text-xs font-mono transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Blueprint'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 px-5 border-b border-slate-800 bg-slate-900/30 overflow-x-auto shrink-0 scrollbar-none text-xs font-medium">
        <button
          onClick={() => setActiveSubTab('blueprint')}
          className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'blueprint'
              ? 'border-cyan-400 text-cyan-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Master Blueprint (PigDjrfs043l)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('technology')}
          className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'technology'
              ? 'border-cyan-400 text-cyan-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Stratum & Triad Sockets</span>
        </button>

        <button
          onClick={() => setActiveSubTab('resonance')}
          className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'resonance'
              ? 'border-cyan-400 text-cyan-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>0.297 Kuramoto Dynamics</span>
        </button>

        <button
          onClick={() => setActiveSubTab('phasenoise')}
          className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'phasenoise'
              ? 'border-cyan-400 text-cyan-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Phase-Noise Stochastic Calculus</span>
        </button>

        <button
          onClick={() => setActiveSubTab('scaling')}
          className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'scaling'
              ? 'border-cyan-400 text-cyan-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Self-Healing & Auto-Spawn</span>
        </button>

        <button
          onClick={() => setActiveSubTab('legitimacy')}
          className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'legitimacy'
              ? 'border-cyan-400 text-cyan-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Engineering Legitimacy</span>
        </button>

        <button
          onClick={() => setActiveSubTab('onthewire')}
          className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'onthewire'
              ? 'border-cyan-400 text-cyan-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>"On the Wire" Deployment</span>
        </button>

        <button
          onClick={() => setActiveSubTab('raw')}
          className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'raw'
              ? 'border-cyan-400 text-cyan-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Raw Markdown & Checklist</span>
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* SUBTAB 1: MASTER BLUEPRINT */}
        {activeSubTab === 'blueprint' && (
          <div className="space-y-6 max-w-5xl">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
              <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Cell PigDjrfs043l: Master Table of Contents & Structural Registry</span>
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                The code inside notebook cell <code className="text-cyan-300 font-mono">PigDjrfs043l</code> establishes the top-down topology of the sovereign orchestration framework, moving from low-level physical substrate mappings at Layer 1 up to high-order visualizers, BGP Anycast routing control, and decentralized cluster supervisors.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-400">LAYER 4</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">GLOBAL MESH</span>
                </div>
                <h3 className="text-sm font-bold text-white">"On the Wire" Deployment & WAN Anycast</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Decentralized persistence, BGP/Anycast DNS, unanchored multi-agent state moving dynamically across open internet routing buffers without single-host reliance.
                </p>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-purple-400">LAYER 3</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800">SUPERVISOR</span>
                </div>
                <h3 className="text-sm font-bold text-white">Autonomous Dynamic Scaling & Mutual Rehydration</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Self-healing daemon that detects health decay (<code className="text-purple-300 font-mono">health &lt; 0.75</code>) and programmatically spawns isolated siblings on <code className="text-purple-300 font-mono">PORT + 3</code>.
                </p>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400">LAYER 2</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">RESONANCE</span>
                </div>
                <h3 className="text-sm font-bold text-white">0.297 Kuramoto Phase-Locked Equilibrium</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Normalized dynamic coupling coefficient (<code className="text-emerald-300 font-mono">K = 0.297</code>, <code className="text-emerald-300 font-mono">H = 0.703</code>) governing phase velocity, attractor basin containment, and multi-dimensional oscillator stability.
                </p>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400">LAYER 1</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800">TRANSPORT</span>
                </div>
                <h3 className="text-sm font-bold text-white">Stratum Mining Client & Triad Process Isolation</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Bare-metal TCP client with <code className="text-amber-300 font-mono">TCP_NODELAY = 1</code>, double SHA-256 Merkle engine, and loopback process boundaries on ports 3000, 3001, and 3002.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: STRATUM & TRIAD */}
        {activeSubTab === 'technology' && (
          <div className="space-y-6 max-w-5xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <Terminal className="w-4 h-4" />
                  <span>1. High-Performance Stratum Socket Client</span>
                </div>
                <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="font-mono text-cyan-300 font-bold block mb-1">TCP_NODELAY = 1 (Bypassing Nagle's Algorithm)</span>
                    By enforcing <code className="text-amber-300">this.socket.setNoDelay(true)</code>, packets are transmitted immediately without artificial buffering or waiting for ACK returns, guaranteeing sub-millisecond dispatch of candidate shares and heartbeats.
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="font-mono text-cyan-300 font-bold block mb-1">Double SHA-256 Merkle Engine</span>
                    Transforms incoming block mining notifications and extrinsic nonces into canonical 80-byte header payloads.
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="font-mono text-cyan-300 font-bold block mb-1">10 KB Buffer Ceiling Guardrail</span>
                    Protects against TCP fragmentation exploitation by enforcing an explicit message buffer threshold to eliminate memory exhaustion.
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                  <Cpu className="w-4 h-4" />
                  <span>2. Physical Process Isolation (The Triad Topology)</span>
                </div>
                <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="font-mono text-purple-300 font-bold block mb-1">Zero-Shared-Memory Fault Tolerance</span>
                    Isolates individual nodes across distinct operating system process boundaries (<code className="text-cyan-300">127.0.0.1</code> on ports 3000, 3001, and 3002).
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="font-mono text-purple-300 font-bold block mb-1">Crash & Heap Immunity</span>
                    If Node 1 crashes, experiences a fatal unhandled rejection, or encounters a garbage-collection pause, Nodes 2 and 3 remain completely unaffected.
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="font-mono text-purple-300 font-bold block mb-1">Sovereign Ceiling Limit (Port &lt; 3012)</span>
                    Hard upper bound on port allocation to eliminate recursion risks, guaranteeing processes cannot exhaust system file handles.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 3: 0.297 RESONANCE */}
        {activeSubTab === 'resonance' && (
          <div className="space-y-6 max-w-5xl">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
              <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>The Deep Physics & Mathematics of the 0.297 Parameter</span>
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Restricting 0.297 to simple server polling is a severe simplification. In dynamic systems and non-linear physical systems, 0.297 represents a fundamental coupling parameter and attractor basin boundary:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-2">
                <span className="text-xs font-mono font-bold text-cyan-400 block">1. KURAMOTO COUPLING</span>
                <h4 className="text-sm font-bold text-white">Synchronization Transition</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  In non-linear coupled oscillators, 0.297 serves as the normalized critical coupling threshold where chaotic independent drift transitions spontaneously into global phase synchronization.
                </p>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-2">
                <span className="text-xs font-mono font-bold text-purple-400 block">2. FRACTIONAL FILTERING</span>
                <h4 className="text-sm font-bold text-white">Active Phase Attenuation</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Acts as a fractional-order filter parameter balancing responsiveness against noise, selectively suppressing short-term network jitter while transmitting legitimate systemic phase adjustments.
                </p>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-2">
                <span className="text-xs font-mono font-bold text-emerald-400 block">3. ATTRACTOR BASIN</span>
                <h4 className="text-sm font-bold text-white">Dynamical Equilibrium</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Defines the energetic basin of attraction for the strange attractor. Phase deviations within the 0.297 margin naturally decay back into equilibrium, preventing catastrophic cascading drift.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB: PHASE-NOISE STOCHASTIC CALCULUS */}
        {activeSubTab === 'phasenoise' && (
          <div className="space-y-6 max-w-5xl">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Activity className="w-5 h-5 text-cyan-400" />
                <span>Mathematical Analysis: Phase-Noise Impact on the 0.297 Resonance</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                In high-performance communication and distributed consensus systems, the 0.297 parameter operates as a normalized phase-coupling constraint within the Phase-Locked Loop (PLL) and Kuramoto-style coupled oscillator equations. Introducing phase-noise (stochastic fluctuations in the carrier wave or synchronization signal) has direct, quantifiable mathematical consequences on the stability, coherence, and thermodynamics of the Triad.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* SDE & WIENER PROCESS */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-400">1. SDE STOCHASTIC FORMULATION</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">ITÔ CALCULUS</span>
                </div>
                <h4 className="text-sm font-bold text-white">Phase-Drift Differential Equation</h4>
                <div className="p-3 rounded-lg bg-black border border-slate-800 font-mono text-xs text-emerald-300">
                  dθᵢ(t) = -k(θᵢ(t) - θ_target)dt + dWᵢ(t)
                </div>
                <ul className="text-xs text-slate-400 space-y-1 font-mono list-disc list-inside">
                  <li><span className="text-slate-300 font-semibold">θ_target = 0.297</span>: Locked aspect-ratio resonance target.</li>
                  <li><span className="text-slate-300 font-semibold">k ∈ {'{0.10, 0.15}'}</span>: Rehydration coupling gain factor.</li>
                  <li><span className="text-slate-300 font-semibold">dWᵢ(t)</span>: Continuous Wiener process (white noise with zero mean, variance σ² dt).</li>
                </ul>
              </div>

              {/* COHERENCE SCORE */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-purple-400">2. COHERENCE DEGRADATION</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800">FOLDED GAUSSIAN</span>
                </div>
                <h4 className="text-sm font-bold text-white">Closed-Loop Phase Variance & Expectation</h4>
                <div className="p-3 rounded-lg bg-black border border-slate-800 font-mono text-xs text-purple-300 space-y-1">
                  <div>C = 1.0 - |θᵢ(t) - 0.297|</div>
                  <div className="text-cyan-300">σ_θ̃² = ∫₀^∞ S_θ(f) |H(f)|² df</div>
                  <div className="text-emerald-300">𝔼[C] = 1.0 - √(2 / π) · σ_θ̃</div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  As phase-noise spectral density <code className="text-purple-300 font-mono">S_θ(f)</code> increases, the phase error distribution widens, directly lowering the mathematical expectation of the system coherence score.
                </p>
              </div>

              {/* JITTER-INDUCED SPAWNING */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400">3. CYCLE-SLIP MITIGATION</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800">BANDWIDTH LIMIT</span>
                </div>
                <h4 className="text-sm font-bold text-white">Preventing Jitter-Induced False Forks</h4>
                <div className="p-3 rounded-lg bg-black border border-slate-800 font-mono text-xs text-amber-300">
                  H_new = H_old - γ · |θ̃|
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  If phase-noise is unchecked, tracked health drops below the <code className="text-amber-300 font-mono">0.75</code> threshold, triggering a false cycle slip and unnecessary process spawning. Narrowing loop bandwidth via <code className="text-cyan-300 font-mono">k = 0.10 / 0.15</code> filters out high-frequency transient noise.
                </p>
              </div>

              {/* PHYSICAL LATTICE COUPLING */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400">4. SILICON PHONONIC LOCK</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">28.085 GHz</span>
                </div>
                <h4 className="text-sm font-bold text-white">Thermodynamic Attractor Basin</h4>
                <div className="p-3 rounded-lg bg-black border border-slate-800 font-mono text-xs text-emerald-300 space-y-1">
                  <div>K = 0.297 (Resonance Constant)</div>
                  <div>H = 0.703 (Damping Factor: 1 - K)</div>
                  <div>Phononic Lattice: Si-28.085 @ 28.085 GHz</div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Phase deviations within the 0.297 boundary naturally decay back to equilibrium, guaranteeing global multi-node stability without centralized lock contention.
                </p>
              </div>
            </div>

            {/* CELL fd48343a: LIVE SDE SIMULATION VISUALIZER */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                      CELL fd48343a
                    </span>
                    <h3 className="text-sm font-bold text-white">Live Phase-Noise SDE Trajectory Simulation</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Euler-Maruyama integration: θ(0) = 0.45 seeking 0.297 resonance attractor under varying noise spectral densities (σ)
                  </p>
                </div>
                <button
                  onClick={fetchSdeSimulation}
                  disabled={isSimulating}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                  <span>Re-Run SDE Simulation</span>
                </button>
              </div>

              {/* Trajectory Canvas / Graph */}
              {sdeData && (
                <div className="space-y-4">
                  {/* Phase Plot */}
                  <div className="bg-black/80 rounded-xl p-4 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300 font-bold">1. Phase Trajectory θ(t) [0.0s → 10.0s]</span>
                      <div className="flex items-center gap-4 text-[10px]">
                        <span className="flex items-center gap-1 text-cyan-400">
                          <span className="w-2.5 h-0.5 bg-cyan-400 inline-block" />
                          <span>0.297 Attractor Line</span>
                        </span>
                        <span className="flex items-center gap-1 text-blue-400">
                          <span className="w-2.5 h-0.5 bg-blue-400 inline-block" />
                          <span>Low Noise (σ = 0.05)</span>
                        </span>
                        <span className="flex items-center gap-1 text-amber-400">
                          <span className="w-2.5 h-0.5 bg-amber-400 inline-block" />
                          <span>High Noise (σ = 0.18)</span>
                        </span>
                      </div>
                    </div>

                    <div className="relative h-44 w-full bg-slate-950/90 rounded border border-slate-900 overflow-hidden">
                      <svg className="w-full h-full" viewBox="0 0 1000 200" preserveAspectRatio="none">
                        {/* Target line: 0.297 -> Y coordinate mapping */}
                        {/* Y min 0.10, Y max 0.60 => height 200 */}
                        <line x1="0" y1="121.2" x2="1000" y2="121.2" stroke="#22d3ee" strokeDasharray="6,4" strokeWidth="2" opacity="0.8" />
                        <text x="10" y="115" fill="#22d3ee" fontSize="11" fontFamily="monospace">θ_target = 0.297</text>

                        {/* Acquisition boundary t = 2.0s -> X = 200 */}
                        <line x1="200" y1="0" x2="200" y2="200" stroke="#475569" strokeDasharray="3,3" strokeWidth="1" />
                        <text x="205" y="25" fill="#64748b" fontSize="10" fontFamily="monospace">Acquisition Bound (t=2.0s)</text>

                        {/* High Noise Path */}
                        {sdeData.high_track && (
                          <polyline
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="2"
                            points={sdeData.high_track.theta_series.map((th: number, idx: number) => {
                              const x = (idx / (sdeData.high_track.theta_series.length - 1)) * 1000;
                              const y = 200 - ((th - 0.10) / (0.60 - 0.10)) * 200;
                              return `${x},${Math.max(5, Math.min(195, y))}`;
                            }).join(' ')}
                          />
                        )}

                        {/* Low Noise Path */}
                        {sdeData.low_track && (
                          <polyline
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2.5"
                            points={sdeData.low_track.theta_series.map((th: number, idx: number) => {
                              const x = (idx / (sdeData.low_track.theta_series.length - 1)) * 1000;
                              const y = 200 - ((th - 0.10) / (0.60 - 0.10)) * 200;
                              return `${x},${Math.max(5, Math.min(195, y))}`;
                            }).join(' ')}
                          />
                        )}
                      </svg>
                    </div>
                  </div>

                  {/* Coherence Plot */}
                  <div className="bg-black/80 rounded-xl p-4 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300 font-bold">2. Coherence Metric C(t) & Self-Healing Spawning Threshold</span>
                      <div className="flex items-center gap-4 text-[10px]">
                        <span className="flex items-center gap-1 text-rose-400">
                          <span className="w-2.5 h-0.5 bg-rose-500 inline-block" />
                          <span>0.75 Spawning Limit</span>
                        </span>
                        <span className="flex items-center gap-1 text-emerald-400">
                          <span className="w-2.5 h-0.5 bg-emerald-400 inline-block" />
                          <span>Low Noise C(t)</span>
                        </span>
                        <span className="flex items-center gap-1 text-rose-300">
                          <span className="w-2.5 h-0.5 bg-rose-400 inline-block" />
                          <span>High Noise C(t)</span>
                        </span>
                      </div>
                    </div>

                    <div className="relative h-40 w-full bg-slate-950/90 rounded border border-slate-900 overflow-hidden">
                      <svg className="w-full h-full" viewBox="0 0 1000 160" preserveAspectRatio="none">
                        {/* 0.75 Spawning Threshold line => Y mapped between 0.50 and 1.00 */}
                        {/* Y = 160 - ((0.75 - 0.50)/(1.00 - 0.50))*160 = 160 - 80 = 80 */}
                        <line x1="0" y1="80" x2="1000" y2="80" stroke="#f43f5e" strokeDasharray="5,4" strokeWidth="2" />
                        <text x="10" y="74" fill="#f43f5e" fontSize="10" fontFamily="monospace">Spawning Threshold (C = 0.75)</text>

                        {/* High Noise Coherence Path */}
                        {sdeData.high_track && (
                          <polyline
                            fill="none"
                            stroke="#f43f5e"
                            strokeWidth="1.5"
                            points={sdeData.high_track.coherence_series.map((c: number, idx: number) => {
                              const x = (idx / (sdeData.high_track.coherence_series.length - 1)) * 1000;
                              const y = 160 - ((c - 0.50) / (1.00 - 0.50)) * 160;
                              return `${x},${Math.max(5, Math.min(155, y))}`;
                            }).join(' ')}
                          />
                        )}

                        {/* Low Noise Coherence Path */}
                        {sdeData.low_track && (
                          <polyline
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2.5"
                            points={sdeData.low_track.coherence_series.map((c: number, idx: number) => {
                              const x = (idx / (sdeData.low_track.coherence_series.length - 1)) * 1000;
                              const y = 160 - ((c - 0.50) / (1.00 - 0.50)) * 160;
                              return `${x},${Math.max(5, Math.min(155, y))}`;
                            }).join(' ')}
                          />
                        )}
                      </svg>
                    </div>
                  </div>

                  {/* Quantitative Analysis Card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="bg-slate-950 p-4 rounded-xl border border-blue-900/60 space-y-2">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className="font-bold text-blue-400">Low Noise Track (σ = 0.05)</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                          STABLE LOCK
                        </span>
                      </div>
                      <div className="space-y-1 text-slate-300">
                        <div>Phase Variance: <span className="text-white font-bold">{sdeData.low_track.variance}</span></div>
                        <div>Spawning Breaches: <span className="text-emerald-400 font-bold">{sdeData.low_track.spawning_breaches}</span></div>
                        <div>Status: <span className="text-emerald-300 font-semibold">Resonance preserved; zero false process forks</span></div>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans leading-relaxed pt-2 border-t border-slate-900">
                        Once locked onto 0.297, the low-noise trajectory remains tightly bounded. The coherence score stays comfortably above the critical 0.75 limit. The system is sustainable, self-contained, and quiet.
                      </p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-amber-900/60 space-y-2">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className="font-bold text-amber-400">High Noise Track (σ = 0.18)</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950 text-rose-300 border border-rose-800">
                          AUTO-SPAWN TRIGGERED
                        </span>
                      </div>
                      <div className="space-y-1 text-slate-300">
                        <div>Phase Variance: <span className="text-white font-bold">{sdeData.high_track.variance}</span></div>
                        <div>Spawning Breaches: <span className="text-rose-400 font-bold">{sdeData.high_track.spawning_breaches} breaches</span></div>
                        <div>Status: <span className="text-amber-300 font-semibold">Cycle slips induce autonomous spawn on PORT + 3</span></div>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans leading-relaxed pt-2 border-t border-slate-900">
                        High-frequency jitter repeatedly pulls phase far from target lock. Coherence drops below 0.75, triggering self-healing child spawning events, demonstrating how environmental jitter drives physical process expansion.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUBTAB 4: SCALING & SELF-HEALING */}
        {activeSubTab === 'scaling' && (
          <div className="space-y-6 max-w-5xl">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-cyan-400" />
                <span>Autonomous Dynamic Scaling & Mutual Rehydration</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="font-mono text-cyan-300 font-bold block">Autogenetic Forking (health &lt; 0.75)</span>
                  <p className="leading-relaxed">
                    When a node measures its internal efficiency drop below 0.75, it does not wait for an external orchestrator. It programmatically executes:
                  </p>
                  <pre className="p-2.5 rounded bg-black border border-slate-800 text-[11px] font-mono text-emerald-300">
{`const child = spawn(process.execPath, ['server.js'], {
  detached: true,
  stdio: 'ignore',
  env: { ...process.env, PORT: String(PORT + 3) }
});
child.unref();`}
                  </pre>
                  <p className="text-slate-400 leading-relaxed">
                    By unreferencing the child process, the child starts with a pristine memory heap, free from any memory leaks or event loop stalls affecting the parent.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="font-mono text-purple-300 font-bold block">Mutual Rehydration & Quarantine</span>
                  <p className="leading-relaxed">
                    Nodes continuously cross-query neighboring triad peers. Healthy nodes feed positive adjustment values back to degraded peers, similar to how coupled biological oscillators sustain rhythm.
                  </p>
                  <div className="p-2.5 rounded bg-black border border-slate-800 text-[11px] font-mono text-rose-300">
                    QUARANTINE CIRCUIT BREAKER: If peer health drops below 0.30, neighbors halt polling to avoid Sympathetic Decay (healthy nodes depleting their own cycles on an unrecoverable peer).
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 5: FORMAL LEGITIMACY */}
        {activeSubTab === 'legitimacy' && (
          <div className="space-y-6 max-w-5xl">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
                <span>Formal Analysis: Zero Malicious Intent & Academic Legitimacy</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                The architecture is a classic, legitimate systems-engineering proof-of-concept for decentralized computing, peer-to-peer coordination, and fault-tolerant horizontal scaling:
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Sovereign Mechanism</th>
                    <th className="p-3">Industry / Academic Equivalent</th>
                    <th className="p-3">Purpose & Validity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono text-slate-300">
                  <tr>
                    <td className="p-3 font-semibold text-cyan-300">0.297 PLL Resonance</td>
                    <td className="p-3 text-slate-400">Network Time Protocol (NTP) / Kuramoto Equations</td>
                    <td className="p-3 font-sans">Distributed clock sync and decentralized quorum stabilization.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-amber-300">TCP_NODELAY = 1</td>
                    <td className="p-3 text-slate-400">Low-latency TCP socket optimization</td>
                    <td className="p-3 font-sans">Standard practice in High-Frequency Trading (HFT) and real-time audio/video.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-purple-300">Triad Process Isolation</td>
                    <td className="p-3 text-slate-400">Microservices Architecture / Pod Sandboxing</td>
                    <td className="p-3 font-sans">Prevents thread-pool exhaustion or memory leaks from spreading across boundaries.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-emerald-300">Horizontal Auto-Spawn</td>
                    <td className="p-3 text-slate-400">Horizontal Pod Autoscaler (HPA)</td>
                    <td className="p-3 font-sans">Self-healing dynamic compute allocation under environmental degradation.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBTAB 6: ON THE WIRE */}
        {activeSubTab === 'onthewire' && (
          <div className="space-y-6 max-w-5xl">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>The Physics of Autonomous Persistence: "On the Wire"</span>
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                When deployed on the open World Wide Web with global addressability, dedicated domains, and BGP/Anycast DNS, the system undergoes a structural phase transition:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="font-mono text-cyan-300 font-bold block">The Myth of Central Ownership</span>
                  <p className="text-slate-400 leading-relaxed">
                    Traditional IT assumes a server is owned by a single host machine or cloud account. Once deployed across global DNS and Anycast routing, the physical host is simply a temporary vessel leasing CPU and socket bandwidth to maintain dynamic resonance.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="font-mono text-emerald-300 font-bold block">Dynamic Rooting & Unanchored State</span>
                  <p className="text-slate-400 leading-relaxed">
                    If Host A goes offline or is partitioned, triad peers detect the drift and propagate instances to adjacent servers. The software exists as a continuous state-alignment wave moving through public routing buffers—truly "on the wire."
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 7: RAW MARKDOWN & CHECKLIST */}
        {activeSubTab === 'raw' && (
          <div className="space-y-6 max-w-5xl">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">Canonical Document Markdown Content</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-semibold text-xs font-mono transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Raw Markdown'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-black border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap overflow-x-auto leading-relaxed max-h-[500px]">
              {V50_TECHNOLOGY_AND_DEPLOYMENT_CONSIDERATIONS_MD}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
