import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FolderKanban, MapPin, ArrowRight, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { projectService } from '../../services/projectService';
import { Project } from '../../types';
import { RiskBadge, StatusBadge } from '../common/Badge';

export const GlobalSearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Keyboard shortcut Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen) {
      setQuery('');
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      if (query.trim()) {
        setLoading(true);
        const res = await projectService.filterProjects({ searchQuery: query, pageSize: 6 });
        setResults(res.projects);
        setLoading(false);
      } else {
        const res = await projectService.filterProjects({ pageSize: 5 });
        setResults(res.projects);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, isSearchOpen]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
        onClick={() => setIsSearchOpen(false)}
      />

      <div className="relative bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 z-10">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects by ID, MP, District, Sector, or Keyword..."
            className="w-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600 mr-2">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="font-mono text-xs bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100">
          {loading ? (
            <div className="p-6 text-center text-xs text-slate-500">Searching records...</div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No matching records found for "{query}"
            </div>
          ) : (
            results.map((project) => (
              <div
                key={project.projectId}
                onClick={() => {
                  navigate(`/projects/${project.projectId}`);
                  setIsSearchOpen(false);
                }}
                className="p-3 hover:bg-slate-50 rounded-lg cursor-pointer flex items-center justify-between transition-colors group"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-semibold text-blue-600">
                      {project.projectId}
                    </span>
                    <StatusBadge status={project.status} />
                    <RiskBadge level={project.riskLevel} score={project.riskScore} />
                  </div>
                  <h5 className="text-xs font-medium text-slate-900 truncate">{project.title}</h5>
                  <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>{project.mpName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {project.district}, {project.state}
                    </span>
                    <span>•</span>
                    <span className="font-mono font-medium text-slate-700">
                      ₹ {project.sanctionedAmountLakhs}L
                    </span>
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors shrink-0" />
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Search spans 4,520 nationwide MPLADS schemes</span>
          <div className="flex items-center gap-3">
            <span>Press Enter to select</span>
          </div>
        </div>
      </div>
    </div>
  );
};
