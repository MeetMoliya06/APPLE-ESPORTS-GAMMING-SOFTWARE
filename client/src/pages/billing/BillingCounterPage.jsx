import { useState, useEffect, useCallback } from 'react';
import { Receipt } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useBranch } from '../../contexts/BranchContext';
import { useSocket } from '../../contexts/SocketContext';
import api from '../../config/api';
import PageHeader from '../../components/layout/PageHeader';
import ActiveBillsList from '../../components/billing/ActiveBillsList';
import BillDetailsPanel from '../../components/billing/BillDetailsPanel';
import { getActiveReservations } from '../../api/reservations.api';

export default function BillingCounterPage() {
  const { isSuperAdmin, user } = useAuth();
  const { activeBranch } = useBranch();
  const { subscribe, connected, SIGNALR_HUBS } = useSocket();

  const [bills, setBills] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null); // { type: 'bill' | 'session', id: billId }
  const [selectedBillData, setSelectedBillData] = useState(null);
  
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
      // Fetch pending bills, active sessions, and reservations
      const [billsRes, sessionsRes, reservationsList] = await Promise.all([
        api.get('/bills', { params: { page: 1, pageSize: 100, branchId: targetBranchId } }),
        api.get('/sessions', { params: { page: 1, pageSize: 100, branchId: targetBranchId } }),
        getActiveReservations(1, 100).catch(() => [])
      ]);

      const unpaidBills = billsRes.data?.data?.items || [];
      const sessions = sessionsRes.data?.data?.items || [];

      setBills(unpaidBills);
      setActiveSessions(sessions.filter(s => s.status === 1 || s.status === 'Active')); 
      setReservations(reservationsList);

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
      if (selectedItem?.id === billId) {
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

    return () => {
      unsubBilling();
      unsubPcStatus();
      unsubReservations();
    };
  }, [connected, subscribe, SIGNALR_HUBS, targetBranchId, fetchDashboardData, selectedItem]);

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

      <div className="flex flex-col lg:flex-row gap-6 mt-6 flex-1 min-h-0">
        
        {/* Left Column: Lists */}
        <div className="w-full lg:w-1/3 flex flex-col h-full bg-bg-2 border border-border rounded-xl p-4 shadow-lg overflow-y-auto">
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

        {/* Right Column: Details Panel */}
        <div className="w-full lg:w-2/3 h-full">
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
