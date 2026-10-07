import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Globe, 
  Box, 
  Activity, 
  Zap, 
  ShieldCheck, 
  Database,
  BarChart3,
  RefreshCw,
  Search,
  ArrowUpRight,
  Maximize2
} from 'lucide-react';
import { GLOBAL_MARKET_TELEMETRY, TelemetryState } from '../../services/MempoolMarketSubstrate';

export const MempoolMarketDashboard: React.FC = () => {
  const [data, setData] = useState<TelemetryState>(GLOBAL_MARKET_TELEMETRY.getState());

  useEffect(() => {
    return GLOBAL_MARKET_TELEMETRY.subscribe(setData);
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(val);
  };

  const formatTime = (ts: number) => {
    const date = new Date(ts * 1000);
    return date.toLocaleTimeString([], { hour12: false });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Market Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative overflow-hidden shadow-xl group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
            <Zap className="w-12 h-12 text-amber-400" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">BTC / USD Price</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-white tracking-tighter">
                {formatCurrency(data.market.priceUsd)}
              </span>
              <span className={`text-xs font-bold flex items-center gap-1 ${data.market.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {data.market.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {data.market.change24h.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative overflow-hidden shadow-xl">
           <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">24h Volume</span>
            </div>
            <div className="text-xl font-bold text-white tracking-tight">
              {formatNumber(data.market.volume24h)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono uppercase">Global Exchange Composite</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative overflow-hidden shadow-xl">
           <div className="flex items-center gap-2 mb-1">
              <Database className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Market Cap</span>
            </div>
            <div className="text-xl font-bold text-white tracking-tight">
              {formatNumber(data.market.marketCap)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono uppercase">Liquid Asset Substrate</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 relative overflow-hidden shadow-xl">
           <div className="flex items-center gap-2 mb-1">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Fee Vector</span>
            </div>
            <div className="text-xl font-bold text-white tracking-tight">
              {data.mempool.suggestedFees.fastest} <span className="text-xs text-slate-500 font-normal">sat/vB</span>
            </div>
            <div className="text-[10px] text-emerald-500 font-mono mt-1 uppercase">Instant Confirmation Zone</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Global Time Vectors */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">Global Synchronization Vectors</h3>
            </div>
            <div className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${data.isSynced ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 animate-pulse'}`}>
              {data.isSynced ? 'GRID_ACTIVE' : 'SYNC_PENDING'}
            </div>
          </div>
          
          <div className="space-y-3">
            {data.vectors.map((vec, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 bg-black/30 rounded-xl border border-slate-800/50 hover:border-slate-700 transition-colors">
                <div className="space-y-0.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">{vec.location}</div>
                  <div className="text-[9px] text-slate-600 font-mono">UTC {vec.offset >= 0 ? '+' : ''}{vec.offset}:00</div>
                </div>
                <div className="text-lg font-mono font-bold text-cyan-400 tracking-tighter">
                  {vec.timestamp}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
            <p className="text-[9px] text-slate-500 leading-relaxed italic">
              Synchronizing system state across opposite global vectors to maintain substrate liveness and cryptographic anchoring.
            </p>
          </div>
        </div>

        {/* Mempool Blocks Dashboard */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-amber-500" />
              <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">Mempool Block Solve Substrate</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-[9px] text-slate-500 font-bold uppercase">Latest Height</span>
                <span className="text-[10px] text-amber-400 font-mono font-bold">{data.mempool.blocks[0]?.height || '---'}</span>
              </div>
              <button className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors">
                <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto p-5 scrollbar-thin scrollbar-thumb-slate-800">
             <div className="flex gap-4 min-w-max">
               {data.mempool.blocks.map((block, idx) => (
                 <div key={idx} className="w-48 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 group hover:border-amber-500/50 transition-all cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-white font-mono">#{block.height}</span>
                      <span className="text-[9px] text-slate-500">{formatTime(block.timestamp)}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] uppercase font-bold text-slate-500">
                        <span>Size</span>
                        <span className="text-slate-300">{(block.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                      <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (block.size / 1000000) * 100)}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] uppercase font-bold text-slate-500">
                        <span>Transactions</span>
                        <span className="text-slate-300">{block.txCount}</span>
                      </div>
                      <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500" style={{ width: `${Math.min(100, (block.txCount / 4000) * 100)}%` }} />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-900">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[9px] font-bold text-slate-600 uppercase">Fee Range</span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">{block.feeRange[0]}-{block.feeRange[1]}</span>
                      </div>
                    </div>

                    <div className="text-[8px] font-mono text-slate-700 truncate mt-1">
                      {block.hash}
                    </div>
                 </div>
               ))}
             </div>
          </div>

          <div className="px-5 py-3 bg-slate-950/50 border-t border-slate-800 flex items-center justify-between text-[10px]">
             <div className="flex items-center gap-6">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded bg-blue-500" />
                 <span className="text-slate-400 uppercase font-bold tracking-tight">Block Weight</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded bg-violet-500" />
                 <span className="text-slate-400 uppercase font-bold tracking-tight">TX Density</span>
               </div>
             </div>
             <div className="flex items-center gap-2 text-slate-500 font-mono italic">
               Live substrate feed from mempool.space v2 API
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
