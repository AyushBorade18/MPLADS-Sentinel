import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  id?: string;
  label: string;
  value: string | number;
  subtext?: string;
  subtextType?: 'positive' | 'neutral' | 'warning' | 'danger';
  subtextIcon?: React.ReactNode;
  hasRedLeftAccent?: boolean;
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  label,
  value,
  subtext,
  subtextType = 'neutral',
  subtextIcon,
  hasRedLeftAccent = false,
  onClick,
  className = '',
}) => {
  const getSubtextColor = () => {
    switch (subtextType) {
      case 'positive':
        return 'text-emerald-600';
      case 'warning':
        return 'text-amber-600';
      case 'danger':
        return 'text-red-600';
      case 'neutral':
      default:
        return 'text-slate-500';
    }
  };

  return (
    <div
      id={id}
      onClick={onClick}
      className={`bg-white rounded-lg border border-slate-200 p-5 relative overflow-hidden transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-sm' : ''
      } ${hasRedLeftAccent ? 'border-l-4 border-l-red-500' : ''} ${className}`}
    >
      <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1">
        {label}
      </p>
      <p className="text-3xl font-bold font-mono text-slate-900 tracking-tight mb-2">
        {value}
      </p>
      {subtext && (
        <div className={`flex items-center gap-1.5 text-xs font-medium ${getSubtextColor()}`}>
          {subtextIcon}
          <span>{subtext}</span>
        </div>
      )}
    </div>
  );
};
