import { memo } from 'react'

import type { Experiment } from '@/src/types/statsig'

import { HealthCheckSection } from '@/src/components/HealthCheckSection'
import { HypothesisSection } from '@/src/components/HypothesisSection'
import { Badge } from '@/src/components/ui/badge'
import { Skeleton } from '@/src/components/ui/skeleton'
import { TimeAgo } from '@/src/components/ui/time-ago'

interface ExperimentSheetDetailsProps {
  isLoading: boolean
  error: unknown
  experiment?: Experiment
}

export const ExperimentSheetDetails = memo(
  ({ isLoading, error, experiment }: ExperimentSheetDetailsProps) => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-center text-sm text-destructive py-4">
          Failed to load experiment details:{' '}
          {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      )
    }

    if (!experiment) {
      return
    }

    return (
      <div className="space-y-6">
        {/* Status Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Status
          </h3>
          <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg border border-border">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground mb-1">Status</span>
              <Badge
                variant={experiment.status === 'active' ? 'default' : 'secondary'}
                className="w-fit"
              >
                {experiment.status}
              </Badge>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground mb-1">Created</span>
              <span className="text-sm font-medium">
                <TimeAgo date={experiment.createdTime} />
              </span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground mb-1">Updated</span>
              <span className="text-sm font-medium">
                <TimeAgo date={experiment.lastModifiedTime} />
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {experiment.description && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Description
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {experiment.description}
            </p>
          </div>
        )}

        {/* Tags */}
        {experiment.tags && experiment.tags.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {experiment.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Health Checks */}
        {experiment.healthChecks && <HealthCheckSection healthChecks={experiment.healthChecks} />}

        {/* Hypothesis */}
        {experiment.hypothesis && <HypothesisSection hypothesis={experiment.hypothesis} />}
      </div>
    )
  },
)

ExperimentSheetDetails.displayName = 'ExperimentSheetDetails'
