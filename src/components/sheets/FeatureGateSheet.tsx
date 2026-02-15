import { useMemo } from 'react'

import { FeatureGateRules } from '@/src/components/FeatureGateRules'
import { GateOverridesSection } from '@/src/components/modals/manage-gate-overrides/GateOverridesSection'
import { useFeatureGate } from '@/src/hooks/use-feature-gate'
import { useGateOverrides } from '@/src/hooks/use-gate-overrides'
import { useUIStore } from '@/src/store/use-ui-store'

import { CommonSheet, SheetTabs } from './CommonSheet'
import { FeatureGateSheetDetails } from './FeatureGateSheetDetails'
import { FeatureGateSheetHeader } from './FeatureGateSheetHeader'

export function FeatureGateSheet() {
  const { currentItemId, isItemSheetOpen, currentItemType } = useUIStore((state) => state)

  const isOpen = isItemSheetOpen && currentItemType === 'feature_gate'

  const {
    data: featureGate,
    error: gateError,
    isLoading: isLoadingGate,
  } = useFeatureGate(isOpen ? currentItemId : undefined)
  const { error: overridesError, isLoading: isLoadingOverrides } = useGateOverrides(
    isOpen ? currentItemId : undefined,
  )

  const isLoading = isLoadingGate || isLoadingOverrides
  const error = gateError || overridesError

  const detailsContent = useMemo(
    () => <FeatureGateSheetDetails isLoading={isLoading} error={error} featureGate={featureGate} />,
    [isLoading, error, featureGate],
  )

  const rulesContent = useMemo(
    () => (currentItemId ? <FeatureGateRules featureGateId={currentItemId} /> : null),
    [currentItemId],
  )

  const overridesContent = useMemo(
    () => <GateOverridesSection featureGate={featureGate} />,
    [featureGate],
  )

  return (
    <CommonSheet type="feature_gate">
      <FeatureGateSheetHeader
        isLoading={isLoading}
        featureGate={featureGate}
        currentItemId={currentItemId}
      />
      <SheetTabs
        detailsContent={detailsContent}
        rulesContent={rulesContent}
        overridesContent={overridesContent}
      />
    </CommonSheet>
  )
}
