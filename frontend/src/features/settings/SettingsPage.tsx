import { PageHeader } from '../../components/ui/PageHeader';
import { ShieldCheck, Server } from 'lucide-react';

export function SettingsPage() {
  return (
    <div className="space-y-8 max-w-3xl">
      <PageHeader title="Settings" subtitle="System configuration and recovery policies" />

      <section>
        <h2 className="text-lg font-semibold text-[#101828] mb-4 flex items-center gap-2"><ShieldCheck size={20} className="text-[#2B84EA]" /> Recovery Policy</h2>
        <div className="bg-white rounded-xl border border-[#E4E7EC] shadow-sm p-6 space-y-6">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-semibold text-[#344054] mb-1">Max Auto-Recovery Amount</label>
              <div className="text-xs text-[#667085] mb-2">Transactions above this amount require human review.</div>
              <input disabled value="INR 10,000" className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#E4E7EC] rounded-lg text-[#101828] font-medium" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#344054] mb-1">Max Retry Count</label>
              <div className="text-xs text-[#667085] mb-2">Maximum automatic retries per transaction.</div>
              <input disabled value="1" className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#E4E7EC] rounded-lg text-[#101828] font-medium" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#344054] mb-1">Minimum AI Confidence</label>
              <div className="text-xs text-[#667085] mb-2">Threshold for automatic execution.</div>
              <input disabled value="75%" className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#E4E7EC] rounded-lg text-[#101828] font-medium" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#344054] mb-1">Repeated Failure Block</label>
              <div className="text-xs text-[#667085] mb-2">Require review if customer has N recent failures.</div>
              <input disabled value="3" className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#E4E7EC] rounded-lg text-[#101828] font-medium" />
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
