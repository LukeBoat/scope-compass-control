import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SidebarLink } from "@/components/SidebarLink";
import { 
  LayoutGrid, 
  Receipt, 
  MessageSquare, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  HelpCircle,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <aside 
      className={cn(
        "h-screen bg-brand-purple-light border-r border-card-border flex flex-col justify-between transition-all duration-300",
        isCollapsed ? "w-16" : "w-60"
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-brand-purple">
              <span className="sr-only">Scope Sentinel</span>
              Scope Sentinel
            </h1>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        
        <nav className="mt-4 space-y-1" aria-label="Main menu">
          <SidebarLink 
            label="Projects" 
            icon={LayoutGrid} 
            href="/" 
            isActive={isActive("/")}
          />
          <SidebarLink 
            label="Invoices" 
            icon={Receipt} 
            href="/invoices" 
            isActive={isActive("/invoices")}
          />
          <SidebarLink 
            label="Feedback" 
            icon={MessageSquare} 
            href="/feedback" 
            isActive={isActive("/feedback")}
          />
          <SidebarLink 
            label="Settings" 
            icon={Settings} 
            href="/settings" 
            isActive={isActive("/settings")}
          />
        </nav>
      </div>

      <div className="p-4 space-y-4">
        <div className="space-y-1" aria-label="Support menu">
          <SidebarLink 
            label="Documentation" 
            icon={FileText} 
            href="/docs" 
            isActive={isActive("/docs")}
          />
          <SidebarLink 
            label="Help & Support" 
            icon={HelpCircle} 
            href="/help" 
            isActive={isActive("/help")}
          />
        </div>
        
        <div className="space-y-2">
          <Badge 
            variant="secondary" 
            className="bg-yellow-100 text-yellow-700"
            role="status"
          >
            Dev Build
          </Badge>
          {!isCollapsed && (
            <div 
              className="text-xs text-muted-foreground opacity-60"
              aria-label="Version information"
            >
              v0.4.2 (dev)
            </div>
          )}
        </div>
      </div>
    </aside>
  );
} 