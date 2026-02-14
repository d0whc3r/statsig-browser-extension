import { useState } from 'react'

import type { Override } from '@/src/hooks/use-overrides'

import { useExperimentMutations } from '@/src/hooks/use-experiment-mutations'
import { useExperimentOverrideHandlers } from '@/src/hooks/use-experiment-override-handlers'
import { useExperimentStorage } from '@/src/hooks/use-experiment-storage'
import { useLocalStorage } from '@/src/hooks/use-local-storage'
import { useUIStore } from '@/src/store/use-ui-store'

export const useExperimentOverridesLogic = (overrides: Override[]) => {
  const { currentItemId } = useUIStore((state) => state)
  const [typeApiKey] = useLocalStorage('statsig-type-api-key', 'read-key')

  const { currentLocalStorageValue, saveToLocalStorage, clearOverride } = useExperimentStorage()

  const [newId, setNewId] = useState('')
  const [selectedGroupId, setSelectedGroupId] = useState('')

  const { addMutation, deleteMutation, isAdding, isDeleting } = useExperimentMutations({
    currentItemId,
    onAddSuccess: () => setNewId(''),
  })

  const { handleAdd, handleDelete, handleSaveToLocalStorage } = useExperimentOverrideHandlers({
    addMutation,
    currentItemId,
    deleteMutation,
    newId,
    overrides,
    saveToLocalStorage,
    selectedGroupId,
  })

  const isPending = isAdding || isDeleting
  const canEdit = typeApiKey === 'write-key'

  return {
    canEdit,
    clearOverride,
    currentLocalStorageValue,
    handleAdd,
    handleDelete,
    isPending,
    newId,
    saveToLocalStorage: handleSaveToLocalStorage,
    selectedGroupId,
    setNewId,
    setSelectedGroupId,
  }
}
