import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface FinancialTrendItem {
  quarter: string;
  allocation: number;
  expenditure: number;
}

const defaultData: FinancialTrendItem[] = [
  { quarter: 'Q1', allocation: 2800, expenditure: 2100 },
  { quarter: 'Q2', allocation: 3100, expenditure: 2450 },
  { quarter: 'Q3', allocation: 3400, expenditure: 2720 },
  { quarter: 'Q4', allocation: 3150, expenditure: 2550 },
  { quarter: "Q1 '24", allocation: 3600, expenditure: 2890 },
];

export const FinancialTrendsChart: React.FC = () => {
  const [data] = useState<FinancialTrendItem[]>(defaultData);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white rounded p-2.5 text-xs font-mono shadow-xl border border-slate-700">
          <p className="font-semibold text-slate-200 border-b border-slate-700 pb-1 mb-1.5">{label}</p>
          <div className="space-y-1">
            <p className="flex justify-between gap-4 text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-slate-300 inline-block"></span>
                Allocation:
              </span>
              <span className="font-semibold text-white">₹{payload[0].value} Cr</span>
            </p>
            <p className="flex justify-between gap-4 text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-slate-900 border border-slate-600 inline-block"></span>
                Expenditure:
              </span>
              <span className="font-semibold text-white">₹{payload[1].value} Cr</span>
            </p>
            <p className="pt-1 border-t border-slate-800 text-[10px] text-emerald-400">
              Rate: {((payload[1].value / payload[0].value) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 flex flex-col h-full shadow-2xs">
      {/* Header & Legend (Matches Screenshot 1) */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold font-display text-slate-900">Financial Trends</h3>
        <div className="flex items-center gap-4 text-xs font-mono text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-slate-300"></span>
            <span>Allocation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-slate-900"></span>
            <span>Expenditure</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 w-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={6}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="quarter"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'JetBrains Mono' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              tickFormatter={(v) => `₹${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="allocation" fill="#cbd5e1" radius={[3, 3, 0, 0]} maxBarSize={32} />
            <Bar dataKey="expenditure" fill="#1e293b" radius={[3, 3, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
