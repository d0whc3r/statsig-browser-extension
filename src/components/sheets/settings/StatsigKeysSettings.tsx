import type { Control, ControllerRenderProps } from 'react-hook-form'

import { Key } from 'lucide-react'
import React, { useCallback } from 'react'

import type { SettingsFormValues } from '@/src/hooks/use-settings-form'

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/src/components/ui/form'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'

interface StatsigKeysSettingsProps {
  control: Control<SettingsFormValues>
}

export const StatsigKeysSettings = ({ control }: StatsigKeysSettingsProps) => {
  const renderLocalStorageKeyField = useCallback(
    ({ field }: { field: ControllerRenderProps<SettingsFormValues, 'localStorageKey'> }) => (
      <FormItem className="w-full space-y-0 sm:w-[200px]">
        <FormLabel className="sr-only">Local Storage Key</FormLabel>
        <FormControl>
          <Input placeholder="e.g. statsig_user" className="w-full" {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    ),
    [],
  )

  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        <Key className="h-3.5 w-3.5" />
        Statsig Keys
      </h3>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="space-y-0.5">
          <Label className="text-sm font-medium">Local Storage Key</Label>
          <p className="text-xs text-muted-foreground">
            Identifier for the user object (default: <code>statsig_user</code>).
          </p>
        </div>
        <FormField control={control} name="localStorageKey" render={renderLocalStorageKeyField} />
      </div>
    </div>
  )
}
