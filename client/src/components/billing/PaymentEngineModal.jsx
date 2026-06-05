import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Receipt, Wallet, CreditCard, Banknote } from 'lucide-react';
import api from '../../config/api';

export default function PaymentEngineModal({ bill, onClose, onPaymentSuccess }) {
  const [cashAmount, setCashAmount] = useState(0);
  const [onlineAmount, setOnlineAmount] = useState(0);
  const [walletAmount, setWalletAmount] = useState(0);
  const [cashReceived, setCashReceived] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const totalInput = cashAmount + onlineAmount + walletAmount;
  const balanceDue = bill?.totalAmount - totalInput;
  const isExactPayment = balanceDue === 0;
  const isOverpaid = balanceDue < 0; // Handled by change calculation if cash

  // Change logic: Only Cash can yield change. We cap total payment to totalAmount.
  // Actually, backend requires exact totalPayment == bill.TotalAmount.
  // So cashAmount must be exactly what is applied to the bill.
  // CashReceived is what the user hands over.
  const changeReturned = cashReceived > cashAmount ? cashReceived - cashAmount : 0;

  // Helpers to auto-fill
  const fillRemaining = (setter) => {
    if (balanceDue > 0) {
      setter(prev => prev + balanceDue);
    }
  };

  const handleProcessPayment = async () => {
    if (totalInput !== bill.totalAmount) {
      setError("Total payment must exactly match the bill grand total.");
      return;
    }
    if (cashAmount > 0 && cashReceived < cashAmount) {
      setError("Cash received cannot be less than the cash amount applied to the bill.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Determine PaymentType (Enum 0=Cash, 1=Online, 2=Split, 3=Wallet)
      // Actually backend enum uses standard names, we can send string or int.
      // Let's send string: "Cash", "Online", "Split", "Wallet"
      let pType = 'Split';
      if (cashAmount === bill.totalAmount) pType = 'Cash';
      else if (onlineAmount === bill.totalAmount) pType = 'Online';
      else if (walletAmount === bill.totalAmount) pType = 'Wallet';

      const payload = {
        paymentType: pType, // JSON enum converter handles string
        cashAmount,
        onlineAmount,
        walletAmount,
        cashReceived: cashAmount > 0 ? cashReceived : 0 // Only pass received if using cash
      };

      await api.post(`/bills/${bill.id}/pay`, payload);
      onPaymentSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  if (!bill) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-bg-2 border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-full"
        >
          {/* Header */}
          <div className="p-4 border-b border-border bg-bg-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-accent" />
              <h2 className="font-heading font-bold text-text uppercase tracking-wider text-lg">
                Process Payment
              </h2>
            </div>
            <button onClick={onClose} className="p-1 text-text-3 hover:text-text rounded-md transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 overflow-y-auto">
            {error && (
              <div className="p-3 mb-4 bg-neon-red/10 border border-neon-red/20 rounded-lg text-neon-red text-sm flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="flex justify-between items-center bg-bg-3 p-4 rounded-xl border border-border mb-6">
              <span className="text-text-2 uppercase tracking-wider font-bold text-sm">Grand Total</span>
              <span className="font-mono text-3xl font-bold text-accent drop-shadow-[0_0_8px_rgba(255,51,102,0.3)]">
                ₹{bill.totalAmount}
              </span>
            </div>

            {/* Split Engine */}
            <div className="space-y-4">
              
              {/* Cash Input */}
              <div className="p-3 border border-border rounded-lg bg-bg-3 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 text-text font-bold uppercase tracking-wider text-sm">
                    <Banknote className="w-4 h-4 text-neon-blue" /> Cash
                  </label>
                  <button onClick={() => fillRemaining(setCashAmount)} className="text-xs text-neon-blue font-bold tracking-wider hover:underline">
                    MAX
                  </button>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] text-text-3 uppercase">Applied to Bill</span>
                    <input 
                      type="number" min="0" 
                      value={cashAmount || ''} onChange={(e) => setCashAmount(Number(e.target.value) || 0)}
                      className="w-full bg-bg-2 border border-border text-text font-mono text-lg rounded-md p-2 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all" 
                    />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] text-text-3 uppercase">Tendered (Received)</span>
                    <input 
                      type="number" min="0" 
                      value={cashReceived || ''} onChange={(e) => setCashReceived(Number(e.target.value) || 0)}
                      className="w-full bg-bg-2 border border-border text-text font-mono text-lg rounded-md p-2 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all" 
                    />
                  </div>
                </div>
                {changeReturned > 0 && (
                  <div className="text-right text-sm text-neon-orange font-bold flex justify-end gap-2 items-center">
                    <span>RETURN CHANGE:</span>
                    <span className="font-mono text-lg">₹{changeReturned}</span>
                  </div>
                )}
              </div>

              {/* Online Input */}
              <div className="p-3 border border-border rounded-lg bg-bg-3">
                <div className="flex justify-between items-center mb-2">
                  <label className="flex items-center gap-2 text-text font-bold uppercase tracking-wider text-sm">
                    <CreditCard className="w-4 h-4 text-neon-purple" /> Online (UPI/Card)
                  </label>
                  <button onClick={() => fillRemaining(setOnlineAmount)} className="text-xs text-neon-purple font-bold tracking-wider hover:underline">
                    MAX
                  </button>
                </div>
                <input 
                  type="number" min="0" 
                  value={onlineAmount || ''} onChange={(e) => setOnlineAmount(Number(e.target.value) || 0)}
                  className="w-full bg-bg-2 border border-border text-text font-mono text-lg rounded-md p-2 focus:border-neon-purple focus:ring-1 focus:ring-neon-purple transition-all" 
                />
              </div>

              {/* Wallet Input */}
              <div className="p-3 border border-border rounded-lg bg-bg-3 opacity-90">
                <div className="flex justify-between items-center mb-2">
                  <label className="flex items-center gap-2 text-text font-bold uppercase tracking-wider text-sm">
                    <Wallet className="w-4 h-4 text-accent" /> Wallet
                  </label>
                  {bill.memberId ? (
                    <button onClick={() => fillRemaining(setWalletAmount)} className="text-xs text-accent font-bold tracking-wider hover:underline">
                      MAX
                    </button>
                  ) : (
                    <span className="text-[10px] text-text-4 uppercase">Member Only</span>
                  )}
                </div>
                <input 
                  type="number" min="0" disabled={!bill.memberId}
                  value={walletAmount || ''} onChange={(e) => setWalletAmount(Number(e.target.value) || 0)}
                  className="w-full bg-bg-2 border border-border text-text font-mono text-lg rounded-md p-2 focus:border-accent focus:ring-1 focus:ring-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                />
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-bg-3 flex flex-col gap-3">
            <div className="flex justify-between items-center px-1">
              <span className="text-text-3 text-xs uppercase tracking-wider">Balance Due</span>
              <span className={`font-mono font-bold text-lg ${balanceDue > 0 ? 'text-neon-red' : balanceDue === 0 ? 'text-neon-blue' : 'text-neon-orange'}`}>
                ₹{Math.max(0, balanceDue)}
              </span>
            </div>
            
            <button
              onClick={handleProcessPayment}
              disabled={loading || totalInput !== bill.totalAmount}
              className={`w-full py-3.5 rounded-lg text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                totalInput === bill.totalAmount && !loading
                  ? 'bg-accent/10 border border-accent text-accent hover:bg-accent/20' 
                  : 'bg-bg-2 border border-border text-text-3 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin" />
              ) : (
                <>✓ Complete Payment</>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
