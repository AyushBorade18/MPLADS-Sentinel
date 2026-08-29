import React from 'react';
import { ProjectStatus, RiskLevel } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score, className = '' }) => {
  if (level === 'High') {
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-red-50 text-red-700 border border-red-200 ${className}`}
      >
        High Risk {score !== undefined ? `(${score})` : ''}
      </span>
    );
  }
  if (level === 'Medium') {
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-amber-50 text-amber-800 border border-amber-200 ${className}`}
      >
        Med Risk {score !== undefined ? `(${score})` : ''}
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}
    >
      Low Risk {score !== undefined ? `(${score})` : ''}
    </span>
  );
};

interface StatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'Completed':
      return (
        <span className={`inline-flex items-center gap-1 text-xs font-medium text-emerald-700 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Completed
        </span>
      );
    case 'Ongoing':
      return (
        <span className={`inline-flex items-center gap-1 text-xs font-medium text-slate-900 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
          Ongoing
        </span>
      );
    case 'Delayed':
      return (
        <span className={`inline-flex items-center gap-1 text-xs font-medium text-red-600 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
          Delayed
        </span>
      );
    case 'Sanctioned':
      return (
        <span className={`inline-flex items-center gap-1 text-xs font-medium text-amber-700 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Sanctioned
        </span>
      );
    case 'Proposed':
    default:
      return (
        <span className={`inline-flex items-center gap-1 text-xs font-medium text-slate-500 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          Proposed
        </span>
      );
  }
};

interface SectorBadgeProps {
  sector: string;
  className?: string;
}

export const SectorBadge: React.FC<SectorBadgeProps> = ({ sector, className = '' }) => {
  return (
    <span
      className={`inline-block text-[11px] font-mono uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 ${className}`}
    >
      {sector}
    </span>
  );
};
