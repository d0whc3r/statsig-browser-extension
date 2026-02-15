import { useState } from 'react'

import type { Override } from '@/src/hooks/use-overrides'
import type { Group } from '@/src/types/statsig'

import { useExperimentMutations } from '@/src/hooks/use-experiment-mutations'
import { useExperimentOverrideHandlers } from '@/src/hooks/use-experiment-override-handlers'
import { useExperimentStorage } from '@/src/hooks/use-experiment-storage'
import { useUserDetails } from '@/src/hooks/use-user-details'
import { useWxtStorage } from '@/src/hooks/use-wxt-storage'
import { apiKeyTypeStorage } from '@/src/lib/storage'
import { useUIStore } from '@/src/store/use-ui-store'

export const useExperimentOverridesLogic = (overrides: Override[], groups?: Group[]) => {
  const { currentItemId } = useUIStore((state) => state)
  const [typeApiKey] = useWxtStorage(apiKeyTypeStorage)
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
    groups,
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
