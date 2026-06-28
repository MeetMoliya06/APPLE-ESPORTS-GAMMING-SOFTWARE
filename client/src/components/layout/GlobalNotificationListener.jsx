import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, MonitorPlay, X, Check, Loader2 } from 'lucide-react';
import { useSocket } from '../../contexts/SocketContext';
import { useToast } from '../ui/Toast';
import api from '../../config/api';

export default function GlobalNotificationListener() {
  const { subscribe, emit, SIGNALR_HUBS, connected } = useSocket();
  const { showToast } = useToast();
  
  // Array of active walk-in requests
  const [requests, setRequests] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!connected) return;

    const unsubscribe = subscribe(SIGNALR_HUBS.NOTIFICATIONS, 'Alert', (data) => {
      if (data.type === 'WalkinSessionRequest') {
        // Add to our list of active requests
        setRequests(prev => {
          // avoid duplicates if same PC sends multiple times
          const filtered = prev.filter(r => r.pcId !== data.pcId);
          return [...filtered, data];
        });
        showToast(`Walk-in request from ${data.pcId}`, 'info');
      }
    });

    const unsubscribeStatus = subscribe(SIGNALR_HUBS.PC_STATUS, 'PcStatusUpdated', (data) => {
      // If PC becomes active, remove any pending walk-in requests for it
      if (data.status === 'active') {
        setRequests(prev => prev.filter(r => r.pcId !== data.pcId));
      }
    });

    return () => {
      unsubscribe();
      if (unsubscribeStatus) unsubscribeStatus();
    };
  }, [connected, subscribe, SIGNALR_HUBS.NOTIFICATIONS, showToast]);

  const handleApprove = async (req) => {
    setIsProcessing(true);
    try {
      // 1. Resolve PC Guid
      const pcRes = await api.get(`/public/pcs/${req.pcId}`);
      if (!pcRes.data.success) {
        showToast('PC not found in database', 'error');
        setIsProcessing(false);
        return;
      }
      
      const actualPcId = pcRes.data.data.id;
      const expectedAmount = (req.duration / 60) * 100; // 100 per hour

      // 2. Start Session (operator's JWT provides operatorId/shiftId)
      const startRes = await api.post('/sessions/start', {
        pcId: actualPcId,
        memberId: null,
        customerName: req.customerName,
        durationMinutes: req.duration,
        packageName: 'Walk-in',
        expectedAmount: expectedAmount
      });

      if (startRes.data.success) {
        showToast(`Session started for ${req.pcId}`, 'success');
        setRequests(prev => prev.filter(r => r.pcId !== req.pcId));
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to approve request', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async (req) => {
    try {
      // 1. Hit the decline API
      await api.post(`/public/pcs/${req.pcId}/decline-walkin`);
      setRequests(prev => prev.filter(r => r.pcId !== req.pcId));
    } catch (err) {
      showToast('Failed to decline request', 'error');
    }
  };

  if (requests.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-4">
      <AnimatePresence>
        {requests.map((req) => (
          <motion.div
            key={req.pcId}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-bg-2 border border-accent shadow-[0_0_30px_rgba(220,38,38,0.3)] rounded-lg p-5 w-[400px]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-accent animate-pulse" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-text uppercase tracking-widest text-sm">Walk-in Request</h3>
                <p className="text-text-2 font-body text-xs mt-0.5">Station <span className="text-accent font-semibold">{req.pcId}</span></p>
              </div>
            </div>

            <div className="bg-bg-3 border border-border p-3 rounded-md mb-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-text-3 font-body text-xs">Customer</span>
                <span className="text-text font-bold font-heading">{req.customerName}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-text-3 font-body text-xs">Duration</span>
                <span className="text-text font-mono font-bold text-sm">
                  {req.duration === 0 ? 'Pay As You Go' : `${req.duration >= 60 ? req.duration / 60 : req.duration} ${req.duration === 30 ? 'Min' : 'Hr'}`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-3 font-body text-xs">Expected Bill</span>
                <span className="text-text font-mono font-bold text-sm text-accent">
                  {req.duration === 0 ? 'Variable' : `₹${(req.duration / 60) * 100}`}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleDecline(req)}
                disabled={isProcessing}
                className="flex-1 bg-bg-3 hover:bg-bg-3/80 text-text-2 border border-border hover:border-text-3 transition-colors rounded-sm py-2 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <X className="w-4 h-4" /> Decline
              </button>
              <button
                onClick={() => handleApprove(req)}
                disabled={isProcessing}
                className="flex-1 bg-accent hover:bg-accent-dark text-white rounded-sm py-2 text-sm font-semibold shadow-[0_0_15px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Approve
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
