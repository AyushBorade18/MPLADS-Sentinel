import React, { useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  ShieldAlert,
  MapPin,
  FileText,
  Settings,
  Search,
  Sparkles,
  X,
  Building2,
  HelpCircle,
  ShieldCheck,
  Plus,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHelp: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose, onOpenHelp }) => {
  const { setIsSearchOpen, unreadCount } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Close sidebar on route change
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Projects Directory',
      path: '/projects',
      icon: FolderKanban,
      badge: '4,520',
    },
    {
      name: 'Risk Analysis & Anomalies',
      path: '/risk-analysis',
      icon: ShieldAlert,
      badge: '124 High',
      badgeColor: 'bg-red-100 text-red-700 font-bold',
    },
    {
      name: 'Geographic GIS Map',
      path: '/map',
      icon: MapPin,
      badge: null,
    },
    {
      name: 'Audit Reports Dossier',
      path: '/reports',
      icon: FileText,
      badge: null,
    },
    {
      name: 'System Settings & Rules',
      path: '/settings',
      icon: Settings,
      badge: null,
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 ease-out"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Off-canvas Sliding Drawer */}
      <div className="fixed inset-y-0 left-0 max-w-[310px] w-full bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-300 ease-out">
        {/* Top Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center text-white shadow-xs">
              <Building2 className="w-5 h-5 text-blue-100" />
            </div>
            <div>
              <div className="text-sm font-bold font-display text-slate-900 leading-none">
                MPLADS Sentinel
              </div>
              <div className="text-[10px] font-mono tracking-wider text-slate-500 uppercase font-semibold mt-1">
                MoSPI Oversight
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 -mr-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200/60 transition-colors"
            aria-label="Close navigation sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Search trigger inside sidebar */}
        <div className="p-3 border-b border-slate-100">
          <button
            onClick={() => {
              onClose();
              setIsSearchOpen(true);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-500 text-xs rounded-lg transition-colors text-left"
          >
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">Search schemes, MPs, districts...</span>
          </button>
        </div>

        {/* AI Assistant Highlight Banner */}
        <div className="px-3 pt-3">
          <NavLink
            to="/ai-assistant"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center justify-between p-3 rounded-lg border transition-all ${
                isActive
                  ? 'bg-blue-600 border-blue-700 text-white shadow-sm'
                  : 'bg-gradient-to-r from-blue-50 to-indigo-50/70 border-blue-200 text-blue-900 hover:border-blue-300'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold font-display leading-tight">Sentinel AI Assistant</div>
                <div className="text-[10px] opacity-75">Forensic ledger queries</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 opacity-60" />
          </NavLink>
        </div>

        {/* Main Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 px-3 py-1">
            Navigation Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200/80'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          {/* Quick Help & Guidelines */}
          <div className="pt-3 mt-3 border-t border-slate-100 space-y-1">
            <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 px-3 py-1">
              Institutional Tools
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenHelp();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors text-left"
            >
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <span>Audit Manual & Guidelines</span>
            </button>

            <button
              onClick={() => {
                onClose();
                navigate('/projects?action=new');
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100 border border-emerald-200 transition-colors text-left"
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Register New Project</span>
            </button>
          </div>
        </div>

        {/* Bottom Auditor Profile Section */}
        <div className="p-3 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
              alt="Auditor Profile"
              className="w-9 h-9 rounded-full object-cover border border-slate-200 ring-2 ring-blue-100 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">Ayush Borade</div>
              <div className="text-[10px] text-slate-500 truncate">Lead Auditor (MoSPI)</div>
              <div className="flex items-center gap-1 text-[9px] font-mono text-emerald-700 mt-0.5">
                <ShieldCheck className="w-2.5 h-2.5" />
                <span>Nodal Access Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
