import { useState, useEffect, useCallback } from 'react';
import { Gamepad2 } from 'lucide-react';
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
  const [selectedPc, setSelectedPc] = useState(null);

  const targetBranchId = isSuperAdmin ? activeBranch?.id : user?.branchId;

  const fetchPcs = useCallback(async () => {
    if (isSuperAdmin && !targetBranchId) {
      setPcs([]);
      setIsLoading(false);
      return; // SuperAdmin must select a branch to view sessions grid
    }

    try {
      const { data } = await api.get('/pcs', { params: { branchId: targetBranchId } });
      // Sort PCs by Name logically (PC-01, PC-02)
      const sortedPcs = (data?.data || []).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
      setPcs(sortedPcs);
    } catch (err) {
      console.error("Failed to load PCs", err);
    } finally {
      setIsLoading(false);
    }
  }, [targetBranchId, isSuperAdmin]);

  useEffect(() => {
    setIsLoading(true);
    fetchPcs();
  }, [fetchPcs]);

  // Realtime SignalR Updates
  useEffect(() => {
    if (!connected || !targetBranchId) return;

    const unsubPcStatus = subscribe(SIGNALR_HUBS.PC_STATUS, 'PcStatusChanged', (updatedPc) => {
      // Update specific PC in the grid array
      setPcs(current => {
        const idx = current.findIndex(p => p.id === updatedPc.id);
        if (idx === -1) return current;
        
        const newArr = [...current];
        newArr[idx] = { ...newArr[idx], ...updatedPc };
        return newArr;
      });

      // Update selected PC if it's the one currently opened in the modal
      setSelectedPc(currentSelected => {
        if (currentSelected?.id === updatedPc.id) {
          return { ...currentSelected, ...updatedPc };
        }
        return currentSelected;
      });
    });

    return () => {
      unsubPcStatus();
    };
  }, [connected, subscribe, SIGNALR_HUBS.PC_STATUS, targetBranchId]);

  if (isSuperAdmin && !activeBranch) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Gamepad2 className="w-12 h-12 text-text-3 mb-4" />
        <h2 className="text-xl font-heading font-bold text-text mb-2">Select a Branch</h2>
        <p className="text-text-2">You must select a branch from the top menu to view live gaming sessions.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text tracking-wide flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-neon-blue" />
            LIVE SESSIONS
          </h1>
          <p className="text-text-2 text-sm mt-1">
            {isSuperAdmin 
              ? `Admin Override Mode — Branch: ${activeBranch?.name}` 
              : `Operator Mode — Branch: ${user?.branchName}`}
          </p>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider bg-bg-2 border border-border p-2 rounded-lg">
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-text-3" /> IDLE</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-neon-blue" /> ACTIVE</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-neon-purple" /> RESERVED</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-neon-orange" /> BILLING</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-neon-red" /> MAINT</div>
        </div>
      </div>

      {/* Grid */}
      <PcGrid pcs={pcs} onPcClick={setSelectedPc} />

      {/* Action Modal */}
      <SessionActionModal 
        pc={selectedPc} 
        onClose={() => setSelectedPc(null)} 
        onActionSuccess={() => {
          // The signalR hub should push the update, but we could optimistic update if needed
          // For now rely on SignalR for exact state integrity.
        }} 
      />
    </div>
  );
}
