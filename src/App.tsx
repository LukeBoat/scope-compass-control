import React, { Suspense, lazy, useCallback, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useLocation, Navigate, useNavigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProjectProvider } from '@/contexts/ProjectContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/Sidebar';
import { Menu, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DevModeIndicator } from '@/components/DevModeIndicator';
import { cn } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Index from '@/pages/Index';
import Team from '@/pages/Team';
import Settings from '@/pages/Settings';
import ClientLogin from '@/pages/ClientLogin';
import ClientSignup from '@/pages/ClientSignup';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import ClientPortal from '@/pages/ClientPortal';
import NotFound from '@/pages/NotFound';
import { ClientModeIndicator } from "@/components/ClientModeIndicator";
import PaymentComplete from '@/pages/PaymentComplete';
import { ClientModeBanner } from "@/components/ClientModeBanner";
import { PublicDeliverableView } from '@/components/PublicDeliverableView';

// Lazy load components with preloading
const ProjectDetail = lazy(() => import("@/pages/ProjectDetail"));
const ProjectInvoices = lazy(() => import("@/pages/ProjectInvoices"));
const Projects = lazy(() => import("@/pages/Projects"));

// Preload components in the background
const preloadComponents = () => {
  const components = [ProjectDetail, ProjectInvoices, Projects];
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
      <Suspense fallback={<LoadingFallback />}>
        <Routes location={location}>
          <Route index element={<ProjectDetail />} />
          <Route path="invoices" element={<ProjectInvoices />} />
          <Route path="timeline" element={<ProjectDetail />} />
          <Route path="scope" element={<ProjectDetail />} />
          <Route path="activity" element={<ProjectDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

// Main App component with optimized state management
const AppContent = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, isLoading } = useAuth();

  // Set default page title
  usePageTitle("Dashboard");

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <div className="min-h-screen bg-background">
              <div className="flex h-screen overflow-hidden">
                <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarToggle} />
                <div className="flex-1 flex flex-col overflow-hidden">
                  <ClientModeBanner />
                  <main className="flex-1 overflow-y-auto">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/login" element={<ClientLogin />} />
                      <Route path="/signup" element={<ClientSignup />} />
                      <Route path="/client-portal" element={
                        <ProtectedRoute>
                          <ClientPortal />
                        </ProtectedRoute>
                      } />
                      <Route path="/projects" element={
                        <ProtectedRoute>
                          <Projects />
                        </ProtectedRoute>
                      } />
                      <Route path="/projects/:projectId/*" element={
                        <ProtectedRoute>
                          <ProjectRoutes />
                        </ProtectedRoute>
                      } />
                      <Route path="/team" element={
                        <ProtectedRoute>
                          <Team />
                        </ProtectedRoute>
                      } />
                      <Route path="/settings" element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      } />
                      <Route path="/payment-complete" element={<PaymentComplete />} />
                      <Route path="/view/:projectId/:deliverableId" element={<PublicDeliverableView />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </div>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

// Root App component with providers
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
