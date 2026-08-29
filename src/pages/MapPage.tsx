import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IndiaRiskMap } from '../components/dashboard/IndiaRiskMap';
import { mockStatesData, stateDistrictsMap } from '../data/mockStates';
import { projectService } from '../services/projectService';
import { Project } from '../types';
import { RiskBadge, StatusBadge } from '../components/common/Badge';
import {
  MapPin,
  Layers,
  Filter,
  Search,
  ExternalLink,
  ChevronDown,
  Navigation,
  Compass,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GoogleMapsGroundingModal } from '../components/common/GoogleMapsGroundingModal';

export const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedState, setSelectedState, addToast } = useApp();
  const [activeRiskFilter, setActiveRiskFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [searchDistrict, setSearchDistrict] = useState('');
  const [mapsModalOpen, setMapsModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeMapsTarget, setActiveMapsTarget] = useState<{
    title?: string;
    id?: string;
    district?: string;
    state?: string;
    coords?: { latitude: number; longitude: number };
    query?: string;
  } | null>(null);

  useEffect(() => {
    projectService.getAllProjects().then(setProjects).catch(console.error);
  }, []);

  const currentStateData =
    selectedState !== 'All States'
      ? mockStatesData.find((s) => s.name.toLowerCase() === selectedState.toLowerCase())
      : null;

  // Filter projects based on state & risk
  const filteredProjects = projects.filter((p) => {
    const matchesState = selectedState === 'All States' || p.state.toLowerCase() === selectedState.toLowerCase();
    const matchesRisk = activeRiskFilter === 'All' || p.riskLevel === activeRiskFilter;
    const matchesQuery = !searchDistrict || p.district.toLowerCase().includes(searchDistrict.toLowerCase()) || p.title.toLowerCase().includes(searchDistrict.toLowerCase());
    return matchesState && matchesRisk && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
            Geographic Risk & Infrastructure GIS Map
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Spatial distribution of sanctioned works, geotagged proof coordinates, and regional risk densities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                addToast('info', `Map focused on ${e.target.value}`);
              }}
              className="appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-semibold py-2 pl-3 pr-8 rounded shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              <option value="All States">All India (Overview)</option>
              {mockStatesData.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Grid: Map on Left (7 cols) + Selected State / Pin Directory on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Canvas */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
              <span className="font-bold text-slate-900 uppercase">RISK FILTER:</span>
              {(['All', 'High', 'Medium', 'Low'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setActiveRiskFilter(r)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    activeRiskFilter === r
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <span className="text-xs font-mono text-slate-500">
              {filteredProjects.length} Pins Active
            </span>
          </div>

          <div className="flex-1 min-h-[500px]">
            <IndiaRiskMap
              selectedState={selectedState}
              onSelectState={(st) => setSelectedState(st)}
            />
          </div>
        </div>

        {/* Right Info Panel */}
        <div className="lg:col-span-5 space-y-6">
          {/* State Summary Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  STATE PROFILE
                </span>
                <h3 className="text-lg font-bold font-display text-slate-900">
                  {selectedState === 'All States' ? 'National Overview (543 Constituencies)' : selectedState}
                </h3>
              </div>
              {currentStateData && (
                <span className="font-mono text-xs font-bold bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200">
                  {currentStateData.highRiskCount} High Risk
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono mb-4">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-500 block text-[10px]">TOTAL SCHEMES</span>
                <span className="text-base font-bold text-slate-900">
                  {currentStateData ? currentStateData.totalProjects : '4,520'}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-500 block text-[10px]">ALLOCATION</span>
                <span className="text-base font-bold text-slate-900">
                  ₹{currentStateData ? currentStateData.allocatedCr : '12,450'} Cr
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-500 block text-[10px]">EXPENDITURE</span>
                <span className="text-base font-bold text-slate-900">
                  ₹{currentStateData ? currentStateData.expenditureCr : '9,820'} Cr
                </span>
              </div>
              <div className="p-2.5 bg-emerald-50/50 rounded border border-emerald-100">
                <span className="text-emerald-700 block text-[10px]">UTILIZATION</span>
                <span className="text-base font-bold text-emerald-800">
                  {currentStateData ? currentStateData.utilizationRate : 78.8}%
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Sentinel GIS telemetry continuously compares reported physical milestone coordinates against registered land records and Survey of India geo-boundaries.
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500">
                Gemini 3.5 Flash Google Maps Grounding
              </span>
              <button
                type="button"
                onClick={() => {
                  setActiveMapsTarget({
                    state: selectedState,
                    query: `Find key public infrastructure, district collectorate offices, and public health centers in ${selectedState === 'All States' ? 'India' : selectedState}`,
                  });
                  setMapsModalOpen(true);
                }}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Audit Region via Maps</span>
              </button>
            </div>
          </div>

          {/* District Geofenced Works List */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold font-display text-slate-900">
                Geotagged Projects in Region
              </h3>
              <span className="text-xs font-mono text-slate-500">{filteredProjects.length} items</span>
            </div>

            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchDistrict}
                onChange={(e) => setSearchDistrict(e.target.value)}
                placeholder="Filter by district or work name..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {filteredProjects.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No projects match selected region filters.
                </div>
              ) : (
                filteredProjects.map((p) => (
                  <div
                    key={p.projectId}
                    className="py-3 hover:bg-slate-50 rounded px-2 transition-colors group flex items-start justify-between gap-3"
                  >
                    <div
                      onClick={() => navigate(`/projects/${p.projectId}`)}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-blue-600 group-hover:underline">
                          {p.projectId}
                        </span>
                        <RiskBadge level={p.riskLevel} score={p.riskScore} />
                      </div>
                      <p className="text-xs font-medium text-slate-900 truncate group-hover:text-blue-600">
                        {p.title}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {p.district}, {p.state}
                        </span>
                        <span>₹{p.sanctionedAmountLakhs}L</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      title="Inspect with Google Maps Grounding"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMapsTarget({
                          title: p.title,
                          id: p.projectId,
                          district: p.district,
                          state: p.state,
                          coords: { latitude: p.latitude, longitude: p.longitude },
                          query: `Verify infrastructure and access roads near "${p.title}" in ${p.district}, ${p.state}. GPS: ${p.latitude}, ${p.longitude}`,
                        });
                        setMapsModalOpen(true);
                      }}
                      className="p-1.5 text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded mt-1 shrink-0 transition-colors"
                    >
                      <Compass className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
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
