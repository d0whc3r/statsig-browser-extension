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
import { useContextStore } from '@/src/store/use-context-store'

export const useExperimentStorage = () => {
  const { currentLocalStorageValue, setCurrentLocalStorageValue } = useContextStore(
    (state) => state,
  )
  const [storageKeyName] = useWxtStorage<string>(localStorageKeyStorage)
  const [storageType] = useWxtStorage<'localStorage' | 'cookie'>(storageTypeStorage)
  const [, setCurrentOverrides] = useWxtStorage(currentOverridesStorage)

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]?.id) {
        const result = await getCurrentStorageValue(tabs[0].id, storageKeyName, storageType)
        if (result !== null) {
          setCurrentLocalStorageValue(result)
        }
      }
    })
  }, [setCurrentLocalStorageValue, storageType, storageKeyName])

  const saveToLocalStorage = useCallback(
    (value: string, allOverrideIds: string[]) => {
      setCurrentOverrides(allOverrideIds.map((id) => ({ name: id }))) // Use generic object structure if needed, or adjust type

      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (tabs[0]?.id) {
          setCurrentLocalStorageValue(value)
          await updateStorageValue({
            storageKey: storageKeyName,
            storageType,
            storageValue: value,
            tabId: tabs[0].id,
          })
        }
      })
    },
    [setCurrentOverrides, setCurrentLocalStorageValue, storageKeyName, storageType],
  )

  const clearOverride = useCallback(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]?.id) {
        setCurrentLocalStorageValue('')
        await removeStorageValue(tabs[0].id, storageKeyName, storageType)
      }
    })
  }, [setCurrentLocalStorageValue, storageKeyName, storageType])

  return {
    clearOverride,
    currentLocalStorageValue,
    saveToLocalStorage,
  }
}
