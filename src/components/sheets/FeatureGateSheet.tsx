import { FeatureGateRules } from '@/src/components/FeatureGateRules'
import { GateOverridesSection } from '@/src/components/modals/manage-gate-overrides/GateOverridesSection'
import { useFeatureGate } from '@/src/hooks/use-feature-gate'
import { useGateOverrides } from '@/src/hooks/use-gate-overrides'
import { useStore } from '@/src/store/use-store'

import { CommonSheet, SheetTabs } from './CommonSheet'
import { FeatureGateSheetDetails } from './FeatureGateSheetDetails'
import { FeatureGateSheetHeader } from './FeatureGateSheetHeader'

export function FeatureGateSheet() {
  const { currentItemId, isItemSheetOpen, currentItemType } = useStore((state) => state)

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

  return (
    <CommonSheet type="feature_gate">
      <FeatureGateSheetHeader
        isLoading={isLoading}
        featureGate={featureGate}
        currentItemId={currentItemId}
      />
      <SheetTabs
        detailsContent={
          <FeatureGateSheetDetails isLoading={isLoading} error={error} featureGate={featureGate} />
        }
        rulesContent={currentItemId && <FeatureGateRules featureGateId={currentItemId} />}
        overridesContent={<GateOverridesSection />}
      />
    </CommonSheet>
  )
}
