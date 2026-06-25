import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, Wallet, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import api from '../../../config/api';
import { useToast } from '../../../components/ui/Toast';

export default function MemberTimeSelectionScreen() {
  const { pcId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [isStarting, setIsStarting] = useState(false);

  const RATE_PER_HOUR = 100; // Example static rate, ideally fetched from backend
  const expectedAmount = (durationMinutes / 60) * RATE_PER_HOUR;

  useEffect(() => {
    const storedProfile = JSON.parse(localStorage.getItem('memberProfile') || 'null');
    if (!storedProfile) {
      navigate(`/pc-overlay/${pcId}/login`);
      return;
    }
    setProfile(storedProfile);
  }, [navigate, pcId]);

  const handleStartSession = async () => {
    if (!profile) return;
    
    // Quick validation
    if (profile.gamingBalance < expectedAmount) {
      showToast('Insufficient gaming balance', 'error');
      return;
    }

    setIsStarting(true);
    const memberToken = localStorage.getItem('memberToken');

    try {
      const res = await api.post(
        '/sessions/start',
        {
          pcId: pcId,
          memberId: profile.memberId,
          customerName: profile.fullName,
          durationMinutes: durationMinutes,
          packageName: 'Member Session',
          expectedAmount: expectedAmount,
        },
        {
          headers: {
            Authorization: `Bearer ${memberToken}`,
            // In a real scenario, we might need X-Branch-Id if the backend requires it. 
            // For now, the backend will resolve the branch from the pcId if possible.
          },
        }
      );

      if (res.data.success) {
        showToast('Session started successfully!', 'success');
        // Once started, navigate back to the main overlay screen
        // The SignalR connection should pick up the active session.
        navigate(`/pc-overlay/${pcId}/`);
      } else {
        showToast(res.data.error || 'Failed to start session', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to start session', 'error');
    } finally {
      setIsStarting(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate(`/pc-overlay/${pcId}/`)}
          className="text-text-3 hover:text-text transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-heading text-xl font-bold text-text uppercase tracking-wider">Start Session</h2>
      </div>

      <div className="bg-bg-3 border border-border p-4 rounded-xl mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-text-3 font-heading uppercase tracking-widest text-xs font-bold">Member</span>
          <Wallet className="w-4 h-4 text-accent" />
        </div>
        <p className="font-bold text-text text-lg">{profile.fullName}</p>
        <p className="text-text-2 font-mono text-xs mb-4">{profile.memberNumber}</p>
        
        <div className="flex justify-between items-center bg-bg/50 p-3 rounded-lg border border-border/50">
          <span className="text-text-2 text-sm font-body">Gaming Balance</span>
          <span className="font-mono font-bold text-text text-lg">₹{profile.gamingBalance.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <h3 className="font-heading text-sm font-bold text-text-2 uppercase tracking-widest mb-4">Select Duration</h3>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[30, 60, 120, 180].map((mins) => (
            <button
              key={mins}
              onClick={() => setDurationMinutes(mins)}
              className={`p-3 rounded-lg border transition-all flex flex-col items-center justify-center gap-1 ${
                durationMinutes === mins 
                  ? 'bg-accent/20 border-accent shadow-[0_0_10px_rgba(220,38,38,0.2)]' 
                  : 'bg-bg-3 border-border hover:border-text-3'
              }`}
            >
              <Clock className={`w-5 h-5 ${durationMinutes === mins ? 'text-accent' : 'text-text-3'}`} />
              <span className={`font-mono font-bold ${durationMinutes === mins ? 'text-text' : 'text-text-2'}`}>
                {mins / 60} {mins === 30 ? 'Min' : 'Hr'}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-auto bg-bg-3 p-4 rounded-xl border border-border">
          <div className="flex justify-between items-center mb-4">
            <span className="text-text-2 text-sm font-body">Estimated Cost</span>
            <span className="font-mono font-bold text-text text-xl">₹{expectedAmount.toFixed(2)}</span>
          </div>

          <button
            onClick={handleStartSession}
            disabled={isStarting || profile.gamingBalance < expectedAmount}
            className="w-full bg-accent hover:bg-accent-dark text-white font-semibold py-3 px-4 rounded-sm transition-all duration-200 flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.3)] disabled:opacity-50 disabled:cursor-not-allowed border border-accent/50 gap-2"
          >
            {isStarting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span className="font-heading text-sm tracking-wider uppercase font-bold">Start Now</span>
              </>
            )}
          </button>
          
          {profile.gamingBalance < expectedAmount && (
            <p className="text-neon-orange text-xs text-center mt-3 font-body">Insufficient balance for this duration.</p>
          )}
        </div>
      </div>
    </div>
  );
}
