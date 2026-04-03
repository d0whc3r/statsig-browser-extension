import { Loader2 } from 'lucide-react'
import { memo } from 'react'

import type { FeatureGate } from '@/src/types/statsig'

import {
  EntityDetailsContainer,
  EntityDetailsSection,
  EntityDetailsTags,
} from '@/src/components/sheets/EntityDetails'

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
        {/* Tags Section */}
        {featureGate?.tags && featureGate.tags.length > 0 && (
          <EntityDetailsSection title="Tags">
            <EntityDetailsTags tags={featureGate.tags} />
          </EntityDetailsSection>
        )}

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
