import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Download,
  Plus,
  Filter,
  RotateCcw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpDown,
  ExternalLink,
  MapPin,
  FileSpreadsheet,
} from 'lucide-react';
import { projectService, ProjectFilters } from '../services/projectService';
import { Project, ProjectStatus, RiskLevel, Sector } from '../types';
import { RiskBadge, StatusBadge, SectorBadge } from '../components/common/Badge';
import { NewProjectModal } from '../components/projects/NewProjectModal';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState } from '../components/common/LoadingState';
import { useApp } from '../context/AppContext';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useApp();

  // Filters State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'All Statuses');
  const [riskFilter, setRiskFilter] = useState(searchParams.get('risk') || 'All Risk Levels');
  const [financialYearFilter, setFinancialYearFilter] = useState('2023-2024');
  const [sectorFilter, setSectorFilter] = useState('All Sectors');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);

  // Sorting
  const [sortBy, setSortBy] = useState<
    'riskScore' | 'recommendedAmount' | 'totalPaid' | 'recommendationDate' | 'progress'
  >('riskScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Data state
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const result = await projectService.filterProjects({
        searchQuery,
        status: statusFilter,
        riskLevel: riskFilter,
        financialYear: financialYearFilter,
        sector: sectorFilter,
        sortBy,
        sortOrder,
        page: currentPage,
        pageSize,
      });

      setProjects(result.projects);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (err) {
      addToast('error', 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [
    currentPage,
    sortBy,
    sortOrder,
    statusFilter,
    riskFilter,
    financialYearFilter,
    sectorFilter,
  ]);

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchProjects();
    addToast('info', 'Filters applied');
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All Statuses');
    setRiskFilter('All Risk Levels');
    setFinancialYearFilter('2023-2024');
    setSectorFilter('All Sectors');
    setCurrentPage(1);
    setSearchParams({});
    addToast('info', 'Filters reset to default');
  };

  const handleExportCSV = () => {
    if (projects.length === 0) return;
    const headers = ['Project ID', 'Ref Code', 'Title', 'MP Name', 'District', 'State', 'Sector', 'Sanctioned (Lakhs)', 'Spent (Lakhs)', 'Status', 'Risk Level', 'Risk Score'];
    const csvRows = [
      headers.join(','),
      ...projects.map((p) =>
        [
          `"${p.projectId}"`,
          `"${p.refCode}"`,
          `"${p.title.replace(/"/g, '""')}"`,
          `"${p.mpName}"`,
          `"${p.district}"`,
          `"${p.state}"`,
          `"${p.sector}"`,
          p.sanctionedAmountLakhs,
          p.spentAmountLakhs,
          p.status,
          p.riskLevel,
          p.riskScore,
        ].join(',')
      ),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MPLADS_Projects_Export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Project directory exported to CSV');
  };

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header (Matches Screenshot 3) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
            Project Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Comprehensive list of all MPLADS allocations and their current execution status.
          </p>
        </div>

        {/* Action Buttons: Export CSV & + New Project */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </button>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Project
          </button>
        </div>
      </div>

      {/* Filter Row (Matches Screenshot 3) */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-center">
          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 font-semibold mb-1">
              STATUS
            </label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs py-2 pl-3 pr-8 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option value="All Statuses">All Statuses</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Delayed">Delayed</option>
                <option value="Sanctioned">Sanctioned</option>
                <option value="Proposed">Proposed</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Risk Level Filter */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 font-semibold mb-1">
              RISK LEVEL
            </label>
            <div className="relative">
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs py-2 pl-3 pr-8 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option value="All Risk Levels">All Risk Levels</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Financial Year Filter */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 font-semibold mb-1">
              FINANCIAL YEAR
            </label>
            <div className="relative">
              <select
                value={financialYearFilter}
                onChange={(e) => setFinancialYearFilter(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs py-2 pl-3 pr-8 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option value="2023-2024">2023-2024</option>
                <option value="2022-2023">2022-2023</option>
                <option value="2021-2022">2021-2022</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Sector Filter */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-slate-400 font-semibold mb-1">
              SECTOR
            </label>
            <div className="relative">
              <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs py-2 pl-3 pr-8 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option value="All Sectors">All Sectors</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Health">Health</option>
                <option value="Education">Education</option>
                <option value="Energy">Energy</option>
                <option value="Water & Sanitation">Water & Sanitation</option>
                <option value="Agriculture">Agriculture</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Reset Button */}
          <div className="pt-4 sm:pt-4">
            <button
              onClick={handleResetFilters}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              Reset
            </button>
          </div>

          {/* Apply Filters Button (Matches Screenshot 3) */}
          <div className="pt-4 sm:pt-4">
            <button
              onClick={handleApplyFilters}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-2xs transition-colors"
            >
              <Filter className="w-3.5 h-3.5" />
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Projects Data Table Container */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <LoadingState message="Fetching project directory records..." />
        ) : projects.length === 0 ? (
          <EmptyState
            title="No Projects Match Selected Filters"
            description="Clear search or adjust sector/risk parameters to view records."
            actionText="Reset All Filters"
            onAction={handleResetFilters}
          />
        ) : (
          <>
            {/* Mobile Cards View (Visible on < md screens) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {projects.map((project) => {
                const spentPercent = Math.min(
                  100,
                  Math.round((project.spentAmountLakhs / project.sanctionedAmountLakhs) * 100)
                );

                return (
                  <div
                    key={project.projectId}
                    onClick={() => navigate(`/projects/${project.projectId}`)}
                    className="p-4 hover:bg-slate-50 transition-colors cursor-pointer space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-mono font-bold text-blue-600">
                          {project.projectId}
                        </span>
                        <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 mt-0.5">
                          {project.title}
                        </h3>
                      </div>
                      <RiskBadge level={project.riskLevel} score={project.riskScore} />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <StatusBadge status={project.status} />
                      <SectorBadge sector={project.sector} />
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {project.district}, {project.state}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-500">Sanctioned: ₹{project.sanctionedAmountLakhs.toFixed(2)}L</span>
                        <span className="font-semibold text-slate-800">
                          Exp: ₹{project.spentAmountLakhs.toFixed(2)}L ({spentPercent}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            spentPercent > 80
                              ? 'bg-emerald-500'
                              : spentPercent > 30
                              ? 'bg-blue-600'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${spentPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500 font-medium truncate">
                        MP: {project.mpName}
                      </span>
                      <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 shrink-0">
                        View Details &rarr;
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Full Table View (Hidden on mobile, visible on md+) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-mono uppercase tracking-wider text-slate-500">
                    <th
                      onClick={() => toggleSort('riskScore')}
                      className="py-3.5 px-4 font-semibold cursor-pointer hover:text-slate-800"
                    >
                      <div className="flex items-center gap-1">
                        <span>PROJECT ID</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4 font-semibold">PROJECT NAME</th>
                    <th className="py-3.5 px-4 font-semibold">MP & DISTRICT</th>
                    <th className="py-3.5 px-4 font-semibold">SECTOR</th>
                    <th
                      onClick={() => toggleSort('recommendedAmount')}
                      className="py-3.5 px-4 font-semibold cursor-pointer hover:text-slate-800"
                    >
                      <div className="flex items-center gap-1">
                        <span>FINANCIALS (₹ LAKHS)</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4 font-semibold">STATUS & RISK</th>
                    <th className="py-3.5 px-4 font-semibold text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {projects.map((project) => {
                    const spentPercent = Math.min(
                      100,
                      Math.round((project.spentAmountLakhs / project.sanctionedAmountLakhs) * 100)
                    );

                    return (
                      <tr
                        key={project.projectId}
                        onClick={() => navigate(`/projects/${project.projectId}`)}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                      >
                        {/* Project ID */}
                        <td className="py-4 px-4 font-mono font-medium text-blue-600 whitespace-nowrap">
                          {project.projectId}
                        </td>

                        {/* Project Name & Ref code */}
                        <td className="py-4 px-4 max-w-xs">
                          <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {project.title}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                            Ref: {project.refCode}
                          </div>
                        </td>

                        {/* MP & District */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="font-medium text-slate-800">{project.mpName}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {project.district}, {project.state}
                          </div>
                        </td>

                        {/* Sector */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <SectorBadge sector={project.sector} />
                        </td>

                        {/* Financials: Sanctioned, Spent & Progress Bar */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center justify-between font-mono text-xs">
                            <span className="font-semibold text-slate-900">
                              {project.sanctionedAmountLakhs.toFixed(2)}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Exp: {project.spentAmountLakhs.toFixed(2)} ({spentPercent}%)
                            </span>
                          </div>
                          <div className="w-36 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                spentPercent > 80
                                  ? 'bg-emerald-500'
                                  : spentPercent > 30
                                  ? 'bg-blue-600'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${spentPercent}%` }}
                            />
                          </div>
                        </td>

                        {/* Status & Risk */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <StatusBadge status={project.status} />
                            <RiskBadge level={project.riskLevel} score={project.riskScore} />
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/projects/${project.projectId}`);
                            }}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                          >
                            View Details &rarr;
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination Bar (Matches Screenshot 3) */}
        <div className="px-4 py-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <p className="text-[11px] font-mono">
            Showing <span className="font-semibold text-slate-900">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-semibold text-slate-900">
              {Math.min(currentPage * pageSize, totalCount)}
            </span>{' '}
            of <span className="font-semibold text-slate-900">{totalCount}</span> entries
          </p>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              const isActive = currentPage === pageNum;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded text-xs font-medium ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {totalPages > 5 && (
              <>
                <span className="px-1 text-slate-400">...</span>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className={`w-7 h-7 rounded text-xs font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 ${
                    currentPage === totalPages ? 'bg-blue-600 text-white font-bold' : ''
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* New Project Registration Modal */}
      <NewProjectModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onProjectCreated={(created) => {
          setProjects([created, ...projects]);
          setTotalCount((c) => c + 1);
        }}
      />
    </div>
  );
};
