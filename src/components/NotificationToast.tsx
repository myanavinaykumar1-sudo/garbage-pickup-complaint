import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, Info, Bell, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const getIcon = () => {
          switch (toast.type) {
            case 'success':
              return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
            case 'warning':
            case 'alert':
              return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
            default:
              return <Info className="w-5 h-5 text-sky-500 shrink-0" />;
          }
        };

        return (
          <div
            key={toast.id}
            className="pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-xl border border-slate-800 flex items-start gap-3 transition-all duration-300 transform translate-y-0 animate-fade-in"
          >
            {getIcon()}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold leading-tight">{toast.title}</div>
              <div className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
