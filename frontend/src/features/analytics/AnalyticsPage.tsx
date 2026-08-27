import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { PageHeader } from '../../components/ui/PageHeader';
import { REAL_ML_METRICS, REAL_BUSINESS_METRICS, RECOVERY_OUTCOMES_DATA, FAILURE_REASON_DATA } from '../../data/analytics';
import { formatLakhsSymbol } from '../../utils/format';

export function AnalyticsPage() {
  return (
    <div className="space-y-8 pb-12">
      <PageHeader title="Analytics & Evaluation" subtitle="Deep dive into ML model performance and business impact" />

      <div className="bg-[#EFF8FF] border border-[#B2DDFF] rounded-xl p-4 flex items-start gap-3">
        <div className="text-[#1570EF] font-bold">INFO</div>
        <div className="text-sm text-[#026AA2]">These metrics are evaluated on an out-of-sample test set of {REAL_BUSINESS_METRICS.testSamples} transactions representing INR {formatLakhsSymbol(REAL_BUSINESS_METRICS.revenueAtRiskPaise)} at risk.</div>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-[#101828] mb-4">ML Model Performance</h2>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Precision', value: REAL_ML_METRICS.precision, color: '#2B84EA' },
            { label: 'Recall', value: REAL_ML_METRICS.recall, color: '#3B82F6' },
            { label: 'F1 Score', value: REAL_ML_METRICS.f1, color: '#10B981' },
            { label: 'AUC-ROC', value: REAL_ML_METRICS.aucRoc, color: '#F59E0B' },
          ].map(m => (
            <div key={m.label} className="bg-white p-5 rounded-xl border border-[#E4E7EC] shadow-sm">
              <div className="text-[13px] font-semibold text-[#667085] uppercase tracking-wide mb-2">{m.label}</div>
              <div className="text-3xl font-bold text-[#101828] mb-3 tabular-nums">{m.value}%</div>
              <div className="h-2 bg-[#F2F4F7] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${m.value}%`, backgroundColor: m.color }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#101828] mb-4">Business Impact</h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-[#111827] text-white p-6 rounded-xl border border-[#1D2939] shadow-card col-span-1 flex flex-col justify-center text-center">
            <div className="text-[13px] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-2">Revenue Recovered</div>
            <div className="text-5xl font-bold text-success mb-2 tabular-nums">{formatLakhsSymbol(REAL_BUSINESS_METRICS.revenueRecoveredPaise)}</div>
            <div className="text-sm text-[#D1D5DB]">{REAL_BUSINESS_METRICS.recoveryRate}% of truly recoverable revenue</div>
          </div>
          
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl border border-[#E4E7EC] shadow-sm">
              <div className="text-sm text-[#667085] mb-1">Total Revenue at Risk</div>
              <div className="text-2xl font-bold text-[#101828] tabular-nums">{formatLakhsSymbol(REAL_BUSINESS_METRICS.revenueAtRiskPaise)}</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-[#E4E7EC] shadow-sm">
              <div className="text-sm text-[#667085] mb-1">Truly Recoverable (Ground Truth)</div>
              <div className="text-2xl font-bold text-[#101828] tabular-nums">{formatLakhsSymbol(REAL_BUSINESS_METRICS.trulyRecoverablePaise)}</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-[#E4E7EC] shadow-sm">
              <div className="text-sm text-[#667085] mb-1">Missed Opportunities (FN)</div>
              <div className="text-2xl font-bold text-danger tabular-nums">{formatLakhsSymbol(REAL_BUSINESS_METRICS.revenueMissedPaise)}</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-[#E4E7EC] shadow-sm">
              <div className="text-sm text-[#667085] mb-1">False Interventions (FP)</div>
              <div className="text-2xl font-bold text-warning tabular-nums">{formatLakhsSymbol(REAL_BUSINESS_METRICS.falselyIntervenedPaise)}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[#E4E7EC] shadow-card">
          <h2 className="text-[15px] font-semibold text-[#101828] mb-6">Recovery Outcomes Distribution</h2>
          <div className="h-64 flex items-center">
            <div className="flex-1 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={RECOVERY_OUTCOMES_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                    {RECOVERY_OUTCOMES_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 flex flex-col justify-center gap-4 pr-4">
              {RECOVERY_OUTCOMES_DATA.map(d => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }}></span>
                    <span className="text-[#475467]">{d.name}</span>
                  </div>
                  <span className="font-semibold tabular-nums">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#E4E7EC] shadow-card">
          <h2 className="text-[15px] font-semibold text-[#101828] mb-6">Failure Reasons & Base Recovery Rate</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FAILURE_REASON_DATA} layout="vertical" margin={{ left: 40, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="reason" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#667085' }} width={120} />
                <Tooltip cursor={{ fill: '#F9FAFB' }} />
                <Bar dataKey="rate" fill="#2B84EA" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}
