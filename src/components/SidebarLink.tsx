import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarLinkProps {
  to: string;
  icon: LucideIcon;
  isActive: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function SidebarLink({ to, icon: Icon, isActive, children, onClick }: SidebarLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        "hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
      )}
      aria-current={isActive ? "page" : undefined}
      onClick={onClick}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="truncate">{children}</span>
    </Link>
  );
} 