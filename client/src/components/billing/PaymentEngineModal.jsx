import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Receipt, Wallet, CreditCard, Banknote, Gamepad2, Coffee } from 'lucide-react';
import { processPayment, getMemberById } from '../../api/billing.api';
import { useToast } from '../ui/Toast';

// Quick-tender presets for cash (common Indian denominations)
const QUICK_TENDER = [20, 50, 100, 200, 500, 1000, 2000];

/**
 * PaymentEngineModal — SOP §10.2 full split-payment engine
 * Supports: Full Cash | Full UPI | Split | Wallet | Member+Cash top-up
 * Props: bill, onClose, onPaymentSuccess
 */
export default function PaymentEngineModal({ bill, onClose, onPaymentSuccess }) {
  const toast = useToast();

  // Payment amounts
  const [cashAmount, setCashAmount] = useState(0);
  const [onlineAmount, setOnlineAmount] = useState(0);
  const [walletAmount, setWalletAmount] = useState(0);
  const [cashReceived, setCashReceived] = useState(0);

  // Member wallet info
  const [memberWallet, setMemberWallet] = useState(null); // { walletBalance }

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset state whenever the bill changes
  useEffect(() => {
    setCashAmount(0);
    setOnlineAmount(0);
    setWalletAmount(0);
    setCashReceived(0);
    setError(null);
  }, [bill?.id]);

  // Fetch member wallet balance if bill has a linked member
  useEffect(() => {
    if (!bill?.memberId) { setMemberWallet(null); return; }
    getMemberById(bill.memberId)
      .then(m => setMemberWallet(m))
      .catch(() => setMemberWallet(null));
  }, [bill?.memberId]);

  if (!bill) return null;

  const total = bill.totalAmount;
  const totalInput = cashAmount + onlineAmount + walletAmount;
  const balanceDue = total - totalInput;
  const changeReturned = cashAmount > 0 && cashReceived > cashAmount
    ? cashReceived - cashAmount
    : 0;

  // Remaining balance unallocated to any method
  const remaining = Math.max(0, balanceDue);

  // Fill remaining into a specific payment method
  const fillRemaining = (setter) => {
    if (remaining > 0) setter(prev => +(prev + remaining).toFixed(2));
  };

  // Quick tender: set cashReceived to preset AND auto-fill cash amount if not set
  const quickTender = (amount) => {
    if (cashAmount === 0) setCashAmount(Math.min(amount, total - onlineAmount - walletAmount));
    setCashReceived(amount);
  };

  // Full payment shortcuts
  const payAll = (method) => {
    setCashAmount(method === 'cash' ? total : 0);
    setOnlineAmount(method === 'online' ? total : 0);
    setWalletAmount(method === 'wallet' ? total : 0);
    setCashReceived(method === 'cash' ? total : 0);
  };

  const handleProcess = async () => {
    if (Math.abs(totalInput - total) > 0.01) {
      setError('Total payment must exactly match the bill grand total.');
      return;
    }
    if (cashAmount > 0 && cashReceived < cashAmount) {
      setError('Cash received cannot be less than the cash amount applied.');
      return;
    }

    // Determine PaymentType string
    let pType = 'Split';
    if (cashAmount === total) pType = 'Cash';
    else if (onlineAmount === total) pType = 'Online';
    else if (walletAmount === total) pType = 'Wallet';

    setLoading(true);
    setError(null);
    try {
      await processPayment(bill.id, {
        paymentType: pType,
        cashAmount,
        onlineAmount,
        walletAmount,
        cashReceived: cashAmount > 0 ? cashReceived : 0,
      });
      toast.success('Payment processed — PC released!');
      onPaymentSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-bg-2 border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh]"
        >
          {/* ── Header ── */}
          <div className="p-4 border-b border-border bg-bg-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-accent" />
              <div>
                <h2 className="font-heading font-bold text-text uppercase tracking-wider text-base leading-none">
                  Process Payment
                </h2>
                <p className="text-[10px] text-text-3 font-mono mt-0.5">
                  {bill.billNumber} — {bill.pcNumber ? `Station ${bill.pcNumber}` : 'Walk-in'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 text-text-3 hover:text-text rounded transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-5 space-y-4">
            {error && (
              <div className="flex items-start gap-2 p-3 bg-neon-red/10 border border-neon-red/20 rounded-lg text-neon-red text-sm">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* ── Bill summary (§10.1) ── */}
            <div className="bg-bg-3 border border-border rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center text-xs text-text-2">
                <span className="flex items-center gap-1.5"><Gamepad2 className="w-3.5 h-3.5 text-neon-purple" /> Gaming</span>
                <span className="font-mono">₹{bill.gamingAmount}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-text-2">
                <span className="flex items-center gap-1.5"><Coffee className="w-3.5 h-3.5 text-neon-orange" /> Food & Drink</span>
                <span className="font-mono">₹{bill.foodAmount}</span>
              </div>
              {bill.discountAmount > 0 && (
                <div className="flex justify-between items-center text-xs text-neon-purple">
                  <span>Discount</span>
                  <span className="font-mono">−₹{bill.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="font-bold text-text uppercase tracking-wider text-sm">Grand Total</span>
                <span className="font-mono font-bold text-2xl text-accent drop-shadow-[0_0_8px_rgba(255,51,102,0.3)]">
                  ₹{total}
                </span>
              </div>
            </div>

            {/* ── Quick payment buttons ── */}
            <div>
              <div className="text-[10px] text-text-3 uppercase tracking-widest font-bold mb-2">Quick Pay</div>
              <div className="grid grid-cols-3 gap-1.5">
                <QuickBtn label="Full Cash" onClick={() => payAll('cash')} color="blue" />
                <QuickBtn label="Full UPI" onClick={() => payAll('online')} color="purple" />
                {bill.memberId && <QuickBtn label="Full Wallet" onClick={() => payAll('wallet')} color="accent" />}
              </div>
            </div>

            {/* ── Cash ── */}
            <div className="p-4 border border-border rounded-xl bg-bg-3 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-text font-bold uppercase tracking-wider text-sm">
                  <Banknote className="w-4 h-4 text-neon-blue" /> Cash
                </label>
                <button
                  onClick={() => fillRemaining(setCashAmount)}
                  className="text-[10px] text-neon-blue font-bold tracking-wider hover:underline uppercase"
                >
                  Fill Remaining
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-text-3 uppercase font-bold">Applied to Bill</span>
                  <input
                    type="number" min="0" max={total}
                    value={cashAmount || ''}
                    onChange={e => setCashAmount(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full mt-1 bg-bg-2 border border-border text-text font-mono text-lg rounded-lg p-2.5 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-text-3 uppercase font-bold">Cash Tendered</span>
                  <input
                    type="number" min="0"
                    value={cashReceived || ''}
                    onChange={e => setCashReceived(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full mt-1 bg-bg-2 border border-border text-text font-mono text-lg rounded-lg p-2.5 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all"
                  />
                </div>
              </div>

              {/* Quick tender denomination buttons (§10.3) */}
              {cashAmount > 0 && (
                <div>
                  <span className="text-[10px] text-text-3 uppercase font-bold block mb-1.5">Quick Tender</span>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_TENDER.filter(d => d >= cashAmount).slice(0, 6).map(d => (
                      <button
                        key={d}
                        onClick={() => quickTender(d)}
                        className={`px-2.5 py-1 rounded border text-[11px] font-mono font-bold transition-colors ${
                          cashReceived === d
                            ? 'bg-neon-blue/20 border-neon-blue text-neon-blue'
                            : 'bg-bg-2 border-border text-text-2 hover:border-neon-blue/50'
                        }`}
                      >
                        ₹{d}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Change display (§10.3) */}
              {changeReturned > 0 && (
                <div className="flex justify-between items-center pt-2 border-t border-border text-neon-orange font-bold">
                  <span className="text-sm uppercase tracking-wider">Return Change</span>
                  <span className="font-mono text-xl">₹{changeReturned}</span>
                </div>
              )}
            </div>

            {/* ── Online / UPI ── */}
            <div className="p-4 border border-border rounded-xl bg-bg-3">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-text font-bold uppercase tracking-wider text-sm">
                  <CreditCard className="w-4 h-4 text-neon-purple" /> Online / UPI
                </label>
                <button
                  onClick={() => fillRemaining(setOnlineAmount)}
                  className="text-[10px] text-neon-purple font-bold tracking-wider hover:underline uppercase"
                >
                  Fill Remaining
                </button>
              </div>
              <input
                type="number" min="0" max={total}
                value={onlineAmount || ''}
                onChange={e => setOnlineAmount(Math.max(0, Number(e.target.value) || 0))}
                className="w-full bg-bg-2 border border-border text-text font-mono text-lg rounded-lg p-2.5 focus:border-neon-purple focus:ring-1 focus:ring-neon-purple transition-all"
              />
            </div>

            {/* ── Wallet ── */}
            <div className={`p-4 border rounded-xl bg-bg-3 ${bill.memberId ? 'border-border' : 'border-border/40 opacity-50'}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="flex items-center gap-2 text-text font-bold uppercase tracking-wider text-sm">
                    <Wallet className="w-4 h-4 text-accent" /> Member Wallet
                  </label>
                  {memberWallet != null && (
                    <p className="text-[10px] text-text-3 font-mono mt-0.5">
                      Balance: <span className="text-neon-blue font-bold">₹{memberWallet.walletBalance?.toFixed(2) ?? '–'}</span>
                    </p>
                  )}
                </div>
                {bill.memberId ? (
                  <button
                    onClick={() => fillRemaining(setWalletAmount)}
                    className="text-[10px] text-accent font-bold tracking-wider hover:underline uppercase"
                  >
                    Fill Remaining
                  </button>
                ) : (
                  <span className="text-[10px] text-text-3 uppercase tracking-wider">Members Only</span>
                )}
              </div>
              <input
                type="number" min="0" max={bill.memberId ? (memberWallet?.walletBalance ?? total) : 0}
                disabled={!bill.memberId}
                value={walletAmount || ''}
                onChange={e => setWalletAmount(Math.max(0, Number(e.target.value) || 0))}
                className="w-full bg-bg-2 border border-border text-text font-mono text-lg rounded-lg p-2.5 focus:border-accent focus:ring-1 focus:ring-accent transition-all disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="p-4 border-t border-border bg-bg-3 space-y-3 shrink-0">
            {/* Running balance display */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-3 uppercase tracking-wider font-bold">Balance Remaining</span>
              <span className={`font-mono font-bold text-lg transition-colors ${
                balanceDue > 0 ? 'text-neon-red' : balanceDue === 0 ? 'text-neon-blue' : 'text-neon-orange'
              }`}>
                {balanceDue === 0 ? '✓ Exact' : `₹${Math.abs(balanceDue).toFixed(0)} ${balanceDue > 0 ? 'short' : 'over'}`}
              </span>
            </div>

            <button
              onClick={handleProcess}
              disabled={loading || Math.abs(totalInput - total) > 0.01}
              className={`w-full py-3.5 rounded-lg text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                Math.abs(totalInput - total) <= 0.01 && !loading
                  ? 'bg-accent/10 border border-accent text-accent hover:bg-accent/20 shadow-[0_0_12px_rgba(255,51,102,0.2)]'
                  : 'bg-bg-2 border border-border text-text-3 cursor-not-allowed'
              }`}
            >
              {loading
                ? <div className="w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                : <><Receipt className="w-4 h-4" /> Complete Payment</>
              }
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ── Quick button helper ───────────────────────────────────────────────────────
function QuickBtn({ label, onClick, color }) {
  const colorMap = {
    blue:   'border-neon-blue/40   bg-neon-blue/10   text-neon-blue   hover:bg-neon-blue/20',
    purple: 'border-neon-purple/40 bg-neon-purple/10 text-neon-purple hover:bg-neon-purple/20',
    accent: 'border-accent/40      bg-accent/10      text-accent      hover:bg-accent/20',
  };
  return (
    <button
      onClick={onClick}
      className={`py-1.5 rounded border text-[10px] font-bold uppercase tracking-wider transition-colors ${colorMap[color]}`}
    >
      {label}
    </button>
  );
}
