import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MainLayout } from "@/components/MainLayout";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import ProjectDetail from "@/pages/ProjectDetail";

// Lazy load components
const Index = lazy(() => import("@/pages/Index"));
const ProjectInvoices = lazy(() => import("@/pages/ProjectInvoices"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="scope-sentinel-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner 
            position="top-right" 
            closeButton 
            richColors 
            pauseWhenPageIsHidden
            expand={true}
            visibleToasts={3}
            toastOptions={{
              duration: 4000,
              className: "group",
            }}
          />
          <BrowserRouter>
            <MainLayout>
              <Routes>
                <Route path="/" element={
                  <Suspense fallback={
                    <div className="space-y-4 p-4" role="status" aria-label="Loading projects">
                      <Skeleton className="h-8 w-1/3" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                          <Skeleton key={i} className="h-[200px]" />
                        ))}
                      </div>
                    </div>
                  }>
                    <Index />
                  </Suspense>
                } />
                
                {/* Project Routes */}
                <Route path="/projects">
                  <Route index element={<Navigate to="/" replace />} />
                  <Route path=":projectId" element={
                    <Suspense fallback={
                      <div className="flex items-center justify-center min-h-screen" role="status" aria-label="Loading project details">
                        <Skeleton className="h-8 w-48" />
                      </div>
                    }>
                      <ProjectDetail />
                    </Suspense>
                  } />
                  <Route path=":projectId/invoices" element={
                    <Suspense fallback={
                      <div className="space-y-4 p-4" role="status" aria-label="Loading invoices">
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-[400px]" />
                      </div>
                    }>
                      <ProjectInvoices />
                    </Suspense>
                  } />
                </Route>

                {/* Other Routes */}
                <Route path="/invoices" element={<Navigate to="/" replace />} />
                <Route path="/feedback" element={<Navigate to="/" replace />} />
                <Route path="/settings" element={<Navigate to="/" replace />} />
                <Route path="/docs" element={<Navigate to="/" replace />} />
                <Route path="/help" element={<Navigate to="/" replace />} />

                {/* 404 Route */}
                <Route path="*" element={
                  <Suspense fallback={
                    <div className="flex items-center justify-center min-h-screen" role="status" aria-label="Loading error page">
                      <Skeleton className="h-8 w-48" />
                    </div>
                  }>
                    <NotFound />
                  </Suspense>
                } />
              </Routes>
            </MainLayout>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
