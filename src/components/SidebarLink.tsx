import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarLinkProps {
  label: string;
  icon: LucideIcon;
  href: string;
  isActive?: boolean;
}

export function SidebarLink({ label, icon: Icon, href, isActive }: SidebarLinkProps) {
  return (
    <Link 
      to={href} 
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
        isActive 
          ? "bg-brand-purple/10 text-brand-purple font-medium" 
          : "text-muted-foreground hover:bg-brand-purple/5 hover:text-brand-purple"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
} 