import { cn } from '../../lib/utils';
import { getRiskLabel } from '../../utils/format';

interface RiskIndicatorProps {
  score: number; // 0-100
  className?: string;
  showLabel?: boolean;
}

export function RiskIndicator({ score, className, showLabel = true }: RiskIndicatorProps) {
  const color = score >= 85 ? '#F04438' : score >= 70 ? '#F79009' : score >= 40 ? '#F79009' : '#12B76A';
  const textColor = score >= 85 ? 'text-danger' : score >= 70 ? 'text-warning' : score >= 40 ? 'text-warning' : 'text-success';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn('text-sm font-bold tabular-nums min-w-[2.5rem]', textColor)}>{score}%</span>
      <div className="flex-1 h-1.5 bg-[#F2F4F7] rounded-full min-w-[48px]">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      {showLabel && <span className={cn('text-xs font-medium min-w-[4rem]', textColor)}>{getRiskLabel(score)}</span>}
    </div>
  );
}
