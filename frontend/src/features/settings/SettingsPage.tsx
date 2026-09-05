import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { ShieldCheck, Server, Save, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../services/apiClient';
import { useAuth } from '../auth/AuthContext';

export function SettingsPage() {
  const { mode } = useAuth();
  const queryClient = useQueryClient();
  const isDemo = mode === 'DEMO';

  const { data: policies, isLoading } = useQuery({
    queryKey: ['policies'],
    queryFn: async () => {
      const res = await apiClient.get('/policy');
      return res.data;
    }
  });

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (policies) {
      const map: Record<string, string> = {};
      policies.forEach((p: any) => {
        map[p.ruleKey] = p.ruleValue;
      });
      setFormData(map);
    }
  }, [policies]);

  const updatePolicy = useMutation({
    mutationFn: async ({ key, value }: { key: string, value: string }) => {
      await apiClient.put(`/policy/${key}`, { value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
    }
  });

  const handleSave = async () => {
    if (isDemo) return;
    setIsSaving(true);
    try {
      for (const key of Object.keys(formData)) {
        const originalValue = policies?.find((p: any) => p.ruleKey === key)?.ruleValue;
        if (originalValue !== formData[key]) {
          await updatePolicy.mutateAsync({ key, value: formData[key] });
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (key: string, val: string) => {
    setFormData(prev => ({ ...prev, [key]: val }));
  };

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-[#2B84EA]" /></div>;

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <PageHeader title="Settings" subtitle="System configuration and recovery policies" />
        <button 
          onClick={handleSave}
          disabled={isDemo || isSaving}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isDemo 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-[#2B84EA] hover:bg-[#1E60B0] text-white shadow-sm'
          }`}
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Changes
        </button>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-[#101828] mb-4 flex items-center gap-2"><ShieldCheck size={20} className="text-[#2B84EA]" /> Recovery Policy</h2>
        <div className="bg-white rounded-xl border border-[#E4E7EC] shadow-sm p-6 space-y-6">
          {isDemo && (
            <div className="bg-[#FFFAEB] border border-[#FEDF89] text-[#B54708] p-3 rounded-lg text-sm mb-4">
              <strong>Demo Mode:</strong> Policy configuration is locked. Sign up for a full account to customize these rules.
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-semibold text-[#344054] mb-1">Max Auto-Recovery Amount (Paise)</label>
              <div className="text-xs text-[#667085] mb-2">Transactions above this amount require human review.</div>
              <input 
                disabled={isDemo} 
                value={formData['max_auto_amount_paise'] || ''} 
                onChange={(e) => handleChange('max_auto_amount_paise', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-[#101828] font-medium transition-colors ${isDemo ? 'bg-[#F9FAFB] border-[#E4E7EC] text-gray-500' : 'bg-white border-[#D0D5DD] hover:border-[#2B84EA] focus:border-[#2B84EA] focus:ring-1 focus:ring-[#2B84EA] outline-none'}`} 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#344054] mb-1">Max Retry Count</label>
              <div className="text-xs text-[#667085] mb-2">Maximum automatic retries per transaction.</div>
              <input 
                disabled={isDemo} 
                value={formData['max_retries_per_transaction'] || ''} 
                onChange={(e) => handleChange('max_retries_per_transaction', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-[#101828] font-medium transition-colors ${isDemo ? 'bg-[#F9FAFB] border-[#E4E7EC] text-gray-500' : 'bg-white border-[#D0D5DD] hover:border-[#2B84EA] focus:border-[#2B84EA] focus:ring-1 focus:ring-[#2B84EA] outline-none'}`} 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#344054] mb-1">Minimum AI Confidence</label>
              <div className="text-xs text-[#667085] mb-2">Threshold for automatic execution.</div>
              <input 
                disabled={isDemo} 
                value={formData['min_recovery_confidence'] || ''} 
                onChange={(e) => handleChange('min_recovery_confidence', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-[#101828] font-medium transition-colors ${isDemo ? 'bg-[#F9FAFB] border-[#E4E7EC] text-gray-500' : 'bg-white border-[#D0D5DD] hover:border-[#2B84EA] focus:border-[#2B84EA] focus:ring-1 focus:ring-[#2B84EA] outline-none'}`} 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#344054] mb-1">Master Auto-Recovery Switch</label>
              <div className="text-xs text-[#667085] mb-2">Set to 'true' to enable AI actions.</div>
              <select
                disabled={isDemo}
                value={formData['auto_recovery_enabled'] || 'false'}
                onChange={(e) => handleChange('auto_recovery_enabled', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-[#101828] font-medium transition-colors ${isDemo ? 'bg-[#F9FAFB] border-[#E4E7EC] text-gray-500' : 'bg-white border-[#D0D5DD] hover:border-[#2B84EA] focus:border-[#2B84EA] focus:ring-1 focus:ring-[#2B84EA] outline-none'}`}
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#101828] mb-4 flex items-center gap-2"><Server size={20} className="text-[#2B84EA]" /> System Status</h2>
        <div className="bg-white rounded-xl border border-[#E4E7EC] shadow-sm p-6">
          <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-4 mb-4">
            <div>
              <div className="font-semibold text-[#101828]">Zoqel AI Engine</div>
              <div className="text-sm text-[#667085]">v2.4.1 (Stable)</div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-[#ECFDF3] border border-[#ABEFC6] rounded-full text-[#067647] text-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-success"></span> Operational
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-[#101828]">Payment Gateway Connection</div>
              <div className="text-sm text-[#667085]">Primary: Razorpay, Secondary: Stripe</div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-[#ECFDF3] border border-[#ABEFC6] rounded-full text-[#067647] text-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-success"></span> Connected
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

