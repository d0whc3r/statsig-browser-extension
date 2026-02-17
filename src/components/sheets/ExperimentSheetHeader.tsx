import { Copy } from 'lucide-react'
import { memo, useCallback } from 'react'

import type { Experiment } from '@/src/types/statsig'

import { Button } from '@/src/components/ui/button'
import { SheetDescription, SheetHeader, SheetTitle } from '@/src/components/ui/sheet'
import { Skeleton } from '@/src/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/src/components/ui/tooltip'

interface ExperimentSheetHeaderProps {
  isLoading: boolean
  experiment?: Experiment
  currentItemId?: string
  typeApiKey: string
  onClose: () => void
  onManage: () => void
}

export const ExperimentSheetHeader = memo(
  ({ isLoading, experiment, currentItemId }: ExperimentSheetHeaderProps) => {
    const handleCopyId = useCallback(() => {
      if (currentItemId) {
        navigator.clipboard.writeText(currentItemId)
      }
    }, [currentItemId])

    return (
      <SheetHeader className="px-6 py-4 border-b shrink-0 pr-12">
        <div className="flex justify-between items-center gap-4">
          <div className="flex-1 min-w-0">
            <SheetTitle className="truncate" title={experiment?.name}>
              {isLoading ? <Skeleton className="h-6 w-32" /> : experiment?.name || 'Experiment'}
            </SheetTitle>
            {!isLoading && experiment && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground font-mono">{experiment.id}</span>
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
          <div className="shrink-0 flex gap-2">
            {experiment?.id && (
              <Button variant="outline" size="sm" className="h-8 gap-2" asChild>
                <a
                  href={`https://console.statsig.com/experiments/${experiment.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Statsig
                </a>
              </Button>
            )}
          </div>
        </div>
        <SheetDescription className="sr-only">
          Details for experiment {experiment?.name}
        </SheetDescription>
      </SheetHeader>
    )
  },
)

ExperimentSheetHeader.displayName = 'ExperimentSheetHeader'
