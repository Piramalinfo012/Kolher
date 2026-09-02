import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, title: string, message?: string, duration = 4000) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    const newToast: ToastItem = { id, type, title, message, duration };

    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((title: string, message?: string) => showToast('success', title, message), [showToast]);
  const error = useCallback((title: string, message?: string) => showToast('error', title, message, 5000), [showToast]);
  const warning = useCallback((title: string, message?: string) => showToast('warning', title, message), [showToast]);
  const info = useCallback((title: string, message?: string) => showToast('info', title, message), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <div className="toast-container fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
        <AnimatePresence>
          {toasts.map(toast => {
            const icons = {
              success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
              error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
              warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
              info: <Info className="w-5 h-5 text-blue-600 shrink-0" />
            };

            const borderColors = {
              success: 'border-emerald-200 bg-white shadow-lg shadow-emerald-950/5',
              error: 'border-rose-200 bg-white shadow-lg shadow-rose-950/5',
              warning: 'border-amber-200 bg-white shadow-lg shadow-amber-950/5',
              info: 'border-blue-200 bg-white shadow-lg shadow-blue-950/5'
            };

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border ${borderColors[toast.type]}`}
                id={`toast-${toast.id}`}
              >
                {icons[toast.type]}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-neutral-900 leading-tight">{toast.title}</div>
                  {toast.message && (
                    <div className="text-xs text-neutral-600 mt-0.5 leading-relaxed">{toast.message}</div>
                  )}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-neutral-400 hover:text-neutral-700 transition-colors p-0.5 rounded-lg hover:bg-neutral-100"
                  aria-label="Close notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
