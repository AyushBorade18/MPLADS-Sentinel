import React, { createContext, useContext, useState, useEffect } from 'react';
import { NotificationItem } from '../types';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

interface AppContextType {
  // Toasts
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], message: string, title?: string) => void;
  removeToast: (id: string) => void;

  // Global filters
  selectedState: string;
  setSelectedState: (state: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;

  // Global search modal
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;

  // Notifications
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;

  // Quick AI Assistant drawer
  isAssistantDrawerOpen: boolean;
  setIsAssistantDrawerOpen: (open: boolean) => void;

  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialNotifications: NotificationItem[] = [
  {
    id: 'n-1',
    title: 'High Severity Anomaly Flagged',
    message: 'PRJ-2023-4921 in Gorakhpur exceeded material cost threshold by 42%.',
    time: '10m ago',
    read: false,
    type: 'alert',
    link: '/projects/PRJ-2023-4921',
  },
  {
    id: 'n-2',
    title: 'Tranche 2 Evidence Missing',
    message: 'Plinth photo evidence pending for Ward 12 Primary Health Center.',
    time: '45m ago',
    read: false,
    type: 'warning',
    link: '/projects/PRJ-2023-4921',
  },
  {
    id: 'n-3',
    title: 'Audit Report Generated',
    message: 'National Financial Utilization & Audit Exceptions FY 23-24 is ready.',
    time: '2h ago',
    read: true,
    type: 'success',
    link: '/reports',
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedState, setSelectedState] = useState<string>('All States');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Districts');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [isAssistantDrawerOpen, setIsAssistantDrawerOpen] = useState<boolean>(false);
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    const savedTheme = localStorage.getItem('sentinel_theme') as 'light' | 'dark' | 'system';
    if (savedTheme) {
      setThemeState(savedTheme);
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    localStorage.setItem('sentinel_theme', newTheme);
    setThemeState(newTheme);
  };

  const addToast = (type: ToastMessage['type'], message: string, title?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast('info', 'All notifications marked as read');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        selectedState,
        setSelectedState,
        selectedDistrict,
        setSelectedDistrict,
        isSearchOpen,
        setIsSearchOpen,
        globalSearchQuery,
        setGlobalSearchQuery,
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        isAssistantDrawerOpen,
        setIsAssistantDrawerOpen,
        theme,
        setTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
