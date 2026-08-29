import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../components/common/StatCard';
import { IndiaRiskMap } from '../components/dashboard/IndiaRiskMap';
import { FinancialTrendsChart } from '../components/dashboard/FinancialTrendsChart';
import { ProjectStatusProgress } from '../components/dashboard/ProjectStatusProgress';
import { dashboardService, DashboardStats } from '../services/dashboardService';
import { stateDistrictsMap, mockStatesData } from '../data/mockStates';
import {
  TrendingUp,
  Landmark,
  CheckCircle2,
  AlertTriangle,
  FolderSync,
  ChevronDown,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedState, setSelectedState, selectedDistrict, setSelectedDistrict, addToast } = useApp();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Available districts for the selected state
  const availableDistricts =
    selectedState !== 'All States' && stateDistrictsMap[selectedState]
      ? ['All Districts', ...stateDistrictsMap[selectedState]]
      : ['All Districts'];

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const data = await dashboardService.getStats(selectedState, selectedDistrict);
      setStats(data);
      setLoading(false);
    };
    fetchStats();
  }, [selectedState, selectedDistrict]);

  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    setSelectedDistrict('All Districts');
    addToast('info', `Dashboard filtered to ${stateName}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Filter Bar (Matches Screenshot 1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Parliamentary constituency financial tracking & automated risk intelligence
          </p>
        </div>

        {/* State & District Dropdowns */}
        <div className="flex items-center gap-3">
          {/* State Dropdown */}
          <div className="relative">
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-medium py-2 pl-3 pr-8 rounded shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              <option value="All States">All States</option>
              {mockStatesData.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* District Dropdown */}
          <div className="relative">
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                addToast('info', `Filtered to ${e.target.value}`);
              }}
              disabled={selectedState === 'All States'}
              className="appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-medium py-2 pl-3 pr-8 rounded shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {availableDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 6 KPI Stat Cards Grid (Matches Screenshot 1) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Projects */}
        <StatCard
          id="stat-total-projects"
          label="TOTAL PROJECTS"
          value={stats ? stats.totalProjects.toLocaleString('en-IN') : '4,520'}
          subtext="+12% yoy"
          subtextType="positive"
          subtextIcon={<TrendingUp className="w-3.5 h-3.5 text-emerald-600" />}
          onClick={() => navigate('/projects')}
        />

        {/* Allocated */}
        <StatCard
          id="stat-allocated"
          label="ALLOCATED (CR)"
          value={stats ? `₹${stats.totalAllocatedCr.toLocaleString('en-IN')}` : '₹12,450'}
          subtext="🏛 FY 23-24"
          subtextType="neutral"
        />

        {/* Expenditure */}
        <StatCard
          id="stat-expenditure"
          label="EXPENDITURE (CR)"
          value={stats ? `₹${stats.totalExpenditureCr.toLocaleString('en-IN')}` : '₹9,820'}
          subtext={stats ? `✓ ${stats.utilizationRatePercent}% Utilized` : '✓ 78% Utilized'}
          subtextType="positive"
        />

        {/* Completed */}
        <StatCard
          id="stat-completed"
          label="COMPLETED"
          value={stats ? stats.completedCount.toLocaleString('en-IN') : '2,100'}
          subtext={stats ? `✓ ${stats.completedRatePercent}% of Total` : '✓ 46% of Total'}
          subtextType="neutral"
          onClick={() => navigate('/projects?status=Completed')}
        />

        {/* Pending */}
        <StatCard
          id="stat-pending"
          label="PENDING"
          value={stats ? stats.pendingCount.toLocaleString('en-IN') : '2,420'}
          subtext="Requires Review"
          subtextType="warning"
          subtextIcon={<FolderSync className="w-3.5 h-3.5 text-amber-500" />}
          onClick={() => navigate('/projects?status=Ongoing')}
        />

        {/* High-Risk (Red Left Bar Accent) */}
        <StatCard
          id="stat-high-risk"
          label="HIGH-RISK"
          value={stats ? stats.highRiskCount : '124'}
          subtext="Critical Delay"
          subtextType="danger"
          subtextIcon={<AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
          hasRedLeftAccent={true}
          onClick={() => navigate('/risk-analysis')}
        />
      </div>

      {/* Main Content Grid: Map (Left) & Charts (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* National Risk Distribution Map (Left 7 cols) */}
        <div className="lg:col-span-7">
          <IndiaRiskMap
            onSelectState={handleStateChange}
            selectedState={selectedState}
          />
        </div>

        {/* Right Section (5 cols): Financial Trends & Project Status */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="h-64">
            <FinancialTrendsChart />
          </div>
          <div className="flex-1">
            <ProjectStatusProgress />
          </div>
        </div>
      </div>
    </div>
  );
};
