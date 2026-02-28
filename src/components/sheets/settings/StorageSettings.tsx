import type { Control, ControllerRenderProps } from 'react-hook-form'

import { Cookie, Database, HardDrive } from 'lucide-react'
import React, { useCallback } from 'react'

import type { SettingsFormValues } from '@/src/hooks/use-settings-form'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { FormControl, FormField, FormItem, FormMessage } from '@/src/components/ui/form'
import { Label } from '@/src/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/src/components/ui/radio-group'

interface StorageSettingsProps {
  control: Control<SettingsFormValues>
}

export const StorageSettings = ({ control }: StorageSettingsProps) => {
  const renderStorageTypeField = useCallback(
    ({ field }: { field: ControllerRenderProps<SettingsFormValues, 'storageType'> }) => (
      <FormItem className="space-y-0">
        <FormControl>
          <RadioGroup
            onValueChange={(val) => field.onChange(val)}
            defaultValue={field.value}
            className="grid grid-cols-2 gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="localStorage" id="localStorage" className="peer sr-only" />
              <Label
                htmlFor="localStorage"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary w-full cursor-pointer transition-all"
              >
                <HardDrive className="mb-2 h-6 w-6 text-muted-foreground" />
                Local Storage
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cookie" id="cookie" className="peer sr-only" />
              <Label
                htmlFor="cookie"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary w-full cursor-pointer transition-all"
              >
                <Cookie className="mb-2 h-6 w-6 text-muted-foreground" />
                Cookies
              </Label>
            </div>
          </RadioGroup>
        </FormControl>
        <FormMessage />
      </FormItem>
    ),
    [],
  )

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
        <Database className="h-4 w-4" />
        Data Storage
      </h3>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Storage Method</CardTitle>
          <CardDescription>Where should the extension store its data?</CardDescription>
        </CardHeader>
        <CardContent>
          <FormField control={control} name="storageType" render={renderStorageTypeField} />
        </CardContent>
      </Card>
    </div>
  )
}
