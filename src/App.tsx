import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Lazy load components
const Index = lazy(() => import("@/pages/Index"));
const ProjectInvoices = lazy(() => import("@/pages/ProjectInvoices"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Create a client
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
        <Routes>
          <Route
            path="/"
            element={
              <Suspense
                fallback={
                  <div className="space-y-4 p-4">
                    <Skeleton className="h-8 w-1/3" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-[200px]" />
                      ))}
                    </div>
                  </div>
                }
              >
                <Index />
              </Suspense>
            }
          />
          <Route
            path="/projects/:projectId/invoices"
            element={
              <Suspense
                fallback={
                  <div className="space-y-4 p-4">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-[400px]" />
                  </div>
                }
              >
                <ProjectInvoices />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <Suspense
                fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    <Skeleton className="h-8 w-48" />
                  </div>
                }
              >
                <NotFound />
              </Suspense>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
