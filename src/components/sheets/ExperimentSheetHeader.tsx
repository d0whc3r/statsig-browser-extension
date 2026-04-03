import { memo } from 'react'

import type { Experiment } from '@/src/types/statsig'

import { Button } from '@/src/components/ui/button'
import { CopyableText } from '@/src/components/ui/copyable-text'
import { SheetDescription, SheetHeader, SheetTitle } from '@/src/components/ui/sheet'
import { Skeleton } from '@/src/components/ui/skeleton'

interface ExperimentSheetHeaderProps {
  isLoading: boolean
  experiment?: Experiment
  currentItemId?: string
  typeApiKey: string
  onClose: () => void
  onManage: () => void
}

export const ExperimentSheetHeader = memo(
  ({ isLoading, experiment }: ExperimentSheetHeaderProps) => (
    <SheetHeader className="px-6 py-4 border-b shrink-0 pr-12">
      <div className="flex justify-between items-center gap-4">
        <div className="flex-1 min-w-0">
          <SheetTitle className="truncate" title={experiment?.name}>
            {isLoading ? <Skeleton className="h-6 w-32" /> : (experiment?.name ?? 'Experiment')}
          </SheetTitle>
          {!isLoading && experiment && (
            <CopyableText
              value={experiment.id}
              copyLabel="Copy ID"
              containerClassName="mt-1 text-xs text-muted-foreground font-mono"
            />
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
  ),
)

ExperimentSheetHeader.displayName = 'ExperimentSheetHeader'
