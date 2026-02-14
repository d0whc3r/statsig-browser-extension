import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import { useSettingsFormState } from '@/src/hooks/use-settings-form-state'
import { useSettingsStorage } from '@/src/hooks/use-settings-storage'
import { useUIStore } from '@/src/store/use-ui-store'

export const useSettingsForm = () => {
  const queryClient = useQueryClient()
  const { isSettingsSheetOpen, setSettingsSheetOpen } = useUIStore((state) => state)
  const {
    apiKey,
    localStorageValue,
    setApiKey,
    setLocalStorageKey,
    setStorageType,
    setTypeApiKey,
    storageType,
    typeApiKey,
  } = useSettingsStorage()

  const { apiKeyValue, error, handleApiKeyChange, handleValueChange, setError, value } =
    useSettingsFormState(apiKey, localStorageValue)

  const handleSave = useCallback(() => {
    if (value === '') {
      setError(true)
      return
    }

    setLocalStorageKey(value)
    if (apiKeyValue !== apiKey) {
      setApiKey(apiKeyValue)
      queryClient.invalidateQueries()
    }
    setSettingsSheetOpen(false)
    setError(false)
  }, [
    value,
    setLocalStorageKey,
    apiKeyValue,
    apiKey,
    setApiKey,
    queryClient,
    setSettingsSheetOpen,
    setError,
  ])

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
    apiKeyValue,
    error,
    handleApiKeyChange,
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
