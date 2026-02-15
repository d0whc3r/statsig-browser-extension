import { useWxtStorage } from '@/src/hooks/use-wxt-storage'
import { apiKeyTypeStorage, localStorageKeyStorage, storageTypeStorage } from '@/src/lib/storage'
import { useSettingsStore } from '@/src/store/use-settings-store'

export const useSettingsStorage = () => {
  const { apiKey, isApiKeyLoading, setApiKey } = useSettingsStore()
  const [localStorageValue, setLocalStorageKey] = useWxtStorage(localStorageKeyStorage)
  const [storageType, setStorageType] = useWxtStorage(storageTypeStorage)
  // Force write-key as default since user requested to remove the selector
  const [typeApiKey, setTypeApiKey] = useWxtStorage(apiKeyTypeStorage)

  // Ensure typeApiKey is always write-key if it was somehow set to read-key
  if (typeApiKey !== 'write-key') {
    setTypeApiKey('write-key')
  }

  const reset = () => {
    setApiKey('')
    setLocalStorageKey('statsig_user')
    // We do not reset storageType or typeApiKey as they are user preferences
  }

  return {
    apiKey,
    isApiKeyLoading,
    localStorageValue,
    reset,
    setApiKey,
    setLocalStorageKey,
    setStorageType,
    setTypeApiKey,
    storageType,
    typeApiKey,
  }
}
