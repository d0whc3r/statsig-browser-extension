import type { Control, ControllerRenderProps } from 'react-hook-form'

import { Key } from 'lucide-react'
import React, { useCallback } from 'react'

import type { SettingsFormValues } from '@/src/hooks/use-settings-form'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/src/components/ui/form'
import { Input } from '@/src/components/ui/input'

interface StatsigKeysSettingsProps {
  control: Control<SettingsFormValues>
}

export const StatsigKeysSettings = ({ control }: StatsigKeysSettingsProps) => {
  const renderLocalStorageKeyField = useCallback(
    ({ field }: { field: ControllerRenderProps<SettingsFormValues, 'localStorageKey'> }) => (
      <FormItem>
        <FormLabel className="sr-only">Local Storage Key</FormLabel>
        <FormControl>
          <Input placeholder="e.g. statsig_user" {...field} />
        </FormControl>
        <FormMessage />
        <p className="text-xs text-muted-foreground mt-2">
          Default: <code>statsig_user</code>
        </p>
      </FormItem>
    ),
    [],
  )

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
        <Key className="h-4 w-4" />
        Statsig Keys
      </h3>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Local Storage Key</CardTitle>
          <CardDescription>
            The key used to identify the Statsig user object in local storage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <FormField control={control} name="localStorageKey" render={renderLocalStorageKeyField} />
        </CardContent>
      </Card>
    </div>
  )
}
