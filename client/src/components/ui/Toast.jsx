// ═══════════════════════════════════════════════════════════
// Gaming Café ERP — Toast Notification Component
// Apple Esports style: slide-in from top-right
// ═══════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, createContext, useContext } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error', 6000),
    info: (msg) => addToast(msg, 'info'),
    warning: (msg) => addToast(msg, 'warning', 5000),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-3 right-3 z-[999] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ toast, onClose }) {
  const typeStyles = {
    success: 'border-accent text-accent bg-accent/5',
    error: 'border-neon-red text-neon-red bg-neon-red/5',
    info: 'border-neon-blue text-neon-blue bg-neon-blue/5',
    warning: 'border-neon-orange text-neon-orange bg-neon-orange/5',
  };

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  };

  return (
    <div
      className={`flex items-start gap-2.5 px-4 py-3 border rounded-md shadow-xl text-xs font-medium animate-[slideIn_0.2s_ease] ${typeStyles[toast.type]}`}
    >
      <span className="text-sm flex-shrink-0 mt-px">{icons[toast.type]}</span>
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={onClose}
        className="opacity-50 hover:opacity-100 transition-opacity text-sm flex-shrink-0"
      >
        ×
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
