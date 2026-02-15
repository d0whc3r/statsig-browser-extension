import { Loader2 } from 'lucide-react'

import type { FeatureGate, GateOverride } from '@/src/types/statsig'

import { GeneralEmptyState } from '@/src/components/ui/general-empty-state'
import { useGateOverrides } from '@/src/hooks/use-gate-overrides'
import { useGateOverridesLogic } from '@/src/hooks/use-gate-overrides-logic'
import { useUIStore } from '@/src/store/use-ui-store'

import { AddOverrideForm } from './AddOverrideForm'
import { OverridesList } from './OverridesList'
import { PageContextCard } from './PageContextCard'

export const GateOverridesSection = ({ featureGate }: { featureGate?: FeatureGate }) => {
  const { currentItemId } = useUIStore((state) => state)
  const { data: overrides, isLoading } = useGateOverrides(currentItemId)

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!overrides) {
    return (
      <GeneralEmptyState
        variant="error"
        title="No data available"
        description="Could not load overrides data for this gate."
      />
    )
  }

  return (
    <GateOverridesManager
      currentItemId={currentItemId}
      overrides={overrides}
      featureGate={featureGate}
    />
  )
}

const GateOverridesManager = ({
  currentItemId,
  overrides,
  featureGate,
}: {
  currentItemId: string | undefined
  overrides: GateOverride
  featureGate?: FeatureGate
}) => {
  const {
    view,
    detectedUser,
    detectedUserId,
    isDetectedUserOverridden,
    detectedUserOverrides,
    canEdit,
    isPending,
    allOverrides,
    handleAddOverride,
    handleDeleteOverride,
    handleSwitchToForm,
    handleSwitchToTable,
  } = useGateOverridesLogic(currentItemId, overrides, featureGate)

  return (
    <div className="flex flex-col gap-6">
      <PageContextCard
        detectedUser={detectedUser || undefined}
        detectedUserId={detectedUserId || ''}
        isDetectedUserOverridden={isDetectedUserOverridden}
        detectedUserOverrides={detectedUserOverrides}
        canEdit={canEdit}
        isPending={isPending}
        onAddOverride={handleAddOverride}
        featureGate={featureGate}
      />

      {view === 'table' ? (
        <OverridesList
          allOverrides={allOverrides}
          canEdit={canEdit}
          isPending={isPending}
          onDeleteOverride={handleDeleteOverride}
          onSwitchToForm={handleSwitchToForm}
        />
      ) : (
        <AddOverrideForm
          isPending={isPending}
          onAddOverride={handleAddOverride}
          onCancel={handleSwitchToTable}
          featureGate={featureGate}
        />
      )}
    </div>
  )
}
