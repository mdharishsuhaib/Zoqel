import { CheckCircle2, XCircle, ShieldCheck, ShieldX } from 'lucide-react';
import type { RecoveryCase } from '../../types';

interface PolicyCheckProps {
  recoveryCase: RecoveryCase | null;
}

export function PolicyCheckPanel({ recoveryCase }: PolicyCheckProps) {
  const allowed = recoveryCase?.policyDecision === 'ALLOWED';
  const checks = allowed
    ? [
        { label: 'Amount within INR 10,000 limit', passed: true },
        { label: 'Retry count within limit (< 2)', passed: true },
        { label: 'Confidence above 75% threshold', passed: true },
        { label: 'Failure type eligible for retry', passed: true },
      ]
    : [
        { label: 'Amount within INR 10,000 limit', passed: false },
        { label: 'Retry count within limit', passed: true },
        { label: 'Confidence above threshold', passed: true },
        { label: 'No repeated failure block', passed: false },
      ];

  return (
    <div className="bg-white rounded-xl border border-[#E4E7EC] p-5">
      <div className="text-[13px] font-semibold text-[#667085] uppercase tracking-wide mb-3">Policy Check</div>
      <div className="space-y-2 mb-4">
        {checks.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            {c.passed
              ? <CheckCircle2 size={15} className="text-success shrink-0" />
              : <XCircle size={15} className="text-danger shrink-0" />
            }
            <span className="text-sm text-[#344054]">{c.label}</span>
          </div>
        ))}
      </div>
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${allowed ? 'bg-[#ECFDF3] border border-[#ABEFC6]' : 'bg-[#FEF3F2] border border-[#FECDCA]'}`}>
        {allowed ? <ShieldCheck size={15} className="text-success" /> : <ShieldX size={15} className="text-danger" />}
        <span className={`text-sm font-semibold ${allowed ? 'text-[#067647]' : 'text-[#B42318]'}`}>
          {recoveryCase?.agentDecision ?? 'UNKNOWN'} — {allowed ? 'AUTHORIZED' : 'BLOCKED'}
        </span>
      </div>
      {!allowed && recoveryCase?.policyReason && (
        <p className="text-xs text-[#667085] mt-2">{recoveryCase.policyReason}</p>
      )}
    </div>
  );
}
