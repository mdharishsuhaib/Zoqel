import { CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import type { RecoveryCase, AuditEvent } from '../../types';
import { formatTime } from '../../utils/format';

interface RecoveryTimelineProps {
  transactionId: string;
  recoveryCase: RecoveryCase | null;
  auditEvents: AuditEvent[];
}

export function RecoveryTimeline({ transactionId, recoveryCase, auditEvents }: RecoveryTimelineProps) {
  const events = [...auditEvents].sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
  
  if (events.length === 0) {
    return <div className="text-sm text-[#667085] p-4 text-center">No timeline data available</div>;
  }

  return (
    <div className="bg-white rounded-xl border border-[#E4E7EC] p-5">
      <div className="text-[13px] font-semibold text-[#667085] uppercase tracking-wide mb-4">Recovery Timeline</div>
      <div className="relative">
        <div className="absolute top-2 bottom-2 left-[11px] w-[2px] bg-[#E4E7EC]" />
        <div className="space-y-6">
          {events.map((evt, i) => {
            const isLast = i === events.length - 1;
            let icon = <CheckCircle2 size={24} className="text-success fill-white" />;
            if (evt.eventType.includes('BLOCKED') || evt.eventType.includes('ESCALATED')) {
              icon = <AlertTriangle size={24} className="text-warning fill-white" />;
            } else if (evt.eventType.includes('FAILED')) {
              icon = <XCircle size={24} className="text-danger fill-white" />;
            } else if (!isLast && evt.eventType.includes('PENDING')) {
              icon = <Clock size={24} className="text-[#98A2B3] fill-white" />;
            }
            
            return (
              <div key={evt.id} className="relative flex gap-4">
                <div className="relative z-10 shrink-0 bg-white">{icon}</div>
                <div className="flex-1 pb-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-[#101828]">{evt.eventType.replace(/_/g, ' ')}</span>
                    <span className="text-xs text-[#667085]">{formatTime(evt.occurredAt)}</span>
                  </div>
                  <p className="text-xs text-[#475467] leading-relaxed">{evt.eventDetail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
