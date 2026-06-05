import { memo, useState, useEffect } from 'react';
import { Monitor, Clock, User, ShieldAlert, Wrench, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatTimeDelta } from '../../utils/timeUtils';

const getStateStyles = (state) => {
  switch (state) {
    case 'Active': return { bg: 'bg-neon-blue/10', border: 'border-neon-blue/30', text: 'text-neon-blue', indicator: 'bg-neon-blue' };
    case 'Reserved': return { bg: 'bg-neon-purple/10', border: 'border-neon-purple/30', text: 'text-neon-purple', indicator: 'bg-neon-purple' };
    case 'AwaitingBilling': return { bg: 'bg-neon-orange/10', border: 'border-neon-orange/30', text: 'text-neon-orange', indicator: 'bg-neon-orange animate-pulse' };
    case 'UnderMaintenance': return { bg: 'bg-neon-red/10', border: 'border-neon-red/30', text: 'text-neon-red', indicator: 'bg-neon-red' };
    case 'Offline': return { bg: 'bg-bg-4', border: 'border-border', text: 'text-text-3', indicator: 'bg-text-3' };
    case 'Idle':
    default: return { bg: 'bg-bg-2', border: 'border-border', text: 'text-text-2', indicator: 'bg-text-3' };
  }
};

const PcCard = memo(({ pc, onClick }) => {
  const [timeLeft, setTimeLeft] = useState('00:00:00');
  const styles = getStateStyles(pc.state);
  
  // Localized tick logic so parent grid doesn't re-render
  useEffect(() => {
    if (pc.state !== 'Active' || !pc.sessionEndTime) {
      setTimeLeft('00:00:00');
      return;
    }

    const updateTimer = () => {
      const end = new Date(pc.sessionEndTime).getTime();
      const now = Date.now();
      const diff = end - now;
      setTimeLeft(formatTimeDelta(diff));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [pc.state, pc.sessionEndTime]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(pc)}
      className={`relative rounded-xl p-4 cursor-pointer transition-colors border ${styles.bg} ${styles.border} flex flex-col justify-between h-36`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Monitor className={`w-5 h-5 ${styles.text}`} />
          <span className="font-heading font-bold text-text uppercase tracking-wider">{pc.name}</span>
        </div>
        <div className={`w-2.5 h-2.5 rounded-full ${styles.indicator} shadow-[0_0_8px_currentColor]`} />
      </div>

      {/* Center Content (State or Timer) */}
      <div className="flex flex-col items-center justify-center flex-1 my-2">
        {pc.state === 'Active' ? (
          <div className="text-center">
            <span className="text-2xl font-mono font-bold text-text drop-shadow-md">
              {timeLeft}
            </span>
            <div className="text-[10px] text-text-3 uppercase tracking-widest mt-0.5 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" /> REMAINING
            </div>
          </div>
        ) : pc.state === 'Reserved' ? (
          <div className="text-center">
            <span className={`text-lg font-bold ${styles.text}`}>RESERVED</span>
            <div className="text-xs text-text-3 mt-1">
              {pc.nextReservationTime ? new Date(pc.nextReservationTime).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' }) : ''}
            </div>
          </div>
        ) : pc.state === 'AwaitingBilling' ? (
          <div className="text-center">
            <AlertTriangle className={`w-6 h-6 mx-auto mb-1 ${styles.text}`} />
            <span className={`text-sm font-bold ${styles.text} uppercase`}>AWAITING BILLING</span>
          </div>
        ) : pc.state === 'UnderMaintenance' ? (
          <div className="text-center">
            <Wrench className={`w-6 h-6 mx-auto mb-1 ${styles.text}`} />
            <span className={`text-sm font-bold ${styles.text} uppercase`}>MAINTENANCE</span>
          </div>
        ) : (
          <span className={`text-lg font-bold ${styles.text} uppercase`}>{pc.state}</span>
        )}
      </div>

      {/* Bottom Footer */}
      <div className="flex items-center justify-between border-t border-border pt-2 mt-auto">
        {pc.customerName ? (
          <div className="flex items-center gap-1.5 max-w-[80%]">
            <User className="w-3.5 h-3.5 text-text-3 shrink-0" />
            <span className="text-xs text-text-2 truncate font-medium">{pc.customerName}</span>
          </div>
        ) : (
          <span className="text-xs text-text-4 font-medium uppercase tracking-wider">AVAILABLE</span>
        )}
        
        {pc.nextReservationId && pc.state !== 'Reserved' && (
          <ShieldAlert className="w-4 h-4 text-neon-purple animate-pulse" title="Upcoming Reservation" />
        )}
      </div>
    </motion.div>
  );
});

PcCard.displayName = 'PcCard';
export default PcCard;
