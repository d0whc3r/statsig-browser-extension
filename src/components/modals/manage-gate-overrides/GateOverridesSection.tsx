import { Loader2 } from 'lucide-react'

import type { GateOverride } from '@/src/types/statsig'

import { useGateOverrides } from '@/src/hooks/use-gate-overrides'
import { useGateOverridesLogic } from '@/src/hooks/use-gate-overrides-logic'
import { useStore } from '@/src/store/use-store'

import { AddOverrideForm } from './AddOverrideForm'
import { OverridesList } from './OverridesList'
import { PageContextCard } from './PageContextCard'

export const GateOverridesSection = () => {
  const { currentItemId } = useStore((state) => state)
  const { data: overrides, isLoading } = useGateOverrides(currentItemId)

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!overrides) {
    return <div className="text-center p-4">No overrides data available.</div>
  }

  return <GateOverridesManager currentItemId={currentItemId} overrides={overrides} />
}

const GateOverridesManager = ({
  currentItemId,
  overrides,
}: {
  currentItemId: string | undefined
  overrides: GateOverride
}) => {
  const {
    view,
    detectedUser,
    detectedUserId,
    isDetectedUserOverridden,
    canEdit,
    isPending,
    allOverrides,
    handleAddOverride,
    handleDeleteOverride,
    handleSwitchToForm,
    handleSwitchToTable,
  } = useGateOverridesLogic(currentItemId, overrides)

  return (
    <div className="flex flex-col gap-6">
      <PageContextCard
        detectedUser={detectedUser || undefined}
        detectedUserId={detectedUserId || ''}
        isDetectedUserOverridden={isDetectedUserOverridden}
        canEdit={canEdit}
        isPending={isPending}
        onAddOverride={handleAddOverride}
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
        />
      )}
    </div>
  )
}
