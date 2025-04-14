import React, { Suspense, lazy, useCallback, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProjectProvider } from '@/contexts/ProjectContext';
import { Sidebar } from '@/components/Sidebar';
import { Menu, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DevModeIndicator } from '@/components/DevModeIndicator';

// Lazy load components with preloading
const Index = lazy(() => import("@/pages/Index"));
const ProjectDetail = lazy(() => import("@/pages/ProjectDetail"));
const ProjectInvoices = lazy(() => import("@/pages/ProjectInvoices"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Preload components in the background
const preloadComponents = () => {
  const components = [Index, ProjectDetail, ProjectInvoices, NotFound];
  components.forEach(component => {
    const preload = component as any;
    if (preload.preload) {
      preload.preload();
    }
  });
};

// Loading component with fade transition
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen animate-fade-in">
    <Skeleton className="h-8 w-8 rounded-full" />
  </div>
);

// Configure React Query with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

// Project routes component with optimized rendering
const ProjectRoutes = () => {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  if (!projectId) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <ErrorBoundary>
      <ProjectProvider projectId={projectId}>
        <Suspense fallback={<LoadingFallback />}>
          <Routes location={location}>
            <Route index element={<ProjectDetail />} />
            <Route path="invoices" element={<ProjectInvoices />} />
            <Route path="timeline" element={<ProjectDetail />} />
            <Route path="scope" element={<ProjectDetail />} />
            <Route path="activity" element={<ProjectDetail />} />
            <Route path="*" element={<Navigate to="." replace />} />
          </Routes>
        </Suspense>
      </ProjectProvider>
    </ErrorBoundary>
  );
};

// Main App component with optimized state management
const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Preload components after initial render
  useEffect(() => {
    preloadComponents();
  }, []);

  // Check if device is mobile on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      // Auto-close sidebar on mobile
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleSidebarToggle = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <Router>
              <div className="flex h-screen bg-background">
                <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarToggle} />
                
                {/* Mobile menu toggle button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="fixed top-4 left-4 z-50 lg:hidden"
                  onClick={handleSidebarToggle}
                  aria-label="Toggle menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
                
                {/* Main content with padding for mobile menu button */}
                <main className={`flex-1 overflow-auto transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : ''} pt-16 lg:pt-0`}>
                  <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/projects/:projectId/*" element={<ProjectRoutes />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </main>
              </div>
              <Toaster />
              <Sonner />
              <DevModeIndicator />
            </Router>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
