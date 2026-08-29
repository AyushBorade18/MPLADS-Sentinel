import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  MapPin,
  ExternalLink,
  Loader2,
  Building2,
  AlertCircle,
  Sparkles,
  Compass,
  Navigation,
  CheckCircle2,
  X,
  Copy,
  Check,
  RefreshCw,
  Search,
} from 'lucide-react';
import { aiService, GroundedMapsResult } from '../../services/aiService';

interface GoogleMapsGroundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName?: string;
  projectId?: string;
  district?: string;
  state?: string;
  coordinates?: { latitude: number; longitude: number };
  initialQuery?: string;
}

export const GoogleMapsGroundingModal: React.FC<GoogleMapsGroundingModalProps> = ({
  isOpen,
  onClose,
  projectName,
  projectId,
  district,
  state,
  coordinates,
  initialQuery,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GroundedMapsResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Initialize query on open
  useEffect(() => {
    if (isOpen) {
      const defaultQuery =
        initialQuery ||
        (projectName
          ? `Verify infrastructure, municipal landmarks, and civic facilities near "${projectName}" in ${district || ''}, ${state || 'India'}. Include verified place coordinates and proximity to public roads.`
          : district
          ? `Find major public health centers, schools, and government collectorate offices in ${district}, ${state || 'India'}`
          : 'Find civic infrastructure facilities and public health centers near Baramati, Maharashtra');

      setQuery(defaultQuery);
      handleSearch(defaultQuery);
    } else {
      setResult(null);
      setError(null);
    }
  }, [isOpen, projectName, district, state, coordinates]);

  const handleSearch = async (queryText?: string) => {
    const textToSearch = queryText || query;
    if (!textToSearch.trim() || loading) return;

    setLoading(true);
    setError(null);
    if (queryText) setQuery(queryText);

    try {
      const data = await aiService.mapsGrounding(
        textToSearch,
        coordinates ? { latitude: coordinates.latitude, longitude: coordinates.longitude } : undefined
      );
      setResult(data);
    } catch (err: any) {
      console.error('Google Maps Grounding Error:', err);
      setError(err?.message || 'Failed to retrieve grounded Google Maps information.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const exportText = `=== GOOGLE MAPS GROUNDING AUDIT REPORT ===\nProject: ${projectName || 'General Query'}\nLocation: ${district || ''}, ${state || ''}\nCoordinates: ${coordinates ? `${coordinates.latitude}, ${coordinates.longitude}` : 'N/A'}\nModel: gemini-3.5-flash (with googleMaps tool)\n\n--- FINDINGS ---\n${result.text}\n\n--- VERIFIED PLACES ---\n${result.places.map((p) => `• ${p.title} (${p.uri})`).join('\n')}`;
    navigator.clipboard.writeText(exportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-display text-slate-900">
                  Google Maps Grounding Verification
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                  gemini-3.5-flash • googleMaps
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {projectName ? `${projectName} (${projectId || 'MPLADS Work'})` : 'Live GIS Grounding Audit'}
                {district && ` • ${district}, ${state}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Coords & Search bar */}
        <div className="p-4 bg-white border-b border-slate-100 space-y-3">
          {coordinates && (
            <div className="flex items-center justify-between text-xs bg-emerald-50/80 border border-emerald-200 text-emerald-900 px-3 py-2 rounded-lg font-mono">
              <span className="flex items-center gap-1.5 font-semibold">
                <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                Target GPS Coords: {coordinates.latitude.toFixed(5)}° N, {coordinates.longitude.toFixed(5)}° E
              </span>
              <span className="text-[10px] text-emerald-700">Bound to retrievalConfig.latLng</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask Gemini to verify specific landmarks, hospitals, or roads near this site..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>Verify with Maps</span>
            </button>
          </form>

          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">QUICK AUDIT:</span>
            {[
              'Nearby health centers & clinics',
              'Govt schools in 5km radius',
              'Access road & bus depot connectivity',
              'Sanitation & water reservoirs',
            ].map((tag, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  const targetQ = `${tag} near ${projectName || district || 'this site'}${district ? `, ${district}` : ''}`;
                  handleSearch(targetQ);
                }}
                disabled={loading}
                className="text-[10px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 px-2 py-0.5 rounded border border-slate-200 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Content body */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading && (
            <div className="py-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-800">
                Grounding with Google Maps via Gemini 3.5 Flash...
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Validating site geography, road connections, and nearby municipal establishments.
              </p>
            </div>
          )}

          {result && !loading && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Grounded Analysis (7 cols) */}
              <div className="lg:col-span-7 bg-slate-50/70 rounded-lg border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold font-display text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Grounded Spatial Verification
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                    Google Maps Grounded
                  </span>
                </div>

                <div className="markdown-body prose prose-slate max-w-none text-xs leading-relaxed">
                  <ReactMarkdown>{result.text}</ReactMarkdown>
                </div>
              </div>

              {/* Right: Place Links & Google Maps Attribution (5 cols) */}
              <div className="lg:col-span-5 space-y-3">
                <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-2xs">
                  <h4 className="text-xs font-mono font-bold uppercase text-slate-600 mb-2.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    VERIFIED GOOGLE MAPS PLACES ({result.places?.length || 0})
                  </h4>

                  {result.places && result.places.length > 0 ? (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {result.places.map((place, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50/40 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2">
                              <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs font-bold text-slate-900 leading-snug">{place.title}</p>
                                <span className="text-[10px] font-mono text-slate-500">Verified POI</span>
                              </div>
                            </div>
                            {place.uri && (
                              <a
                                href={place.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-emerald-700 bg-white border border-emerald-200 rounded hover:bg-emerald-50 shrink-0 transition-colors"
                                title="Open in Google Maps"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>

                          {place.uri && (
                            <div className="mt-2 pt-1.5 border-t border-slate-200/80 flex items-center justify-between text-[10px]">
                              <span className="font-mono text-emerald-700 font-semibold truncate max-w-[130px]">
                                maps.google.com
                              </span>
                              <a
                                href={place.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-700 font-semibold hover:underline flex items-center gap-0.5"
                              >
                                View Location &rarr;
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 py-3 text-center">
                      No explicit place markers extracted. The narrative contains general geospatial grounding.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Grounding engine: Gemini 3.5 Flash • Real-time Google Maps Places
          </span>

          <div className="flex items-center gap-2">
            {result && (
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-md text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Audit Report'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
