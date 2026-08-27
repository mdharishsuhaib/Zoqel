import { cn } from '../../lib/utils';

const STATUS_STYLES: Record<string, string> = {
  RECOVERED: 'bg-[#ECFDF3] text-[#067647] border-[#ABEFC6]',
  SUCCESS: 'bg-[#ECFDF3] text-[#067647] border-[#ABEFC6]',
  FAILED: 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]',
  DANGER: 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]',
  ESCALATED: 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]',
  IGNORED: 'bg-[#F2F4F7] text-[#667085] border-[#E4E7EC]',
  SKIPPED: 'bg-[#F2F4F7] text-[#667085] border-[#E4E7EC]',
  IN_PROGRESS: 'bg-[#EFF8FF] text-[#1570EF] border-[#B2DDFF]',
  PROCESSING: 'bg-[#EFF8FF] text-[#1570EF] border-[#B2DDFF]',
  PENDING: 'bg-[#F2F4F7] text-[#667085] border-[#E4E7EC]',
  OPEN: 'bg-[#EFF8FF] text-[#1570EF] border-[#B2DDFF]',
  BLOCKED: 'bg-[#FFF6ED] text-[#C4320A] border-[#FDDCAB]',
  ALLOWED: 'bg-[#ECFDF3] text-[#067647] border-[#ABEFC6]',
  RETRY: 'bg-[#EFF8FF] text-[#1570EF] border-[#B2DDFF]',
  ESCALATE: 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]',
  IGNORE: 'bg-[#F2F4F7] text-[#667085] border-[#E4E7EC]',
  NOTIFY: 'bg-[#F0F9FF] text-[#026AA2] border-[#B9E6FE]',
  HIGH: 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]',
  VERY_HIGH: 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]',
  MEDIUM: 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]',
  LOW: 'bg-[#ECFDF3] text-[#067647] border-[#ABEFC6]',
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? 'bg-[#F2F4F7] text-[#667085] border-[#E4E7EC]';
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border', style, className)}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
