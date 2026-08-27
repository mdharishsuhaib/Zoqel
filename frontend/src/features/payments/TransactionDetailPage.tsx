import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, User, CreditCard, Activity, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { getTransaction, getRecoveryCase } from '../../services/recoveryService';
import { getAuditEvents } from '../../services/auditService';
import { MOCK_AUDIT_EVENTS } from '../../data/audit';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatLakhsSymbol, formatDateTime, getFailureReasonLabel, formatTxnId } from '../../utils/format';
import { RecoveryTimeline } from '../../components/recovery/RecoveryTimeline';
import { DecisionEvidence } from '../../components/recovery/DecisionEvidence';
import { PolicyCheckPanel } from '../../components/recovery/PolicyCheck';

export function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: txn } = useQuery({ queryKey: ['txn', id], queryFn: () => getTransaction(id!) });
  const { data: rc } = useQuery({ queryKey: ['rc', id], queryFn: () => getRecoveryCase(id!) });
  const { data: rawEvents } = useQuery({ queryKey: ['audit', id], queryFn: () => getAuditEvents(id!) });

  const events = rawEvents?.length ? rawEvents : MOCK_AUDIT_EVENTS.filter(e => e.transactionId === 'TXN-91823').map((e, i) => ({ ...e, transactionId: id!, id: i + 1000 }));

  if (!txn) return <div className="p-8">Loading...</div>;

  const isSuccess = txn.id === 'TXN-91823' || txn.status === 'RECOVERED';
  const isEscalated = txn.id === 'TXN-82193' || txn.status === 'ESCALATED';

  const evidenceItems = isEscalated ? [
    { label: 'High transaction value exceeds limit', positive: false },
    { label: '3 previous failures detected', positive: false },
    { label: 'REPEATED_FAILURE pattern matched', positive: false },
    { label: 'Low recovery probability (< 50%)', positive: false },
  ] : [
    { label: '8 previous successful payments', positive: true },
    { label: 'No previous failures detected', positive: true },
    { label: 'BANK_TIMEOUT eligible for retry', positive: true },
    { label: 'Amount within INR 10,000 auto-limit', positive: true },
    { label: 'Recovery probability 87% (> 75%)', positive: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-[#F2F4F7] text-[#667085] transition-colors"><ArrowLeft size={20} /></button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[28px] font-bold text-[#101828] leading-tight">{formatTxnId(txn.id)}</h1>
            <StatusBadge status={txn.status} className="text-sm px-3 py-1" />
          </div>
          <p className="text-sm text-[#667085] mt-1">Initiated on {formatDateTime(txn.initiatedAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-[#E4E7EC] p-6 shadow-card grid grid-cols-2 gap-8">
            <div>
              <div className="text-[13px] font-semibold text-[#667085] uppercase tracking-wide mb-4 flex items-center gap-2"><CreditCard size={16}/> Transaction</div>
              <div className="space-y-4 text-sm">
                <div><span className="text-[#667085] block mb-1">Amount</span><span className="font-semibold text-lg">{formatLakhsSymbol(txn.amountPaise)}</span></div>
                <div><span className="text-[#667085] block mb-1">Method</span><span className="font-medium">{txn.paymentMethod}</span></div>
                <div><span className="text-[#667085] block mb-1">Failure Reason</span><span className="font-medium text-danger">{txn.failureReason ? getFailureReasonLabel(txn.failureReason) : 'N/A'}</span></div>
              </div>
            </div>
            <div>
              <div className="text-[13px] font-semibold text-[#667085] uppercase tracking-wide mb-4 flex items-center gap-2"><User size={16}/> Customer Signal</div>
              <div className="space-y-4 text-sm">
                <div><span className="text-[#667085] block mb-1">Customer</span><span className="font-medium">{txn.customer.name} ({txn.customer.email})</span></div>
                <div><span className="text-[#667085] block mb-1">Lifetime Value</span><span className="font-medium">{formatLakhsSymbol(txn.customer.lifetimeValuePaise)}</span></div>
                <div>
                  <span className="text-[#667085] block mb-1">Risk Tier</span>
                  <StatusBadge status={txn.customer.riskTier} />
                </div>
              </div>
            </div>
          </div>

          <RecoveryTimeline transactionId={txn.id} recoveryCase={rc ?? null} auditEvents={events ?? []} />
        </div>

        {/* Right Column */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-[#E4E7EC] p-6 shadow-card">
            <div className="text-[13px] font-semibold text-[#667085] uppercase tracking-wide mb-4 flex items-center gap-2"><Activity size={16}/> Zoqel Decision</div>
            
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2"><span className="text-[#475467]">Recovery Probability</span><span className="font-bold text-[#101828]">{isEscalated ? '42%' : '87%'}</span></div>
              <div className="h-2 bg-[#F2F4F7] rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${isEscalated ? 'bg-warning' : 'bg-success'}`} style={{ width: isEscalated ? '42%' : '87%' }} />
              </div>
            </div>

            <div className={`mb-6 p-4 rounded-xl border ${isEscalated ? 'bg-[#FFFAEB] border-[#FEDF89]' : 'bg-[#EFF8FF] border-[#B2DDFF]'}`}>
              <div className="text-xs font-semibold mb-2 uppercase tracking-wide text-[#667085]">Recommendation</div>
              <div className={`text-2xl font-bold mb-1 ${isEscalated ? 'text-[#B54708]' : 'text-[#1570EF]'}`}>{isEscalated ? 'ESCALATE' : 'RETRY'}</div>
              <div className={`text-sm ${isEscalated ? 'text-[#B54708]' : 'text-[#1570EF]'}`}>Confidence: {isEscalated ? '42%' : '87%'}</div>
            </div>
            
            <p className="text-sm text-[#475467] leading-relaxed">
              {rc?.agentReason || (isEscalated ? 'Repeated failure pattern with low recovery probability.' : 'Temporary bank timeout with strong payment history — high probability retry candidate.')}
            </p>
          </div>

          <DecisionEvidence items={evidenceItems} />
          
          <PolicyCheckPanel recoveryCase={rc ?? null} />

          {isSuccess && (
            <div className="bg-[#ECFDF3] border border-[#ABEFC6] rounded-xl p-5 flex items-start gap-3">
              <CheckCircle2 className="text-success mt-0.5 shrink-0" size={20} />
              <div>
                <div className="text-[#067647] font-bold text-lg mb-1">{formatLakhsSymbol(txn.amountPaise)} RECOVERED</div>
                <div className="text-[#067647] text-sm opacity-90">Payment successfully settled automatically.</div>
              </div>
            </div>
          )}

          {isEscalated && (
            <div className="bg-[#FFFAEB] border border-[#FEDF89] rounded-xl p-5 flex items-start gap-3">
              <AlertTriangle className="text-warning mt-0.5 shrink-0" size={20} />
              <div>
                <div className="text-[#B54708] font-bold text-lg mb-1">ESCALATED TO HUMAN</div>
                <div className="text-[#B54708] text-sm opacity-90">No automatic action taken. Safe block applied.</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-white rounded-xl border border-[#E4E7EC] shadow-card">
        <div className="px-6 py-4 border-b border-[#E4E7EC]">
          <h2 className="text-lg font-semibold text-[#101828]">Full Audit Trail</h2>
        </div>
        <div className="p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F9FAFB] text-[#667085]">
              <tr>
                <th className="px-6 py-3 font-medium w-48">Time</th>
                <th className="px-6 py-3 font-medium w-40">Actor</th>
                <th className="px-6 py-3 font-medium w-56">Event</th>
                <th className="px-6 py-3 font-medium">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EC]">
              {events?.map(evt => (
                <tr key={evt.id} className="hover:bg-[#F9FAFB]">
                  <td className="px-6 py-3 text-[#667085] whitespace-nowrap">{formatDateTime(evt.occurredAt)}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase text-white ${evt.actor === 'Risk Engine' ? 'bg-danger' : evt.actor === 'AI Agent' ? 'bg-[#2B84EA]' : evt.actor === 'Policy Engine' ? 'bg-warning' : evt.actor === 'Simulator' ? 'bg-success' : evt.actor === 'ML Engine' ? 'bg-[#8B5CF6]' : 'bg-[#111827]'}`}>
                      {evt.actor}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-medium text-[#101828]">{evt.eventType}</td>
                  <td className="px-6 py-3 text-[#475467]">{evt.eventDetail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
