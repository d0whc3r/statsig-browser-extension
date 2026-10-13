import { useEffect } from 'react'

import { useWxtStorage } from '@/src/hooks/use-wxt-storage'
import { apiKeyTypeStorage, currentOverridesStorage, localStorageKeyStorage } from '@/src/lib/storage'
import { useSettingsStore } from '@/src/store/use-settings-store'

export const useSettingsStorage = () => {
  const { activeProjectId, apiKey, clearProjects, isApiKeyLoading, projects } = useSettingsStore()
  const [localStorageValue, setLocalStorageKey] = useWxtStorage(localStorageKeyStorage)
  const [typeApiKey, setTypeApiKey, isApiKeyTypeLoading] = useWxtStorage(apiKeyTypeStorage)
  const [, setCurrentOverrides] = useWxtStorage(currentOverridesStorage)

  // Normalize legacy settings after hydration, outside the render phase.
  useEffect(() => {
    if (!isApiKeyTypeLoading && typeApiKey !== 'write-key') {
      setTypeApiKey('write-key')
    }
  }, [isApiKeyTypeLoading, typeApiKey, setTypeApiKey])

  const reset = async () => {
    await clearProjects()
    setLocalStorageKey('statsig_user')
    setCurrentOverrides([])
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
