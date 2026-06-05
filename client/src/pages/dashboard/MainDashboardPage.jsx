import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MonitorPlay, Users, Wallet, CreditCard, Coffee, Wrench, AlertTriangle, Activity, Banknote } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useBranch } from '../../contexts/BranchContext';
import { useSocket } from '../../contexts/SocketContext';
import api from '../../config/api';

import DashboardStatsCard from '../../components/ui/DashboardStatsCard';
import RecentTransactionsFeed from './RecentTransactionsFeed';

export default function MainDashboardPage() {
  const { isSuperAdmin, user } = useAuth();
  const { activeBranch } = useBranch();
  const { subscribe, connected, SIGNALR_HUBS } = useSocket();
  
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // The branch we should fetch data for
  // Operators are locked to their own branch via backend, but we pass it anyway.
  // Super Admins pass activeBranch.id or null for global
  const targetBranchId = isSuperAdmin ? activeBranch?.id : user?.branchId;

  const fetchDashboardData = useCallback(async () => {
    try {
      const params = targetBranchId ? { branchId: targetBranchId } : {};
      const [summaryRes, txRes] = await Promise.all([
        api.get('/dashboard/summary', { params }),
        api.get('/dashboard/transactions', { params: { ...params, limit: 15 } })
      ]);
      
      setSummary(summaryRes.data.data);
      setTransactions(txRes.data.data);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setIsLoading(false);
    }
  }, [targetBranchId]);

  // Initial fetch
  useEffect(() => {
    setIsLoading(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  // SignalR Realtime Updates
  useEffect(() => {
    if (!connected) return;

    // Listen to dashboard hub events
    // Assuming backend emits 'DashboardUpdated' and 'ActivityFeedUpdated'
    const unsubSummary = subscribe(SIGNALR_HUBS.DASHBOARD, 'DashboardUpdated', (newSummary) => {
      // Only update if it pertains to our current view (handled by hub groups, but we just replace state)
      setSummary(newSummary);
    });

    const unsubFeed = subscribe(SIGNALR_HUBS.DASHBOARD, 'ActivityFeedUpdated', (newActivities) => {
      // Prepend new activities and maintain max limit
      setTransactions(prev => {
        const merged = [...newActivities, ...prev];
        return merged.slice(0, 50); // Keep max 50 in memory
      });
    });

    return () => {
      unsubSummary();
      unsubFeed();
    };
  }, [connected, subscribe, SIGNALR_HUBS.DASHBOARD]);

  if (isLoading && !summary) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text tracking-wide flex items-center gap-2">
            <Activity className="w-6 h-6 text-accent" />
            OPERATIONAL DASHBOARD
          </h1>
          <p className="text-text-2 text-sm mt-1">
            {isSuperAdmin 
              ? (activeBranch ? `Viewing Branch: ${activeBranch.name}` : 'Viewing Global Aggregates (All Branches)')
              : `Viewing Assigned Branch: ${user?.branchName}`
            }
          </p>
        </div>
      </div>

      {/* KPI Grid - Operational */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStatsCard 
          title="Active Sessions" 
          value={summary?.totalActiveSessions || 0} 
          icon={MonitorPlay} 
          colorClass="neon-blue"
          delay={0.1}
        />
        <DashboardStatsCard 
          title="PCs Active / Reserved" 
          value={`${summary?.totalActivePcs || 0} / ${summary?.reservedPcs || 0}`} 
          icon={Users} 
          colorClass="neon-purple"
          delay={0.2}
        />
        <DashboardStatsCard 
          title="Awaiting Billing" 
          value={summary?.awaitingBillingPcs || 0} 
          icon={AlertTriangle} 
          colorClass="neon-orange"
          delay={0.3}
        />
        <DashboardStatsCard 
          title="Active Food Orders" 
          value={summary?.activeFoodOrders || 0} 
          icon={Coffee} 
          colorClass="accent"
          delay={0.4}
        />
      </div>

      {/* Financial Overview - Split Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Financial KPIs & Secondary Metrics */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Revenue Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <DashboardStatsCard 
              title="Today's Revenue" 
              value={`₹${(summary?.totalRevenueToday || 0).toLocaleString()}`} 
              subtitle={`Gaming: ₹${summary?.gamingRevenueToday || 0} • Food: ₹${summary?.foodRevenueToday || 0}`}
              icon={Wallet} 
              colorClass="accent"
              delay={0.5}
            />
            <DashboardStatsCard 
              title="Cash Collection" 
              value={`₹${(summary?.cashTotals || 0).toLocaleString()}`} 
              icon={Banknote} 
              colorClass="neon-blue"
              delay={0.6}
            />
            <DashboardStatsCard 
              title="Online / Wallet" 
              value={`₹${(summary?.onlineTotals + summary?.walletTotals || 0).toLocaleString()}`} 
              icon={CreditCard} 
              colorClass="neon-purple"
              delay={0.7}
            />
          </div>

          {/* Secondary Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-bg-2 border border-border rounded-lg p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-bg-3 border border-border-2 rounded">
                  <Wrench className="w-5 h-5 text-text-3" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-text">PCs Under Maintenance</h4>
                  <p className="text-xs text-text-2">Requires technical review</p>
                </div>
              </div>
              <span className="text-xl font-heading font-bold text-text-2">{summary?.pcsUnderMaintenance || 0}</span>
            </div>

            <div className="bg-bg-2 border border-border rounded-lg p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-neon-red/10 border border-neon-red/20 rounded">
                  <AlertTriangle className="w-5 h-5 text-neon-red" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-text">Low Stock Alerts</h4>
                  <p className="text-xs text-text-2">Inventory requiring restock</p>
                </div>
              </div>
              <span className="text-xl font-heading font-bold text-neon-red">{summary?.lowStockAlerts || 0}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Activity Feed */}
        <div className="lg:col-span-1 h-full">
          <RecentTransactionsFeed transactions={transactions} />
        </div>
      </div>
    </div>
  );
}
