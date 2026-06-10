import { memo, useState, useEffect, useCallback } from 'react';
import { User, Clock, Wrench, ShieldAlert, AlertTriangle, Square, RefreshCw, Receipt, Coffee, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

// ── Elapsed time from a start ISO string (counting UP) ──
function useElapsedTime(startTimeIso) {
  const [elapsed, setElapsed] = useState({ h: 0, m: 0, s: 0, totalMin: 0 });

  useEffect(() => {
    if (!startTimeIso) return;

    const update = () => {
      const diffMs = Date.now() - new Date(startTimeIso).getTime();
      const totalSec = Math.max(0, Math.floor(diffMs / 1000));
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      setElapsed({ h, m, s, totalMin: totalSec / 60 });
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [startTimeIso]);

  return elapsed;
}

// ── Format elapsed as "0h 12m" ──
function fmtElapsed(h, m) {
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const PcCard = memo(({ pc, onStartSession, onRefresh }) => {
  const { isSuperAdmin } = useAuth();
  const elapsed = useElapsedTime(pc.sessionStartTime);
  const [actionLoading, setActionLoading] = useState(null); // 'stop' | 'extend' | etc.

  // Live charge: elapsed minutes * rate per hour / 60
  const liveCharge = pc.ratePerHour > 0
    ? Math.ceil((elapsed.totalMin / 60) * pc.ratePerHour)
    : 0;

  const isActive = pc.state === 'Active';
  const isIdle = pc.state === 'Idle';
  const isReserved = pc.state === 'Reserved';
  const isAwaiting = pc.state === 'AwaitingBilling';
  const isMaintenance = pc.state === 'UnderMaintenance';

  const doAction = useCallback(async (action, payload = {}) => {
    setActionLoading(action);
    try {
      await api.post(`/sessions/${pc.activeSessionId}/${action}`, payload);
      onRefresh?.();
    } catch (err) {
      console.error(`Action ${action} failed:`, err);
    } finally {
      setActionLoading(null);
    }
  }, [pc.activeSessionId, onRefresh]);

  // ── FREE (Idle) Card ──
  if (isIdle) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-lg border border-border bg-bg-2 p-4 flex flex-col gap-3 select-none"
      >
        <div className="flex items-center justify-between">
          <span className="font-heading font-bold text-text text-sm tracking-wider">{pc.name}</span>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 border border-border text-text-3 rounded">FREE</span>
        </div>
        <div className="flex items-center gap-1.5 text-text-3 text-xs">
          <User className="w-3.5 h-3.5" />
          <span>Available</span>
        </div>
        <button
          onClick={() => onStartSession?.(pc)}
          className="w-full py-1.5 rounded border border-pc-active/40 bg-pc-active/10 text-pc-active text-[11px] font-bold uppercase tracking-widest hover:bg-pc-active/20 transition-colors"
        >
          START SESSION
        </button>
      </motion.div>
    );
  }

  // ── OCCUPIED (Active) Card ──
  if (isActive) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-lg border border-pc-active/50 bg-bg-2 p-4 flex flex-col gap-2.5 shadow-[0_0_12px_rgba(220,38,38,0.08)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="font-heading font-bold text-text text-sm tracking-wider">{pc.name}</span>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 border border-pc-active/50 text-pc-active rounded">OCCUPIED</span>
        </div>

        {/* Customer type */}
        <div className="flex items-center gap-1.5 text-text-2 text-xs">
          <User className="w-3.5 h-3.5 text-text-3" />
          <span>{pc.customerName || pc.customerType || 'Walk-in'}</span>
        </div>

        {/* Time + Charge row */}
        <div className="grid grid-cols-2 gap-2 bg-bg-3 rounded p-2.5 border border-border">
          <div>
            <div className="text-[9px] text-text-3 font-mono uppercase tracking-widest mb-0.5">Session Elapsed</div>
            <div className="font-mono font-bold text-pc-active text-sm">
              {fmtElapsed(elapsed.h, elapsed.m)}
            </div>
          </div>
          <div>
            <div className="text-[9px] text-text-3 font-mono uppercase tracking-widest mb-0.5">Charge</div>
            <div className="font-mono font-bold text-neon-orange text-sm">
              ₹{liveCharge}
            </div>
          </div>
        </div>

        {/* Action Buttons Row 1: Stop + Extend */}
        <div className="grid grid-cols-2 gap-1.5">
          <ActionBtn
            color="red"
            icon={<Square className="w-3 h-3" />}
            label="Stop"
            loading={actionLoading === 'stop'}
            onClick={() => doAction('stop')}
          />
          <ActionBtn
            color="blue"
            icon={<RefreshCw className="w-3 h-3" />}
            label="Extend"
            loading={actionLoading === 'extend'}
            onClick={() => doAction('extend', { extraMinutes: 60 })}
          />
        </div>

        {/* Action Buttons Row 2: Bill + Food + Promo */}
        <div className="grid grid-cols-3 gap-1.5">
          <ActionBtn
            color="orange"
            icon={<Receipt className="w-3 h-3" />}
            label="Bill"
            loading={actionLoading === 'bill'}
            onClick={() => doAction('bill')}
            small
          />
          <ActionBtn
            color="green"
            icon={<Coffee className="w-3 h-3" />}
            label="Food"
            loading={actionLoading === 'food'}
            onClick={() => doAction('food')}
            small
          />
          <ActionBtn
            color="purple"
            icon={<Gift className="w-3 h-3" />}
            label="Promo"
            loading={actionLoading === 'promo'}
            onClick={() => doAction('promo')}
            small
          />
        </div>
      </motion.div>
    );
  }

  // ── AWAITING BILLING Card ──
  if (isAwaiting) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-lg border border-neon-orange/50 bg-bg-2 p-4 flex flex-col gap-3"
      >
        <div className="flex items-center justify-between">
          <span className="font-heading font-bold text-text text-sm tracking-wider">{pc.name}</span>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 border border-neon-orange/50 text-neon-orange rounded animate-pulse">BILLING</span>
        </div>
        <div className="flex items-center gap-1.5 text-neon-orange text-xs">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{pc.customerName || 'Awaiting checkout'}</span>
        </div>
        <div className="text-[10px] text-text-3 font-mono text-center py-1">Pending at billing counter</div>
      </motion.div>
    );
  }

  // ── RESERVED Card ──
  if (isReserved) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-lg border border-neon-purple/40 bg-bg-2 p-4 flex flex-col gap-3"
      >
        <div className="flex items-center justify-between">
          <span className="font-heading font-bold text-text text-sm tracking-wider">{pc.name}</span>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 border border-neon-purple/50 text-neon-purple rounded">RESERVED</span>
        </div>
        <div className="flex items-center gap-1.5 text-neon-purple text-xs">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>{pc.customerName || 'Reserved slot'}</span>
        </div>
        {pc.nextReservationTime && (
          <div className="flex items-center gap-1 text-[10px] text-text-3 font-mono">
            <Clock className="w-3 h-3" />
            {new Date(pc.nextReservationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
          </div>
        )}
      </motion.div>
    );
  }

  // ── MAINTENANCE Card ──
  if (isMaintenance) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-lg border border-neon-red/30 bg-bg-2/60 p-4 flex flex-col gap-3 opacity-75"
      >
        <div className="flex items-center justify-between">
          <span className="font-heading font-bold text-text-2 text-sm tracking-wider">{pc.name}</span>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 border border-neon-red/30 text-neon-red rounded">MAINT</span>
        </div>
        <div className="flex items-center gap-1.5 text-neon-red text-xs">
          <Wrench className="w-3.5 h-3.5" />
          <span>Under maintenance</span>
        </div>
      </motion.div>
    );
  }

  // ── OFFLINE / fallback ──
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative rounded-lg border border-border/30 bg-bg-2/40 p-4 flex flex-col gap-3 opacity-40"
    >
      <div className="flex items-center justify-between">
        <span className="font-heading font-bold text-text-3 text-sm tracking-wider">{pc.name}</span>
        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 border border-border text-text-3 rounded">OFFLINE</span>
      </div>
    </motion.div>
  );
});

// ── Small reusable action button ──
function ActionBtn({ color, icon, label, onClick, loading, small = false }) {
  const colorMap = {
    red:    'border-neon-red/40    bg-neon-red/10    text-neon-red    hover:bg-neon-red/20',
    blue:   'border-neon-blue/40   bg-neon-blue/10   text-neon-blue   hover:bg-neon-blue/20',
    orange: 'border-neon-orange/40 bg-neon-orange/10 text-neon-orange hover:bg-neon-orange/20',
    green:  'border-pc-active/40   bg-pc-active/10   text-pc-active   hover:bg-pc-active/20',
    purple: 'border-neon-purple/40 bg-neon-purple/10 text-neon-purple hover:bg-neon-purple/20',
  };

  return (
    <button
      onClick={onClick}
      disabled={!!loading}
      className={`flex items-center justify-center gap-1 rounded border transition-colors
        ${small ? 'py-1 text-[10px]' : 'py-1.5 text-[11px]'}
        font-bold uppercase tracking-wider
        ${colorMap[color]}
        ${loading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {loading ? <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" /> : icon}
      {label}
    </button>
  );
}

PcCard.displayName = 'PcCard';
export default PcCard;
