import { useState, useEffect, useCallback } from 'react';
import { UtensilsCrossed, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useBranch } from '../../contexts/BranchContext';
import { useSocket } from '../../contexts/SocketContext';
import api from '../../config/api';
import PageHeader from '../../components/layout/PageHeader';

import FoodOrderKanban from '../../components/food/FoodOrderKanban';
import CreateFoodOrderModal from '../../components/food/CreateFoodOrderModal';

export default function FoodOrdersPage() {
  const { isSuperAdmin, user } = useAuth();
  const { activeBranch } = useBranch();
  const { subscribe, connected, SIGNALR_HUBS } = useSocket();

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const targetBranchId = isSuperAdmin ? activeBranch?.id : user?.branchId;

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

    // Listen to food order updates
    const unsubFood = subscribe(SIGNALR_HUBS.FOOD_ORDERS, 'FoodOrderUpdated', () => {
      fetchOrders(); // Refresh board completely to ensure sync
    });

    return () => unsubFood();
  }, [connected, subscribe, SIGNALR_HUBS.FOOD_ORDERS, targetBranchId, fetchOrders]);

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
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <PageHeader
          title="Food Orders"
          subtitle="Kitchen workflow and delivery management"
          icon="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          badge="LIVE"
        />
        
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary flex items-center gap-2 shadow-lg shadow-accent/20"
        >
          <Plus className="w-5 h-5" /> New Order
        </button>
      </div>

      <div className="flex-1 min-h-0 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          </div>
        ) : (
          <FoodOrderKanban orders={orders} onOrderUpdated={fetchOrders} />
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
