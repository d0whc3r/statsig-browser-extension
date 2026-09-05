import { useWxtStorage } from '@/src/hooks/use-wxt-storage'
import { apiKeyTypeStorage, currentOverridesStorage, localStorageKeyStorage } from '@/src/lib/storage'
import { useSettingsStore } from '@/src/store/use-settings-store'

export const useSettingsStorage = () => {
  const { activeProjectId, apiKey, clearProjects, isApiKeyLoading, projects } = useSettingsStore()
  const [localStorageValue, setLocalStorageKey] = useWxtStorage(localStorageKeyStorage)
  // Force write-key as default since user requested to remove the selector
  const [typeApiKey, setTypeApiKey] = useWxtStorage(apiKeyTypeStorage)
  const [, setCurrentOverrides] = useWxtStorage(currentOverridesStorage)

  // Ensure typeApiKey is always write-key if it was somehow set to read-key
  if (typeApiKey !== 'write-key') {
    setTypeApiKey('write-key')
  }

  const reset = async () => {
    await clearProjects()
    setLocalStorageKey('statsig_user')
    setCurrentOverrides([])
    // We do not reset typeApiKey as it is a user preference
  }

  return {
    activeProjectId,
    apiKey,
    isApiKeyLoading,
    localStorageValue,
    projects,
    reset,
    setLocalStorageKey,
    setTypeApiKey,
    typeApiKey,
  }
}
