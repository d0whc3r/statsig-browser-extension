import { useLocalStorage } from '@/src/hooks/use-local-storage'

export const useSettingsStorage = () => {
  const [apiKey, setApiKey] = useLocalStorage('statsig-console-api-key', '')
  const [localStorageValue, setLocalStorageKey] = useLocalStorage(
    'statsig-local-storage-key',
    'statsig_user',
  )
  const [storageType, setStorageType] = useLocalStorage('statsig-storage-type', 'localStorage')
  // Force write-key as default since user requested to remove the selector
  const [typeApiKey, setTypeApiKey] = useLocalStorage('statsig-type-api-key', 'write-key')

  // Ensure typeApiKey is always write-key if it was somehow set to read-key
  if (typeApiKey !== 'write-key') {
    setTypeApiKey('write-key')
  }

  return {
    apiKey,
    localStorageValue,
    setApiKey,
    setLocalStorageKey,
    setStorageType,
    setTypeApiKey,
    storageType,
    typeApiKey,
  }
}
