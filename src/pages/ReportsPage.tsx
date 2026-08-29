import React, { useState, useEffect } from 'react';
import { reportService, GenerateReportParams } from '../services/reportService';
import { ReportItem } from '../types';
import { mockStatesData } from '../data/mockStates';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Download,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Calendar,
  Building,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { LoadingState } from '../components/common/LoadingState';

export const ReportsPage: React.FC = () => {
  const { addToast } = useApp();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [formParams, setFormParams] = useState<GenerateReportParams>({
    category: 'Financial Audit',
    financialYear: '2023-2024',
    state: 'National (All States)',
    format: 'PDF',
    includeAnomalies: true,
    includeGeotagEvidence: true,
  });

  const fetchReports = async () => {
    setLoading(true);
    const list = await reportService.getRecentReports();
    setReports(list);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDownload = async (reportId: string) => {
    try {
      await reportService.downloadReport(reportId);
      addToast('success', 'Report dossier downloaded successfully');
    } catch (err) {
      addToast('error', 'Failed to download report file');
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const newReport = await reportService.generateReport(formParams);
      setReports([newReport, ...reports]);
      addToast('success', `Generated report: ${newReport.title}`);
      setIsGenerateModalOpen(false);
    } catch (err) {
      addToast('error', 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    const matchesCat = categoryFilter === 'All' || r.category === categoryFilter;
    const matchesQ =
      !searchQuery ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQ;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
            Institutional Audit Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Parliamentary oversight summaries, statutory forensic dossiers, and fund reconciliation extracts.
          </p>
        </div>

        <button
          onClick={() => setIsGenerateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-2xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Generate Custom Audit Report
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category tabs */}
        <div className="flex flex-wrap items-center gap-1 text-xs">
          {['All', 'Financial Audit', 'Risk Intelligence', 'Sectoral Analysis', 'Institutional'].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded transition-colors ${
                  categoryFilter === cat
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search report title or ID..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <LoadingState message="Loading audit dossier records..." />
      ) : filteredReports.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center text-slate-500 text-sm">
          No reports found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-lg border border-slate-200 p-6 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-blue-600">
                      {report.id}
                    </span>
                    <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 uppercase">
                      {report.category}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {report.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-2 leading-snug">
                  {report.title}
                </h3>

                <p className="text-xs text-slate-600 mb-4 line-clamp-3 leading-relaxed">
                  {report.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
                <div className="space-x-3">
                  <span>{report.financialYear}</span>
                  <span>•</span>
                  <span>{report.format} ({report.fileSize})</span>
                </div>

                <button
                  onClick={() => handleDownload(report.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generate Report Modal */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Generate Institutional Audit Report"
        subtitle="Compile automated forensic findings, financial ledgers, and geotag proof into an official synthesis"
        maxWidth="lg"
      >
        <form onSubmit={handleGenerate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Report Category *</label>
            <select
              value={formParams.category}
              onChange={(e) => setFormParams({ ...formParams, category: e.target.value })}
              className="w-full border border-slate-300 rounded px-3 py-2 text-slate-800 bg-white"
            >
              <option value="Financial Audit">Financial Audit & Discrepancy Reconciliation</option>
              <option value="Risk Intelligence">Risk Intelligence & Vendor Concentration Dossier</option>
              <option value="Sectoral Analysis">Sectoral Infrastructure Distribution Analysis</option>
              <option value="Institutional">Statutory Annual Oversight Summary</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Financial Year *</label>
              <select
                value={formParams.financialYear}
                onChange={(e) => setFormParams({ ...formParams, financialYear: e.target.value })}
                className="w-full border border-slate-300 rounded px-3 py-2 text-slate-800 bg-white"
              >
                <option value="2023-2024">FY 2023-2024</option>
                <option value="2022-2023">FY 2022-2023</option>
                <option value="2021-2022">FY 2021-2022</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Export Format *</label>
              <select
                value={formParams.format}
                onChange={(e) =>
                  setFormParams({ ...formParams, format: e.target.value as 'PDF' | 'XLSX' | 'CSV' })
                }
                className="w-full border border-slate-300 rounded px-3 py-2 text-slate-800 bg-white"
              >
                <option value="PDF">PDF (Formal Dossier)</option>
                <option value="XLSX">Excel Spreadsheet (.xlsx)</option>
                <option value="CSV">Raw CSV Data Stream</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">State / Territory Scope *</label>
            <select
              value={formParams.state}
              onChange={(e) => setFormParams({ ...formParams, state: e.target.value })}
              className="w-full border border-slate-300 rounded px-3 py-2 text-slate-800 bg-white"
            >
              <option value="National (All States)">National (All 543 Constituencies)</option>
              {mockStatesData.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formParams.includeAnomalies}
                onChange={(e) =>
                  setFormParams({ ...formParams, includeAnomalies: e.target.checked })
                }
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-700 font-medium">
                Include Anomaly Cluster Diagnostics & Decoupling Flags
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formParams.includeGeotagEvidence}
                onChange={(e) =>
                  setFormParams({ ...formParams, includeGeotagEvidence: e.target.checked })
                }
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-700 font-medium">
                Include Geotagged Site Verification Coordinates & Drone Inspection Logs
              </span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsGenerateModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded text-slate-700 font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={generating}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {generating ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  Synthesizing Report...
                </>
              ) : (
                'Generate & Publish Report'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
