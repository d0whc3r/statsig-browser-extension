import { useWxtStorage } from '@/src/hooks/use-wxt-storage'
import {
  apiKeyStorage,
  apiKeyTypeStorage,
  localStorageKeyStorage,
  storageTypeStorage,
} from '@/src/lib/storage'

export const useSettingsStorage = () => {
  const [apiKey, setApiKey, isApiKeyLoading] = useWxtStorage(apiKeyStorage)
  const [localStorageValue, setLocalStorageKey] = useWxtStorage(localStorageKeyStorage)
  const [storageType, setStorageType] = useWxtStorage(storageTypeStorage)
  // Force write-key as default since user requested to remove the selector
  const [typeApiKey, setTypeApiKey] = useWxtStorage(apiKeyTypeStorage)

  // Ensure typeApiKey is always write-key if it was somehow set to read-key
  if (typeApiKey !== 'write-key') {
    setTypeApiKey('write-key')
  }

  return {
    apiKey,
    isApiKeyLoading,
    localStorageValue,
    setApiKey,
    setLocalStorageKey,
    setStorageType,
    setTypeApiKey,
    storageType,
    typeApiKey,
  }
}
