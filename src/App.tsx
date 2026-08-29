import React, { useState } from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { ToastContainer } from './components/layout/ToastContainer';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { HelpModal } from './components/layout/HelpModal';
import { FloatingAIButton } from './components/layout/FloatingAIButton';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { RiskAnalysisPage } from './pages/RiskAnalysisPage';
import { MapPage } from './pages/MapPage';
import { ReportsPage } from './pages/ReportsPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';
import { Building2, ShieldCheck } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const MainLayout: React.FC<{ children: React.ReactNode; onOpenHelp: () => void }> = ({ children, onOpenHelp }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Main Top Navigation */}
      <Navbar onOpenHelp={onOpenHelp} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* Footer with Government Transparency Watermark */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 mt-12 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-blue-700 flex items-center justify-center text-white text-[10px] font-bold">
              S
            </div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">MPLADS Sentinel</span>
            <span>•</span>
            <span>Ministry of Statistics & Programme Implementation (MoSPI) Oversight Portal</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Forensic Anomaly Scanner Active
            </span>
            <span>v2.4.0 (Statutory Build)</span>
          </div>
        </div>
      </footer>

      {/* Global Utility Overlays */}
      <ToastContainer />
      <GlobalSearchModal />
      <FloatingAIButton />
    </>
  );
};

export default function App() {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <HashRouter>
      <AuthProvider>
        <AppProvider>
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200">
            <MainLayout onOpenHelp={() => setHelpOpen(true)}>
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
                <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
                <Route path="/risk-analysis" element={<ProtectedRoute><RiskAnalysisPage /></ProtectedRoute>} />
                <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
                <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistantPage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </MainLayout>
            <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
          </div>
        </AppProvider>
      </AuthProvider>
    </HashRouter>
  );
}
