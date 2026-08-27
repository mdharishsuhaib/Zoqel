import { cn } from '../../lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: { value: string; positive: boolean };
  accent?: 'default' | 'success' | 'danger' | 'violet' | 'blue' | 'black';
  className?: string;
}

export function MetricCard({ title, value, subtitle, trend, accent = 'default', className }: MetricCardProps) {
  const accentBorder = {
    default: '',
    success: 'border-l-4 border-l-success',
    danger: 'border-l-4 border-l-danger',
    violet: 'border-l-4 border-l-[#8B5CF6]',
    blue: 'border-l-4 border-l-[#3B82F6]',
    black: 'border-l-4 border-l-black',
  }[accent];

  return (
    <div className={cn(
      'bg-white rounded-xl border border-[#E4E7EC] shadow-card p-5 flex flex-col gap-3',
      accentBorder, className
    )}>
      <div className="text-[13px] font-medium text-[#667085]">{title}</div>
      <div className={cn(
        'text-3xl font-bold tabular-nums leading-none',
        accent === 'success' ? 'text-success' : 
        accent === 'danger' ? 'text-danger' : 
        accent === 'violet' ? 'text-[#8B5CF6]' :
        accent === 'blue' ? 'text-[#3B82F6]' :
        accent === 'black' ? 'text-black' :
        'text-[#101828]'
      )}>
        {value}
      </div>
      {(subtitle || trend) && (
        <div className="flex items-center gap-2">
          {trend && (
            <span className={cn('flex items-center gap-0.5 text-xs font-semibold',
              trend.positive ? 'text-success' : 'text-danger'
            )}>
              {trend.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {trend.value}
            </span>
          )}
          {subtitle && <span className="text-xs text-[#98A2B3]">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
