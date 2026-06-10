import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, User, Clock, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';

/**
 * Modal for starting a NEW session on an idle PC.
 * Active session actions (Stop, Extend, Bill, Food, Promo)
 * are now handled inline on the PcCard itself.
 */
export default function SessionActionModal({ pc, onClose, onActionSuccess }) {
  const { isSuperAdmin, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    customerName: '',
    customerType: 'Walk-in', // 'Walk-in' | 'Member'
    durationMinutes: 60,
  });

  if (!pc) return null;

  // Only show for idle PCs — active sessions are handled inline on card
  if (pc.state !== 'Idle' && pc.state !== 'Offline') return null;

  const handleStart = async (e) => {
    e.preventDefault();
    if (!form.customerName.trim()) {
      setError('Customer name is required.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const ratePerHour = form.customerType === 'member' ? 80 : 100;
      const expectedAmount = (form.durationMinutes / 60) * ratePerHour;
      
      await api.post('/sessions/start', {
        pcId: pc.id,
        customerName: form.customerName.trim(),
        customerType: form.customerType,
        durationMinutes: form.durationMinutes,
        packageName: `${form.customerType.toUpperCase()} - ${form.durationMinutes}m`,
        expectedAmount: expectedAmount,
        isOverride: isSuperAdmin,
        operatorId: user?.id,
      });
      onActionSuccess?.();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.error || err.response?.data?.message || 'Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="w-full max-w-sm bg-bg-2 border border-border rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-border bg-bg-3 flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-text uppercase tracking-wider text-base flex items-center gap-2">
                <Play className="w-4 h-4 text-pc-active" />
                Start Session — {pc.name}
              </h2>
              <p className="text-text-3 text-[10px] font-mono mt-0.5">
                {pc.zone && <span className="mr-2 text-neon-purple">{pc.zone}</span>}
                {pc.ratePerHour > 0 && <span>₹{pc.ratePerHour}/hr</span>}
              </p>
            </div>
            <button onClick={onClose} className="p-1 text-text-3 hover:text-text rounded transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleStart} className="p-5 space-y-4">
            {error && (
              <div className="p-3 bg-neon-red/10 border border-neon-red/20 rounded text-neon-red text-xs">
                {error}
              </div>
            )}

            {/* Customer Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-semibold text-text-2 uppercase tracking-wider flex items-center gap-1">
                <User className="w-3 h-3" /> Customer Name *
              </label>
              <input
                type="text"
                value={form.customerName}
                onChange={(e) => setForm(f => ({ ...f, customerName: e.target.value }))}
                placeholder="Enter name or token..."
                className="w-full bg-bg-3 border border-border rounded px-3 py-2 text-sm text-text placeholder-text-3 focus:border-pc-active focus:outline-none transition-colors"
                autoFocus
              />
            </div>

            {/* Customer Type */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-semibold text-text-2 uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3 h-3" /> Session Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['Walk-in', 'Member'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, customerType: type }))}
                    className={`py-2 rounded border text-xs font-semibold uppercase tracking-wide transition-colors ${
                      form.customerType === type
                        ? 'border-pc-active bg-pc-active/10 text-pc-active'
                        : 'border-border bg-bg-3 text-text-2 hover:border-border-2'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-semibold text-text-2 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3" /> Duration
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[30, 60, 120, 180].map(min => (
                  <button
                    key={min}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, durationMinutes: min }))}
                    className={`py-2 rounded border text-xs font-semibold transition-colors ${
                      form.durationMinutes === min
                        ? 'border-pc-active bg-pc-active/10 text-pc-active'
                        : 'border-border bg-bg-3 text-text-2 hover:border-border-2'
                    }`}
                  >
                    {min < 60 ? `${min}m` : `${min / 60}h`}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded border border-pc-active/50 bg-pc-active/10 text-pc-active font-heading font-bold uppercase tracking-widest text-sm hover:bg-pc-active/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-pc-active border-t-transparent rounded-full animate-spin" />
                : <Play className="w-4 h-4" />
              }
              {loading ? 'Starting...' : 'Start Session'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
