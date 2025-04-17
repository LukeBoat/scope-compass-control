import { useEffect, useState } from 'react';
import { toast } from 'sonner';

/**
 * Hook to handle responsive toast positioning based on device type
 * Ensures toasts don't overlap with navigation elements on mobile
 */
export function useResponsiveToast() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile on mount
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Custom toast function that adjusts position based on device
  const showToast = (message: string, options?: Parameters<typeof toast>[1]) => {
    // Default options
    const defaultOptions = {
      position: isMobile ? 'top-center' : 'bottom-center',
      style: {
        marginBottom: isMobile ? '1rem' : '4rem', // More margin on desktop to avoid nav
      },
    };

    // Merge with user options
    const mergedOptions = {
      ...defaultOptions,
      ...options,
      style: {
        ...defaultOptions.style,
        ...(options?.style || {}),
      },
    };

    return toast(message, mergedOptions);
  };

  return { showToast, isMobile };
} 