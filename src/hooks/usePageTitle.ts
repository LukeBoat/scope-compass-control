import { useEffect } from 'react';

/**
 * Custom hook to update the document title
 * @param title The title to set, or null to reset to default
 * @param prefix Optional prefix to add before the title
 * @param suffix Optional suffix to add after the title
 */
export function usePageTitle(title: string | null) {
  useEffect(() => {
    const baseTitle = 'Scope Sentinel';
    document.title = title ? `${title} | ${baseTitle}` : baseTitle;
    
    return () => {
      document.title = baseTitle;
    };
  }, [title]);
} 