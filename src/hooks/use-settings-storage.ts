import { useLocalStorage } from '@/src/hooks/use-local-storage'

export const useSettingsStorage = () => {
  const [apiKey, setApiKey] = useLocalStorage('statsig-console-api-key', '')
  const [localStorageValue, setLocalStorageKey] = useLocalStorage('statsig-local-storage-key', '')
  const [storageType, setStorageType] = useLocalStorage('statsig-storage-type', 'localStorage')
  const [typeApiKey, setTypeApiKey] = useLocalStorage('statsig-type-api-key', 'read-key')

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
