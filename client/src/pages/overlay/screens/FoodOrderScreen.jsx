import React, { useState } from 'react';
import { useOverlaySocket } from '../../../contexts/OverlaySocketContext';
import { Coffee, Plus, Minus, ShoppingCart, Loader2, CheckCircle2 } from 'lucide-react';

const MOCK_MENU = [
  { id: 1, name: 'Red Bull', price: 120, category: 'Beverages', inStock: true },
  { id: 2, name: 'Monster Energy', price: 150, category: 'Beverages', inStock: true },
  { id: 3, name: 'French Fries', price: 90, category: 'Snacks', inStock: true },
  { id: 4, name: 'Cheese Nachos', price: 110, category: 'Snacks', inStock: false },
  { id: 5, name: 'Chicken Burger', price: 180, category: 'Meals', inStock: true },
  { id: 6, name: 'Chocolate Brownie', price: 80, category: 'Desserts', inStock: true }
];

export default function FoodOrderScreen() {
  const { placeFoodOrder, foodOrders, sessionData } = useOverlaySocket();
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState('Beverages');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const categories = ['Beverages', 'Snacks', 'Meals', 'Desserts'];
  
  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === itemId);
      if (existing.qty === 1) {
        return prev.filter(i => i.id !== itemId);
      }
      return prev.map(i => i.id === itemId ? { ...i, qty: i.qty - 1 } : i);
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    
    // Convert cart to the required backend structure
    const orderItems = cart.map(item => ({
      menuItemId: item.id,
      name: item.name,
      quantity: item.qty,
      price: item.price
    }));

    try {
      const res = await placeFoodOrder(orderItems, cartTotal);
      if (res.success) {
        setCart([]);
        setOrderSuccess(true);
        setTimeout(() => setOrderSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!sessionData) {
    return <div className="p-6 text-center text-text-3 font-body">Session not active</div>;
  }

  if (sessionData.sessionStatus === 'awaiting_billing') {
    return (
      <div className="p-6 text-center h-full flex flex-col items-center justify-center">
        <ShoppingCart className="w-16 h-16 text-text-3 mb-4 opacity-50" />
        <h2 className="font-heading text-xl font-bold text-text-2 tracking-wide uppercase">Session Ended</h2>
        <p className="text-text-3 font-body text-sm mt-2">Food ordering is disabled while awaiting billing.</p>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="p-6 text-center h-full flex flex-col items-center justify-center bg-bg/90">
        <div className="w-20 h-20 bg-neon-green/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,211,166,0.3)]">
          <CheckCircle2 className="w-10 h-10 text-neon-green" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-text tracking-wide uppercase">Order Placed!</h2>
        <p className="text-text-2 font-body mt-2">Your order will be served at your desk shortly.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-bg relative">
      {/* Header Tabs */}
      <div className="flex overflow-x-auto shrink-0 bg-bg-3 border-b border-border/50 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-4 py-3 font-heading text-sm uppercase tracking-wider font-bold shrink-0 border-b-2 transition-colors ${
              activeTab === cat 
                ? 'border-accent text-accent' 
                : 'border-transparent text-text-3 hover:text-text-2'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {MOCK_MENU.filter(m => m.category === activeTab).map(item => {
          const cartItem = cart.find(c => c.id === item.id);
          return (
            <div key={item.id} className="bg-bg-2 border border-border/60 rounded-xl p-3 flex items-center justify-between shadow-sm hover:border-accent/30 transition-colors">
              <div>
                <h3 className={`font-body font-semibold ${item.inStock ? 'text-text' : 'text-text-3 line-through'}`}>
                  {item.name}
                </h3>
                <p className="text-accent font-mono text-sm font-bold">₹{item.price}</p>
                {!item.inStock && <p className="text-[10px] text-neon-orange uppercase tracking-wider mt-1">Out of Stock</p>}
              </div>

              {item.inStock && (
                <div className="flex items-center gap-3 bg-bg-3 rounded-lg border border-border/50 p-1">
                  {cartItem ? (
                    <>
                      <button onClick={() => removeFromCart(item.id)} className="p-1 hover:bg-white/5 rounded text-text-2">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-mono text-text font-bold w-4 text-center">{cartItem.qty}</span>
                      <button onClick={() => addToCart(item)} className="p-1 hover:bg-white/5 rounded text-accent">
                        <Plus className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button onClick={() => addToCart(item)} className="px-3 py-1 font-heading text-xs uppercase tracking-wider text-accent font-bold hover:bg-accent/10 rounded transition-colors">
                      Add
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cart Summary Bar (Fixed Bottom before nav) */}
      {cart.length > 0 && (
        <div className="shrink-0 bg-accent p-4 flex items-center justify-between text-bg shadow-[0_-5px_20px_rgba(220,38,38,0.2)]">
          <div>
            <p className="font-heading font-bold text-sm tracking-wider uppercase">{totalItems} Items</p>
            <p className="font-mono font-bold text-xl">₹{cartTotal}</p>
          </div>
          <button 
            onClick={handleCheckout}
            disabled={isSubmitting}
            className="bg-bg text-text px-6 py-2 rounded-lg font-heading font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-bg-2 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Order'}
          </button>
        </div>
      )}
    </div>
  );
}
