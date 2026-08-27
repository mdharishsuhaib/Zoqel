import { CheckCircle2, XCircle } from 'lucide-react';

interface EvidenceItem {
  label: string;
  positive: boolean;
}

export function DecisionEvidence({ items }: { items: EvidenceItem[] }) {
  return (
    <div className="bg-white rounded-xl border border-[#E4E7EC] p-5">
      <div className="text-[13px] font-semibold text-[#667085] uppercase tracking-wide mb-3">Decision Evidence</div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            {item.positive
              ? <CheckCircle2 size={15} className="text-success shrink-0" />
              : <XCircle size={15} className="text-danger shrink-0" />
            }
            <span className="text-sm text-[#344054]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
