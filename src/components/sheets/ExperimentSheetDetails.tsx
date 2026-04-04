import { memo } from 'react'

import type { Experiment } from '@/src/types/statsig'

import { HealthCheckSection } from '@/src/components/HealthCheckSection'
import { HypothesisSection } from '@/src/components/HypothesisSection'
import { EntityDetailsContainer, EntityDetailsSection, EntityDetailsTags } from '@/src/components/sheets/EntityDetails'
import { Skeleton } from '@/src/components/ui/skeleton'

interface ExperimentSheetDetailsProps {
  isLoading: boolean
  error: unknown
  experiment?: Experiment
}

export const ExperimentSheetDetails = memo(({ isLoading, error, experiment }: ExperimentSheetDetailsProps) => {
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
      <div className="py-4 text-center text-sm text-destructive">
        Failed to load experiment details: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    )
  }

  if (!experiment) {
    return
  }

  return (
    <EntityDetailsContainer>
      {/* Tags Section */}
      {experiment.tags && experiment.tags.length > 0 && (
        <EntityDetailsSection title="Tags">
          <EntityDetailsTags tags={experiment.tags} />
        </EntityDetailsSection>
      )}

      {/* Description */}
      {experiment.description && (
        <EntityDetailsSection title="Description">
          <p>{experiment.description}</p>
        </EntityDetailsSection>
      )}

      {/* Health Checks */}
      {experiment.healthChecks && <HealthCheckSection healthChecks={experiment.healthChecks} />}

      {/* Hypothesis */}
      {experiment.hypothesis && <HypothesisSection hypothesis={experiment.hypothesis} />}
    </EntityDetailsContainer>
  )
})

ExperimentSheetDetails.displayName = 'ExperimentSheetDetails'
