import React, { memo } from 'react'

import type { Override } from '@/src/hooks/use-overrides'
import type { Group } from '@/src/types/statsig'

import { AddOverrideInput } from '@/src/components/AddOverrideInput'
import { ExperimentPageContextCard } from '@/src/components/ExperimentPageContextCard'
import { OverrideGroup } from '@/src/components/OverrideGroup'
import { Button } from '@/src/components/ui/button'
import { GeneralEmptyState } from '@/src/components/ui/general-empty-state'
import { useExperimentOverridesLogic } from '@/src/hooks/use-experiment-overrides-logic'

interface Props {
  overrides: Override[]
  groups?: Group[]
}

const EMPTY_GROUPS: Group[] = []

export const ExperimentOverrides = memo(({ overrides, groups = EMPTY_GROUPS }: Props) => {
  const {
    currentLocalStorageValue,
    newId,
    setNewId,
    selectedGroupId,
    setSelectedGroupId,
    isPending,
    saveToLocalStorage,
    clearOverride,
    handleAdd,
    handleDelete,
    canEdit,
    detectedUser,
    detectedUserId,
    isDetectedUserOverridden,
  } = useExperimentOverridesLogic(overrides)

  if (overrides.length === 0 && !canEdit) {
    return <GeneralEmptyState variant="override" entityName="experiment" />
  }

  const hasActiveOverride = Boolean(currentLocalStorageValue)

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-lg font-bold">Experiment overrides</h3>
        {hasActiveOverride && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearOverride}
            title="Clear the active override"
          >
            Clear
          </Button>
        )}
      </div>
      <p className="mb-3 text-sm text-muted-foreground">
        Here you can view and inject an override to your local storage.
      </p>

      {canEdit && (
        <>
          <ExperimentPageContextCard
            detectedUser={detectedUser || undefined}
            detectedUserId={detectedUserId || ''}
            isDetectedUserOverridden={isDetectedUserOverridden}
            canEdit={canEdit}
            isPending={isPending}
            groups={groups}
            onAddOverride={handleAdd}
          />
          <AddOverrideInput
            newId={newId}
            setNewId={setNewId}
            selectedGroupId={selectedGroupId}
            setSelectedGroupId={setSelectedGroupId}
            groups={groups}
            isPending={isPending}
            onAdd={handleAdd}
          />
        </>
      )}

      <div className="space-y-4">
        {overrides.length === 0 ? (
          <GeneralEmptyState variant="override" entityName="experiment" />
        ) : (
          overrides.map((override) => {
            const groupName =
              groups.find((group) => group.id === override.groupID)?.name || override.groupID

            return (
              <OverrideGroup
                key={override.groupID}
                override={override}
                groupName={groupName}
                currentLocalStorageValue={currentLocalStorageValue || ''}
                canEdit={canEdit}
                onSave={saveToLocalStorage}
                onDelete={handleDelete}
              />
            )
          })
        )}
      </div>
    </div>
  )
})
ExperimentOverrides.displayName = 'ExperimentOverrides'
