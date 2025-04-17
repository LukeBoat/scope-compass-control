import * as React from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { APP_VERSION, BUILD_DATE, GIT_COMMIT } from "@/config/version"
import { formatDistanceToNow } from "date-fns"

export function DevModeIndicator() {
  const isProduction = process.env.NODE_ENV === "production"

  if (isProduction) {
    return null
  }

  const buildTimeAgo = formatDistanceToNow(new Date(BUILD_DATE), { addSuffix: true })

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="fixed bottom-4 right-4 z-50">
            <div className="flex items-center gap-2 rounded-full bg-yellow-500/10 px-3 py-1.5 text-xs font-medium text-yellow-600 ring-1 ring-inset ring-yellow-500/20">
              <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
              <span>v{APP_VERSION}</span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs space-y-2">
          <div className="space-y-1">
            <p className="font-medium">Development Build</p>
            <p className="text-xs text-muted-foreground">Features may be incomplete or unstable.</p>
          </div>
          <div className="text-xs space-y-1 text-muted-foreground">
            <p>Build: {GIT_COMMIT.slice(0, 7)}</p>
            <p>Built {buildTimeAgo}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
} 