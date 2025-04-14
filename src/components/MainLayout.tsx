import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children?: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on larger screens and handle initial state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 lg:hidden"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity duration-200 ease-in-out lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-[280px] border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
            "transition-all duration-200 ease-in-out lg:relative lg:w-64 lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        />

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
} 