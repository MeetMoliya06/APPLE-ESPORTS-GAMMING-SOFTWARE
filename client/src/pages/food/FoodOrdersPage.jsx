import { useState, useEffect, useCallback, useRef } from 'react';
import { UtensilsCrossed, Plus, LayoutGrid, List, Bell, Volume2, VolumeX, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useBranch } from '../../contexts/BranchContext';
import { useSocket } from '../../contexts/SocketContext';
import api from '../../config/api';
import PageHeader from '../../components/layout/PageHeader';

import FoodOrderKanban from '../../components/food/FoodOrderKanban';
import FoodOrderQueue from '../../components/food/FoodOrderQueue';
import CreateFoodOrderModal from '../../components/food/CreateFoodOrderModal';

// Synth beep notification sound
const playNotificationSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.2);
  } catch (err) {
    console.warn('AudioContext failed to play sound:', err);
  }
};

export default function FoodOrdersPage() {
  const { isSuperAdmin, user } = useAuth();
  const { activeBranch } = useBranch();
  const { subscribe, connected, SIGNALR_HUBS } = useSocket();

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Settings: viewMode (kanban vs queue), soundEnabled, archiveMinutes
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('food_order_view_mode') || 'queue');
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('food_order_sound_enabled') !== 'false');
  const [archiveMinutes, setArchiveMinutes] = useState(() => Number(localStorage.getItem('food_order_archive_minutes')) || 5);

  const prevPendingCount = useRef(0);

  const targetBranchId = isSuperAdmin ? activeBranch?.id : user?.branchId;

  // Request browser notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    if (isSuperAdmin && !targetBranchId) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/food-orders', { params: { page: 1, pageSize: 200, branchId: targetBranchId } });
      setOrders(data?.data?.items || []);
    } catch (err) {
      console.error("Failed to load food orders:", err);
    } finally {
      setIsLoading(false);
    }
  }, [targetBranchId, isSuperAdmin]);

  useEffect(() => {
    setIsLoading(true);
    fetchOrders();
  }, [fetchOrders]);

  // Real-Time SignalR
  useEffect(() => {
    if (!connected || !targetBranchId) return;

    const unsubFood = subscribe(SIGNALR_HUBS.FOOD_ORDERS, 'FoodOrderUpdated', () => {
      fetchOrders();
    });

    return () => unsubFood();
  }, [connected, subscribe, SIGNALR_HUBS.FOOD_ORDERS, targetBranchId, fetchOrders]);

  // Fallback Polling (every 5 seconds when SignalR is offline)
  useEffect(() => {
    if (!targetBranchId) return;

    if (!connected) {
      console.log("[SignalR Offline] Starting fallback polling (5s) for Food Orders...");
      const interval = setInterval(() => {
        fetchOrders();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [connected, targetBranchId, fetchOrders]);

  const pendingOrders = orders.filter(o => o.status === 0 || o.status === 'Pending');

  // Trigger sound & browser notifications on new pending orders
  useEffect(() => {
    if (orders.length > 0) {
      const pendingCount = pendingOrders.length;
      if (pendingCount > prevPendingCount.current) {
        if (soundEnabled) {
          playNotificationSound();
        }
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          const lastOrder = pendingOrders[pendingOrders.length - 1];
          new Notification('New Food Order!', {
            body: `${lastOrder.pcNumber ? `Station ${lastOrder.pcNumber}` : 'Walk-in'} ordered: ${lastOrder.items?.map(i => `${i.itemName} (x${i.quantity})`).join(', ')}`,
            icon: '/logo.png'
          });
        }
      }
      prevPendingCount.current = pendingCount;
    } else {
      prevPendingCount.current = 0;
    }
  }, [orders, soundEnabled, pendingOrders]);

  // Handle settings updates
  const handleToggleView = (mode) => {
    setViewMode(mode);
    localStorage.setItem('food_order_view_mode', mode);
  };

  const handleToggleSound = () => {
    setSoundEnabled(prev => {
      localStorage.setItem('food_order_sound_enabled', String(!prev));
      return !prev;
    });
  };

  const handleArchiveMinutesChange = (val) => {
    const mins = Math.max(1, Number(val));
    setArchiveMinutes(mins);
    localStorage.setItem('food_order_archive_minutes', String(mins));
  };

  // Filter out delivered orders that are older than N minutes
  const now = new Date();
  const activeOrders = orders.filter(o => {
    const isDel = o.status === 3 || o.status === 'Delivered';
    if (!isDel) return true;
    if (!o.deliveredAt) return true;

    const deliveredTime = new Date(o.deliveredAt);
    const diffMs = now - deliveredTime;
    const diffMins = diffMs / 1000 / 60;
    return diffMins < archiveMinutes;
  });

  if (isSuperAdmin && !activeBranch) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <UtensilsCrossed className="w-12 h-12 text-text-3 mb-4" />
        <h2 className="text-xl font-heading font-bold text-text mb-2">Select a Branch</h2>
        <p className="text-text-2">You must select a branch to view the Food Orders Dashboard.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-bg-2 border border-border p-4 rounded-xl shadow-lg">
        <PageHeader
          title="Food Orders"
          subtitle="Kitchen workflow and delivery management"
          icon="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          badge="LIVE"
        />
        
        {/* Header Controls Panel */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Bell Icon with Badge Count */}
          <div className="relative p-2 rounded-lg bg-bg-3 border border-border flex items-center justify-center text-text-2">
            <Bell className={`w-5 h-5 ${pendingOrders.length > 0 ? 'text-neon-orange animate-swing' : ''}`} />
            {pendingOrders.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-neon-orange text-black font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-bg-2 font-mono">
                {pendingOrders.length}
              </span>
            )}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            title={soundEnabled ? 'Disable Notification Sound' : 'Enable Notification Sound'}
            className="p-2 rounded-lg bg-bg-3 border border-border hover:border-accent text-text-2 hover:text-accent transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-text-3" />}
          </button>

          {/* Auto-archive Config */}
          <div className="flex items-center gap-1.5 bg-bg-3 border border-border px-3 py-1.5 rounded-lg text-xs">
            <Settings className="w-4 h-4 text-text-3" />
            <span className="text-text-3 font-semibold uppercase text-[10px]">Archive:</span>
            <input
              type="number"
              min="1"
              max="60"
              value={archiveMinutes}
              onChange={e => handleArchiveMinutesChange(e.target.value)}
              className="w-10 bg-bg-2 border border-border/80 text-text font-mono text-center rounded focus:border-accent outline-none text-xs"
            />
            <span className="text-text-3 text-[10px] font-semibold">MIN</span>
          </div>

          {/* View Toggles */}
          <div className="flex bg-bg-3 border border-border p-1 rounded-lg">
            <button
              onClick={() => handleToggleView('queue')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'queue' ? 'bg-bg-2 text-accent border border-border/30' : 'text-text-3 hover:text-text'}`}
              title="Queue Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleToggleView('kanban')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-bg-2 text-accent border border-border/30' : 'text-text-3 hover:text-text'}`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary flex items-center gap-2 shadow-lg shadow-accent/20 text-xs py-2 px-4 uppercase font-bold"
          >
            <Plus className="w-4 h-4" /> New Order
          </button>
        </div>
      </div>

      {/* Main Board Area */}
      <div className="flex-1 min-h-0 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          </div>
        ) : viewMode === 'kanban' ? (
          <FoodOrderKanban orders={activeOrders} onOrderUpdated={fetchOrders} />
        ) : (
          <FoodOrderQueue orders={activeOrders} onOrderUpdated={fetchOrders} />
        )}
      </div>

      {isCreateModalOpen && (
        <CreateFoodOrderModal 
          onClose={() => setIsCreateModalOpen(false)}
          onOrderPlaced={fetchOrders}
        />
      )}
    </div>
  );
}
