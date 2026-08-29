import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Sparkles,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Search,
  CheckCircle2,
  RefreshCw,
  Clock,
  Filter,
  MapPin,
  Compass,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { RiskBadge, StatusBadge } from '../components/common/Badge';
import { GoogleMapsGroundingModal } from '../components/common/GoogleMapsGroundingModal';
import { riskService, RiskIntelligenceSummary } from '../services/riskService';
import { Project, RiskCluster } from '../types';
import { OutlierPoint } from '../data/mockRiskClusters';
import { useApp } from '../context/AppContext';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

export const RiskAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [summary, setSummary] = useState<RiskIntelligenceSummary | null>(null);
  const [clusters, setClusters] = useState<RiskCluster[]>([]);
  const [outliers, setOutliers] = useState<OutlierPoint[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [queue, setQueue] = useState<Project[]>([]);
  const [scanning, setScanning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [mapsModalOpen, setMapsModalOpen] = useState(false);
  const [activeMapsTarget, setActiveMapsTarget] = useState<{
    title?: string;
    id?: string;
    district?: string;
    state?: string;
    coords?: { latitude: number; longitude: number };
    query?: string;
  } | null>(null);

  const fetchData = async () => {
    const s = await riskService.getRiskSummary();
    const c = await riskService.getRiskClusters();
    const o = await riskService.getOutliersData();
    const t = await riskService.getRiskTrendData();
    const q = await riskService.getPrioritizationQueue();

    setSummary(s);
    setClusters(c);
    setOutliers(o);
    setTrendData(t);
    setQueue(q);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunDeepScan = async () => {
    setScanning(true);
    addToast('info', 'Running deep forensic scan across all 4,520 projects...');
    try {
      const result = await riskService.runDeepScan();
      addToast(
        'success',
        `Deep scan completed in ${result.scanDurationMs}ms. ${result.newAnomaliesCount} new anomalies reviewed.`
      );
      fetchData();
    } catch (err) {
      addToast('error', 'Scan failed to complete');
    } finally {
      setScanning(false);
    }
  };

  const filteredClusters =
    selectedCategory === 'all'
      ? clusters
      : clusters.filter((c) => c.category === selectedCategory);

  const CustomScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: OutlierPoint = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white rounded p-3 text-xs shadow-xl border border-slate-700 font-mono">
          <div className="flex items-center justify-between gap-3 border-b border-slate-700 pb-1 mb-1.5">
            <span className="font-semibold text-blue-400">{data.projectId}</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] ${data.riskType === 'high_risk' ? 'bg-red-900 text-red-300' : 'bg-slate-800 text-slate-300'}`}>
              {data.riskType === 'high_risk' ? 'Critical Decoupling' : 'Normal'}
            </span>
          </div>
          <p className="text-slate-300 mb-1">{data.projectName}</p>
          <div className="space-y-0.5 text-[11px]">
            <p className="text-slate-400">Funds Released: <span className="text-white font-bold">{data.fundsReleasedPercent}%</span></p>
            <p className="text-slate-400">Physical Progress: <span className="text-white font-bold">{data.progressPercent}%</span></p>
            <p className="text-amber-400 font-semibold">Expenditure: ₹{data.expenditureLakhs} L</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header (Matches Screenshot 5) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
            Risk Analysis & Anomaly Detection
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            AI-driven forensic identification of project delays, budget overruns, and vendor anomalies.
          </p>
        </div>

        {/* Run Deep Scan Button */}
        <button
          onClick={handleRunDeepScan}
          disabled={scanning}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
          {scanning ? 'Forensic Scan in Progress...' : 'Run Deep Scan'}
        </button>
      </div>

      {/* 4 KPI Summary Cards (Matches Screenshot 5) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="TOTAL FLAGGED"
          value={summary ? summary.totalFlagged : 142}
          subtext="▲ 12 this week"
          subtextType="danger"
        />

        <StatCard
          label="HIGH SEVERITY"
          value={summary ? summary.highSeverityCount : 38}
          subtext="Immediate Action Required"
          subtextType="warning"
          hasRedLeftAccent={true}
        />

        <StatCard
          label="VALUE AT RISK"
          value={summary ? `₹${summary.estimatedValueAtRiskCr} Cr` : '₹4.2 Cr'}
          subtext="Estimated impact"
          subtextType="neutral"
        />

        <StatCard
          label="LAST SCAN"
          value={summary ? summary.lastScanTime : '14 mins ago'}
          subtext="Auto-refreshes daily"
          subtextType="positive"
          subtextIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
        />
      </div>

      {/* Main Grid: Left Section (Clusters + Scatter Outlier) & Right Section (Queue + Trend) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Identified Anomaly Clusters (Matches Screenshot 5) */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-bold font-display text-slate-900">
                  Identified Anomaly Clusters
                </h3>
                <p className="text-xs text-slate-500">Automated pattern grouping across audited districts</p>
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1 text-[11px] font-mono">
                {['all', 'vendor', 'cost', 'timeline'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-1 rounded capitalize transition-colors ${
                      selectedCategory === cat
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredClusters.map((cluster) => {
                const isHigh = cluster.severity.includes('High');
                return (
                  <div
                    key={cluster.id}
                    className={`p-4 rounded-lg border transition-all ${
                      isHigh
                        ? 'bg-red-50/40 border-red-200 hover:border-red-300'
                        : 'bg-amber-50/30 border-amber-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isHigh ? 'bg-red-500 ring-2 ring-red-200' : 'bg-amber-500 ring-2 ring-amber-200'
                          }`}
                        />
                        <h4 className="text-sm font-semibold text-slate-900">{cluster.title}</h4>
                      </div>
                      <span
                        className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded ${
                          isHigh ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {cluster.severity}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 mb-2 leading-relaxed">
                      {cluster.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-200/60">
                      <span>Location: {cluster.districtOrState}</span>
                      <button
                        onClick={() => navigate('/projects')}
                        className="text-blue-600 hover:text-blue-800 font-sans font-semibold inline-flex items-center gap-1"
                      >
                        {cluster.affectedProjectsCount} projects affected &rarr;
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress vs. Expenditure Outliers Scatter Chart (Matches Screenshot 5) */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold font-display text-slate-900">
                  Progress vs. Expenditure Outliers
                </h3>
                <p className="text-xs text-slate-500">Decoupling between funds released vs. physical progress</p>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1 text-red-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                  Flagged Outliers
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                  Normal
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    dataKey="progressPercent"
                    name="Physical Progress"
                    unit="%"
                    domain={[0, 100]}
                    tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  />
                  <YAxis
                    type="number"
                    dataKey="fundsReleasedPercent"
                    name="Funds Released"
                    unit="%"
                    domain={[0, 100]}
                    tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  />
                  <ZAxis type="number" range={[80, 140]} />
                  <Tooltip content={<CustomScatterTooltip />} />
                  <Scatter
                    name="Projects"
                    data={outliers}
                    fill="#1e293b"
                    shape={(props: any) => {
                      const { cx, cy, payload } = props;
                      const isHigh = payload.riskType === 'high_risk';
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isHigh ? 7 : 5}
                          fill={isHigh ? '#ef4444' : '#2563eb'}
                          stroke={isHigh ? '#fee2e2' : '#dbeafe'}
                          strokeWidth={2}
                          className="cursor-pointer hover:scale-125 transition-transform"
                          onClick={() => navigate(`/projects/${payload.projectId}`)}
                        />
                      );
                    }}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-slate-400 font-mono text-center mt-2">
              Top-left quadrant indicates high funds released (&gt;70%) with low physical progress (&lt;30%). Click dots to view project dossier.
            </p>
          </div>
        </div>

        {/* Right Column (5 cols): Prioritization Queue & Anomaly Trend */}
        <div className="lg:col-span-5 space-y-6">
          {/* High-Risk Prioritization Queue (Matches Screenshot 5) */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold font-display text-slate-900">
                  Prioritization Queue
                </h3>
                <p className="text-xs text-slate-500">Urgent forensic review recommendations</p>
              </div>
              <span className="text-xs font-mono bg-red-50 text-red-700 px-2 py-0.5 rounded font-semibold">
                {queue.length} Active
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
              {queue.map((p) => (
                <div
                  key={p.projectId}
                  className="py-3 hover:bg-slate-50 rounded px-2 transition-colors group flex items-start justify-between gap-2"
                >
                  <div
                    onClick={() => navigate(`/projects/${p.projectId}`)}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-blue-600 group-hover:underline">
                        {p.projectId}
                      </span>
                      <span className="font-mono text-xs font-bold bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                        Score: {p.riskScore}
                      </span>
                    </div>

                    <h5 className="text-xs font-medium text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {p.title}
                    </h5>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>{p.district}, {p.state}</span>
                      <span className="text-blue-600 font-semibold group-hover:underline flex items-center gap-1">
                        Dossier &rarr;
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    title="Audit with Google Maps Grounding"
                    onClick={() => {
                      setActiveMapsTarget({
                        title: p.title,
                        id: p.projectId,
                        district: p.district,
                        state: p.state,
                        coords: { latitude: p.latitude, longitude: p.longitude },
                        query: `Verify site location, terrain landmarks, and nearest civic facilities around "${p.title}" in ${p.district}, ${p.state}. Lat/Lng: ${p.latitude}, ${p.longitude}`,
                      });
                      setMapsModalOpen(true);
                    }}
                    className="p-1.5 text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded mt-1 shrink-0 transition-colors"
                  >
                    <Compass className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Anomaly Trend Chart (Past 30 Days) */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold font-display text-slate-900">
                  Anomaly Detection Trend
                </h3>
                <p className="text-xs text-slate-500">30-day detection frequency velocity</p>
              </div>
              <span className="text-xs font-mono text-emerald-600 font-semibold">+18% scan coverage</span>
            </div>

            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '11px',
                      fontFamily: 'JetBrains Mono',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="anomalies"
                    stroke="#dc2626"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#dc2626' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <GoogleMapsGroundingModal
        isOpen={mapsModalOpen}
        onClose={() => {
          setMapsModalOpen(false);
          setActiveMapsTarget(null);
        }}
        projectName={activeMapsTarget?.title}
        projectId={activeMapsTarget?.id}
        district={activeMapsTarget?.district}
        state={activeMapsTarget?.state}
        coordinates={activeMapsTarget?.coords}
        initialQuery={activeMapsTarget?.query}
      />
    </div>
  );
};
