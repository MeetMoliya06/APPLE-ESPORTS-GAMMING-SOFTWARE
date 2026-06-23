import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, LogOut, MonitorPlay, History, ChevronRight, User, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';

export default function MemberPortalPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [idlePcs, setIdlePcs] = useState([]);
  const [selectedPc, setSelectedPc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    // Basic auth check
    if (!user || user.role !== 'member') {
      // In a real implementation you might have a better guard
      // navigate('/user/member-login');
      // return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // Setup Axios headers with token (handled by interceptor typically, but assuming standard implementation)
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      
      const [profileRes, pcsRes] = await Promise.all([
        axios.get('/api/member-portal/me', { headers }),
        axios.get('/api/member-portal/pcs/idle', { headers })
      ]);

      if (profileRes.data.success) {
        setProfile(profileRes.data.data);
      }
      
      if (pcsRes.data.success) {
        setIdlePcs(pcsRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching member data', error);
      showToast('Failed to load portal data. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSession = async () => {
    if (!selectedPc) return;
    setIsStarting(true);
    
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const res = await axios.post('/api/member-portal/sessions/start', {
        pcId: selectedPc.id
      }, { headers });

      if (res.data.success) {
        showToast(`Session started on ${selectedPc.name}! Proceed to your station.`, 'success');
        // Redirect to a live view or refresh
        fetchData();
        setSelectedPc(null);
      } else {
        showToast(res.data.error || 'Failed to start session', 'error');
      }
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to start session', 'error');
    } finally {
      setIsStarting(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-bg flex items-center justify-center text-neon-secondary animate-pulse font-outfit text-xl">Loading Portal...</div>;
  }

  return (
    <div className="min-h-screen bg-bg relative overflow-x-hidden">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neon-secondary/10 via-bg to-bg" />

      {/* Header */}
      <header className="relative z-10 glass-panel rounded-none border-t-0 border-l-0 border-r-0 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-neon-secondary/20 flex items-center justify-center border border-neon-secondary/50">
            <User className="w-6 h-6 text-neon-secondary" />
          </div>
          <div>
            <h1 className="font-outfit text-2xl font-bold text-white tracking-wide">{profile?.fullName || 'Member'}</h1>
            <p className="text-text-muted font-mono text-sm">{profile?.memberNumber || 'MEM-0000'}</p>
          </div>
        </div>
        <button 
          onClick={() => { logout(); navigate('/'); }}
          className="btn-secondary flex items-center gap-2 border-neon-danger/30 hover:bg-neon-danger/10 text-neon-danger"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-outfit">Logout</span>
        </button>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Wallet & Status */}
        <div className="space-y-6">
          {/* Wallet Card */}
          <div className="glass-panel p-6 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-white/5">
              <Wallet className="w-32 h-32" />
            </div>
            <h2 className="text-text-muted font-outfit text-sm tracking-wider uppercase mb-2">Available Balance</h2>
            <div className="font-mono text-5xl font-bold text-white mb-6">
              ₹{(profile?.walletBalance || 0).toFixed(2)}
            </div>
            
            {profile?.walletBalance < 100 && (
              <div className="bg-neon-warning/10 border border-neon-warning/30 rounded p-3 flex items-start gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-neon-warning shrink-0 mt-0.5" />
                <p className="text-xs text-neon-warning font-inter leading-relaxed">Low balance. Please recharge at the counter soon to ensure uninterrupted gaming.</p>
              </div>
            )}
            
            <button className="w-full btn-secondary text-white border-white/20 flex items-center justify-between group">
              <span className="font-outfit tracking-wide">View Transaction History</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Membership Status */}
          <div className="glass-panel p-6">
            <h3 className="font-outfit text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-neon-primary" />
              Membership Plan
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-glass-border">
                <span className="text-text-muted font-inter">Current Tier</span>
                <span className="text-white font-semibold">{profile?.membershipPlanName || 'Standard'}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-glass-border">
                <span className="text-text-muted font-inter">Hourly Rate</span>
                <span className="text-neon-success font-mono font-semibold">₹{profile?.hourlyRate || '100'}/hr</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted font-inter">Total Points</span>
                <span className="text-neon-secondary font-semibold">{profile?.totalPoints || 0} pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: PC Selection */}
        <div className="lg:col-span-2 glass-panel p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-outfit text-2xl font-bold text-white">Start Session</h2>
              <p className="text-text-muted font-inter mt-1">Select an available PC to begin your gaming session immediately.</p>
            </div>
            <div className="flex items-center gap-2 text-sm bg-black/20 px-3 py-1.5 rounded-full border border-glass-border">
              <span className="w-2 h-2 rounded-full bg-neon-success animate-pulse" />
              <span className="text-text-muted">{idlePcs.length} PCs Available</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8 overflow-y-auto pr-2 flex-1 max-h-[500px] scrollbar-thin">
            {idlePcs.map(pc => (
              <motion.div
                key={pc.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedPc(pc)}
                className={`
                  p-4 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2
                  ${selectedPc?.id === pc.id 
                    ? 'bg-neon-primary/20 border-neon-primary shadow-[0_0_15px_rgba(0,229,255,0.2)]' 
                    : 'bg-black/20 border-glass-border hover:border-white/30'}
                `}
              >
                <MonitorPlay className={`w-8 h-8 ${selectedPc?.id === pc.id ? 'text-neon-primary' : 'text-text-muted'}`} />
                <span className={`font-mono font-bold text-lg ${selectedPc?.id === pc.id ? 'text-white' : 'text-text-muted'}`}>
                  {pc.name}
                </span>
              </motion.div>
            ))}
            {idlePcs.length === 0 && (
              <div className="col-span-full py-12 text-center text-text-muted flex flex-col items-center">
                <MonitorPlay className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-outfit text-xl">No PCs are currently available.</p>
                <p className="text-sm mt-2">Please wait or check with the counter.</p>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <AnimatePresence>
            {selectedPc && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mt-auto p-4 bg-neon-primary/10 border border-neon-primary/30 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-neon-primary rounded-lg flex items-center justify-center text-bg font-bold font-mono">
                    {selectedPc.name}
                  </div>
                  <div>
                    <p className="text-sm text-text-muted font-inter">Selected Station</p>
                    <p className="text-white font-outfit font-semibold">Ready to start</p>
                  </div>
                </div>
                
                <button
                  onClick={handleStartSession}
                  disabled={isStarting}
                  className="btn-primary px-8 py-3 text-lg rounded-xl flex items-center gap-2 disabled:opacity-50"
                >
                  {isStarting ? 'Starting...' : 'Start Session Now'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
