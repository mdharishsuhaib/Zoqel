import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '../../components/ui/PageHeader';
import { getTransactions, getRecoveryCase } from '../../services/recoveryService';
import { formatLakhsSymbol, formatTxnId } from '../../utils/format';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function HumanReviewPage() {
  const navigate = useNavigate();
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  // Fetch all escalated transactions from the live backend
  const { data: pagedTxns } = useQuery({
    queryKey: ['escalated_txns'],
    queryFn: () => getTransactions(0, 50, 'ESCALATED'),
    refetchInterval: 5000
  });

  // Filter out the ones we've already "resolved" in this session
  const pendingTxns = useMemo(() => {
    return pagedTxns?.content.filter(t => !resolvedIds.has(t.id)) || [];
  }, [pagedTxns, resolvedIds]);

  const currentTxn = pendingTxns[0];

  // Fetch the recovery case context for the current transaction to show the AI diagnosis
  const { data: currentRc } = useQuery({
    queryKey: ['rc', currentTxn?.id],
    queryFn: () => currentTxn ? getRecoveryCase(currentTxn.id) : null,
    enabled: !!currentTxn
  });

  const handleResolve = () => {
    if (currentTxn) {
      setResolvedIds(prev => new Set(prev).add(currentTxn.id));
    }
  };

  if (!currentTxn) {
    return (
      <div className="space-y-6">
        <PageHeader title="Human Review" subtitle="No cases require attention at this time." />
        <div className="text-center py-24 bg-white rounded-xl border border-[#E4E7EC] shadow-sm">
          <CheckCircle2 size={56} className="text-success mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#101828] mb-2">All Caught Up</h2>
          <p className="text-[#667085]">There are no pending cases requiring human review. The AI is handling everything else.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Human Review" subtitle={`${pendingTxns.length} decision${pendingTxns.length === 1 ? '' : 's'} requires attention`} />

      <div className="bg-white rounded-xl border border-[#E4E7EC] shadow-card overflow-hidden">
        <div className="bg-[#FFFAEB] border-b border-[#FEDF89] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-warning text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">Escalated</span>
            <span className="font-semibold text-[#B54708]">Policy Block Requires Review</span>
          </div>
          <span className="text-[#B54708] font-mono text-sm">{formatTxnId(currentTxn.id)}</span>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-[#667085] uppercase tracking-wide mb-4">Context</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-[#667085]">Customer</span><span className="font-medium text-[#101828]">{currentTxn.customer.name}</span></div>
                <div className="flex justify-between"><span className="text-[#667085]">Amount</span><span className="font-medium text-lg text-[#101828]">{formatLakhsSymbol(currentTxn.amountPaise)}</span></div>
                <div className="flex justify-between"><span className="text-[#667085]">Failure Reason</span><span className="font-medium text-danger">{currentTxn.failureReason}</span></div>
                <div className="flex justify-between"><span className="text-[#667085]">Risk Tier</span><span className="font-medium text-[#101828]">{currentTxn.customer.riskTier}</span></div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#667085] uppercase tracking-wide mb-4">AI Diagnosis</h3>
              <div className="bg-[#F9FAFB] border border-[#E4E7EC] rounded-lg p-5 text-sm h-full flex flex-col justify-center">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-semibold text-[#101828]">Agent Decision:</span> 
                  <span className="text-[#B54708] font-bold bg-[#FFFAEB] px-2 py-0.5 rounded border border-[#FEDF89]">{currentRc?.agentDecision || 'ESCALATE'}</span>
                </div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-semibold text-[#101828]">Confidence:</span> 
                  <span className="text-[#475467] font-medium">{currentRc?.agentConfidence ? `${(currentRc.agentConfidence * 100).toFixed(1)}%` : '42.0%'}</span>
                </div>
                <div className="text-[#475467] italic pt-3 border-t border-[#E4E7EC]">
                  "{currentRc?.agentReason || 'Fallback: Unknown or complex issue requires human review.'}"
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-[#E4E7EC] pt-6 flex justify-between items-center">
            <button onClick={() => navigate(`/app/payments/${currentTxn.id}`)} className="text-sm font-semibold text-[#2B84EA] hover:text-[#1A6DD0] flex items-center gap-1 transition-colors">
              View Full Audit Trail <ArrowRight size={16} />
            </button>
            <div className="flex gap-4">
              <button onClick={handleResolve} className="px-6 py-2.5 bg-white border border-[#D0D5DD] text-[#344054] font-medium rounded-lg hover:bg-[#F9FAFB] flex items-center gap-2 transition-colors">
                <XCircle size={18} /> Dismiss Case
              </button>
              <button onClick={handleResolve} className="px-6 py-2.5 bg-[#2B84EA] text-white font-medium rounded-lg hover:bg-[#1A6DD0] flex items-center gap-2 transition-colors">
                <CheckCircle2 size={18} /> Override & Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
