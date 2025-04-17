import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useClientMode() {
  const [isClientMode, setIsClientMode] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if we're in the client portal route
    setIsClientMode(location.pathname.includes('/client-portal'));
  }, [location]);

  return { isClientMode };
} 