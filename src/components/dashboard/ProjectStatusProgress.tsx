import React from 'react';
import { useNavigate } from 'react-router-dom';

interface StatusItem {
  name: string;
  count: number;
  color: string;
  total: number;
  statusParam: string;
}

export const ProjectStatusProgress: React.FC = () => {
  const navigate = useNavigate();

  // Total projects = 4,520 (Matches Screenshot 1)
  const total = 4520;
  const statuses: StatusItem[] = [
    { name: 'Completed', count: 2100, color: '#10b981', total, statusParam: 'Completed' },
    { name: 'Ongoing', count: 1580, color: '#1e293b', total, statusParam: 'Ongoing' },
    { name: 'Sanctioned', count: 680, color: '#f59e0b', total, statusParam: 'Sanctioned' },
    { name: 'Proposed', count: 160, color: '#e2e8f0', total, statusParam: 'Proposed' },
  ];

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 flex flex-col justify-between shadow-2xs">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold font-display text-slate-900">Project Status</h3>
        <span className="text-xs font-mono text-slate-500">4,520 Total</span>
      </div>

      <div className="space-y-4">
        {statuses.map((s) => {
          const percent = ((s.count / s.total) * 100).toFixed(1);
          return (
            <div
              key={s.name}
              onClick={() => navigate(`/projects?status=${s.statusParam}`)}
              className="group cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-700 group-hover:text-blue-600 transition-colors">
                  {s.name}
                </span>
                <span className="font-mono font-semibold text-slate-900">
                  {s.count.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: s.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span>Active Execution: 81.4%</span>
        <button
          onClick={() => navigate('/projects')}
          className="text-blue-600 hover:text-blue-800 font-medium font-sans hover:underline"
        >
          View Full Breakdown &rarr;
        </button>
      </div>
    </div>
  );
};
