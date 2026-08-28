import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, User, CreditCard, Activity, CheckCircle2, AlertTriangle, XCircle, ShieldCheck, ShieldAlert, FileText } from 'lucide-react';
import { getTransaction, getRecoveryCase } from '../../services/recoveryService';
import { getAuditEvents } from '../../services/auditService';
import { MOCK_AUDIT_EVENTS } from '../../data/audit';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatLakhsSymbol, formatDateTime, getFailureReasonLabel, formatTxnId, formatPercent } from '../../utils/format';
import { useState } from 'react';

export function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: txn, isLoading: isTxnLoading } = useQuery({ queryKey: ['txn', id], queryFn: () => getTransaction(id!) });
  const { data: rc, isLoading: isRcLoading } = useQuery({ queryKey: ['rc', id], queryFn: () => getRecoveryCase(id!) });
  const { data: rawEvents } = useQuery({ queryKey: ['audit', id], queryFn: () => getAuditEvents(id!) });

  const [showReasoning, setShowReasoning] = useState(false);

  const events = rawEvents?.length ? rawEvents : MOCK_AUDIT_EVENTS.filter(e => e.transactionId === 'TXN-91823').map((e, i) => ({ ...e, transactionId: id!, id: i + 1000 }));

  if (isTxnLoading || isRcLoading) return <div className="p-8">Loading...</div>;
  if (!txn) return <div className="p-8">Transaction not found.</div>;

  const isSuccess = txn.status === 'SUCCESS' || txn.status === 'RECOVERED';
  const isEscalated = txn.status === 'ESCALATED' || rc?.status === 'ESCALATED';

  // Fallback for agent decision if not populated
  const agentDecision = rc?.agentDecision || (isEscalated ? 'RETRY' : 'RETRY');
  const policyDecision = rc?.policyDecision || (isEscalated ? 'BLOCKED' : 'ALLOWED');
  const finalDecision = isEscalated ? 'ESCALATE' : 'AUTOMATIC RETRY';
  
  const recoveryProb = rc?.recoveryProbability ? formatPercent(rc.recoveryProbability * 100) : (isEscalated ? '42%' : '87%');

  const policyChecks = isEscalated ? [
    { label: 'Confidence below 75%', passed: false },
    { label: 'Amount exceeds ₹10,000 auto-limit', passed: false },
    { label: 'Repeated failures detected', passed: false },
  ] : [
    { label: 'Recovery confidence ≥ 75%', passed: true },
    { label: 'Amount ≤ ₹10,000', passed: true },
    { label: 'Retry available', passed: true },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* 1. Transaction Header */}
      <div>
        <div className="flex items-center gap-4 mb-2">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-[#F2F4F7] text-[#667085] transition-colors"><ArrowLeft size={20} /></button>
          <div className="text-sm font-semibold text-[#667085] uppercase tracking-wide">Payment Recovery Case</div>
        </div>
        <div className="pl-12">
          <h1 className="text-4xl font-bold text-[#101828] mb-4">{formatTxnId(txn.id)}</h1>
          
          <div className="bg-white rounded-xl border border-[#E4E7EC] shadow-sm p-6 flex items-center justify-between">
            <div>
              <div className="text-[#667085] text-sm mb-1">Amount</div>
              <div className="text-2xl font-bold">{formatLakhsSymbol(txn.amountPaise)}</div>
            </div>
            <div>
              <div className="text-[#667085] text-sm mb-1">Status</div>
              <StatusBadge status={txn.status} className="text-base px-3 py-1" />
            </div>
            <div>
              <div className="text-[#667085] text-sm mb-1">Failure Reason</div>
              <div className="font-semibold text-danger">{txn.failureReason ? getFailureReasonLabel(txn.failureReason) : 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Revenue Risk */}
      <div className="pl-12">
        <h2 className="text-sm font-bold text-[#667085] uppercase tracking-wide mb-3">Revenue Risk</h2>
        <div className="bg-white rounded-xl border border-[#E4E7EC] shadow-sm p-6 border-l-4 border-l-warning">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-2xl font-bold mb-2">{formatLakhsSymbol(txn.amountPaise)}</div>
              <div className="text-[#475467] text-sm max-w-lg">
                <strong>Why?</strong> {isEscalated ? 'Customer has a history of repeated failures and this transaction exceeds standard thresholds.' : 'Payment failed but customer has historically successful transactions and strong lifetime value.'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[#667085] text-sm mb-1">Risk Level</div>
              <div className="font-bold text-warning text-lg">HIGH</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Zoqel Decision - HERO */}
      <div className="pl-12">
        <h2 className="text-sm font-bold text-[#667085] uppercase tracking-wide mb-3 flex items-center gap-2">
          <Activity size={16} /> Zoqel Decision
        </h2>
        <div className="bg-[#111827] rounded-xl border border-[#1D2939] shadow-xl text-white overflow-hidden">
          
          <div className="grid grid-cols-2 p-8 gap-12 border-b border-[#374151]">
            <div className="space-y-8">
              <div>
                <div className="text-[#9CA3AF] text-sm mb-1 uppercase tracking-wider font-semibold">Recovery Probability</div>
                <div className="text-5xl font-bold">{recoveryProb}</div>
              </div>
              <div>
                <div className="text-[#9CA3AF] text-sm mb-1 uppercase tracking-wider font-semibold">Primary Signal</div>
                <div className="text-lg">{txn.failureReason ? getFailureReasonLabel(txn.failureReason) : 'BANK_TIMEOUT'}</div>
              </div>
              <div>
                <div className="text-[#9CA3AF] text-sm mb-2 uppercase tracking-wider font-semibold">Recommended Action (AI)</div>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-semibold ${agentDecision === 'RETRY' ? 'bg-[#1570EF]/10 border-[#1570EF]/30 text-[#84CAFF]' : 'bg-[#B54708]/10 border-[#B54708]/30 text-[#FEC84B]'}`}>
                  {agentDecision}
                </div>
              </div>
            </div>

            <div className="bg-[#1F2937] p-6 rounded-xl border border-[#374151]">
              <div className="text-[#9CA3AF] text-sm mb-4 uppercase tracking-wider font-semibold flex items-center gap-2">
                <ShieldCheck size={16} /> Policy Check
              </div>
              <div className="space-y-3 mb-6">
                {policyChecks.map((c, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {c.passed ? <CheckCircle2 size={18} className="text-success shrink-0" /> : <XCircle size={18} className="text-danger shrink-0" />}
                    <span className="text-sm">{c.label}</span>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t border-[#374151]">
                <div className="text-[#9CA3AF] text-sm mb-1 uppercase tracking-wider font-semibold">Final Decision</div>
                <div className="text-2xl font-bold tracking-wide">{finalDecision}</div>
              </div>
            </div>
          </div>

          {/* 4. Expandable AI Reasoning */}
          <div className="bg-[#1F2937] border-b border-[#374151]">
            <button 
              onClick={() => setShowReasoning(!showReasoning)}
              className="w-full px-8 py-4 flex items-center justify-between text-sm font-semibold hover:bg-[#374151] transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-[#9CA3AF]" />
                Why did Zoqel choose this?
              </div>
              <span className="text-[#9CA3AF]">{showReasoning ? '−' : '+'}</span>
            </button>
            {showReasoning && (
              <div className="px-8 pb-6 pt-2 text-[#D1D5DB] text-sm leading-relaxed space-y-4">
                <p><strong>AI Reasoning:</strong></p>
                <p>Zoqel evaluated:</p>
                <ul className="list-disc pl-5 space-y-1 text-[#9CA3AF]">
                  <li>Failure reason: {txn.failureReason}</li>
                  <li>Historical customer behavior: {txn.customer.riskTier} risk tier</li>
                  <li>Transaction amount: {formatLakhsSymbol(txn.amountPaise)}</li>
                  <li>Previous payment attempts</li>
                </ul>
                <p>The model estimated a <strong>{recoveryProb} probability</strong> of successful recovery.</p>
                <p>The Policy Engine {policyDecision === 'ALLOWED' ? 'authorized one automatic retry because all configured safety limits were satisfied.' : 'overruled the AI recommendation and forced human escalation because configured safety limits (amount/history) were exceeded.'}</p>
              </div>
            )}
          </div>

          <div className="p-6 bg-[#047857]/20 border-t border-[#059669]/30">
            <div className="text-xs uppercase tracking-wider font-semibold text-[#34D399] mb-1">Action Executed</div>
            <div className="flex items-center gap-2 text-white font-medium">
              <CheckCircle2 size={18} className="text-[#34D399]" />
              {isEscalated ? 'Escalated to human review' : 'Payment successfully settled'}
            </div>
          </div>

        </div>
      </div>

      {/* 5. Outcome */}
      <div className="pl-12">
        {isSuccess && (
          <div className="bg-[#ECFDF3] border-2 border-[#34D399] rounded-xl p-8 shadow-sm flex items-start gap-4">
            <CheckCircle2 className="text-[#059669] shrink-0" size={32} />
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#059669] mb-1">Recovered</div>
              <div className="text-[#064E3B] font-bold text-3xl mb-2">{formatLakhsSymbol(txn.amountPaise)}</div>
              <div className="text-[#065F46] font-medium">Payment successfully settled</div>
            </div>
          </div>
        )}
        {isEscalated && (
          <div className="bg-[#FFFAEB] border-2 border-[#FBBF24] rounded-xl p-8 shadow-sm flex items-start gap-4">
            <ShieldAlert className="text-[#D97706] shrink-0" size={32} />
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#D97706] mb-1">Escalated</div>
              <div className="text-[#92400E] font-bold text-3xl mb-2">{formatLakhsSymbol(txn.amountPaise)}</div>
              <div className="text-[#92400E] font-medium">Escalated to Human Review Queue</div>
            </div>
          </div>
        )}
      </div>

      {/* 6. Audit Trail */}
      <div className="pl-12">
        <h2 className="text-sm font-bold text-[#667085] uppercase tracking-wide mb-3">Audit Trail</h2>
        <div className="bg-white rounded-xl border border-[#E4E7EC] shadow-sm overflow-hidden">
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
                  <td className="px-6 py-4 text-[#667085] whitespace-nowrap">{formatDateTime(evt.occurredAt)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase text-white ${evt.actor === 'Risk Engine' ? 'bg-[#F04438]' : evt.actor === 'AI Agent' ? 'bg-[#2B84EA]' : evt.actor === 'Policy Engine' ? 'bg-[#F79009]' : evt.actor === 'Simulator' ? 'bg-[#12B76A]' : evt.actor === 'ML Engine' ? 'bg-[#8B5CF6]' : 'bg-[#111827]'}`}>
                      {evt.actor}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-[#101828]">{evt.eventType}</td>
                  <td className="px-6 py-4 text-[#475467]">{evt.eventDetail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
