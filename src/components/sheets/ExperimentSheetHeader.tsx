import { memo } from 'react'

import type { Experiment } from '@/src/types/statsig'

import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { CopyableText } from '@/src/components/ui/copyable-text'
import { SheetDescription, SheetHeader, SheetTitle } from '@/src/components/ui/sheet'
import { Skeleton } from '@/src/components/ui/skeleton'
import { TimeAgo } from '@/src/components/ui/time-ago'

interface ExperimentSheetHeaderProps {
  isLoading: boolean
  experiment?: Experiment
  currentItemId?: string
  typeApiKey: string
  onClose: () => void
  onManage: () => void
}

export const ExperimentSheetHeader = memo(({ isLoading, experiment }: ExperimentSheetHeaderProps) => (
  <SheetHeader className="shrink-0 border-b px-6 py-4 pr-12">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <SheetTitle className="truncate" title={experiment?.name}>
            {isLoading ? <Skeleton className="h-6 w-32" /> : (experiment?.name ?? 'Experiment')}
          </SheetTitle>
          {!isLoading && experiment && (
            <Badge
              variant={experiment.status === 'active' ? 'default' : 'secondary'}
              className="h-5 shrink-0 px-1.5 text-[10px]"
            >
              {experiment.status}
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!isLoading && experiment && (
            <CopyableText
              value={experiment.id}
              copyLabel="Copy ID"
              containerClassName="text-xs text-muted-foreground font-mono"
            />
          )}
          {!isLoading && experiment && (
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                Created <TimeAgo date={experiment.createdTime} />
              </span>
              <span className="flex items-center gap-1">
                Updated <TimeAgo date={experiment.lastModifiedTime} />
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
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
    <SheetDescription className="sr-only">Details for experiment {experiment?.name}</SheetDescription>
  </SheetHeader>
))

ExperimentSheetHeader.displayName = 'ExperimentSheetHeader'
