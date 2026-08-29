import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Search,
  Globe,
  ExternalLink,
  Loader2,
  Sparkles,
  AlertCircle,
  FileText,
  Bookmark,
  Share2,
  TrendingUp,
} from 'lucide-react';
import { aiService, GroundedSearchResult } from '../../services/aiService';

const SUGGESTED_SEARCH_TOPICS = [
  'Latest MoSPI circulars and guidelines for MPLADS 2023-24 revision',
  'Parliamentary standing committee report on MPLADS unspent funds',
  'State-wise utilization of MPLADS funds for disaster relief and emergency response',
  'Permissible works checklist under MPLADS for community solar infrastructure',
];

export const SearchGroundingTab: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GroundedSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (queryText?: string) => {
    const textToSearch = queryText || query;
    if (!textToSearch.trim() || loading) return;

    setLoading(true);
    setError(null);
    if (queryText) setQuery(queryText);

    try {
      const data = await aiService.searchGrounding(textToSearch);
      setResult(data);
    } catch (err: any) {
      console.error('Search Grounding Error:', err);
      setError(err?.message || 'Failed to retrieve grounded web search facts.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Globe className="w-3 h-3" />
            Google Search Grounding • Gemini 3.5 Flash
          </div>
          <h2 className="text-lg font-bold font-display text-slate-900">
            Real-Time Public Web Intelligence & Statutory Circulars
          </h2>
          <p className="text-xs text-slate-600">
            Ground audit analyses with live Google Search citations, national gazette notifications,
            CAG parliamentary audit reports, and MoSPI press releases.
          </p>
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
              placeholder="e.g., Latest MoSPI circulars and rules for MPLADS unspent balance carryover..."
              className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white rounded-lg pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Ground with Search</span>
          </button>
        </form>

        {/* Quick Topics */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">HOT TOPICS:</span>
          {SUGGESTED_SEARCH_TOPICS.map((st, idx) => (
            <button
              key={idx}
              onClick={() => handleSearch(st)}
              disabled={loading}
              className="text-[11px] bg-slate-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-800 text-slate-600 px-2.5 py-1 rounded border border-slate-200 transition-colors text-left"
            >
              {st.slice(0, 48)}... &rarr;
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
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-800">
            Searching Live Web via Google Search Grounding...
          </div>
          <div className="text-xs text-slate-500 max-w-md mx-auto">
            Retrieving trusted government portals, circulars, and verified journalistic reports.
          </div>
        </div>
      )}

      {/* Results View */}
      {result && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Answer Content */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold font-display text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Live Web-Grounded Assessment
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                Google Search Verified
              </span>
            </div>

            <div className="markdown-body prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed">
              <ReactMarkdown>{result.text}</ReactMarkdown>
            </div>
          </div>

          {/* Web Sources & Grounding Citations */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-blue-600" />
                WEB CITATIONS & SOURCES ({result.sources?.length || 0})
              </h3>

              {result.sources && result.sources.length > 0 ? (
                <div className="space-y-2.5">
                  {result.sources.map((src, idx) => (
                    <a
                      key={idx}
                      href={src.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50/60 hover:border-blue-300 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 line-clamp-2">
                          {src.title}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 mt-0.5" />
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mt-1 truncate">
                        {src.uri}
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded border border-slate-100">
                  Search synthesis compiled without individual URL anchors.
                </div>
              )}
            </div>

            {/* Generated Search Queries */}
            {result.searchQueries && result.searchQueries.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
                <h4 className="text-[11px] font-mono font-semibold uppercase text-slate-500 mb-2">
                  INTERNAL SEARCH QUERIES
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.searchQueries.map((sq, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                    >
                      {sq}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
