import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Bot } from 'lucide-react';

export const FloatingAIButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // If already on /ai-assistant, do not show duplicate floating button
  if (location.pathname === '/ai-assistant') return null;

  return (
    <button
      onClick={() => navigate('/ai-assistant')}
      className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-blue-300"
      title="Open Sentinel AI Intelligence Console"
      aria-label="Open Sentinel AI Intelligence Console"
    >
      <Bot className="w-6 h-6 group-hover:rotate-6 transition-transform" />
      <span className="absolute -top-1 -right-1 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
      </span>
    </button>
  );
};
