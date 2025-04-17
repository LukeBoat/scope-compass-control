import { useClientMode } from "@/hooks/useClientMode";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

export function ClientModeIndicator() {
  const { isClientMode } = useClientMode();

  if (!isClientMode) return null;

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "fixed top-4 right-4 z-50 flex items-center gap-1.5",
        "bg-brand-purple/10 text-brand-purple border-brand-purple/20",
        "px-3 py-1.5 text-sm font-medium"
      )}
    >
      <User className="h-4 w-4" />
      <span>Client Mode</span>
    </Badge>
  );
} 