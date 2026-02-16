import { useCallback } from 'react'

import { useOverridesSectionLogic } from '@/src/hooks/use-overrides-section-logic'

import type { AddOverrideParams } from './PageContextCard'

import { AddOverrideForm } from './AddOverrideForm'
import { OverridesList } from './OverridesList'
import { PageContextCard } from './PageContextCard'

export const OverridesSection = () => {
  const {
    addOverride,
    deleteOverride,
    detectedUser,
    detectedUserId,
    detectedUserOverrides,
    groups,
    handleBackClick,
    handleCreateOverrideClick,
    isDetectedUserOverridden,
    isPending,
    overridesData,
    typeApiKey,
    view,
    experiment,
  } = useOverridesSectionLogic()

  const handleAddOverride = useCallback(
    ({ userId, groupId, environment, idType }: AddOverrideParams) => {
      addOverride({
        environment: environment || undefined,
        groupID: groupId,
        ids: [userId],
        unitType: idType || undefined,
      })
    },
    [addOverride],
  )

  return (
    <div className="flex flex-col gap-6">
      <PageContextCard
        detectedUser={detectedUser || undefined}
        detectedUserId={detectedUserId || ''}
        isDetectedUserOverridden={isDetectedUserOverridden}
        detectedUserOverrides={detectedUserOverrides}
        canEdit={typeApiKey === 'write-key'}
        isPending={isPending}
        groups={groups}
        onAddOverride={handleAddOverride}
        experiment={experiment}
      />

      {view === 'table' ? (
        <OverridesList
          canEdit={typeApiKey === 'write-key'}
          onCreateOverrideClick={handleCreateOverrideClick}
          overridesData={overridesData}
          onDeleteOverride={deleteOverride}
          isPending={isPending}
          groups={groups}
        />
      ) : (
        <AddOverrideForm
          groups={groups}
          onCancel={handleBackClick}
          onAddOverride={addOverride}
          isPending={isPending}
          experiment={experiment}
        />
      )}
    </div>
  )
}
