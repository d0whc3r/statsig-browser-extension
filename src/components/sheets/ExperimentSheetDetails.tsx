import { memo } from 'react'

import type { Experiment } from '@/src/types/statsig'

import { HealthCheckSection } from '@/src/components/HealthCheckSection'
import { HypothesisSection } from '@/src/components/HypothesisSection'
import {
  EntityDetailsContainer,
  EntityDetailsDivider,
  EntityDetailsField,
  EntityDetailsHeader,
  EntityDetailsSection,
  EntityDetailsTags,
} from '@/src/components/sheets/EntityDetails'
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
      <EntityDetailsContainer>
        {/* Status Section */}
        <EntityDetailsHeader>
          <EntityDetailsField label="Status">
            <Badge
              variant={experiment.status === 'active' ? 'default' : 'secondary'}
              className="w-fit"
            >
              {experiment.status}
            </Badge>
          </EntityDetailsField>

          <EntityDetailsDivider />

          <EntityDetailsField label="Created">
            <TimeAgo date={experiment.createdTime} />
          </EntityDetailsField>

          <EntityDetailsDivider />

          <EntityDetailsField label="Updated">
            <TimeAgo date={experiment.lastModifiedTime} />
          </EntityDetailsField>
        </EntityDetailsHeader>

        {/* Description */}
        {experiment.description && (
          <EntityDetailsSection title="Description">
            <p>{experiment.description}</p>
          </EntityDetailsSection>
        )}

        {/* Tags */}
        <EntityDetailsTags tags={experiment.tags} />

        {/* Health Checks */}
        {experiment.healthChecks && <HealthCheckSection healthChecks={experiment.healthChecks} />}

        {/* Hypothesis */}
        {experiment.hypothesis && <HypothesisSection hypothesis={experiment.hypothesis} />}
      </EntityDetailsContainer>
    )
  },
)

ExperimentSheetDetails.displayName = 'ExperimentSheetDetails'
