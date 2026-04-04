import { memo } from 'react'

import type { FeatureGate } from '@/src/types/statsig'

import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { CopyableText } from '@/src/components/ui/copyable-text'
import { SheetDescription, SheetHeader, SheetTitle } from '@/src/components/ui/sheet'
import { Skeleton } from '@/src/components/ui/skeleton'
import { TimeAgo } from '@/src/components/ui/time-ago'

interface FeatureGateSheetHeaderProps {
  isLoading: boolean
  featureGate?: FeatureGate
  currentItemId?: string
}

export const FeatureGateSheetHeader = memo(({ isLoading, featureGate, currentItemId }: FeatureGateSheetHeaderProps) => (
  <SheetHeader className="shrink-0 border-b px-6 py-4 pr-12">
    <div className="flex items-start justify-between gap-4 pr-6">
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <SheetTitle
            className="cursor-pointer truncate text-lg font-bold hover:underline"
            title={featureGate?.name ?? currentItemId}
          >
            {isLoading ? <Skeleton className="h-6 w-32" /> : (featureGate?.name ?? currentItemId)}
          </SheetTitle>
          {!isLoading && featureGate && (
            <>
              <Badge
                variant={featureGate.status === 'In Progress' ? 'secondary' : 'outline'}
                className="h-5 shrink-0 px-1.5 text-[10px]"
              >
                {featureGate.status}
              </Badge>
              <Badge
                variant={featureGate.isEnabled ? 'default' : 'destructive'}
                className="h-5 shrink-0 px-1.5 text-[10px]"
              >
                {featureGate.isEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!isLoading && currentItemId && (
            <CopyableText
              value={currentItemId}
              copyLabel="Copy ID"
              containerClassName="text-xs text-muted-foreground font-mono"
            />
          )}
          {!isLoading && featureGate?.lastModifiedTime && (
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                Updated <TimeAgo date={featureGate.lastModifiedTime} />
              </span>
            </div>
          )}
        </div>
      </div>
      <Button variant="outline" size="sm" asChild className="shrink-0">
        <a href={`https://console.statsig.com/gates/${currentItemId}`} target="_blank" rel="noopener noreferrer">
          Statsig
        </a>
      </Button>
    </div>
    <SheetDescription className="sr-only">Details for feature gate {currentItemId}</SheetDescription>
  </SheetHeader>
))

FeatureGateSheetHeader.displayName = 'FeatureGateSheetHeader'
