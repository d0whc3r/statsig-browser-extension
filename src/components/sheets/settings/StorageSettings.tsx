import type { Control, ControllerRenderProps } from 'react-hook-form'

import { Database } from 'lucide-react'
import React, { useCallback } from 'react'

import type { SettingsFormValues } from '@/src/hooks/use-settings-form'

import { FormControl, FormField, FormItem, FormMessage } from '@/src/components/ui/form'
import { Label } from '@/src/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select'

interface StorageSettingsProps {
  control: Control<SettingsFormValues>
}

export const StorageSettings = ({ control }: StorageSettingsProps) => {
  const renderStorageTypeField = useCallback(
    ({ field }: { field: ControllerRenderProps<SettingsFormValues, 'storageType'> }) => {
      const handleStorageChange = field.onChange
      return (
        <FormItem className="w-full space-y-0 sm:w-[150px]">
          <FormControl>
            <Select value={field.value} onValueChange={handleStorageChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select storage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="localStorage">Local Storage</SelectItem>
                <SelectItem value="cookie">Cookies</SelectItem>
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )
    },
    [],
  )

  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        <Database className="h-3.5 w-3.5" />
        Data Storage
      </h3>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-sm font-medium">Storage Method</Label>
          <p className="text-xs text-muted-foreground">Where to store extension data.</p>
        </div>
        <FormField control={control} name="storageType" render={renderStorageTypeField} />
      </div>
    </div>
  )
}
