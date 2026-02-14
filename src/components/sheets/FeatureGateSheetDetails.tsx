import { Loader2 } from 'lucide-react'
import { memo } from 'react'

import type { FeatureGate } from '@/src/types/statsig'

import { Badge } from '@/src/components/ui/badge'
import { TimeAgo } from '@/src/components/ui/time-ago'

interface FeatureGateSheetDetailsProps {
  isLoading: boolean
  error: unknown
  featureGate?: FeatureGate
}

export const FeatureGateSheetDetails = memo(
  ({ isLoading, error, featureGate }: FeatureGateSheetDetailsProps) => {
    if (isLoading) {
      return (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-destructive text-center p-4">Error loading feature gate details</div>
      )
    }

    return (
      <>
        {/* Status Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Status
          </h3>
          <div className="flex items-center gap-4 p-3 bg-secondary/20 rounded-lg border">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground mb-1">Status</span>
              <Badge
                variant={featureGate?.status === 'In Progress' ? 'secondary' : 'outline'}
                className="w-fit"
              >
                {featureGate?.status}
              </Badge>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground mb-1">Enabled</span>
              <Badge variant={featureGate?.isEnabled ? 'default' : 'destructive'} className="w-fit">
                {featureGate?.isEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground mb-1">Last Updated</span>
              <span className="text-sm font-medium">
                <TimeAgo date={featureGate?.lastModifiedTime || Date.now()} />
              </span>
            </div>
          </div>
        </div>

        {/* Tags Section */}
        {featureGate?.tags && featureGate.tags.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {featureGate.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {featureGate?.description && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Description
            </h3>
            <p className="text-sm leading-relaxed text-foreground/90">{featureGate.description}</p>
          </div>
        )}
      </>
    )
  },
)

FeatureGateSheetDetails.displayName = 'FeatureGateSheetDetails'
