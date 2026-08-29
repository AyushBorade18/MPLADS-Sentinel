import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const getIcon = () => {
          switch (toast.type) {
            case 'success':
              return <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
            case 'error':
            case 'danger' as any:
              return <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />;
            case 'warning':
              return <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
            case 'info':
            default:
              return <Info className="w-5 h-5 text-blue-600 shrink-0" />;
          }
        };

        const getBorderColor = () => {
          switch (toast.type) {
            case 'success':
              return 'border-emerald-200 bg-emerald-50/90';
            case 'error':
            case 'danger' as any:
              return 'border-red-200 bg-red-50/90';
            case 'warning':
              return 'border-amber-200 bg-amber-50/90';
            case 'info':
            default:
              return 'border-blue-200 bg-blue-50/90';
          }
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-xs text-slate-800 transition-all transform translate-y-0 ${getBorderColor()}`}
          >
            {getIcon()}
            <div className="flex-1 min-w-0">
              {toast.title && <h5 className="text-sm font-semibold text-slate-900 leading-tight">{toast.title}</h5>}
              <p className="text-xs text-slate-700 mt-0.5 leading-normal">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 rounded p-0.5 shrink-0"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
