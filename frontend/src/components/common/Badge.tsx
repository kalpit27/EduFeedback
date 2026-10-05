import React from 'react';

interface BadgeProps {
  variant?: 'cyan' | 'orange' | 'green' | 'gray' | 'danger' | 'purple';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'cyan', children, className = '' }) => {
  const variantStyles = {
    cyan: 'bg-[#1DCED8]/15 text-[#17B2BA] border-[#1DCED8]/30',
    orange: 'bg-[#FF9D50]/15 text-[#E6853A] border-[#FF9D50]/30',
    green: 'bg-[#55E07E]/15 text-[#2E9C4F] border-[#55E07E]/30',
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
    danger: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
