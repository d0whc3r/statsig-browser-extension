import { Loader2 } from 'lucide-react'
import { memo } from 'react'

import type { FeatureGate } from '@/src/types/statsig'

import {
  EntityDetailsContainer,
  EntityDetailsDivider,
  EntityDetailsField,
  EntityDetailsHeader,
  EntityDetailsSection,
  EntityDetailsTags,
} from '@/src/components/sheets/EntityDetails'
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
      <EntityDetailsContainer>
        {/* Status Section */}
        <EntityDetailsHeader>
          <EntityDetailsField label="Status">
            <Badge
              variant={featureGate?.status === 'In Progress' ? 'secondary' : 'outline'}
              className="w-fit"
            >
              {featureGate?.status}
            </Badge>
          </EntityDetailsField>

          <EntityDetailsDivider />

          <EntityDetailsField label="Enabled">
            <Badge variant={featureGate?.isEnabled ? 'default' : 'destructive'} className="w-fit">
              {featureGate?.isEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </EntityDetailsField>

          <EntityDetailsDivider />

          <EntityDetailsField label="Last Updated">
            <TimeAgo date={featureGate?.lastModifiedTime ?? Date.now()} />
          </EntityDetailsField>
        </EntityDetailsHeader>

        {/* Tags Section */}
        <EntityDetailsTags tags={featureGate?.tags} />

        {/* Description */}
        {featureGate?.description && (
          <EntityDetailsSection title="Description">
            <p>{featureGate.description}</p>
          </EntityDetailsSection>
        )}
      </EntityDetailsContainer>
    )
  },
)

FeatureGateSheetDetails.displayName = 'FeatureGateSheetDetails'
