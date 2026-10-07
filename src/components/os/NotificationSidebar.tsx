import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Zap,
  Activity,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'critical';
  timestamp: number;
}

interface NotificationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationSidebar: React.FC<NotificationSidebarProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<SystemNotification[]>([
    {
      id: 'initial-boot',
      title: 'Kernel Substrate Online',
      message: 'Aether OS v2.4 initialized with DO-178C DAL-A compliance.',
      type: 'success',
      timestamp: Date.now() - 1000 * 60 * 5
    },
    {
      id: 'mesh-sync',
      title: 'Mesh Grid Synchronized',
      message: 'Successfully established hole-punching into 5 worker sectors.',
      type: 'info',
      timestamp: Date.now() - 1000 * 60 * 2
    }
  ]);

  // Simulate incoming notifications
  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      const types: Array<SystemNotification['type']> = ['info', 'success', 'warning'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      const newNotif: SystemNotification = {
        id: `notif-${Date.now()}`,
        title: type === 'warning' ? 'Dynamic VDD Droop' : 'ASIC Cycle Transition',
        message: type === 'warning' 
          ? 'Voltage stability threshold detected slight drift in Sector 4.' 
          : 'Deterministic state transition successful (τ-transition).',
        type,
        timestamp: Date.now()
      };
      
      setNotifications(prev => [newNotif, ...prev].slice(0, 20));
    }, 15000);
    
    return () => clearInterval(interval);
  }, [isOpen]);

  const clearAll = () => setNotifications([]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[10000]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 bottom-0 w-80 bg-slate-900/95 backdrop-blur-2xl border-l border-white/10 z-[10001] flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-blue-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-widest">Control Center</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
                  <ShieldCheck className="w-12 h-12 opacity-20" />
                  <p className="text-[11px] font-bold uppercase tracking-widest">No active alerts</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-2 hover:bg-white/10 transition-colors group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {n.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        {n.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                        {n.type === 'critical' && <Activity className="w-3.5 h-3.5 text-rose-400" />}
                        {n.type === 'info' && <Info className="w-3.5 h-3.5 text-blue-400" />}
                        <span className="text-[10px] font-bold text-slate-200 uppercase tracking-tight">{n.title}</span>
                      </div>
                      <span className="text-[8px] font-mono text-slate-600 tabular-nums">
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                      {n.message}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-white/5 bg-slate-950/50">
               <button 
                onClick={clearAll}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-bold text-slate-400 hover:text-white transition-all uppercase tracking-widest"
               >
                 Acknowledge All
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
