import { useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface ToastOptions {
  description?: string;
  duration?: number;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function useDebouncedToast(delay = 1000) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showToast = useCallback((type: 'success' | 'error' | 'info' | 'warning', message: string, options?: ToastOptions) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout
    timeoutRef.current = setTimeout(() => {
      toast[type](message, {
        duration: options?.duration || 5000,
        ...options,
      });
    }, delay);
  }, [delay]);

  const success = useCallback((message: string, options?: ToastOptions) => {
    showToast('success', message, options);
  }, [showToast]);

  const error = useCallback((message: string, options?: ToastOptions) => {
    showToast('error', message, options);
  }, [showToast]);

  const info = useCallback((message: string, options?: ToastOptions) => {
    showToast('info', message, options);
  }, [showToast]);

  const warning = useCallback((message: string, options?: ToastOptions) => {
    showToast('warning', message, options);
  }, [showToast]);

  return {
    success,
    error,
    info,
    warning,
  };
} 