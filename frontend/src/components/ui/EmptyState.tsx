interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-[#F2F4F7] flex items-center justify-center mb-4">
        <span className="text-2xl">◈</span>
      </div>
      <h3 className="text-[15px] font-semibold text-[#101828] mb-1">{title}</h3>
      <p className="text-sm text-[#667085] max-w-xs mb-4">{description}</p>
      {action}
    </div>
  );
}
