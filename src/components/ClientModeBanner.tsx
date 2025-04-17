import { useClientMode } from "@/hooks/useClientMode";
import { Users } from "lucide-react";

export function ClientModeBanner() {
  const { isClientMode } = useClientMode();

  if (!isClientMode) return null;

  return (
    <div className="bg-brand-blue/10 border-b border-brand-blue/20">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-brand-blue">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">Client View</span>
          </div>
          <span className="text-xs text-brand-blue/80">
            You are viewing the project as a client
          </span>
        </div>
      </div>
    </div>
  );
} 