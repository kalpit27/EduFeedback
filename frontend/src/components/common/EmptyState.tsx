import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white border border-dashed border-neutral-border rounded-card">
      <div className="p-3 bg-[#1DCED8]/10 text-[#17B2BA] rounded-full mb-3">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-base font-semibold text-[#1F2937]">{title}</h4>
      <p className="text-xs text-neutral-secondary max-w-sm mt-1 mb-4">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary text-xs py-1.5 px-3">
          {actionLabel}
        </button>
      )}
    </div>
  );
};
