import { Copy, ExternalLink } from 'lucide-react'
import { memo, useCallback } from 'react'

import type { FeatureGate } from '@/src/types/statsig'

import { Button } from '@/src/components/ui/button'
import { SheetDescription, SheetHeader, SheetTitle } from '@/src/components/ui/sheet'
import { Skeleton } from '@/src/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/src/components/ui/tooltip'

interface FeatureGateSheetHeaderProps {
  isLoading: boolean
  featureGate?: FeatureGate
  currentItemId?: string
}

export const FeatureGateSheetHeader = memo(
  ({ isLoading, featureGate, currentItemId }: FeatureGateSheetHeaderProps) => {
    const handleCopyId = useCallback(() => {
      if (currentItemId) {
        navigator.clipboard.writeText(currentItemId)
      }
    }, [currentItemId])

    return (
      <SheetHeader className="px-6 py-4 border-b shrink-0">
        <div className="flex justify-between items-center pr-6">
          <div className="flex-1 min-w-0 mr-4">
            <SheetTitle
              className="text-lg font-bold truncate cursor-pointer hover:underline"
              onClick={handleCopyId}
            >
              {isLoading ? <Skeleton className="h-6 w-32" /> : featureGate?.name || currentItemId}
            </SheetTitle>
            {!isLoading && currentItemId && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground font-mono">{currentItemId}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4"
                        onClick={handleCopyId}
                      >
                        <Copy className="h-3 w-3" />
                        <span className="sr-only">Copy ID</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy ID</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
          <Button variant="outline" size="sm" asChild className="shrink-0">
            <a
              href={`https://console.statsig.com/gates/${currentItemId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Statsig
            </a>
          </Button>
        </div>
        <SheetDescription className="sr-only">
          Details for feature gate {currentItemId}
        </SheetDescription>
      </SheetHeader>
    )
  },
)

FeatureGateSheetHeader.displayName = 'FeatureGateSheetHeader'
