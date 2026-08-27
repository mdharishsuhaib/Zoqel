interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-[28px] font-bold text-[#101828] leading-tight">{title}</h1>
        {subtitle && <p className="text-sm text-[#667085] mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 mt-1">{actions}</div>}
    </div>
  );
}
