import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Receipt } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useBranch } from '../../contexts/BranchContext';
import { useSocket } from '../../contexts/SocketContext';
import api from '../../config/api';
import PageHeader from '../../components/layout/PageHeader';
import ActiveBillsList from '../../components/billing/ActiveBillsList';
import BillDetailsPanel from '../../components/billing/BillDetailsPanel';
import BillingAddItemsPanel from '../../components/billing/BillingAddItemsPanel';
import { getActiveReservations } from '../../api/reservations.api';

export default function BillingCounterPage() {
  const { isSuperAdmin, user } = useAuth();
  const { activeBranch } = useBranch();
  const { subscribe, connected, SIGNALR_HUBS } = useSocket();
  const { state } = useLocation();
  const autoSelectPcId = state?.autoSelectPcId;

  const [bills, setBills] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null); // { type: 'bill' | 'session', id: billId }
  const [selectedBillData, setSelectedBillData] = useState(null);
  const [summary, setSummary] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true);

  const targetBranchId = isSuperAdmin ? activeBranch?.id : user?.branchId;

  // ── 1. Fetch Master Data ──
  const fetchDashboardData = useCallback(async () => {
    if (isSuperAdmin && !targetBranchId) {
      setBills([]);
      setActiveSessions([]);
      setReservations([]);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch pending bills, active sessions, reservations, and summary stats
      const [billsRes, sessionsRes, reservationsList, summaryRes] = await Promise.all([
        api.get('/bills', { params: { page: 1, pageSize: 100, branchId: targetBranchId } }),
        api.get('/sessions', { params: { page: 1, pageSize: 100, branchId: targetBranchId } }),
        getActiveReservations(1, 100).catch(() => []),
        api.get('/dashboard/summary', { params: { branchId: targetBranchId } }).catch(() => null)
      ]);

      const unpaidBills = billsRes.data?.data?.items || [];
      const sessions = sessionsRes.data?.data?.items || [];

      setBills(unpaidBills);
      setActiveSessions(sessions.filter(s => s.status === 1 || s.status === 'Active')); 
      setReservations(reservationsList);
      if (summaryRes?.data?.data) {
        setSummary(summaryRes.data.data);
      }

      if (autoSelectPcId) {
        // Try to find in unpaid bills first
        const bill = unpaidBills.find(b => b.pcId === autoSelectPcId);
        if (bill) {
          setSelectedItem({ type: 'bill', id: bill.id });
        } else {
          // Try to find in active sessions
          const session = sessions.find(s => s.pcId === autoSelectPcId && (s.status === 1 || s.status === 'Active'));
          if (session) {
             setSelectedItem({ type: 'session', id: session.billId });
          }
        }
      }

    } catch (err) {
      console.error("Failed to load Billing Counter data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [targetBranchId, isSuperAdmin]);

  useEffect(() => {
    setIsLoading(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ── 2. Real-Time Hubs ──
  useEffect(() => {
    if (!connected || !targetBranchId) return;

    // Listen to billing updates
    const unsubBilling = subscribe(SIGNALR_HUBS.BILLING, 'BillingUpdated', (billId) => {
      fetchDashboardData();
      if (selectedItem?.id === billId || selectedBillData?.id === billId) {
        fetchBillDetails(billId);
      }
    });

    // Listen to PC Status changes
    const unsubPcStatus = subscribe(SIGNALR_HUBS.PC_STATUS, 'PcStatusChanged', () => {
      fetchDashboardData();
    });

    // Listen to Reservation updates
    const unsubReservations = subscribe(SIGNALR_HUBS.RESERVATIONS, 'ReservationUpdated', () => {
      fetchDashboardData();
    });

    // Listen to Dashboard summary updates
    const unsubSummary = subscribe(SIGNALR_HUBS.DASHBOARD, 'DashboardUpdated', (newSummary) => {
      setSummary(newSummary);
    });

    return () => {
      unsubBilling();
      unsubPcStatus();
      unsubReservations();
      unsubSummary();
    };
  }, [connected, subscribe, SIGNALR_HUBS, targetBranchId, fetchDashboardData, selectedItem, selectedBillData]);

  // ── 3. Fetch Selected Bill Details ──
  const fetchBillDetails = async (billId) => {
    if (!billId) return;
    try {
      const { data } = await api.get(`/bills/${billId}`);
      setSelectedBillData(data.data);
    } catch (err) {
      console.error("Failed to load bill details", err);
      setSelectedBillData(null);
    }
  };

  useEffect(() => {
    if (selectedItem?.id) {
      fetchBillDetails(selectedItem.id);
    } else {
      setSelectedBillData(null);
    }
  }, [selectedItem]);

  // ── 4. Handlers ──
  const handlePaymentSuccess = () => {
    fetchDashboardData();
    // Re-fetch selected bill to show it as Paid, or clear it
    if (selectedItem?.id) {
      fetchBillDetails(selectedItem.id);
    }
  };

  if (isSuperAdmin && !activeBranch) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Receipt className="w-12 h-12 text-text-3 mb-4" />
        <h2 className="text-xl font-heading font-bold text-text mb-2">Select a Branch</h2>
        <p className="text-text-2">You must select a branch to view the Billing Counter.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Billing Counter"
        subtitle="Process split payments and manage active session bills"
        icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        badge="LIVE"
      />

      <div className="grid grid-cols-4 gap-2 mt-4">
        <div className="bg-bg-2 border border-border rounded-xl p-2.5 px-3 shadow-sm">
          <div className="text-[10px] text-text-2 mb-0.5 uppercase tracking-wide">Active PCs</div>
          <div className="font-mono text-base font-bold text-accent">{summary?.totalActivePcs || 0}</div>
        </div>
        <div className="bg-bg-2 border border-border rounded-xl p-2.5 px-3 shadow-sm">
          <div className="text-[10px] text-text-2 mb-0.5 uppercase tracking-wide">Today Bills</div>
          <div className="font-mono text-base font-bold text-text">{summary?.todayBillsCount || 0}</div>
        </div>
        <div className="bg-bg-2 border border-border rounded-xl p-2.5 px-3 shadow-sm">
          <div className="text-[10px] text-text-2 mb-0.5 uppercase tracking-wide">Today Revenue</div>
          <div className="font-mono text-[13px] font-bold text-accent">₹{summary?.totalRevenueToday?.toLocaleString() || '0'}</div>
        </div>
        <div className="bg-bg-2 border border-border rounded-xl p-2.5 px-3 shadow-sm">
          <div className="text-[10px] text-text-2 mb-0.5 uppercase tracking-wide">Rate Mode</div>
          <div className="font-mono text-[13px] font-bold text-accent">STD ₹40</div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mt-4 flex-1 min-h-0">
        
        {/* Left Column: Lists */}
        <div className="w-full lg:w-[28%] flex flex-col h-full bg-bg-2 border border-border rounded-xl p-4 shadow-lg overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center flex-1">
              <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            </div>
          ) : (
            <ActiveBillsList 
              bills={bills} 
              activeSessions={activeSessions}
              reservations={reservations}
              selectedId={selectedItem?.id}
              onSelect={setSelectedItem}
            />
          )}
        </div>

        {/* Middle Column: Add Items */}
        <div className="w-full lg:w-[38%] h-full">
          <BillingAddItemsPanel 
            bill={selectedBillData} 
            onOrderPlaced={() => {
              fetchDashboardData();
              if (selectedBillData?.id) {
                fetchBillDetails(selectedBillData.id);
              }
            }} 
          />
        </div>

        {/* Right Column: Details Panel */}
        <div className="w-full lg:w-[34%] h-full">
          <BillDetailsPanel
            bill={selectedBillData}
            onBillUpdate={(updatedBill) => {
              setSelectedBillData(updatedBill);
              fetchDashboardData();
            }}
            onPaymentSuccess={handlePaymentSuccess}
          />
        </div>

      </div>
    </div>
  );
}
