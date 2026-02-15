import { useCallback } from 'react'

import type { Override } from '@/src/hooks/use-overrides'
import type { Group } from '@/src/types/statsig'

interface UseExperimentOverrideHandlersProps {
  currentItemId: string | undefined
  newId: string
  selectedGroupId: string
  groups?: Group[]
  addMutation: (data: {
    experimentId: string
    override: { groupID: string; ids: string[] }
  }) => void
  deleteMutation: (data: {
    experimentId: string
    override: { groupID: string; ids: string[] }
  }) => void
  overrides: Override[]
  saveToLocalStorage: (value: string, overrideIds: string[]) => void
}

export const useExperimentOverrideHandlers = ({
  currentItemId,
  newId,
  selectedGroupId,
  addMutation,
  deleteMutation,
  groups,
  overrides,
  saveToLocalStorage,
}: UseExperimentOverrideHandlersProps) => {
  const handleSaveToLocalStorage = useCallback(
    (value: string) => {
      const allOverrideIds = overrides.flatMap((override) => override.ids)
      saveToLocalStorage(value, allOverrideIds)
    },
    [overrides, saveToLocalStorage],
  )

  const handleAdd = useCallback(
    (userId?: string, groupId?: string) => {
      const id = userId || newId
      const group = groupId || selectedGroupId

      if (!currentItemId || !id || !group) {
        return
      }

      // Validate group exists if groups are provided
      if (groups && !groups.some((g) => g.id === group)) {
        console.error(`Group ID ${group} not found in experiment groups`)
        return
      }

      addMutation({
        experimentId: currentItemId,
        override: {
          groupID: group,
          ids: [id],
        },
      })
    },
    [currentItemId, newId, selectedGroupId, groups, addMutation],
  )

  const handleDelete = useCallback(
    (groupId: string, idToRemove: string) => {
      if (!currentItemId) {
        return
      }

      deleteMutation({
        experimentId: currentItemId,
        override: {
          groupID: groupId,
          ids: [idToRemove],
        },
      })
    },
    [currentItemId, deleteMutation],
  )

  return { handleAdd, handleDelete, handleSaveToLocalStorage }
}
