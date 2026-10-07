import React, { useEffect, useRef } from 'react';

interface BrainkNeuralFabricProps {
  sramSnapshot: string; // Hex string
  activeLanes: number;
}

export const BrainkNeuralFabric: React.FC<BrainkNeuralFabricProps> = ({ sramSnapshot, activeLanes }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sramSnapshot) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const bytes = new Uint8Array(sramSnapshot.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const dotSize = 3;
      const gap = 1;
      const lanesToRender = Math.min(activeLanes, 20);
      
      // Render 20 Parallel Execution Lanes
      for (let lane = 0; lane < lanesToRender; lane++) {
        // Offset MEM-05: 0x1400 (5120 bytes)
        // Digest starts at offset 16 in spatial_lane_t (64 bytes each)
        const digestOffset = 5120 + (lane * 64) + 16;
        const digestBytes = bytes.slice(digestOffset, digestOffset + 32);
        
        // Horizontal: 32 bytes (256 bits)
        // Vertical: 20 Lanes
        digestBytes.forEach((byte, byteIdx) => {
          for (let bit = 0; bit < 8; bit++) {
            const isSet = (byte >> (7 - bit)) & 1;
            const x = byteIdx * 8 + bit;
            const y = lane;
            
            // Optical Entropy Mapping
            // PURE DARK (Match) vs ACTIVE EMIT (Entropy)
            if (isSet) {
              ctx.fillStyle = `rgba(59, 130, 246, ${0.4 + Math.random() * 0.6})`;
            } else {
              // High entropy zero-pixel: deep slate
              ctx.fillStyle = '#0f172a';
              if (byte === 0) {
                 // Target match hit (MEM-04 Threshold Gate)
                 ctx.fillStyle = '#10b981';
              }
            }
            
            ctx.fillRect(
              x * (dotSize + gap) + 20, 
              y * (dotSize + gap * 2) + 15, 
              dotSize, 
              dotSize
            );
          }
        });

        // Lane Authority Indicator (L_i = O_i)
        ctx.fillStyle = '#475569';
        ctx.font = '6px monospace';
        ctx.fillText(`L${(lane + 1).toString().padStart(2, '0')}`, 2, lane * (dotSize + gap * 2) + 20);
      }

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [sramSnapshot, activeLanes]);

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest">Braink Neural Fabric // Optical Eval</span>
         </div>
         <div className="flex items-center gap-3">
            <span className="text-[9px] font-mono text-slate-500">SAMPLING: 40Hz</span>
            <span className="text-[9px] font-mono text-emerald-500">DMA_SUBSTRATE: OK</span>
         </div>
      </div>
      <canvas 
        ref={canvasRef} 
        width={1050} 
        height={130} 
        className="w-full h-32 bg-slate-950 rounded-xl border border-slate-800/50 cursor-crosshair"
      />
      <div className="grid grid-cols-4 gap-4 text-[8px] font-mono text-slate-600">
         <div className="flex items-center gap-1.5">
           <div className="w-1.5 h-1.5 rounded-sm bg-emerald-500" />
           <span>● PURE DARK (THRESHOLD)</span>
         </div>
         <div className="flex items-center gap-1.5">
           <div className="w-1.5 h-1.5 rounded-sm bg-blue-500" />
           <span>○ ACTIVE EMIT (ENTROPY)</span>
         </div>
         <div className="flex items-center gap-1.5">
           <div className="w-1.5 h-1.5 rounded-sm bg-slate-800" />
           <span>◌ NULL VECTOR</span>
         </div>
         <div className="text-right text-slate-500">
           INVARIANT: L_i ≡ O_i
         </div>
      </div>
    </div>
  );
};
