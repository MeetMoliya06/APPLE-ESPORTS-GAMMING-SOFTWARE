import { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, AlertTriangle, FileText, CheckCircle, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useBranch } from '../../contexts/BranchContext';
import api from '../../config/api';
import PageHeader from '../../components/layout/PageHeader';

export default function EodDashboardPage() {
  const { isSuperAdmin, user } = useAuth();
  const { activeBranch } = useBranch();

  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [report, setReport] = useState(null);
  const [validation, setValidation] = useState(null);
  const [isHistorical, setIsHistorical] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [error, setError] = useState(null);

  const targetBranchId = isSuperAdmin ? activeBranch?.id : user?.branchId;

  const fetchEodData = useCallback(async () => {
    if (isSuperAdmin && !targetBranchId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setValidation(null);

    try {
      // First try to fetch historical snapshot
      try {
        const { data: historyData } = await api.get('/eod/history', {
          params: { date: targetDate, branchId: targetBranchId }
        });
        
        setReport(historyData.data.data); // historyData.data is EodSnapshotDto, .data is EodReportDto
        setIsHistorical(true);
      } catch (historyErr) {
        if (historyErr.response?.status === 404) {
          // No snapshot exists. It is either today or an unfinalized past date.
          setIsHistorical(false);
          
          // Fetch Preview
          const { data: previewData } = await api.get('/eod/preview', {
            params: { date: targetDate, branchId: targetBranchId }
          });
          setReport(previewData.data);

          // Fetch Validation Status
          const { data: validationData } = await api.get('/eod/validation', {
            params: { date: targetDate, branchId: targetBranchId }
          });
          setValidation(validationData.data);
        } else {
          throw historyErr;
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch EOD data.');
    } finally {
      setIsLoading(false);
    }
  }, [targetDate, targetBranchId, isSuperAdmin]);

  useEffect(() => {
    fetchEodData();
  }, [fetchEodData]);

  const handleFinalize = async () => {
    if (!window.confirm("Are you sure? This will generate a permanent immutable snapshot for this date. It cannot be undone.")) return;

    setIsFinalizing(true);
    try {
      await api.post('/eod/finalize', { date: targetDate });
      await fetchEodData(); // Re-fetch to show historical locked view
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to finalize EOD.');
    } finally {
      setIsFinalizing(false);
    }
  };

  if (isSuperAdmin && !activeBranch) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Lock className="w-12 h-12 text-text-3 mb-4" />
        <h2 className="text-xl font-heading font-bold text-text mb-2">Select a Branch</h2>
        <p className="text-text-2">You must select a branch to view EOD Reports.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto space-y-6 overflow-y-auto pb-10">
      <div className="flex justify-between items-center bg-bg-2 p-6 rounded-xl border border-border">
        <PageHeader
          title="End of Day Dashboard"
          subtitle={isHistorical ? 'Immutable Financial Snapshot' : 'Live Preview & Finalization'}
          icon="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
        <div className="flex flex-col items-end gap-2">
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="bg-bg-3 border border-border rounded-lg px-4 py-2 text-text outline-none focus:border-accent"
          />
          {isHistorical && (
            <span className="bg-neon-green/10 text-neon-green px-3 py-1 rounded border border-neon-green/30 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Finalized
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-neon-red/10 border border-neon-red/30 text-neon-red p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
      ) : report ? (
        <>
          {/* Validation Panel (Only if not historical) */}
          {!isHistorical && validation && (
            <div className={`p-6 rounded-xl border ${validation.isReady ? 'bg-neon-green/5 border-neon-green/20' : 'bg-neon-red/5 border-neon-red/20'}`}>
              <h3 className={`text-sm uppercase font-bold tracking-widest mb-4 flex items-center gap-2 ${validation.isReady ? 'text-neon-green' : 'text-neon-red'}`}>
                {validation.isReady ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                Financial Validation Status
              </h3>
              
              {validation.isReady ? (
                <p className="text-text-2 text-sm">All shifts are closed. All registers verified. Financials are balanced. You may proceed to finalize.</p>
              ) : (
                <ul className="space-y-2">
                  {validation.blockers.map((blocker, idx) => (
                    <li key={idx} className="text-sm text-neon-red flex items-start gap-2">
                      <span className="text-neon-red/50 mt-0.5">•</span>
                      {blocker}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Revenue & Operations Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-bg-2 p-5 rounded-xl border border-border shadow-lg">
              <div className="text-text-3 text-xs uppercase font-bold tracking-widest mb-1">Total Net Revenue</div>
              <div className="text-3xl font-mono font-bold text-accent">₹{report.revenue.netRevenue}</div>
            </div>
            <div className="bg-bg-2 p-5 rounded-xl border border-border shadow-lg">
              <div className="text-text-3 text-xs uppercase font-bold tracking-widest mb-1">Gaming Revenue</div>
              <div className="text-2xl font-mono font-bold text-text">₹{report.revenue.totalGamingRevenue}</div>
            </div>
            <div className="bg-bg-2 p-5 rounded-xl border border-border shadow-lg">
              <div className="text-text-3 text-xs uppercase font-bold tracking-widest mb-1">Food Revenue</div>
              <div className="text-2xl font-mono font-bold text-text">₹{report.revenue.totalFoodRevenue}</div>
            </div>
            <div className="bg-bg-2 p-5 rounded-xl border border-border shadow-lg">
              <div className="text-text-3 text-xs uppercase font-bold tracking-widest mb-1">Discounts Applied</div>
              <div className="text-2xl font-mono font-bold text-text">₹{report.revenue.totalDiscounts}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cash Summary */}
            <div className="bg-bg-2 rounded-xl border border-border shadow-lg p-6">
              <h3 className="text-sm uppercase font-bold text-text-2 tracking-widest mb-6 border-b border-border pb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Cash Lifecycle Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-2">Opening Balance Total</span>
                  <span className="font-mono text-text">₹{report.cash.totalOpeningBalance}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-2">Cash Sales + Wallet TopUps</span>
                  <span className="font-mono text-neon-green">+ ₹{report.cash.totalCashSales}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-2">Petty Expenses</span>
                  <span className="font-mono text-neon-red">- ₹{report.cash.totalPettyExpenses}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-border pt-4">
                  <span className="font-bold text-text">Expected Drawer Total</span>
                  <span className="font-mono font-bold text-accent">₹{report.cash.expectedCashInDrawer}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-text">Physically Counted</span>
                  <span className="font-mono font-bold text-text">₹{report.cash.actualPhysicalCashCounted}</span>
                </div>
                <div className="flex justify-between items-center text-sm bg-bg-3 p-3 rounded-lg border border-border mt-2">
                  <span className="font-bold text-text uppercase tracking-widest text-xs">Final Discrepancy</span>
                  <span className={`font-mono font-bold ${report.cash.totalDiscrepancy === 0 ? 'text-neon-blue' : 'text-neon-red'}`}>
                    ₹{report.cash.totalDiscrepancy}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-bg-2 rounded-xl border border-border shadow-lg p-6">
              <h3 className="text-sm uppercase font-bold text-text-2 tracking-widest mb-6 border-b border-border pb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Payment Collection
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-2">Cash Collected</span>
                  <span className="font-mono text-text">₹{report.paymentMethods.totalCash}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-2">Online (UPI/Card)</span>
                  <span className="font-mono text-text">₹{report.paymentMethods.totalOnline}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-2">Wallet Deductions</span>
                  <span className="font-mono text-neon-purple">₹{report.paymentMethods.totalWalletDeductions}</span>
                </div>
              </div>

              <h3 className="text-sm uppercase font-bold text-text-2 tracking-widest mt-8 mb-6 border-b border-border pb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Operations Overview
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-bg-3 p-3 rounded-lg border border-border text-center">
                  <div className="text-2xl font-bold text-text">{report.operations.totalSessions}</div>
                  <div className="text-[10px] uppercase font-bold text-text-3 tracking-widest mt-1">Sessions</div>
                </div>
                <div className="bg-bg-3 p-3 rounded-lg border border-border text-center">
                  <div className="text-2xl font-bold text-text">{report.operations.totalFoodOrders}</div>
                  <div className="text-[10px] uppercase font-bold text-text-3 tracking-widest mt-1">Food Orders</div>
                </div>
              </div>
            </div>
          </div>

          {/* Finalize Button */}
          {!isHistorical && isSuperAdmin && (
            <div className="mt-8">
              <button
                onClick={handleFinalize}
                disabled={!validation?.isReady || isFinalizing}
                className="w-full py-5 rounded-xl font-bold uppercase tracking-widest text-sm transition-all bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/20 flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFinalizing ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    Finalize EOD & Create Immutable Snapshot
                  </>
                )}
              </button>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
