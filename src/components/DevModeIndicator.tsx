import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function DevModeIndicator() {
  if (import.meta.env.PROD) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="fixed bottom-4 right-4 z-50">
            <div className={cn(
              "flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1.5 text-sm font-medium text-yellow-800",
              "border border-yellow-200 shadow-sm"
            )}>
              <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
              <span>DEV</span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Development Build</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 