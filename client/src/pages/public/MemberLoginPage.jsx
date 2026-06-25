import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserCheck, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../../components/ui/Toast';

export default function MemberLoginPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) return;

    setIsLoading(true);
    try {
      const res = await axios.post('/api/members/login', {
        username: identifier,
        password,
      });

      if (res.data.success) {
        const data = res.data.data;
        localStorage.setItem('memberToken', data.token);
        localStorage.setItem('memberProfile', JSON.stringify({
          memberId: data.memberId,
          memberNumber: data.memberNumber,
          fullName: data.fullName,
          gamingBalance: data.gamingBalance,
          foodBalance: data.foodBalance,
        }));
        showToast(`Welcome back, ${data.fullName}!`, 'success');
        navigate('/user/member-portal');
      } else {
        showToast(res.data.error || 'Login failed', 'error');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Invalid credentials';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <button
          onClick={() => navigate('/user/select')}
          className="absolute -top-12 left-0 flex items-center gap-2 text-text-2 hover:text-text transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-heading font-semibold text-lg uppercase tracking-wider">Back</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-bg-2/80 backdrop-blur-xl border-border/60 shadow-xl shadow-black/50 p-8 hover:border-accent transition-colors duration-300"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-accent/10 border border-accent/30 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
              <UserCheck className="w-8 h-8 text-accent" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-text tracking-wide uppercase">Member Login</h1>
            <p className="text-text-2 font-body mt-2 text-sm">Access your wallet and start sessions directly.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-2 mb-2 font-body tracking-wide">MOBILE NO. OR MEMBER ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCheck className="h-5 w-5 text-text-3" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="input w-full pl-10 focus:border-accent focus:ring-accent/30"
                  placeholder="e.g. 9876543210 or MEM-2606-0001"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-2 mb-2 font-body tracking-wide">PASSWORD</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-3" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input w-full pl-10 focus:border-accent focus:ring-accent/30"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !identifier || !password}
              className="w-full bg-accent hover:bg-accent-dark text-white font-semibold py-3 px-4 rounded-sm transition-all duration-200 flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.3)] disabled:opacity-50 disabled:cursor-not-allowed border border-accent/50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="font-heading text-lg tracking-wider uppercase font-bold">Enter Portal</span>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
