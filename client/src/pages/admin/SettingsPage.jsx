import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import { useToast } from '../../components/ui/Toast';
import Drawer from '../../components/ui/Drawer';
import { useBranch } from '../../contexts/BranchContext';
import { 
  getBranches, createBranch, updateBranch, deleteBranch, activateBranch,
  getOperators, createOperator, updateOperator, deleteOperator, activateOperator, deleteOperatorPermanent,
  getBranchPcsDetailed, createPc, updatePc, deletePc,
  getAuditLogs
} from '../../api/settings.api';
import { 
  Store, Users, Activity, MoreVertical, Edit, Trash2, Plus, Save, Clock, MapPin, Monitor, Wrench, Shield, Check, Info
} from 'lucide-react';
import './SettingsPage.css';

const PERMISSION_KEYS = [
  { id: 'main_dashboard', label: 'Operational Dashboard', desc: 'Summary of active play, operator shift totals' },
  { id: 'billing_counter', label: 'Billing Counter', desc: 'Initiate play sessions, process items & checkout' },
  { id: 'sessions', label: 'Sessions Console', desc: 'Track PC play status and live timers' },
  { id: 'reservations', label: 'Reservations Board', desc: 'Book play slots and manage guest bookings' },
  { id: 'food_orders', label: 'Food & Beverage Orders', desc: 'Process orders and dispatch kitchen items' },
  { id: 'cash_register', label: 'Cash Register Drawer', desc: 'Manage cash transactions in open shift' },
  { id: 'cash_desk', label: 'Cash Desk Verification', desc: 'Verify expected vs counted cash in drawer' },
  { id: 'members', label: 'Member Management', desc: 'Register new loyalty accounts and top-up wallets' },
  { id: 'menu_editor', label: 'Menu & Pricing Profiles', desc: 'Configure cafe rates and menu card items' },
  { id: 'pc_status', label: 'PC Fleet Status', desc: 'Full PC network health overview (Admin only)' },
  { id: 'eod', label: 'End of Day (EOD) Snapshots', desc: 'Review shifts summaries and register snapshot reports' },
  { id: 'settings', label: 'System Settings', desc: 'Configure operators, branches, and logs' }
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('branches');
  const toast = useToast();
  const { loadBranches } = useBranch();
  const [loading, setLoading] = useState(false);
  
  // Data State
  const [branches, setBranches] = useState([]);
  const [operators, setOperators] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Drawers State
  const [branchDrawer, setBranchDrawer] = useState({ isOpen: false, data: null });
  const [operatorDrawer, setOperatorDrawer] = useState({ isOpen: false, data: null });
  
  // PC fleet sub-state for a specific branch
  const [pcModal, setPcModal] = useState({ isOpen: false, branch: null, pcs: [], loading: false });
  const [pcDrawer, setPcDrawer] = useState({ isOpen: false, data: null }); // Nested PC create/edit drawer

  // Dropdown States — tracks id + screen coords for fixed-position menu
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, oRes, aRes] = await Promise.all([
        getBranches(), getOperators(), getAuditLogs()
      ]);
      setBranches(bRes.data || []);
      setOperators(oRes.data || []);
      setAuditLogs(aRes.data || []);
    } catch (error) {
      toast.error('Failed to load settings data');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
    
    // Close menus on outside click or scroll (fixed dropdowns need both)
    const handleClickOutside = () => setActiveDropdown(null);
    const handleScroll = () => setActiveDropdown(null);
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [fetchData]);

  const toggleDropdown = (e, id) => {
    e.stopPropagation();
    if (activeDropdown === id) {
      setActiveDropdown(null);
      return;
    }
    // Calculate position from the button's bounding rect
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
    });
    setActiveDropdown(id);
  };

  const closeDropdown = () => setActiveDropdown(null);

  // ----- BRANCH HANDLERS -----
  const handleSaveBranch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      name: formData.get('name'),
      address: formData.get('address'),
      openingTime: formData.get('openingTime'),
      closingTime: formData.get('closingTime')
    };

    try {
      if (branchDrawer.data) {
        await updateBranch(branchDrawer.data.id, payload);
        toast.success('Branch updated successfully');
      } else {
        await createBranch(payload);
        toast.success('Branch created successfully');
      }
      setBranchDrawer({ isOpen: false, data: null });
      fetchData();
      await loadBranches();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save branch');
    }
  };

  const handleDeleteBranch = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this branch? Operators will not be able to log in to this location.')) {
      try {
        await deleteBranch(id);
        toast.success('Branch deactivated successfully');
        fetchData();
        await loadBranches();
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to deactivate branch');
      }
    }
  };

  // ----- OPERATOR HANDLERS -----
  const handleDeleteOperator = async (id) => {
    if (window.confirm('Are you sure you want to disable this operator account?')) {
      try {
        await deleteOperator(id);
        toast.success('Operator disabled successfully');
        fetchData();
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to disable operator');
      }
    }
  };

  const handleActivateBranch = async (id) => {
    try {
      await activateBranch(id);
      toast.success('Branch activated successfully');
      fetchData();
      await loadBranches();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to activate branch');
    }
  };

  const handleActivateOperator = async (id) => {
    try {
      await activateOperator(id);
      toast.success('Operator activated successfully');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to activate operator');
    }
  };

  const handleDeleteOperatorPermanent = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this operator account? This action cannot be undone.')) {
      try {
        await deleteOperatorPermanent(id);
        toast.success('Operator deleted permanently');
        fetchData();
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to delete operator permanently');
      }
    }
  };

  // ----- PC FLEET HANDLERS -----
  const openPcManager = async (branch) => {
    setPcModal({ isOpen: true, branch, pcs: [], loading: true });
    try {
      const pcsData = await getBranchPcsDetailed(branch.id);
      setPcModal(prev => ({ ...prev, pcs: pcsData.data || [], loading: false }));
    } catch (error) {
      toast.error('Failed to load PC fleet status');
      setPcModal(prev => ({ ...prev, loading: false }));
    }
  };

  const refreshPcsList = async (branchIdOverride) => {
    // Use the override or fall back to the current pcModal.branch
    const targetBranchId = branchIdOverride || pcModal.branch?.id;
    if (!targetBranchId) return;
    setPcModal(prev => ({ ...prev, loading: true }));
    try {
      const pcsData = await getBranchPcsDetailed(targetBranchId);
      setPcModal(prev => ({ ...prev, pcs: pcsData.data || [], loading: false }));
    } catch (error) {
      toast.error('Failed to load PC fleet status');
      setPcModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSavePc = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const specs = {
      gpu: formData.get('gpu'),
      cpu: formData.get('cpu'),
      ram: formData.get('ram')
    };
    
    const payload = {
      pcNumber: formData.get('pcNumber'),
      pcName: formData.get('pcName'),
      branchId: pcModal.branch.id,
      ipAddress: formData.get('ipAddress'),
      specs: JSON.stringify(specs),
      zone: formData.get('zone'),
      hardwareNotes: formData.get('hardwareNotes')
    };

    try {
      if (pcDrawer.data) {
        await updatePc(pcDrawer.data.id, payload);
        toast.success('PC updated successfully');
      } else {
        await createPc(payload);
        toast.success('PC created successfully');
      }
      // Capture branchId before closing the drawer (avoids stale closure)
      const branchId = pcModal.branch?.id;
      setPcDrawer({ isOpen: false, data: null });
      refreshPcsList(branchId);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save PC');
    }
  };

  const handleDeletePc = async (pcId) => {
    if (window.confirm('Are you sure you want to delete this PC? This action is soft-deleted.')) {
      try {
        await deletePc(pcId);
        toast.success('PC deleted successfully');
        refreshPcsList(pcModal.branch?.id);
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to delete PC');
      }
    }
  };

  return (
    <div className="settings-page space-y-6">
      <PageHeader
        title="Settings & Configurations"
        subtitle="Manage branches, PC fleet allocation, operator permission profiles, and system audit trails."
        icon="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        badge="SUPER ADMIN ONLY"
      />

      <div className="settings-layout">
        {/* Sidebar Nav */}
        <div className="settings-sidebar">
          <nav className="settings-nav">
            <button 
              className={`nav-item w-full ${activeTab === 'branches' ? 'active' : ''}`} 
              onClick={() => setActiveTab('branches')}
            >
              <Store size={16} /> Branches & Locations
            </button>
            <button 
              className={`nav-item w-full ${activeTab === 'operators' ? 'active' : ''}`} 
              onClick={() => setActiveTab('operators')}
            >
              <Users size={16} /> Operators & Access
            </button>
            <button 
              className={`nav-item w-full ${activeTab === 'audit' ? 'active' : ''}`} 
              onClick={() => setActiveTab('audit')}
            >
              <Activity size={16} /> System Audit Logs
            </button>
          </nav>
        </div>

        {/* Content Pane */}
        <div className="settings-content">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
              <p className="text-text-2 text-xs font-mono">LOADING CONFIGURATIONS...</p>
            </div>
          ) : (
            <>
              {/* BRANCHES TAB */}
              {activeTab === 'branches' && (
                <div className="tab-pane fade-in space-y-4">
                  <div className="pane-header">
                    <div>
                      <h2>Branches & Locations</h2>
                      <p className="text-text-2 text-xs mt-1">Configure physical gaming hubs, operating times, and PC fleets.</p>
                    </div>
                    <button 
                      className="btn-primary flex items-center gap-2 text-xs shadow-lg shadow-accent/25" 
                      onClick={() => setBranchDrawer({ isOpen: true, data: null })}
                    >
                      <Plus size={14} /> NEW BRANCH
                    </button>
                  </div>
                  
                  <div className="table-container overflow-x-auto">
                    <table className="data-table text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          <th>Branch Name</th>
                          <th>Location Address</th>
                          <th>Operating Hours</th>
                          <th>Status</th>
                          <th className="w-16"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {branches.map(b => (
                          <tr key={b.id} className="hover:bg-bg-3/20 transition-colors">
                            <td className="font-semibold text-text font-heading text-sm">{b.name}</td>
                            <td className="text-text-2">
                              <span className="flex items-center gap-1.5"><MapPin size={13} className="text-text-3" /> {b.address || 'No address added'}</span>
                            </td>
                            <td className="text-text-2">
                              <span className="flex items-center gap-1.5"><Clock size={13} className="text-text-3" /> {b.openingTime} - {b.closingTime}</span>
                            </td>
                            <td>
                              <span className={`status-badge ${b.status?.toLowerCase()}`}>{b.status}</span>
                            </td>
                            <td className="text-right relative">
                              <button 
                                className="icon-btn hover:text-accent" 
                                onClick={(e) => toggleDropdown(e, `branch-${b.id}`)}
                              >
                                <MoreVertical size={14} />
                              </button>
                              {activeDropdown === `branch-${b.id}` && (
                                <div className="dropdown-menu" style={{ top: dropdownPos.top, right: dropdownPos.right }}>
                                  <button onClick={() => { closeDropdown(); setBranchDrawer({ isOpen: true, data: b }); }}><Edit size={12} /> Edit Details</button>
                                  <button onClick={() => { closeDropdown(); openPcManager(b); }}><Monitor size={12} /> Manage PCs</button>
                                  {b.status === 'Active' ? (
                                    <button className="danger" onClick={() => { closeDropdown(); handleDeleteBranch(b.id); }}><Trash2 size={12} /> Deactivate</button>
                                  ) : (
                                    <button className="text-accent hover:bg-accent/10" onClick={() => { closeDropdown(); handleActivateBranch(b.id); }}><Check size={12} /> Activate</button>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* OPERATORS TAB */}
              {activeTab === 'operators' && (
                <div className="tab-pane fade-in space-y-4">
                  <div className="pane-header">
                    <div>
                      <h2>Operators & Access Control</h2>
                      <p className="text-text-2 text-xs mt-1">Manage gaming operator accounts and control dashboard menu access.</p>
                    </div>
                    <button 
                      className="btn-primary flex items-center gap-2 text-xs shadow-lg shadow-accent/25" 
                      onClick={() => setOperatorDrawer({ isOpen: true, data: null })}
                    >
                      <Plus size={14} /> NEW OPERATOR
                    </button>
                  </div>

                  <div className="table-container overflow-x-auto">
                    <table className="data-table text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          <th>Operator Full Name</th>
                          <th>Username</th>
                          <th>Assigned Branch</th>
                          <th>Status</th>
                          <th className="w-16"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {operators.map(o => (
                          <tr key={o.id} className="hover:bg-bg-3/20 transition-colors">
                            <td className="font-semibold text-text">
                              <div className="flex items-center gap-2.5">
                                <div className="avatar font-mono">{o.fullName ? o.fullName[0].toUpperCase() : '?'}</div>
                                <span>{o.fullName}</span>
                              </div>
                            </td>
                            <td className="text-text-2 font-mono">@{o.username}</td>
                            <td className="text-text-2">{o.branchName}</td>
                            <td>
                              <span className={`status-badge ${o.status?.toLowerCase()}`}>{o.status}</span>
                            </td>
                            <td className="text-right relative">
                              <button 
                                className="icon-btn hover:text-accent" 
                                onClick={(e) => toggleDropdown(e, `op-${o.id}`)}
                              >
                                <MoreVertical size={14} />
                              </button>
                              {activeDropdown === `op-${o.id}` && (
                                <div className="dropdown-menu" style={{ top: dropdownPos.top, right: dropdownPos.right }}>
                                  <button onClick={() => { closeDropdown(); setOperatorDrawer({ isOpen: true, data: o }); }}><Edit size={12} /> Edit operator</button>
                                  {o.status === 'Active' ? (
                                    <button className="danger" onClick={() => { closeDropdown(); handleDeleteOperator(o.id); }}><Trash2 size={12} /> Disable Account</button>
                                  ) : (
                                    <>
                                      <button className="text-accent hover:bg-accent/10" onClick={() => { closeDropdown(); handleActivateOperator(o.id); }}><Check size={12} /> Enable Account</button>
                                      <button className="danger" onClick={() => { closeDropdown(); handleDeleteOperatorPermanent(o.id); }}><Trash2 size={12} /> Delete Permanently</button>
                                    </>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* AUDIT LOGS TAB */}
              {activeTab === 'audit' && (
                <div className="tab-pane fade-in space-y-4">
                  <div className="pane-header">
                    <div>
                      <h2>System Audit Logs</h2>
                      <p className="text-text-2 text-xs mt-1">Immutable security ledger capturing operator logins, checkouts, and adjustments.</p>
                    </div>
                  </div>

                  <div className="table-container overflow-x-auto max-h-[500px] scrollbar-thin">
                    <table className="data-table text-xs">
                      <thead className="sticky top-0 z-10">
                        <tr className="border-b border-border">
                          <th>Timestamp</th>
                          <th>Staff User</th>
                          <th>Action Code</th>
                          <th>Target Entity</th>
                          <th>IP Address</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {auditLogs.map(log => (
                          <tr key={log.id} className="hover:bg-bg-3/20 transition-colors">
                            <td className="text-text-2 font-mono text-[10px] whitespace-nowrap">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td className="font-semibold text-text">{log.userName || 'System'}</td>
                            <td>
                              <span className={`action-badge ${log.action?.toLowerCase()?.includes('create') ? 'create' : log.action?.toLowerCase()?.includes('delete') ? 'delete' : log.action?.toLowerCase()?.includes('update') ? 'update' : log.action?.toLowerCase()?.includes('login') ? 'login' : log.action?.toLowerCase()?.includes('logout') ? 'logout' : ''}`}>
                                {log.action}
                              </span>
                            </td>
                            <td className="text-text-2">
                              {log.targetType ? `${log.targetType}` : '-'}
                              {log.details && <span className="text-[10px] block text-text-3 font-mono mt-0.5">{log.details}</span>}
                            </td>
                            <td className="text-text-2 font-mono text-[10px]">{log.ipAddress || '127.0.0.1'}</td>
                          </tr>
                        ))}
                        {auditLogs.length === 0 && (
                          <tr>
                            <td colSpan="5" className="text-center py-8 text-text-3 font-mono">
                              No logs recorded.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* BRANCH DRAWER — key forces form remount when switching between different branches */}
      <Drawer
        isOpen={branchDrawer.isOpen}
        onClose={() => setBranchDrawer({ isOpen: false, data: null })}
        title={branchDrawer.data ? 'Update Branch Settings' : 'Create Branch Location'}
        width="450px"
      >
        <form key={branchDrawer.data?.id || 'new-branch'} onSubmit={handleSaveBranch} className="form-stack">
          <div className="form-group">
            <label>Branch Name *</label>
            <input 
              name="name" 
              required 
              defaultValue={branchDrawer.data?.name} 
              className="form-control" 
              placeholder="e.g. Apple Esports VIP"
            />
          </div>
          
          <div className="form-group">
            <label>Address / Location</label>
            <textarea 
              name="address" 
              rows="3" 
              defaultValue={branchDrawer.data?.address} 
              className="form-control" 
              placeholder="Full location coordinates..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label>Opening Time *</label>
              <input 
                type="time" 
                name="openingTime" 
                required 
                defaultValue={branchDrawer.data?.openingTime || '10:00'} 
                className="form-control" 
              />
            </div>
            
            <div className="form-group">
              <label>Closing Time *</label>
              <input 
                type="time" 
                name="closingTime" 
                required 
                defaultValue={branchDrawer.data?.closingTime || '02:00'} 
                className="form-control" 
              />
            </div>
          </div>
          
          <div className="drawer-footer pt-4">
            <button type="submit" className="btn-primary w-full flex justify-center items-center gap-2 font-heading tracking-wider">
              <Save size={16} /> SAVE LOCATION
            </button>
          </div>
        </form>
      </Drawer>

      {/* OPERATOR DRAWER */}
      <Drawer
        isOpen={operatorDrawer.isOpen}
        onClose={() => setOperatorDrawer({ isOpen: false, data: null })}
        title={operatorDrawer.data ? 'Update Operator Profile' : 'Register Operator Account'}
        width="650px"
      >
        <OperatorForm 
          initialData={operatorDrawer.data} 
          branches={branches}
          onSave={async (payload) => {
            try {
              if (operatorDrawer.data) {
                await updateOperator(operatorDrawer.data.id, payload);
                toast.success('Operator profile updated');
              } else {
                await createOperator(payload);
                toast.success('Operator registered successfully');
              }
              setOperatorDrawer({ isOpen: false, data: null });
              fetchData();
            } catch (err) {
              toast.error(err.response?.data?.error || 'Failed to save operator profile');
            }
          }}
        />
      </Drawer>

      {/* PC FLEET MANAGER MODAL */}
      {pcModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[990]">
          <div className="bg-bg-2 border border-border rounded-lg shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-bg-3 flex items-center justify-between">
              <div>
                <h3 className="font-heading text-lg font-bold text-text uppercase tracking-wider flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-accent" />
                  Manage PC Fleet — {pcModal.branch?.name}
                </h3>
                <p className="text-text-2 text-xs mt-0.5">Define gaming rigs, zones, specs, and local configurations</p>
              </div>
              <button 
                onClick={() => setPcModal({ isOpen: false, branch: null, pcs: [], loading: false })}
                className="text-text-2 hover:text-neon-red p-1 rounded hover:bg-neon-red/10 transition-colors"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-xs bg-accent/5 border border-accent/20 px-3 py-1.5 rounded text-accent">
                  <Info className="w-4 h-4" />
                  PC number must be unique within this branch context.
                </div>
                <button 
                  onClick={() => setPcDrawer({ isOpen: true, data: null })}
                  className="btn-primary flex items-center gap-1.5 text-[11px] font-bold uppercase py-1.5 px-3"
                >
                  <Plus size={13} /> ADD PC RIG
                </button>
              </div>

              {pcModal.loading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-2">
                  <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                  <p className="text-text-3 font-mono text-[10px]">SYNCING PC FLEET STATE...</p>
                </div>
              ) : (
                <div className="table-container overflow-x-auto text-[11px]">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Rig / No</th>
                        <th>Specs</th>
                        <th>Network Zone</th>
                        <th>IP Address</th>
                        <th>Hardware Notes</th>
                        <th>Status</th>
                        <th className="w-16">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {pcModal.pcs.map(p => {
                        let parsedSpecs = {};
                        try {
                          parsedSpecs = typeof p.specs === 'string' ? JSON.parse(p.specs) : (p.specs || {});
                        } catch (e) {
                          parsedSpecs = {};
                        }

                        return (
                          <tr key={p.id}>
                            <td className="font-semibold text-text font-heading text-xs">
                              {p.pcNumber} {p.pcName && p.pcName !== p.pcNumber && <span className="text-text-3">({p.pcName})</span>}
                            </td>
                            <td className="text-text-2 max-w-[120px] truncate">
                              {parsedSpecs.gpu || parsedSpecs.cpu ? (
                                <span>{parsedSpecs.gpu || '-'} / {parsedSpecs.cpu || '-'} {parsedSpecs.ram ? `(${parsedSpecs.ram}G)` : ''}</span>
                              ) : 'N/A'}
                            </td>
                            <td>
                              <span className="px-2 py-0.5 bg-bg-3 rounded border border-border text-text-2">{p.zone || 'Standard'}</span>
                            </td>
                            <td className="text-text-2 font-mono">{p.ipAddress || '-'}</td>
                            <td className="text-text-2 max-w-[120px] truncate">{p.hardwareNotes || '-'}</td>
                            <td>
                              <span className={`status-badge ${p.state?.toLowerCase() === 'idle' ? 'active' : 'suspended'}`}>
                                {p.state}
                              </span>
                            </td>
                            <td className="flex items-center gap-1">
                              <button 
                                onClick={() => setPcDrawer({ isOpen: true, data: p })}
                                className="icon-btn hover:text-accent p-1"
                                title="Edit specs"
                              >
                                <Edit size={12} />
                              </button>
                              <button 
                                onClick={() => handleDeletePc(p.id)}
                                className="icon-btn text-neon-red hover:bg-neon-red/10 p-1"
                                title="Delete PC"
                              >
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {pcModal.pcs.length === 0 && (
                        <tr>
                          <td colSpan="7" className="text-center py-8 text-text-3 font-mono">
                            No PC stations configured for this branch. Click 'Add PC Rig' to get started.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* NESTED PC CREATE/EDIT DRAWER — key forces form remount per PC */}
      <Drawer
        isOpen={pcDrawer.isOpen}
        onClose={() => setPcDrawer({ isOpen: false, data: null })}
        title={pcDrawer.data ? 'Update PC Rig Details' : 'Register PC Rig'}
        width="400px"
      >
        <form key={pcDrawer.data?.id || 'new-pc'} onSubmit={handleSavePc} className="form-stack text-xs">
          <div className="form-group">
            <label>PC ID / Station Number *</label>
            <input 
              name="pcNumber" 
              required 
              defaultValue={pcDrawer.data?.pcNumber} 
              className="form-control" 
              placeholder="e.g. PC-01"
            />
          </div>
          
          <div className="form-group">
            <label>Friendly Name</label>
            <input 
              name="pcName" 
              defaultValue={pcDrawer.data?.pcName} 
              className="form-control" 
              placeholder="e.g. RTX 4090 VIP Rig"
            />
          </div>

          <div className="form-group">
            <label>Zone / Tier</label>
            <select 
              name="zone" 
              defaultValue={pcDrawer.data?.zone || 'Standard'} 
              className="form-control"
            >
              <option value="Standard">Standard Area</option>
              <option value="VIP">VIP Lounge</option>
              <option value="Console">Console Room</option>
              <option value="Streaming">Streaming Booth</option>
            </select>
          </div>

          <div className="form-group">
            <label>IP Address</label>
            <input 
              name="ipAddress" 
              defaultValue={pcDrawer.data?.ipAddress} 
              className="form-control" 
              placeholder="e.g. 192.168.1.100"
            />
          </div>

          <div className="border-t border-border pt-3 mt-3">
            <h4 className="font-semibold text-text uppercase tracking-wider text-[10px] mb-2 text-accent">Specifications</h4>
            
            {(() => {
              let specs = {};
              try {
                specs = typeof pcDrawer.data?.specs === 'string' ? JSON.parse(pcDrawer.data.specs) : (pcDrawer.data?.specs || {});
              } catch (e) {
                specs = {};
              }
              
              return (
                <div className="grid grid-cols-3 gap-2">
                  <div className="form-group">
                    <label>GPU</label>
                    <input name="gpu" defaultValue={specs.gpu} className="form-control text-[10px] px-2" placeholder="e.g. RTX 4070" />
                  </div>
                  <div className="form-group">
                    <label>CPU</label>
                    <input name="cpu" defaultValue={specs.cpu} className="form-control text-[10px] px-2" placeholder="e.g. i7-14700" />
                  </div>
                  <div className="form-group">
                    <label>RAM (GB)</label>
                    <input name="ram" defaultValue={specs.ram} className="form-control text-[10px] px-2" placeholder="e.g. 32" />
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="form-group">
            <label>Hardware Notes</label>
            <textarea 
              name="hardwareNotes" 
              rows="2" 
              defaultValue={pcDrawer.data?.hardwareNotes} 
              className="form-control" 
              placeholder="Faulty key/specs updates..."
            />
          </div>

          <div className="drawer-footer pt-4">
            <button type="submit" className="btn-primary w-full flex justify-center items-center gap-2">
              <Save size={16} /> SAVE PC CONFIG
            </button>
          </div>
        </form>
      </Drawer>

    </div>
  );
}

function OperatorForm({ initialData, branches, onSave }) {
  const [matrix, setMatrix] = useState({});
  const toast = useToast();

  useEffect(() => {
    if (initialData?.dashboardPermissions) {
      try {
        const perms = typeof initialData.dashboardPermissions === 'string' 
          ? JSON.parse(initialData.dashboardPermissions) 
          : initialData.dashboardPermissions;
        setMatrix(perms || {});
      } catch (e) {
        setMatrix({});
      }
    } else {
      // Default permissions for new operators
      const defaults = {};
      PERMISSION_KEYS.forEach(k => {
        defaults[k.id] = k.id !== 'pc_status' && k.id !== 'eod' && k.id !== 'settings';
      });
      setMatrix(defaults);
    }
  }, [initialData]);

  const togglePermission = (permId) => {
    setMatrix(prev => ({
      ...prev,
      [permId]: !prev[permId]
    }));
  };

  const handleAllToggle = (val) => {
    const updated = {};
    PERMISSION_KEYS.forEach(k => {
      updated[k.id] = val;
    });
    setMatrix(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const password = formData.get('password');
    
    const payload = {
      fullName: formData.get('fullName'),
      username: formData.get('username'),
      password: password,
      branchId: formData.get('branchId'),
      dashboardPermissions: JSON.stringify(matrix)
    };

    if (!initialData && !password) {
      toast.error('Password is required for new operator accounts.');
      return;
    }

    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="form-stack flex flex-col h-full text-xs">
      <div className="grid grid-cols-2 gap-4">
        <div className="form-group">
          <label>Full Name *</label>
          <input 
            name="fullName" 
            required 
            defaultValue={initialData?.fullName} 
            className="form-control" 
            placeholder="e.g. John Operator"
          />
        </div>
        
        <div className="form-group">
          <label>Username *</label>
          <input 
            name="username" 
            required 
            defaultValue={initialData?.username} 
            className="form-control" 
            placeholder="e.g. joperator"
          />
        </div>
        
        <div className="form-group">
          <label>Password {initialData && <span className="text-text-3 font-normal">(Leave blank to keep current)</span>}</label>
          <input 
            type="password" 
            name="password" 
            className="form-control" 
            placeholder={initialData ? '••••••••' : 'Required password'} 
          />
        </div>
        
        <div className="form-group">
          <label>Assign to Branch Location *</label>
          <select name="branchId" required defaultValue={initialData?.branchId} className="form-control">
            <option value="">Select Branch...</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-t border-border pt-4 mt-4 flex-1">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-heading text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-accent" />
            Dashboard Menu Permissions Matrix
          </h4>
          <div className="flex gap-2">
            <button 
              type="button" 
              onClick={() => handleAllToggle(true)}
              className="text-[10px] text-accent hover:underline font-semibold"
            >
              Select All
            </button>
            <span className="text-text-3">|</span>
            <button 
              type="button" 
              onClick={() => handleAllToggle(false)}
              className="text-[10px] text-text-3 hover:underline font-semibold"
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="matrix-table-container scrollbar-thin max-h-[300px] overflow-y-auto">
          <table className="matrix-table text-xs">
            <thead>
              <tr className="border-b border-border bg-bg-3">
                <th className="text-left w-12 text-center"><Check className="w-3.5 h-3.5 mx-auto" /></th>
                <th className="text-left">Dashboard Modules</th>
                <th className="text-left text-text-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {PERMISSION_KEYS.map(k => (
                <tr 
                  key={k.id} 
                  className="hover:bg-bg-3/20 cursor-pointer"
                  onClick={() => togglePermission(k.id)}
                >
                  <td className="text-center" onClick={(e) => e.stopPropagation()}>
                    <label className="checkbox-wrapper">
                      <input 
                        type="checkbox" 
                        checked={!!matrix[k.id]}
                        onChange={() => togglePermission(k.id)}
                      />
                      <span className="custom-checkbox"></span>
                    </label>
                  </td>
                  <td className="font-semibold text-text">{k.label}</td>
                  <td className="text-text-2 font-mono text-[10px]">{k.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="drawer-footer pt-4 mt-6">
        <button type="submit" className="btn-primary w-full flex justify-center items-center gap-2 font-heading tracking-wider">
          <Save size={16} /> SAVE OPERATOR ACCESS
        </button>
      </div>
    </form>
  );
}
