import { useCallback, useEffect } from 'react'

import {
  getCurrentStorageValue,
  removeStorageValue,
  updateStorageValue,
} from '@/src/handlers/local-storage-handlers'
import { useWxtStorage } from '@/src/hooks/use-wxt-storage'
import {
  currentOverridesStorage,
  localStorageKeyStorage,
  storageTypeStorage,
} from '@/src/lib/storage'
import { getActiveTab } from '@/src/lib/tabs'
import { useContextStore } from '@/src/store/use-context-store'

export const useExperimentStorage = () => {
  const { currentLocalStorageValue, setCurrentLocalStorageValue } = useContextStore(
    (state) => state,
  )
  const [storageKeyName] = useWxtStorage<string>(localStorageKeyStorage)
  const [storageType] = useWxtStorage<'localStorage' | 'cookie'>(storageTypeStorage)
  const [, setCurrentOverrides] = useWxtStorage(currentOverridesStorage)

  useEffect(() => {
    const fetchStorageValue = async () => {
      const tab = await getActiveTab()
      const activeTabId = tab?.id

      if (activeTabId) {
        const result = await getCurrentStorageValue(activeTabId, storageKeyName, storageType)
        if (result !== null) {
          setCurrentLocalStorageValue(result)
        }
      }
    }
    fetchStorageValue()
  }, [setCurrentLocalStorageValue, storageType, storageKeyName])

  const saveToLocalStorage = useCallback(
    async (value: string, allOverrideIds: string[]) => {
      setCurrentOverrides(allOverrideIds.map((id) => ({ name: id }))) // Use generic object structure if needed, or adjust type

      const tab = await getActiveTab()
      const activeTabId = tab?.id

      if (activeTabId) {
        setCurrentLocalStorageValue(value)
        await updateStorageValue({
          storageKey: storageKeyName,
          storageType,
          storageValue: value,
          tabId: activeTabId,
        })
      }
    },
    [setCurrentOverrides, setCurrentLocalStorageValue, storageKeyName, storageType],
  )

  const clearOverride = useCallback(async () => {
    const tab = await getActiveTab()
    const activeTabId = tab?.id

    if (activeTabId) {
      setCurrentLocalStorageValue('')
      await removeStorageValue(activeTabId, storageKeyName, storageType)
    }
  }, [setCurrentLocalStorageValue, storageKeyName, storageType])

  return {
    clearOverride,
    currentLocalStorageValue,
    saveToLocalStorage,
  }
}
