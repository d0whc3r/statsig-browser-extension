import { useCallback, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useAppInitialization } from '@/src/hooks/use-app-initialization'
import { useDetectedUser } from '@/src/hooks/use-detected-user'
import { useLogout } from '@/src/hooks/use-logout'
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

  const [activeTab, setActiveTab] = useState('experiments')

  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value)
      // Clear selection when changing tabs to prevent sheet type mismatch
      setItemSheetOpen(false)
      setCurrentItemId(undefined)
    },
    [setItemSheetOpen, setCurrentItemId],
  )

  return {
    activeTab,
    handleLogout,
    handleTabChange,
  }
}
