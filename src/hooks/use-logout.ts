import { useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useSettingsStorage } from '@/src/hooks/use-settings-storage'
import { queryClient } from '@/src/lib/query-client'
import { useContextStore } from '@/src/store/use-context-store'
import { useUIStore } from '@/src/store/use-ui-store'

export const useLogout = () => {
  const { reset: resetUIStore, setAuthModalOpen } = useUIStore(
    useShallow((state) => ({
      reset: state.reset,
      setAuthModalOpen: state.setAuthModalOpen,
    })),
  )
  const resetContextStore = useContextStore((state) => state.reset)
  const { reset: resetSettings } = useSettingsStorage()

  return useCallback(async () => {
    // 1. Reset Settings (clears API Key)
    await resetSettings()

    // 2. Clear Query Cache (removes all fetched data)
    queryClient.clear()

    // 3. Reset UI State (closes modals, sheets, etc.)
    resetUIStore()

    // 4. Reset Context State (clears detected user, etc.)
    resetContextStore()

    // 5. Open Auth Modal
    setAuthModalOpen(true)
  }, [resetSettings, resetUIStore, resetContextStore, setAuthModalOpen])
}
