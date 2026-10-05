import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accentColor?: 'cyan' | 'orange' | 'green' | 'blue';
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor = 'cyan',
  trend,
}) => {
  const colorMap = {
    cyan: {
      bg: 'bg-[#1DCED8]/10',
      text: 'text-[#17B2BA]',
      border: 'border-l-4 border-l-[#1DCED8]',
    },
    orange: {
      bg: 'bg-[#FF9D50]/10',
      text: 'text-[#E6853A]',
      border: 'border-l-4 border-l-[#FF9D50]',
    },
    green: {
      bg: 'bg-[#55E07E]/10',
      text: 'text-[#43C268]',
      border: 'border-l-4 border-l-[#55E07E]',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-l-4 border-l-blue-500',
    },
  };

  const selected = colorMap[accentColor];

  return (
    <div className={`bg-white border border-neutral-border rounded-card p-5 shadow-subtle ${selected.border} hover:shadow-card transition-all`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-secondary">{title}</p>
          <h3 className="text-2xl font-bold text-[#1F2937] mt-1.5">{value}</h3>
          {subtitle && <p className="text-xs text-neutral-secondary mt-1">{subtitle}</p>}
          {trend && (
            <p className={`text-xs mt-2 font-medium flex items-center gap-1 ${trend.isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{trend.value}</span>
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${selected.bg} ${selected.text}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
