import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { X, Minus, Square, Maximize2 } from 'lucide-react';

interface AetherWindowProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  isMinimized: boolean;
  zIndex: number;
  onFocus: (id: string) => void;
  defaultSize?: { width: number | string; height: number | string };
  defaultPosition?: { x: number; y: number };
}

export const AetherWindow: React.FC<AetherWindowProps> = ({ 
  id, title, icon, children, onClose, onMinimize, isMinimized, zIndex, onFocus, defaultSize, defaultPosition 
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [prevSize, setPrevSize] = useState(defaultSize || { width: 800, height: 600 });
  const [prevPos, setPrevPos] = useState(defaultPosition || { x: 100, y: 100 });

  if (isMinimized) return null;

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  return (
    <Rnd
      style={{ zIndex }}
      size={isMaximized ? { width: '100%', height: '100%' } : prevSize}
      position={isMaximized ? { x: 0, y: 0 } : prevPos}
      onDragStop={(e, d) => !isMaximized && setPrevPos({ x: d.x, y: d.y })}
      onResizeStop={(e, direction, ref, delta, position) => {
        if (!isMaximized) {
          setPrevSize({ width: ref.style.width, height: ref.style.height });
          setPrevPos(position);
        }
      }}
      dragHandleClassName="window-header"
      minWidth={300}
      minHeight={200}
      bounds="parent"
      enableResizing={!isMaximized}
      disableDragging={isMaximized}
      onMouseDown={() => onFocus(id)}
    >
      <div className="flex flex-col w-full h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div 
          className="window-header h-10 bg-slate-800/50 flex items-center justify-between px-4 cursor-default select-none border-b border-slate-700/50"
          onMouseDown={() => onFocus(id)}
        >
          <div className="flex items-center gap-3">
            <div className="text-slate-400">{icon}</div>
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">{title}</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onMinimize(id); }}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-500 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); toggleMaximize(); }}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-500 transition-colors"
            >
              {isMaximized ? <Maximize2 className="w-3.5 h-3.5 rotate-180" /> : <Square className="w-3.5 h-3.5" />}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onClose(id); }}
              className="p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-slate-500 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative bg-slate-950">
          {children}
        </div>
      </div>
    </Rnd>
  );
};
