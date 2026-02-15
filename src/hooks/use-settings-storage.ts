import { useLocalStorage } from '@/src/hooks/use-local-storage'
import { STORAGE_KEYS } from '@/src/lib/storage-keys'

export const useSettingsStorage = () => {
  const [apiKey, setApiKey] = useLocalStorage(STORAGE_KEYS.CONSOLE_API_KEY, '')
  const [localStorageValue, setLocalStorageKey] = useLocalStorage(
    STORAGE_KEYS.LOCAL_STORAGE_KEY,
    'statsig_user',
  )
  const [storageType, setStorageType] = useLocalStorage(STORAGE_KEYS.STORAGE_TYPE, 'localStorage')
  // Force write-key as default since user requested to remove the selector
  const [typeApiKey, setTypeApiKey] = useLocalStorage(STORAGE_KEYS.API_KEY_TYPE, 'write-key')

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
