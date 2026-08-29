import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, RefreshCw, MessageSquareWarning } from 'lucide-react';
import { getTransaction, getRecoveryCase } from '../../services/recoveryService';
import { getAuditEvents } from '../../services/auditService';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatLakhsSymbol } from '../../utils/format';
import { PipelineVisual } from '../../components/recovery/PipelineVisual';

export function TransactionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: tx, isLoading: isTxLoading } = useQuery({ queryKey: ['transaction', id], queryFn: () => getTransaction(id!) });
  const { data: rawEvents, isLoading: isEventsLoading } = useQuery({ queryKey: ['auditEvents', id], queryFn: () => getAuditEvents(id!) });
  
  const events = Array.isArray(rawEvents) ? rawEvents : [];

  if (isTxLoading) return <div className="p-8 text-center text-[#667085]">Loading transaction details...</div>;
  if (!tx) return <div className="p-8 text-center text-[#F04438]">Transaction not found</div>;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium text-[#667085] hover:text-[#101828] transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#101828] leading-tight flex items-center gap-3">
            {id} <StatusBadge status={tx.status} />
          </h1>
          <p className="text-sm text-[#667085] mt-1">Initiated on {new Date(tx.initiatedAt).toLocaleString()}</p>
        </div>
        <div className="text-right">
          <div className="text-[28px] font-bold text-[#101828]">{formatLakhsSymbol(tx.amountPaise)}</div>
          <div className="text-sm text-[#667085] uppercase tracking-wide font-semibold mt-1">Amount</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-[#E4E7EC] shadow-card p-6">
            <h2 className="text-lg font-semibold text-[#101828] mb-6">Recovery Pipeline</h2>
            <PipelineVisual />
          </div>

          <div className="bg-[#111827] rounded-xl border border-[#1D2939] shadow-card p-6 text-white">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-[#2B84EA] animate-pulse" />
              <h2 className="text-lg font-semibold">Agent Reasoning Log</h2>
            </div>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#374151] before:to-transparent">
              {isEventsLoading ? (
                 <div className="text-center text-[#9CA3AF]">Loading agent reasoning...</div>
              ) : events.length === 0 ? (
                 <div className="text-center text-[#9CA3AF]">No reasoning log found for this transaction.</div>
              ) : events.map((e, idx) => (
                <div key={e.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-[#111827] bg-[#2B84EA] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10" />
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] bg-[#1F2937] p-4 rounded-xl border border-[#374151] shadow">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-[#9CA3AF]">{e.actor}</span>
                      <span className="text-[10px] text-[#6B7280]">{new Date(e.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-sm font-medium text-white">{e.eventType}</div>
                    <div className="text-xs text-[#9CA3AF] mt-1">{e.eventDetail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#E4E7EC] shadow-card p-6">
            <h3 className="text-sm font-semibold text-[#101828] uppercase tracking-wide mb-4">Customer Info</h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-[#667085] mb-1">Name</div>
                <div className="text-sm font-medium text-[#101828]">{tx.customer.name}</div>
              </div>
              <div>
                <div className="text-xs text-[#667085] mb-1">Email</div>
                <div className="text-sm font-medium text-[#101828]">{tx.customer.email}</div>
              </div>
              <div>
                <div className="text-xs text-[#667085] mb-1">Risk Profile</div>
                <StatusBadge status={tx.customer.riskTier} />
              </div>
            </div>
          </div>

          {tx.failureReason && (
            <div className="bg-[#FFF4ED] border border-[#F9DBAF] rounded-xl p-6">
              <div className="flex items-center gap-2 text-[#B93815] font-semibold mb-2">
                <MessageSquareWarning size={18} />
                Root Cause Diagnosis
              </div>
              <p className="text-sm text-[#B93815]">{tx.failureReason.replace(/_/g, ' ')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
