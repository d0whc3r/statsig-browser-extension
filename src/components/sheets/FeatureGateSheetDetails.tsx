import { Loader2 } from 'lucide-react'
import { memo } from 'react'

import type { GateIssue } from '@/src/lib/gate-audit'
import type { FeatureGate } from '@/src/types/statsig'

import { EntityDetailsContainer, EntityDetailsSection, EntityDetailsTags } from '@/src/components/sheets/EntityDetails'
import { GATE_ISSUE_LABELS } from '@/src/lib/gate-audit'

interface FeatureGateSheetDetailsProps {
  isLoading: boolean
  error: unknown
  featureGate?: FeatureGate
  issues?: GateIssue[]
}

export const FeatureGateSheetDetails = memo(function FeatureGateSheetDetails({
  isLoading,
  error,
  featureGate,
  issues,
}: FeatureGateSheetDetailsProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return <div className="p-4 text-center text-destructive">Error loading feature gate details</div>
  }

  return (
    <EntityDetailsContainer>
      {/* Tags Section */}
      {featureGate?.tags && featureGate.tags.length > 0 && (
        <EntityDetailsSection title="Tags">
          <EntityDetailsTags tags={featureGate.tags} />
        </EntityDetailsSection>
      )}

      {/* Cleanup signals */}
      {issues && issues.length > 0 && (
        <EntityDetailsSection title="Cleanup signals">
          <ul className="space-y-1.5">
            {issues.map((issue) => (
              <li key={issue.key}>
                <span className="font-medium">{GATE_ISSUE_LABELS[issue.key]}</span>
                <span className="text-muted-foreground"> — {issue.detail}</span>
              </li>
            ))}
          </ul>
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
})

FeatureGateSheetDetails.displayName = 'FeatureGateSheetDetails'
