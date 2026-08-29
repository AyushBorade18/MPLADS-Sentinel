import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { reportService } from '../services/reportService';
import { Project } from '../types';
import { RiskBadge, StatusBadge, SectorBadge } from '../components/common/Badge';
import { UpdateStatusModal } from '../components/projects/UpdateStatusModal';
import { UploadEvidenceModal } from '../components/projects/UploadEvidenceModal';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { GoogleMapsGroundingModal } from '../components/common/GoogleMapsGroundingModal';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Flag,
  Bookmark,
  FileText,
  Edit3,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building,
  User,
  ShieldAlert,
  Camera,
  ExternalLink,
  Bot,
  Layers,
  History,
  Check,
  Sparkles,
  Compass,
} from 'lucide-react';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isMapsModalOpen, setIsMapsModalOpen] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      setLoading(true);
      const found = await projectService.getProjectById(id);
      setProject(found);
      setLoading(false);
    };
    fetchProject();
  }, [id]);

  if (loading) {
    return <LoadingState message="Fetching project dossier and audit logs..." />;
  }

  if (!project) {
    return (
      <EmptyState
        title="Project Record Not Found"
        description={`No MPLADS project found matching ID "${id}".`}
        actionText="Back to Projects Directory"
        onAction={() => navigate('/projects')}
      />
    );
  }

  const handleToggleFlag = async () => {
    const res = await projectService.toggleFlag(project.projectId);
    setProject({ ...project, isFlaggedForReview: res });
    addToast(res ? 'warning' : 'info', res ? 'Project flagged for institutional audit' : 'Flag removed');
  };

  const handleToggleBookmark = async () => {
    const res = await projectService.toggleBookmark(project.projectId);
    setProject({ ...project, isBookmarked: res });
    addToast('info', res ? 'Saved to Bookmarks' : 'Removed from Bookmarks');
  };

  const handleGenerateDossier = async () => {
    setGeneratingReport(true);
    try {
      await reportService.generateReport({
        category: 'Forensic Audit Dossier',
        financialYear: project.financialYear,
        state: project.state,
        district: project.district,
        format: 'PDF',
        includeAnomalies: true,
        includeGeotagEvidence: true,
      });
      addToast('success', `Generated Forensic Dossier for ${project.projectId}`);
      navigate('/reports');
    } catch (err) {
      addToast('error', 'Failed to generate report dossier');
    } finally {
      setGeneratingReport(false);
    }
  };

  const spentPercent = Math.min(
    100,
    Math.round((project.spentAmountLakhs / project.sanctionedAmountLakhs) * 100)
  );

  return (
    <div className="space-y-6">
      {/* Top Breadcrumbs & Back Bar (Matches Screenshots 8, 9, 10) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/projects"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Project Directory
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-lg font-bold text-slate-900">{project.projectId}</span>
            <span className="text-xs font-mono text-slate-400">Ref: {project.refCode}</span>
            <RiskBadge level={project.riskLevel} score={project.riskScore} />
            <StatusBadge status={project.status} />
            <SectorBadge sector={project.sector} />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight mt-1">
            {project.title}
          </h1>
        </div>

        {/* Action Buttons: Flag, Bookmark, Dossier, Update Status */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleToggleBookmark}
            className={`p-2 border rounded text-xs font-medium transition-colors ${
              project.isBookmarked
                ? 'bg-amber-50 border-amber-300 text-amber-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Bookmark Project"
          >
            <Bookmark className={`w-4 h-4 ${project.isBookmarked ? 'fill-amber-500' : ''}`} />
          </button>

          <button
            onClick={handleToggleFlag}
            className={`inline-flex items-center gap-1.5 px-3 py-2 border rounded text-xs font-medium transition-colors ${
              project.isFlaggedForReview
                ? 'bg-red-50 border-red-300 text-red-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Flag className={`w-3.5 h-3.5 ${project.isFlaggedForReview ? 'fill-red-600' : ''}`} />
            {project.isFlaggedForReview ? 'Flagged for Audit' : 'Flag for Review'}
          </button>

          <button
            onClick={handleGenerateDossier}
            disabled={generatingReport}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold shadow-2xs transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            {generatingReport ? 'Compiling Dossier...' : 'Audit Dossier'}
          </button>

          <button
            onClick={() => setIsUpdateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-2xs transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Update Status
          </button>
        </div>
      </div>

      {/* 4 Key Metrics Row (Matches Screenshot 8) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Sanctioned */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1">
            SANCTIONED AMOUNT
          </p>
          <p className="text-2xl font-bold font-mono text-slate-900">
            ₹ {project.sanctionedAmountLakhs.toFixed(2)} L
          </p>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            Sanction: {project.sanctionDate}
          </p>
        </div>

        {/* Released */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1">
            RELEASED TRANCHE
          </p>
          <p className="text-2xl font-bold font-mono text-slate-900">
            ₹ {project.releasedAmountLakhs.toFixed(2)} L
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Tranche 1: 100% of Initial Allocation
          </p>
        </div>

        {/* Expenditure */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1">
            TOTAL EXPENDITURE
          </p>
          <p className="text-2xl font-bold font-mono text-slate-900">
            ₹ {project.spentAmountLakhs.toFixed(2)} L
          </p>
          <p className="text-xs text-emerald-600 font-medium mt-1">
            ✓ {spentPercent}% Disbursed
          </p>
        </div>

        {/* Physical Progress */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1">
            PHYSICAL PROGRESS
          </p>
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {project.physicalProgressPercent}%
            </span>
            <span className="text-xs text-red-600 font-medium">Expected: 80%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                project.physicalProgressPercent > 70
                  ? 'bg-emerald-500'
                  : project.physicalProgressPercent > 30
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${project.physicalProgressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Left Detailed Columns (Timeline, Risk, Nodal) + Right (Evidence, Map, Audit) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Progress & Milestone Timeline (Matches Screenshot 8, 10) */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold font-display text-slate-900">
                  Execution Milestones & Schedule
                </h3>
                <p className="text-xs text-slate-500">Statutory sanction to handover progression</p>
              </div>
              <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                Target: {project.targetCompletionDate || project.completedDate || 'FY 2024-Q4'}
              </span>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {project.milestones.map((ms, idx) => {
                const isCompleted = ms.status === 'completed';
                const isCurrent = ms.status === 'current';
                const isDelayed = ms.status === 'delayed';

                return (
                  <div key={idx} className="relative group">
                    {/* Circle icon */}
                    <div
                      className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isCompleted
                          ? 'bg-emerald-500 text-white'
                          : isDelayed
                          ? 'bg-red-500 text-white animate-pulse'
                          : isCurrent
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-3 h-3" />
                      ) : isDelayed ? (
                        '!'
                      ) : (
                        idx + 1
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-900">{ms.step}</span>
                        <span className="font-mono text-slate-500">{ms.date}</span>
                      </div>
                      {ms.description && (
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          {ms.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Forensic Risk & Anomaly Assessment (Matches Screenshot 8) */}
          <div className="bg-white rounded-lg border border-red-200 p-6 shadow-2xs">
            <div className="flex items-start justify-between mb-4 border-b border-red-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-red-100 text-red-700 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-display text-slate-900">
                    Sentinel Anomaly Assessment
                  </h3>
                  <p className="text-xs text-red-700 font-medium">
                    Automated Forensic Anomaly Score: {project.riskScore} / 100
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/ai-assistant')}
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold"
              >
                <Bot className="w-3.5 h-3.5" />
                Ask AI Assistant
              </button>
            </div>

            {/* Risk Triggers */}
            <div className="space-y-3 mb-4">
              {project.riskFactors.length === 0 ? (
                <p className="text-xs text-slate-500">No active anomaly triggers identified.</p>
              ) : (
                project.riskFactors.map((rf, i) => (
                  <div
                    key={i}
                    className="p-3 bg-red-50/50 rounded border border-red-100 flex items-start gap-3"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs mb-0.5">
                        <span className="font-semibold text-red-950">{rf.title || rf.name || 'Risk Indicator'}</span>
                        <span className="font-mono text-[10px] bg-red-100 text-red-800 px-1.5 py-0.2 rounded">
                          {rf.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{rf.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Recommended Auditor Directive */}
            <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
              <span className="font-semibold text-slate-800 block mb-1">
                Suggested Institutional Directive:
              </span>
              <p className="text-slate-600 leading-relaxed">
                Withhold subsequent tranche releases until physical field audit by District Nodal
                Officer confirms plinth depth and material invoice reconciliation against PWD
                Schedule of Rates.
              </p>
            </div>
          </div>

          {/* MP & Executing Agency Info */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs">
            <h3 className="text-base font-bold font-display text-slate-900 mb-4">
              Nodal Authority & Implementing Agency
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 font-mono uppercase text-[10px]">
                  RECOMMENDING MP
                </span>
                <p className="font-semibold text-slate-900 text-sm">{project.mpName}</p>
                <p className="text-slate-600">{project.constituency} Constituency, {project.state}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 font-mono uppercase text-[10px]">
                  IMPLEMENTING AGENCY
                </span>
                <p className="font-semibold text-slate-900 text-sm">{project.implementingAgency}</p>
                <p className="text-slate-600">District Collectorate Cell</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Geotagged Evidence, Mini Map, Audit Trail */}
        <div className="lg:col-span-5 space-y-6">
          {/* Geotagged Visual Evidence Card (Matches Screenshot 8, 9) */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold font-display text-slate-900">
                  Geotagged Site Evidence
                </h3>
                <p className="text-xs text-slate-500">Photographic inspection records</p>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
              >
                <Camera className="w-3.5 h-3.5" />
                + Upload Photo
              </button>
            </div>

            <div className="space-y-4">
              {project.evidence.map((ev) => (
                <div
                  key={ev.id}
                  className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50/50"
                >
                  {ev.missing ? (
                    <div className="p-4 text-center bg-amber-50/60 border border-amber-200 rounded m-2">
                      <AlertTriangle className="w-6 h-6 text-amber-600 mx-auto mb-1" />
                      <p className="text-xs font-semibold text-amber-900">{ev.title}</p>
                      <p className="text-[11px] text-amber-700 mt-0.5">{ev.description}</p>
                      <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="mt-2 text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        Upload Verified Snapshot &rarr;
                      </button>
                    </div>
                  ) : (
                    <div>
                      {ev.imageUrl && (
                        <div className="relative h-44 w-full bg-slate-200">
                          <img
                            src={ev.imageUrl}
                            alt={ev.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-1 rounded">
                            GPS: {ev.latitude?.toFixed(4)}° N, {ev.longitude?.toFixed(4)}° E
                          </div>
                        </div>
                      )}
                      <div className="p-3">
                        <p className="text-xs font-semibold text-slate-900">{ev.title}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5">{ev.description}</p>
                        <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                          <span>Verified by: {ev.verifiedBy}</span>
                          <span>{ev.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Mini Interactive GIS Location Snippet */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Constituency GIS Map
              </h3>
              <span className="text-[11px] font-mono text-slate-500">
                {project.latitude.toFixed(4)}, {project.longitude.toFixed(4)}
              </span>
            </div>

            <div className="h-44 rounded-lg bg-slate-100 border border-slate-200 relative overflow-hidden flex items-center justify-center">
              {/* Patterned Map Grid */}
              <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:12px_12px] opacity-40"></div>

              {/* Pin representation */}
              <div className="z-10 flex flex-col items-center animate-bounce">
                <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg ring-4 ring-red-100">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="mt-1 bg-slate-900 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow">
                  {project.district} Ward Cadastre
                </div>
              </div>

              <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded text-[9px] font-mono text-slate-500 border border-slate-200">
                Sentinel Geofence Active
              </div>
            </div>

            {/* Google Maps Grounding Audit Trigger */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Google Maps Grounding
                </div>
                <div className="text-[11px] text-slate-500">
                  Gemini 3.5 Flash geospatial audit of nearby roads & civic places
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMapsModalOpen(true)}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Verify with Maps</span>
              </button>
            </div>
          </div>

          {/* Audit Log & Provenance History */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-600" />
                Provenance & Audit Trail
              </h3>
              <span className="text-xs text-slate-400 font-mono">{project.auditLogs.length} events</span>
            </div>

            <div className="space-y-3 text-xs">
              {project.auditLogs.map((log) => (
                <div key={log.id} className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-800">{log.action}</span>
                    <span className="text-[10px] font-mono text-slate-400">{log.timestamp}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-normal">{log.details}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    By: {log.actor} ({log.role})
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UpdateStatusModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        project={project}
        onUpdated={(u) => setProject(u)}
      />

      <UploadEvidenceModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        project={project}
        onEvidenceAdded={(u) => setProject(u)}
      />

      <GoogleMapsGroundingModal
        isOpen={isMapsModalOpen}
        onClose={() => setIsMapsModalOpen(false)}
        projectName={project.title}
        projectId={project.projectId}
        district={project.district}
        state={project.state}
        coordinates={{ latitude: project.latitude, longitude: project.longitude }}
      />
    </div>
  );
};
