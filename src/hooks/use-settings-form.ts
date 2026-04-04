import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useSettingsStorage } from '@/src/hooks/use-settings-storage'
import { useUIStore } from '@/src/store/use-ui-store'

const settingsSchema = z.object({
  localStorageKey: z.string().min(1, 'This field is required.'),
  storageType: z.enum(['localStorage', 'cookie']),
})

export type SettingsFormValues = z.infer<typeof settingsSchema>

export const useSettingsForm = () => {
  const { isSettingsSheetOpen, setSettingsSheetOpen } = useUIStore((state) => state)
  const { localStorageValue, setLocalStorageKey, setStorageType, storageType } = useSettingsStorage()

  const form = useForm<SettingsFormValues>({
    defaultValues: {
      localStorageKey: localStorageValue || 'statsig_user',
      storageType: storageType || 'localStorage',
    },
    resolver: zodResolver(settingsSchema),
  })

  // Update form values when storage values change or when sheet opens
  useEffect(() => {
    if (isSettingsSheetOpen) {
      form.reset({
        localStorageKey: localStorageValue || 'statsig_user',
        storageType: storageType || 'localStorage',
      })
    }
  }, [isSettingsSheetOpen, localStorageValue, storageType, form])

  const handleSave = useCallback(
    (event: React.ComponentProps<'form'>['onSubmit'] extends (event: infer T) => unknown ? T : never) => {
      void form.handleSubmit((values: SettingsFormValues) => {
        setLocalStorageKey(values.localStorageKey)
        setStorageType(values.storageType)
        setSettingsSheetOpen(false)
      })(event)
    },
    [form, setLocalStorageKey, setSettingsSheetOpen, setStorageType],
  )

  const handleClose = useCallback(
    (open: boolean) => {
      if (!open) {
        setSettingsSheetOpen(false)
      }
    },
    [setSettingsSheetOpen],
  )

  return {
    form,
    handleClose,
    handleSave,
    isSettingsSheetOpen,
  }
}
