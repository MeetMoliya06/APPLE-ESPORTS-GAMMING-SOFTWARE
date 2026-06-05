import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, FastForward, ArrowRightLeft, ShieldAlert, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';

export default function SessionActionModal({ pc, onClose, onActionSuccess }) {
  const { isSuperAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [overrideReason, setOverrideReason] = useState('');

  if (!pc) return null;

  const handleAction = async (actionEndpoint, payload = {}) => {
    if (isSuperAdmin && !overrideReason.trim()) {
      setError("Super Admins must provide an override reason for audit logging.");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const finalPayload = isSuperAdmin ? { ...payload, overrideReason, isOverride: true } : payload;
      
      // e.g., POST /api/sessions/start
      // For stop: POST /api/sessions/{pc.activeSessionId}/stop
      let url = '';
      if (actionEndpoint === 'start') {
        url = '/sessions/start';
        finalPayload.pcId = pc.id;
      } else {
        url = `/sessions/${pc.activeSessionId}/${actionEndpoint}`;
      }

      await api.post(url, finalPayload);
      onActionSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`w-full max-w-md bg-bg-2 border ${isSuperAdmin ? 'border-accent' : 'border-border'} rounded-xl shadow-2xl overflow-hidden`}
        >
          {/* Header */}
          <div className={`p-4 border-b ${isSuperAdmin ? 'border-accent/30 bg-accent/5' : 'border-border bg-bg-3/50'} flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              {isSuperAdmin ? (
                <ShieldAlert className="w-5 h-5 text-accent animate-pulse" />
              ) : (
                <div className={`w-2.5 h-2.5 rounded-full ${pc.state === 'Active' ? 'bg-neon-blue' : 'bg-text-3'}`} />
              )}
              <h2 className="font-heading font-bold text-text uppercase tracking-wider text-lg">
                {isSuperAdmin ? 'ADMIN OVERRIDE:' : 'MANAGE:'} {pc.name}
              </h2>
            </div>
            <button onClick={onClose} className="p-1 text-text-3 hover:text-text rounded-md transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {error && (
              <div className="p-3 bg-neon-red/10 border border-neon-red/20 rounded-lg text-neon-red text-sm flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="bg-bg-3 p-3 rounded-lg border border-border">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-text-3">Current State:</span>
                <span className="text-text font-medium uppercase">{pc.state}</span>
                {pc.customerName && (
                  <>
                    <span className="text-text-3">Customer:</span>
                    <span className="text-text font-medium">{pc.customerName}</span>
                  </>
                )}
              </div>
            </div>

            {isSuperAdmin && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-accent uppercase tracking-wider">Override Reason (Required)</label>
                <input
                  type="text"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g., Resolving stuck session #881"
                  className="w-full bg-bg-3 border border-accent/30 text-text text-sm rounded-lg p-2.5 focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(pc.state === 'Idle' || pc.state === 'Offline') && (
                <button
                  onClick={() => handleAction('start', { durationMinutes: 60, isPrepaid: false })} // Default mockup payload
                  disabled={loading}
                  className="flex items-center justify-center gap-2 p-3 bg-neon-blue/10 hover:bg-neon-blue/20 text-neon-blue border border-neon-blue/30 rounded-lg transition-colors"
                >
                  <Play className="w-4 h-4" /> Start Session
                </button>
              )}

              {pc.state === 'Active' && (
                <>
                  <button
                    onClick={() => handleAction('extend', { extraMinutes: 60 })}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 p-3 bg-neon-purple/10 hover:bg-neon-purple/20 text-neon-purple border border-neon-purple/30 rounded-lg transition-colors"
                  >
                    <FastForward className="w-4 h-4" /> Extend
                  </button>
                  <button
                    onClick={() => handleAction('transfer')}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 p-3 bg-text-3/10 hover:bg-text-3/20 text-text border border-border rounded-lg transition-colors"
                  >
                    <ArrowRightLeft className="w-4 h-4" /> Transfer
                  </button>
                  <button
                    onClick={() => handleAction('stop')}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 p-3 bg-neon-orange/10 hover:bg-neon-orange/20 text-neon-orange border border-neon-orange/30 rounded-lg transition-colors sm:col-span-2"
                  >
                    <Square className="w-4 h-4" /> Stop Session (To Billing)
                  </button>
                </>
              )}

              {isSuperAdmin && pc.state === 'UnderMaintenance' && (
                <button
                  onClick={() => handleAction('resolve_maintenance')} // Needs backend support
                  disabled={loading}
                  className="flex items-center justify-center gap-2 p-3 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 rounded-lg transition-colors sm:col-span-2"
                >
                  <Wrench className="w-4 h-4" /> Clear Maintenance Lock
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
