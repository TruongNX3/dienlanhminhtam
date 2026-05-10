'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
}

export const Toast = ({ message, type, isVisible, onClose }: ToastProps) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const icons = {
    success: <CheckCircle2 className="text-green-500" size={20} />,
    error: <AlertCircle className="text-red-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />,
  };

  const bgColors = {
    success: 'bg-green-50 border-green-100',
    error: 'bg-red-50 border-red-100',
    info: 'bg-blue-50 border-blue-100',
  };

  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-xl animate-in slide-in-from-right-10 duration-300",
      bgColors[type]
    )}>
      <div className="shrink-0">{icons[type]}</div>
      <p className="text-sm font-bold text-slate-800 pr-2">{message}</p>
      <button 
        onClick={onClose}
        className="p-1 hover:bg-black/5 rounded-full transition-colors ml-auto text-slate-400"
      >
        <X size={16} />
      </button>
    </div>
  );
};
