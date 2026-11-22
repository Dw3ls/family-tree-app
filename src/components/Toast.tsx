'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-950 text-white border border-zinc-800 shadow-soft-lg animate-fadeIn text-xs"
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' && (
              <span className="p-1 rounded-lg bg-darkorange-700 text-white shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            )}
            {toast.type === 'error' && (
              <span className="p-1 rounded-lg bg-red-600 text-white shrink-0">
                <AlertCircle className="w-3.5 h-3.5" />
              </span>
            )}
            {toast.type === 'info' && (
              <span className="p-1 rounded-lg bg-zinc-800 text-darkorange-400 shrink-0 border border-zinc-700">
                <Info className="w-3.5 h-3.5" />
              </span>
            )}
            <span className="font-medium text-zinc-100 leading-snug">{toast.message}</span>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="p-1 rounded-md text-zinc-400 hover:text-white transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
