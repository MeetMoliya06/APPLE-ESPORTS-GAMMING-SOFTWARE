import { useState, useEffect, useCallback, useMemo } from 'react';
import { MonitorPlay, MonitorOff, IndianRupee, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useBranch } from '../../contexts/BranchContext';
import { useSocket } from '../../contexts/SocketContext';
import api from '../../config/api';

import PcGrid from '../../components/sessions/PcGrid';
import SessionActionModal from '../../components/sessions/SessionActionModal';

export default function SessionsPage() {
  const { isSuperAdmin, user } = useAuth();
  const { activeBranch } = useBranch();
  const { subscribe, connected, SIGNALR_HUBS } = useSocket();

  const [pcs, setPcs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startModalPc, setStartModalPc] = useState(null); // PC to start session on

  const targetBranchId = isSuperAdmin ? activeBranch?.id : user?.branchId;

  const fetchPcs = useCallback(async () => {
    if (!targetBranchId) {
      setPcs([]);
      setIsLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/pcs', { params: { branchId: targetBranchId } });
      const sorted = (data?.data || []).sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true })
      );
      setPcs(sorted);
    } catch (err) {
      console.error('Failed to load PCs', err);
    } finally {
      setIsLoading(false);
    }
  }, [targetBranchId]);

  useEffect(() => {
    setIsLoading(true);
    fetchPcs();
  }, [fetchPcs]);

  // SignalR realtime PC state updates
  useEffect(() => {
    if (!connected || !targetBranchId) return;
    const unsub = subscribe(SIGNALR_HUBS.PC_STATUS, 'PcStatusChanged', (updatedPc) => {
      setPcs(current => {
        const idx = current.findIndex(p => p.id === updatedPc.id);
        if (idx === -1) return current;
        const next = [...current];
        next[idx] = { ...next[idx], ...updatedPc };
        return next;
      });
    });
    return () => unsub();
  }, [connected, subscribe, SIGNALR_HUBS.PC_STATUS, targetBranchId]);

  // ── Stats computed from PC list ──
  const stats = useMemo(() => {
    const activeSessions = pcs.filter(p => p.state === 'Active').length;
    const idleStations = pcs.filter(p => p.state === 'Idle').length;
    const awaitingBilling = pcs.filter(p => p.state === 'AwaitingBilling').length;

    // Live accrued revenue across all active sessions
    const liveRevenue = pcs
      .filter(p => p.state === 'Active' && p.sessionStartTime && p.ratePerHour > 0)
      .reduce((sum, p) => {
        const elapsedMin = (Date.now() - new Date(p.sessionStartTime).getTime()) / 60000;
        return sum + Math.ceil((elapsedMin / 60) * p.ratePerHour);
      }, 0);

    return { activeSessions, idleStations, awaitingBilling, liveRevenue };
  }, [pcs]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<MonitorPlay className="w-4 h-4" />}
          label="ACTIVE SESSIONS"
          value={stats.activeSessions}
          color="text-pc-active"
          borderColor="border-pc-active/20"
        />
        <StatCard
          icon={<MonitorOff className="w-4 h-4" />}
          label="IDLE STATIONS"
          value={stats.idleStations}
          color="text-text-2"
          borderColor="border-border"
        />
        <StatCard
          icon={<IndianRupee className="w-4 h-4" />}
          label="LIVE ACCRUED REVENUE"
          value={`₹${stats.liveRevenue}`}
          color="text-neon-orange"
          borderColor="border-neon-orange/20"
        />
        <StatCard
          icon={<Clock className="w-4 h-4" />}
          label="AWAITING BILLING"
          value={stats.awaitingBilling}
          color="text-neon-purple"
          borderColor="border-neon-purple/20"
        />
      </div>

      {/* ── Instruction strip ── */}
      <p className="text-text-3 text-xs font-mono">
        Click <span className="text-pc-active font-semibold">START SESSION</span> on a free station to begin. Red borders indicate active connections.
      </p>

      {/* ── Legend ── */}
      <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-wider">
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-text-3" /> Idle</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-pc-active" /> Active</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-neon-purple" /> Reserved</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-neon-orange" /> Awaiting Bill</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-neon-red" /> Maintenance</div>
      </div>

      {/* ── PC Grid ── */}
      <PcGrid
        pcs={pcs}
        onStartSession={setStartModalPc}
        onRefresh={fetchPcs}
      />

      {/* ── Start Session Modal (only for new session initiation) ── */}
      <SessionActionModal
        pc={startModalPc}
        onClose={() => setStartModalPc(null)}
        onActionSuccess={() => {
          setStartModalPc(null);
          fetchPcs();
        }}
      />
    </div>
  );
}

// ── Stats card component ──
function StatCard({ icon, label, value, color, borderColor }) {
  return (
    <div className={`bg-bg-2 border ${borderColor} rounded-lg p-4 flex flex-col gap-1.5`}>
      <div className={`flex items-center gap-1.5 text-[9px] font-mono font-semibold uppercase tracking-widest ${color}`}>
        {icon}
        {label}
      </div>
      <div className={`font-heading font-bold text-2xl ${color}`}>{value}</div>
    </div>
  );
}
