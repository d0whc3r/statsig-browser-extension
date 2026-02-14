import { useCallback, useEffect } from 'react'

import {
  getCurrentStorageValue,
  removeStorageValue,
  updateStorageValue,
} from '@/src/handlers/local-storage-handlers'
import { useLocalStorage } from '@/src/hooks/use-local-storage'
import { useStore } from '@/src/store/use-store'

export const useExperimentStorage = () => {
  const { currentLocalStorageValue, setCurrentLocalStorageValue } = useStore((state) => state)
  const [storageKeyName] = useLocalStorage('statsig-local-storage-key', 'statsig_gate_overrides')
  const [storageType] = useLocalStorage<'cookie' | 'localStorage'>(
    'statsig-storage-type',
    'localStorage',
  )
  const [, setCurrentOverrides] = useLocalStorage<unknown[]>('statsig-current-overrides', [])

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
      setCurrentOverrides(allOverrideIds.map((id) => ({ name: id })))

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
