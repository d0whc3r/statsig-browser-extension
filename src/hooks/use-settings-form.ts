import { useCallback } from 'react'

import { useSettingsFormState } from '@/src/hooks/use-settings-form-state'
import { useSettingsStorage } from '@/src/hooks/use-settings-storage'
import { useUIStore } from '@/src/store/use-ui-store'

export const useSettingsForm = () => {
  const { isSettingsSheetOpen, setSettingsSheetOpen } = useUIStore((state) => state)
  const {
    localStorageValue,
    setLocalStorageKey,
    setStorageType,
    setTypeApiKey,
    storageType,
    typeApiKey,
  } = useSettingsStorage()

  const { error, handleValueChange, setError, value } = useSettingsFormState(localStorageValue)

  const handleSave = useCallback(() => {
    if (value === '') {
      setError(true)
      return
    }

    setLocalStorageKey(value)
    setSettingsSheetOpen(false)
    setError(false)
  }, [value, setLocalStorageKey, setSettingsSheetOpen, setError])

  const handleClose = useCallback(
    (open: boolean) => {
      if (!open) {
        setSettingsSheetOpen(false)
      }
    },
    [setSettingsSheetOpen],
  )

  const handleWriteAccessChange = useCallback(
    (checked: boolean) => {
      setTypeApiKey(checked ? 'write-key' : 'read-key')
    },
    [setTypeApiKey],
  )

  const handleStorageTypeChange = useCallback(
    (val: string) => {
      setStorageType(val as 'localStorage' | 'cookie')
    },
    [setStorageType],
  )

  return {
    error,
    handleClose,
    handleSave,
    handleStorageTypeChange,
    handleValueChange,
    handleWriteAccessChange,
    isSettingsSheetOpen,
    storageType,
    typeApiKey,
    value,
  }
}
