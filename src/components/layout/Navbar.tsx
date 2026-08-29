import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  ShieldAlert,
  MapPin,
  FileText,
  Settings,
  Search,
  Bell,
  HelpCircle,
  Menu,
  X,
  Sparkles,
  ExternalLink,
  Check,
  Building2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { MobileSidebar } from './MobileSidebar';

export const Navbar: React.FC<{ onOpenHelp: () => void }> = ({ onOpenHelp }) => {
  const { user, logout } = useAuth();
  const {
    unreadCount,
    notifications,
    markAsRead,
    markAllAsRead,
    setIsSearchOpen,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Risk Analysis', path: '/risk-analysis', icon: ShieldAlert },
    { name: 'Map', path: '/map', icon: MapPin },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      {/* Top Header Row */}
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Left: Mobile Hamburger Button & Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Hamburger trigger for mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-1 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Open Navigation Sidebar"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <NavLink to="/dashboard" className="flex items-center gap-2 sm:gap-2.5 focus:outline-none">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-blue-700 flex items-center justify-center text-white shadow-xs shrink-0">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-100" />
              </div>
              <div>
                <div className="text-sm sm:text-base font-bold font-display text-slate-900 leading-tight tracking-tight flex items-center gap-1.5">
                  MPLADS Sentinel
                </div>
                <div className="hidden xs:block text-[9px] sm:text-[10px] font-mono tracking-widest text-slate-500 uppercase font-semibold">
                  Institutional Oversight
                </div>
              </div>
            </NavLink>
          </div>

          {/* Center Search Bar (Tablet & Desktop) */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <div
              onClick={() => setIsSearchOpen(true)}
              className="w-full relative flex items-center bg-slate-50 border border-slate-200 hover:border-slate-300 rounded px-3 py-1.5 text-xs sm:text-sm text-slate-500 cursor-pointer transition-colors shadow-2xs"
            >
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <span className="truncate">Search projects, districts, or IDs...</span>
              <kbd className="ml-auto hidden lg:inline-block font-mono text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-400">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search icon on mobile */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 relative transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-[calc(100vw-32px)] sm:w-96 max-w-sm bg-white rounded-lg border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-800">Notifications</h4>
                      {unreadCount > 0 && (
                        <span className="bg-blue-100 text-blue-800 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">No new notifications</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markAsRead(n.id);
                            if (n.link) {
                              navigate(n.link);
                              setNotificationsOpen(false);
                            }
                          }}
                          className={`p-3 hover:bg-slate-50 cursor-pointer flex items-start gap-3 transition-colors ${
                            !n.read ? 'bg-blue-50/40' : ''
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {n.type === 'alert' && <AlertCircle className="w-4 h-4 text-red-600" />}
                            {n.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-600" />}
                            {n.type === 'success' && <Check className="w-4 h-4 text-emerald-600" />}
                            {n.type === 'info' && <Bell className="w-4 h-4 text-blue-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800 truncate">{n.title}</p>
                            <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Help Button (hidden on very small screens, accessible in mobile sidebar) */}
            <button
              onClick={onOpenHelp}
              className="hidden sm:inline-flex p-2 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Institutional Help & Documentation"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* Theme Toggle */}
            <div className="relative ml-1">
              <button
                onClick={() => {
                  const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
                  setTheme(nextTheme);
                }}
                className="p-2 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors capitalize text-xs font-semibold"
              >
                {theme}
              </button>
            </div>

            {/* User Profile Avatar */}
            <div className="relative ml-1" ref={userRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 focus:outline-none"
                aria-label="User profile"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 font-bold text-xs uppercase">
                  {user?.email?.charAt(0) || 'U'}
                </div>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-800 truncate">{user?.email}</p>
                    <p className="text-[11px] text-slate-500 capitalize">{user?.role} Access</p>
                    <span className="inline-block mt-1 text-[10px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                      MoSPI Nodal Access
                    </span>
                  </div>
                  <NavLink
                    to="/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    Account & Threshold Settings
                  </NavLink>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Navigation Tabs Bar */}
        <nav className="hidden lg:flex items-center justify-between border-t border-slate-100 -mb-px">
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      isActive
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </NavLink>
              );
            })}
          </div>

          <div className="flex items-center gap-3 py-2">
            <NavLink
              to="/ai-assistant"
              className={({ isActive }) =>
                `inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-700 text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                }`
              }
            >
              <Sparkles className="w-3.5 h-3.5" />
              Sentinel AI Console
            </NavLink>
          </div>
        </nav>
      </div>

      {/* Off-canvas Hamburger Sidebar for Mobile and Tablet */}
      <MobileSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpenHelp={onOpenHelp}
      />
    </header>
  );
};
