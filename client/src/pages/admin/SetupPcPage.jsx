import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, CheckCircle, MonitorSmartphone } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

export default function SetupPcPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [pcId, setPcId] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    if (!pcId) return;

    localStorage.setItem('dedicatedPcId', pcId);
    showToast('PC Setup completed! Redirecting...', 'success');
    
    // Redirect to root, which will now catch the localStorage value
    // and redirect to the PC overlay.
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="card bg-bg-2/80 backdrop-blur-xl border-border/60 shadow-xl shadow-black/50 p-8 hover:border-accent transition-colors duration-300">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-accent/10 border border-accent/30 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
              <MonitorSmartphone className="w-8 h-8 text-accent" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-text tracking-wide uppercase">Setup Dedicated PC</h1>
            <p className="text-text-2 font-body mt-2 text-sm">Configure this device to always launch the PC Overlay.</p>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-2 mb-2 font-body tracking-wide">PC IDENTIFIER</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Monitor className="h-5 w-5 text-text-3" />
                </div>
                <input
                  type="text"
                  required
                  value={pcId}
                  onChange={(e) => setPcId(e.target.value.toUpperCase())}
                  className="input w-full pl-10 focus:border-accent focus:ring-accent/30 uppercase"
                  placeholder="e.g. CTL-PC-01"
                />
              </div>
              <p className="text-xs text-text-3 mt-2">Use the format: BRANCH-PC-NUMBER</p>
            </div>

            <button
              type="submit"
              disabled={!pcId}
              className="w-full bg-accent hover:bg-accent-dark text-white font-semibold py-3 px-4 rounded-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.3)] disabled:opacity-50 disabled:cursor-not-allowed border border-accent/50"
            >
              <CheckCircle className="w-5 h-5" />
              <span className="font-heading text-lg tracking-wider uppercase font-bold">Save Configuration</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
