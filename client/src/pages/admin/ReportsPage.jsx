import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Utensils, 
  Gamepad2, 
  AlertTriangle,
  User,
  Clock,
  Search,
  RefreshCw
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import { getRangeReport, getDiscrepancies } from '../../api/food.api';
import { useBranch } from '../../contexts/BranchContext';
import { useAuth } from '../../contexts/AuthContext';

export default function ReportsPage() {
  const { activeBranch } = useBranch();
  const { isSuperAdmin } = useAuth();

  // Date range selectors
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Data states
  const [reportData, setReportData] = useState({ daily: [], monthly: [] });
  const [discrepancies, setDiscrepancies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [discrepancyLoading, setDiscrepancyLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    if (!activeBranch) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getRangeReport({ 
        startDate: `${startDate}T00:00:00Z`, 
        endDate: `${endDate}T23:59:59Z`, 
        branchId: activeBranch.id 
      });
      setReportData(data?.data || { daily: [], monthly: [] });
    } catch (err) {
      setError('Failed to fetch range report data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscrepancies = async () => {
    if (!activeBranch) return;
    setDiscrepancyLoading(true);
    try {
      const data = await getDiscrepancies({ branchId: activeBranch.id });
      setDiscrepancies(data?.data || []);
    } catch (err) {
      console.error('Failed to load discrepancies log:', err);
    } finally {
      setDiscrepancyLoading(false);
    }
  };

  useEffect(() => {
    if (activeBranch) {
      fetchReports();
      fetchDiscrepancies();
    }
  }, [activeBranch]);

  // Aggregate totals
  const totalGaming = reportData.daily?.reduce((sum, d) => sum + d.gamingRevenue, 0) || 0;
  const totalFood = reportData.daily?.reduce((sum, d) => sum + d.foodRevenue, 0) || 0;
  const totalRevenue = reportData.daily?.reduce((sum, d) => sum + d.totalRevenue, 0) || 0;

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertTriangle className="w-12 h-12 text-neon-red mb-4 animate-bounce" />
        <h2 className="text-xl font-heading font-bold text-text mb-2">Access Denied</h2>
        <p className="text-text-2">This reports page is restricted to Super Administrators only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1">
      {/* Header */}
      <div className="flex justify-between items-start">
        <PageHeader
          title="Revenue & Inventory Reports"
          subtitle="Super Admin EOM comparisons, gaming vs. food breakdowns, and reconciliation logs"
          icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2"
        />

        {/* Date Selector Panel */}
        <div className="flex items-center gap-3 bg-bg-2 border border-border p-2 rounded-xl shadow-lg">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-text-3" />
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="bg-bg-3 border border-border text-text text-xs rounded-md p-1.5 focus:border-accent outline-none"
            />
            <span className="text-text-3 text-xs">to</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="bg-bg-3 border border-border text-text text-xs rounded-md p-1.5 focus:border-accent outline-none"
            />
          </div>
          <button
            onClick={fetchReports}
            className="btn-primary py-1.5 px-3 flex items-center gap-1.5 text-xs font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Apply
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-bg-2/55 border border-border p-6 rounded-xl flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-neon-blue/5 rounded-full blur-xl" />
          <div className="p-3.5 bg-neon-blue/10 border border-neon-blue/20 text-neon-blue rounded-lg">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-text-3 text-xs font-bold uppercase tracking-wider">Gaming Revenue</div>
            <div className="text-2xl font-mono font-extrabold text-text mt-1">₹{totalGaming.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className="card bg-bg-2/55 border border-border p-6 rounded-xl flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-xl" />
          <div className="p-3.5 bg-accent/10 border border-accent/20 text-accent rounded-lg">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <div className="text-text-3 text-xs font-bold uppercase tracking-wider">Food & Drink Revenue</div>
            <div className="text-2xl font-mono font-extrabold text-text mt-1">₹{totalFood.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </div>

        <div className="card bg-bg-2/55 border border-border p-6 rounded-xl flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-neon-green/5 rounded-full blur-xl" />
          <div className="p-3.5 bg-neon-green/10 border border-neon-green/20 text-neon-green rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-text-3 text-xs font-bold uppercase tracking-wider">Total Combined Revenue</div>
            <div className="text-2xl font-mono font-extrabold text-neon-green mt-1">₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </div>
      </div>

      {/* Revenue Split Breakdown Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Daily Revenue Split */}
        <div className="card bg-bg-2 border border-border p-6 rounded-xl flex flex-col min-h-[400px]">
          <h2 className="font-heading font-extrabold text-sm uppercase tracking-wider text-text mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            Daily Revenue Breakdown
          </h2>
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : reportData.daily?.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-text-3 text-xs italic">
                No billing records found in selected range.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border text-text-3 uppercase tracking-wider font-bold text-[10px]">
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5 text-right">Gaming</th>
                    <th className="py-2.5 text-right">Food & Drink</th>
                    <th className="py-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-mono">
                  {reportData.daily.map(day => (
                    <tr key={day.date} className="hover:bg-bg-3/40 transition-colors">
                      <td className="py-2 text-text-2">{day.date}</td>
                      <td className="py-2 text-right text-text">₹{day.gamingRevenue.toFixed(2)}</td>
                      <td className="py-2 text-right text-text">₹{day.foodRevenue.toFixed(2)}</td>
                      <td className="py-2 text-right text-neon-green font-bold">₹{day.totalRevenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Monthly Revenue Comparison (EOM) */}
        <div className="card bg-bg-2 border border-border p-6 rounded-xl flex flex-col min-h-[400px]">
          <h2 className="font-heading font-extrabold text-sm uppercase tracking-wider text-text mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-neon-blue" />
            Monthly EOM Summary
          </h2>
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : reportData.monthly?.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-text-3 text-xs italic">
                No monthly data aggregated.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border text-text-3 uppercase tracking-wider font-bold text-[10px]">
                    <th className="py-2.5">Month</th>
                    <th className="py-2.5 text-right">Gaming</th>
                    <th className="py-2.5 text-right">Food & Drink</th>
                    <th className="py-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-mono">
                  {reportData.monthly.map(month => (
                    <tr key={month.month} className="hover:bg-bg-3/40 transition-colors">
                      <td className="py-2 text-text-2">{month.month}</td>
                      <td className="py-2 text-right text-text">₹{month.gamingRevenue.toFixed(2)}</td>
                      <td className="py-2 text-right text-text">₹{month.foodRevenue.toFixed(2)}</td>
                      <td className="py-2 text-right text-neon-green font-bold">₹{month.totalRevenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

      {/* Discrepancy Logs Table */}
      <div className="card bg-bg-2 border border-border p-6 rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-heading font-extrabold text-sm uppercase tracking-wider text-text flex items-center gap-2">
            <AlertTriangle className="w-4.5 h-4.5 text-neon-orange" />
            Inventory Discrepancy Logs
          </h2>
          <button
            onClick={fetchDiscrepancies}
            className="btn-secondary py-1 px-3 text-[11px] font-bold uppercase tracking-wider"
          >
            Refresh Logs
          </button>
        </div>

        <div className="overflow-x-auto">
          {discrepancyLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : discrepancies.length === 0 ? (
            <div className="text-center text-text-3 text-xs italic py-8 border border-dashed border-border rounded-lg">
              No physical count discrepancies logged.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border text-text-3 uppercase tracking-wider font-bold text-[10px]">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4 text-right">Expected</th>
                  <th className="py-3 px-4 text-right">Physical Count</th>
                  <th className="py-3 px-4 text-center">Delta / Discrepancy</th>
                  <th className="py-3 px-4">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono">
                {discrepancies.map(log => {
                  const delta = log.quantity || 0;
                  const deltaColor = delta > 0 ? 'text-neon-green' : delta < 0 ? 'text-neon-red font-bold' : 'text-text-3';
                  const sign = delta > 0 ? '+' : '';
                  return (
                    <tr key={log.id} className="hover:bg-bg-3/40 transition-colors">
                      <td className="py-3 px-4 text-text-2 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-text-3" />
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-text font-bold font-heading">{log.itemName}</td>
                      <td className="py-3 px-4 text-right text-text">{log.oldValue}</td>
                      <td className="py-3 px-4 text-right text-text">{log.newValue}</td>
                      <td className={`py-3 px-4 text-center ${deltaColor}`}>
                        {sign}{delta}
                      </td>
                      <td className="py-3 px-4 text-text-3 italic font-sans max-w-[200px] truncate" title={log.reason}>
                        {log.reason || 'None'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
