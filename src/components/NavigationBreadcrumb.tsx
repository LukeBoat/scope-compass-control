import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface NavigationBreadcrumbProps {
  className?: string;
}

export function NavigationBreadcrumb({ className }: NavigationBreadcrumbProps) {
  const location = useLocation();
  const { user } = useAuth();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Create breadcrumb items with proper labels
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const isLast = index === pathSegments.length - 1;
    
    // Customize labels based on path segments
    let label = segment;
    if (segment === 'client') {
      label = 'Client Portal';
    } else if (segment === 'projects') {
      label = user?.role === 'client' ? 'My Projects' : 'Projects';
    } else if (segment.match(/^[a-f0-9]{24}$/)) {
      // If segment looks like a MongoDB ID, try to get a friendly name
      label = 'Project Details';
    } else {
      label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    }

    return {
      path,
      label,
      isLast
    };
  });

  // Determine the home link based on user role
  const homeLink = user?.role === 'client' ? '/client' : '/';

  return (
    <nav className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)}>
      <Link 
        to={homeLink}
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {breadcrumbItems.map((item, index) => (
        <div key={item.path} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1" />
          {item.isLast ? (
            <span className="font-medium text-foreground">{item.label}</span>
          ) : (
            <Link 
              to={item.path}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
} 