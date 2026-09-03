import { useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useAppInitialization } from '@/src/hooks/use-app-initialization'
import { useDetectedUser } from '@/src/hooks/use-detected-user'
import { useLogout } from '@/src/hooks/use-logout'
import { isMainTab, useUiPreferencesStore } from '@/src/store/use-ui-preferences-store'
import { useUIStore } from '@/src/store/use-ui-store'

export const useAppLogic = () => {
  useAppInitialization()
  useDetectedUser()
  const handleLogout = useLogout()

  const { setCurrentItemId, setItemSheetOpen } = useUIStore(
    useShallow((state) => ({
      setCurrentItemId: state.setCurrentItemId,
      setItemSheetOpen: state.setItemSheetOpen,
    })),
  )

  const activeTab = useUiPreferencesStore((state) => state.activeTab)
  const setActiveTab = useUiPreferencesStore((state) => state.setActiveTab)

  const handleTabChange = useCallback(
    (value: string) => {
      if (!isMainTab(value)) {
        return
      }
      setActiveTab(value)
      // Clear selection when changing tabs to prevent sheet type mismatch
      setItemSheetOpen(false)
      setCurrentItemId(undefined)
    },
    [setActiveTab, setItemSheetOpen, setCurrentItemId],
  )

  return {
    activeTab,
    handleLogout,
    handleTabChange,
  }
}
