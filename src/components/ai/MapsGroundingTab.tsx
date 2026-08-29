import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  MapPin,
  Compass,
  Search,
  ExternalLink,
  Navigation,
  Loader2,
  Building2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Map as MapIcon,
} from 'lucide-react';
import { aiService, GroundedMapsResult } from '../../services/aiService';

const SUGGESTED_MAP_QUERIES = [
  'Find primary health centers and municipal hospitals near Baramati, Maharashtra for MPLADS validation',
  'Locate district magistrate collectorate office and public libraries in Madurai, Tamil Nadu',
  'Find community sanitation complexes and public water supply facilities near Patna, Bihar',
  'Verify access roads and government schools near Varanasi, Uttar Pradesh',
];

export const MapsGroundingTab: React.FC = () => {
  const [query, setQuery] = useState('');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GroundedMapsResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setUseCurrentLocation(true);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        alert('Could not access current location. Proceeding with text-based map lookup.');
      }
    );
  };

  const handleSearch = async (queryText?: string) => {
    const textToSearch = queryText || query;
    if (!textToSearch.trim() || loading) return;

    setLoading(true);
    setError(null);
    if (queryText) setQuery(queryText);

    try {
      const data = await aiService.mapsGrounding(
        textToSearch,
        useCurrentLocation && userCoords ? userCoords : undefined
      );
      setResult(data);
    } catch (err: any) {
      console.error('Maps Grounding Error:', err);
      setError(err?.message || 'Failed to retrieve grounded Google Maps information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <MapPin className="w-3 h-3" />
              Google Maps Grounding • Gemini 3.5 Flash
            </div>
            <h2 className="text-lg font-bold font-display text-slate-900">
              GIS Geolocation & Facility Proximity Verification
            </h2>
            <p className="text-xs text-slate-600">
              Cross-reference MPLADS physical infrastructure sites against real-world Google Maps places,
              municipal landmarks, verified civic addresses, and navigation routes.
            </p>
          </div>

          <button
            type="button"
            onClick={requestLocation}
            className={`px-3 py-2 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
              useCurrentLocation
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{useCurrentLocation ? 'GPS Coords Locked' : 'Use Current GPS'}</span>
          </button>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="mt-4 flex flex-col sm:flex-row items-center gap-2"
        >
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Primary Health Centers and civic hospitals in Baramati, Maharashtra..."
              className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:bg-white rounded-lg pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapIcon className="w-4 h-4" />}
            <span>Ground via Maps</span>
          </button>
        </form>

        {/* Quick Map Suggestions */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">QUICK LOCATIONS:</span>
          {SUGGESTED_MAP_QUERIES.map((sq, idx) => (
            <button
              key={idx}
              onClick={() => handleSearch(sq)}
              disabled={loading}
              className="text-[11px] bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 text-slate-600 px-2.5 py-1 rounded border border-slate-200 transition-colors text-left"
            >
              {sq.slice(0, 45)}... &rarr;
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-800">
            Querying Google Maps Grounding & Place Directory...
          </div>
          <div className="text-xs text-slate-500 max-w-md mx-auto">
            Extracting verified geo-coordinates, municipal address markers, and place metadata for "{query}".
          </div>
        </div>
      )}

      {/* Results Container */}
      {result && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Grounded Text Analysis */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold font-display text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Grounded Spatial & Infrastructure Analysis
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                Google Maps Verified
              </span>
            </div>

            <div className="markdown-body prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed">
              <ReactMarkdown>{result.text}</ReactMarkdown>
            </div>
          </div>

          {/* Place Cards & Google Maps Links (MANDATORY Google Maps attribution) */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                VERIFIED GOOGLE MAPS PLACES ({result.places?.length || 0})
              </h3>

              {result.places && result.places.length > 0 ? (
                <div className="space-y-2.5">
                  {result.places.map((place, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-100/90 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <Building2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <div className="text-xs font-bold text-slate-900">{place.title}</div>
                            <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                              Geotagged Infrastructure Node
                            </div>
                          </div>
                        </div>

                        {place.uri && (
                          <a
                            href={place.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:text-emerald-900 p-1.5 bg-white border border-emerald-200 rounded-md hover:bg-emerald-50 transition-colors shrink-0"
                            title="Open in Google Maps"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      {place.uri && (
                        <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-emerald-700 font-semibold truncate max-w-[180px]">
                            maps.google.com
                          </span>
                          <a
                            href={place.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                          >
                            View on Map &rarr;
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded border border-slate-100">
                  Spatial context synthesized. No standalone place pins were returned in grounding metadata.
                </div>
              )}
            </div>

            {/* Field Verification Tip */}
            <div className="bg-emerald-50/60 border border-emerald-200 p-3.5 rounded-lg text-emerald-900 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Auditor Geofence Protocol
              </div>
              <p className="text-[11px] opacity-85 leading-relaxed">
                Geotag coordinates submitted by contractors must match within 250 meters of the Google Maps municipal boundary for automated milestone disbursement approval.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
