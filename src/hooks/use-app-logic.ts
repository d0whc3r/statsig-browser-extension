import { useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useAppInitialization } from '@/src/hooks/use-app-initialization'
import { useLogout } from '@/src/hooks/use-logout'
import { usePageDetection } from '@/src/hooks/use-page-detection'
import { usePageProject } from '@/src/hooks/use-page-project'
import { isMainTab, useUiPreferencesStore } from '@/src/store/use-ui-preferences-store'
import { useUIStore } from '@/src/store/use-ui-store'

export const useAppLogic = () => {
  useAppInitialization()
  usePageDetection()
  const { status: pageProjectStatus } = usePageProject()
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
    // Project data is only fetched once the page is known to belong to a configured project.
    isPageMatched: pageProjectStatus === 'matched',
  }
}
