import { Receipt, Plus, Coffee, Gamepad2, Tag } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function BillDetailsPanel({ bill, onOpenPaymentEngine }) {
  const { isSuperAdmin } = useAuth();

  if (!bill) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-text-3 bg-bg-2 border border-border rounded-xl">
        <Receipt className="w-12 h-12 mb-3 opacity-50" />
        <p className="font-heading uppercase tracking-widest text-sm">Select a bill to view</p>
      </div>
    );
  }

  const isFinalized = bill.status === 0; // Assuming 0 is Pending, 1 is Completed. Wait, BillStatus: Pending=0, Completed=1, Voided=2.

  return (
    <div className="flex flex-col h-full bg-bg-2 border border-border rounded-xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className="bg-bg-3 p-4 border-b border-border flex justify-between items-center">
        <div>
          <h2 className="font-heading font-bold text-text uppercase tracking-wider flex items-center gap-2">
            <Receipt className="w-5 h-5 text-accent" />
            {bill.pcNumber ? `Station ${bill.pcNumber}` : 'Walk-in'}
          </h2>
          <p className="text-xs text-text-3 font-mono mt-0.5">{bill.billNumber} • {bill.customerName || 'Guest'}</p>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          bill.status === 1 ? 'bg-neon-blue/20 text-neon-blue' : 'bg-neon-orange/20 text-neon-orange'
        }`}>
          {bill.status === 1 ? 'PAID' : 'UNPAID'}
        </div>
      </div>

      {/* Line Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {bill.items?.length === 0 ? (
          <p className="text-xs text-text-3 italic text-center py-4">No items on this bill yet.</p>
        ) : (
          bill.items?.map(item => (
            <div key={item.id} className="flex justify-between items-start py-2 border-b border-border-2 text-sm">
              <div className="flex items-start gap-2">
                {item.itemType === 'gaming' ? <Gamepad2 className="w-4 h-4 text-neon-purple mt-0.5 shrink-0" /> : <Coffee className="w-4 h-4 text-neon-orange mt-0.5 shrink-0" />}
                <div>
                  <div className="text-text">{item.itemName}</div>
                  <div className="text-[10px] text-text-3 font-mono">{item.quantity} × ₹{item.unitPrice}</div>
                </div>
              </div>
              <div className="font-mono text-text">₹{item.totalPrice}</div>
            </div>
          ))
        )}
      </div>

      {/* Totals Section */}
      <div className="bg-bg-3 p-4 border-t border-border">
        <div className="space-y-1.5 text-xs text-text-2 mb-3">
          <div className="flex justify-between">
            <span>Gaming Subtotal</span>
            <span className="font-mono">₹{bill.gamingAmount}</span>
          </div>
          <div className="flex justify-between">
            <span>Food Subtotal</span>
            <span className="font-mono">₹{bill.foodAmount}</span>
          </div>
          {bill.discountAmount > 0 && (
            <div className="flex justify-between text-neon-purple font-medium">
              <span>Discount ({bill.discountReason})</span>
              <span className="font-mono">-₹{bill.discountAmount}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center py-3 border-t border-border-2 mb-3">
          <span className="font-heading font-bold text-lg text-text">GRAND TOTAL</span>
          <span className="font-mono font-bold text-2xl text-accent drop-shadow-[0_0_8px_rgba(255,51,102,0.5)]">
            ₹{bill.totalAmount}
          </span>
        </div>

        {/* Action Buttons */}
        {bill.status === 0 && (
          <div className="flex gap-2">
            {isSuperAdmin && (
              <button className="flex-1 py-3 px-2 bg-neon-purple/10 border border-neon-purple/30 text-neon-purple rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neon-purple/20 transition-colors flex items-center justify-center gap-1.5">
                <Tag className="w-4 h-4" /> Discount
              </button>
            )}
            <button 
              onClick={onOpenPaymentEngine}
              className="flex-[2] py-3 px-4 bg-accent/10 border border-accent text-accent rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-accent/20 transition-colors flex items-center justify-center gap-2"
            >
              <Receipt className="w-4 h-4" /> Process Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
