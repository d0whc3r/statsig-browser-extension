import { memo } from 'react'

import type { FeatureGate } from '@/src/types/statsig'

import { Button } from '@/src/components/ui/button'
import { CopyableText } from '@/src/components/ui/copyable-text'
import { SheetDescription, SheetHeader, SheetTitle } from '@/src/components/ui/sheet'
import { Skeleton } from '@/src/components/ui/skeleton'

interface FeatureGateSheetHeaderProps {
  isLoading: boolean
  featureGate?: FeatureGate
  currentItemId?: string
}

export const FeatureGateSheetHeader = memo(
  ({ isLoading, featureGate, currentItemId }: FeatureGateSheetHeaderProps) => (
    <SheetHeader className="px-6 py-4 border-b shrink-0 pr-12">
      <div className="flex justify-between items-center pr-6">
        <div className="flex-1 min-w-0 mr-4">
          <SheetTitle
            className="text-lg font-bold truncate cursor-pointer hover:underline"
            title={featureGate?.name ?? currentItemId}
          >
            {isLoading ? <Skeleton className="h-6 w-32" /> : (featureGate?.name ?? currentItemId)}
          </SheetTitle>
          {!isLoading && currentItemId && (
            <CopyableText
              value={currentItemId}
              copyLabel="Copy ID"
              containerClassName="mt-1 text-xs text-muted-foreground font-mono"
            />
          )}
        </div>
        <Button variant="outline" size="sm" asChild className="shrink-0">
          <a
            href={`https://console.statsig.com/gates/${currentItemId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Statsig
          </a>
        </Button>
      </div>
      <SheetDescription className="sr-only">
        Details for feature gate {currentItemId}
      </SheetDescription>
    </SheetHeader>
  ),
)

FeatureGateSheetHeader.displayName = 'FeatureGateSheetHeader'
