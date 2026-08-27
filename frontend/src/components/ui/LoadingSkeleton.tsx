import { cn } from '../../lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-[#F2F4F7] rounded', className)} />;
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-[#E4E7EC] p-5">
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-9 w-32 mb-3" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}
