import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, ShoppingCart, AlertTriangle } from 'lucide-react';

export default function LimitedUserPage() {
  const navigate = useNavigate();
  // In a real implementation, we would listen via SignalR if a PC was assigned
  // or if a session was started. For now, we simulate state.
  const [isAssigned, setIsAssigned] = useState(false);
  const [pcNumber, setPcNumber] = useState('');

  // Demo toggle for testing UI
  const toggleAssigned = () => {
    setIsAssigned(!isAssigned);
    setPcNumber(isAssigned ? '' : 'PC-07');
  };

  return (
    <div className="min-h-screen bg-bg relative overflow-hidden flex">
      {/* Main Content Area (Background) */}
      <div className="flex-1 relative flex items-center justify-center p-6">
        <button 
          onClick={() => navigate('/user/select')}
          className="absolute top-8 left-8 flex items-center gap-2 text-text-muted hover:text-white transition-colors z-20"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-outfit text-lg">Back</span>
        </button>

        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neon-primary/10 via-bg to-bg" />

        <div className="relative z-10 text-center max-w-2xl">
          {!isAssigned ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel p-10 border-neon-primary/20"
            >
              <h1 className="font-outfit text-4xl font-bold text-white mb-6">Welcome to Apple Esports</h1>
              <div className="w-16 h-1 bg-neon-primary mx-auto mb-6 rounded-full" />
              <p className="text-2xl text-text-muted font-inter leading-relaxed">
                Please proceed to the counter to be assigned a gaming station.
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="font-outfit text-6xl font-bold text-white mb-4">You are at {pcNumber}</h1>
              <p className="text-xl text-neon-success font-inter">Session is active</p>
            </motion.div>
          )}
        </div>

        {/* Developer debug toggle */}
        <button onClick={toggleAssigned} className="absolute bottom-4 left-4 text-xs text-text-muted/50 border border-text-muted/20 px-2 py-1 rounded">Toggle Dev State</button>
      </div>

      {/* Limited User Sidebar */}
      {isAssigned && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          className="w-80 border-l border-glass-border glass-panel rounded-none flex flex-col h-screen"
        >
          {/* Header */}
          <div className="p-6 border-b border-glass-border">
            <h2 className="font-outfit text-xl font-semibold text-white tracking-wide">Gaming Station</h2>
            <p className="text-neon-primary font-mono mt-1 text-lg">{pcNumber}</p>
          </div>

          {/* Session Minimal Status */}
          <div className="p-6 border-b border-glass-border bg-black/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-text-muted font-inter text-sm">Remaining Time</span>
              <Clock className="w-4 h-4 text-neon-success" />
            </div>
            <div className="font-mono text-3xl font-bold text-white">01:45:00</div>
            
            {/* Timer Bar */}
            <div className="mt-4 h-1.5 bg-bg-surface rounded-full overflow-hidden">
              <div className="h-full bg-neon-success w-2/3" />
            </div>
          </div>

          {/* Warning Alerts */}
          <div className="p-4 mx-4 mt-6 bg-neon-warning/10 border border-neon-warning/30 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-neon-warning shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-neon-warning font-semibold font-outfit">Ending Soon</p>
              <p className="text-text-muted text-xs mt-1">Please top up at the counter to continue playing.</p>
            </div>
          </div>

          <div className="flex-1" />

          {/* Food Menu Teaser */}
          <div className="p-6 border-t border-glass-border bg-gradient-to-t from-bg-surface to-transparent">
            <button className="w-full btn-secondary flex items-center justify-center gap-2 py-3 border-neon-primary/30 hover:border-neon-primary text-neon-primary">
              <ShoppingCart className="w-4 h-4" />
              <span className="font-outfit font-semibold">Order Food & Drinks</span>
            </button>
            <p className="text-xs text-text-muted text-center mt-3">Orders are billed to your station</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
