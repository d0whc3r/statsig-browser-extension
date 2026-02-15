import { useState } from 'react'

import type { Override } from '@/src/hooks/use-overrides'

import { useExperimentMutations } from '@/src/hooks/use-experiment-mutations'
import { useExperimentOverrideHandlers } from '@/src/hooks/use-experiment-override-handlers'
import { useExperimentStorage } from '@/src/hooks/use-experiment-storage'
import { useLocalStorage } from '@/src/hooks/use-local-storage'
import { useUserDetails } from '@/src/hooks/use-user-details'
import { STORAGE_KEYS } from '@/src/lib/storage-keys'
import { useUIStore } from '@/src/store/use-ui-store'

export const useExperimentOverridesLogic = (overrides: Override[]) => {
  const { currentItemId } = useUIStore((state) => state)
  const [typeApiKey] = useLocalStorage(STORAGE_KEYS.API_KEY_TYPE, 'write-key')
  const { data: detectedUser } = useUserDetails()

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

  const detectedUserId = (detectedUser?.userID || (detectedUser as Record<string, unknown>)?.id) as
    | string
    | undefined

  const isDetectedUserOverridden = detectedUserId
    ? overrides.some((override) => override.ids.includes(detectedUserId))
    : false

  return {
    canEdit,
    clearOverride,
    currentLocalStorageValue,
    detectedUser,
    detectedUserId,
    handleAdd,
    handleDelete,
    isDetectedUserOverridden,
    isPending,
    newId,
    saveToLocalStorage: handleSaveToLocalStorage,
    selectedGroupId,
    setNewId,
    setSelectedGroupId,
  }
}
