import { useEffect } from 'react'

import { useSettingsStorage } from '@/src/hooks/use-settings-storage'
import { useSettingsStore } from '@/src/store/use-settings-store'
import { useUIStore } from '@/src/store/use-ui-store'

export function useAppInitialization() {
  const setAuthModalOpen = useUIStore((state) => state.setAuthModalOpen)
  const { apiKey, isApiKeyLoading } = useSettingsStorage()
  const initializeSettings = useSettingsStore((state) => state.initialize)

  useEffect(() => {
    initializeSettings()
  }, [initializeSettings])

  useEffect(() => {
    if (!isApiKeyLoading && !apiKey) {
      setAuthModalOpen(true)
    }
  }, [apiKey, isApiKeyLoading, setAuthModalOpen])
}
