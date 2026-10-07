import React, { useMemo } from 'react';
import { Battery, Zap, Thermometer, BarChart3 } from 'lucide-react';

interface PowerProfilerProps {
  alpha: number; // Switching Activity Factor
  v_dd: number;  // Core Voltage (mV)
  freq: number;  // Frequency (MHz)
  temp: number;  // Junction Temp (C)
}

export const PowerProfiler: React.FC<PowerProfilerProps> = ({ alpha, v_dd, freq, temp }) => {
  // P_dyn = alpha * C_L * V_dd^2 * f
  // C_L simplified to 10fF per bit for visualization
  const dynamicPower = useMemo(() => {
    const c_l = 10e-15;
    const v = v_dd / 1000;
    const f = freq * 1e6;
    const power = alpha * c_l * (v * v) * f;
    return (power * 1e12).toFixed(2); // pJ/op representation
  }, [alpha, v_dd, freq]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-bold text-white uppercase tracking-widest font-heading">Hardware Power Profiler</h2>
        </div>
        <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
           <span className="text-[10px] font-bold text-blue-400 font-mono">α = {alpha.toFixed(4)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-slate-500">
            <Battery className="w-3.5 h-3.5" />
            <span className="text-[9px] font-bold uppercase">Dynamic Power</span>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">{dynamicPower}</span>
            <span className="text-[10px] text-slate-500 font-mono mb-1">pJ/op</span>
          </div>
          <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 transition-all duration-1000" 
              style={{ width: `${Math.min(100, (parseFloat(dynamicPower) / 20) * 100)}%` }}
            />
          </div>
        </div>

        <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-slate-500">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[9px] font-bold uppercase">Core VDD Droop</span>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-bold text-blue-400 font-mono tabular-nums">{v_dd}</span>
            <span className="text-[10px] text-slate-500 font-mono mb-1">mV</span>
          </div>
          <div className="text-[8px] text-slate-600 font-mono">NOMINAL: 850mV // DROOP: {(850 - v_dd).toFixed(1)}mV</div>
        </div>

        <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-slate-500">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[9px] font-bold uppercase">Clock Frequency</span>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">{freq}</span>
            <span className="text-[10px] text-slate-500 font-mono mb-1">MHz</span>
          </div>
          <div className="text-[8px] text-slate-600 font-mono">PLL_LOCK: STABLE</div>
        </div>

        <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-slate-500">
            <Thermometer className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-[9px] font-bold uppercase">Junction Temp</span>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-bold text-rose-400 font-mono tabular-nums">{temp.toFixed(1)}</span>
            <span className="text-[10px] text-slate-500 font-mono mb-1">°C</span>
          </div>
          <div className="text-[8px] text-slate-600 font-mono">T_LIMIT: 95.0°C</div>
        </div>
      </div>

      <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
        <p className="text-[10px] text-slate-400 leading-relaxed italic">
          "The 608-bit static latch reduces register switching activity factor (α) from 0.50 to 0.025, yielding a 95.0% reduction in dynamic power dissipation compared to standard microarchitectural polling. Every bit-flip is accounted for in the SRAM holding substrate."
        </p>
      </div>
    </div>
  );
};
