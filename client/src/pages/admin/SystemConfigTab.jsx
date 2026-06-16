import React, { useState, useEffect } from 'react';
import { getSystemConfigs, saveSystemConfig } from '../../api/settings.api';
import { useToast } from '../../components/ui/Toast';
import { Save } from 'lucide-react';

export default function SystemConfigTab() {
  const [configs, setConfigs] = useState({});
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const res = await getSystemConfigs();
      const configMap = {};
      res.data?.forEach(c => {
        configMap[c.configKey] = c.configValue;
      });
      setConfigs(configMap);
    } catch (err) {
      toast.error('Failed to load system configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      pricing: {
        baseRate: Number(formData.get('baseRate')),
        taxPercentage: Number(formData.get('taxPercentage'))
      },
      reservation: {
        gracePeriodMinutes: Number(formData.get('gracePeriodMinutes')),
        maxAdvanceDays: Number(formData.get('maxAdvanceDays'))
      },
      loyalty: {
        pointsPerRupee: Number(formData.get('pointsPerRupee')),
        minRedemption: Number(formData.get('minRedemption'))
      }
    };

    try {
      await saveSystemConfig({
        configKey: 'global_system_rules',
        configValue: data,
        description: 'Global system rules for pricing, reservations, and loyalty'
      });
      toast.success('System configuration saved successfully');
    } catch (err) {
      toast.error('Failed to save configurations');
    }
  };

  if (loading) return <div className="text-center py-10 text-text-2">Loading configs...</div>;

  const currentRules = configs['global_system_rules'] || {
    pricing: { baseRate: 100, taxPercentage: 18 },
    reservation: { gracePeriodMinutes: 15, maxAdvanceDays: 7 },
    loyalty: { pointsPerRupee: 0.1, minRedemption: 100 }
  };

  return (
    <div className="tab-pane fade-in space-y-6">
      <div className="pane-header">
        <div>
          <h2>System Configuration</h2>
          <p className="text-text-2 text-xs mt-1">Configure session pricing rules, taxation, and global loyalty settings.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-bg-2 p-5 rounded-lg border border-border">
          <h3 className="text-sm font-semibold mb-4 text-accent">Pricing & Taxation</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label>Default Base Rate (₹/hr)</label>
              <input type="number" name="baseRate" defaultValue={currentRules.pricing.baseRate} className="form-control" />
            </div>
            <div className="form-group">
              <label>Tax Percentage (%)</label>
              <input type="number" name="taxPercentage" defaultValue={currentRules.pricing.taxPercentage} className="form-control" />
            </div>
          </div>
        </div>

        <div className="bg-bg-2 p-5 rounded-lg border border-border">
          <h3 className="text-sm font-semibold mb-4 text-accent">Reservation Rules</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label>Grace Period (Minutes before auto-cancel)</label>
              <input type="number" name="gracePeriodMinutes" defaultValue={currentRules.reservation.gracePeriodMinutes} className="form-control" />
            </div>
            <div className="form-group">
              <label>Max Advance Booking (Days)</label>
              <input type="number" name="maxAdvanceDays" defaultValue={currentRules.reservation.maxAdvanceDays} className="form-control" />
            </div>
          </div>
        </div>

        <div className="bg-bg-2 p-5 rounded-lg border border-border">
          <h3 className="text-sm font-semibold mb-4 text-accent">Loyalty & Wallet Rules</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label>Points Per ₹ Spent</label>
              <input type="number" step="0.01" name="pointsPerRupee" defaultValue={currentRules.loyalty.pointsPerRupee} className="form-control" />
            </div>
            <div className="form-group">
              <label>Minimum Points for Redemption</label>
              <input type="number" name="minRedemption" defaultValue={currentRules.loyalty.minRedemption} className="form-control" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary flex items-center gap-2 shadow-lg shadow-accent/25">
            <Save size={14} /> SAVE CONFIGURATIONS
          </button>
        </div>
      </form>
    </div>
  );
}
