import { Save, Settings } from 'lucide-react'
import React from 'react'

import { AppearanceSettings } from '@/src/components/sheets/settings/AppearanceSettings'
import { StatsigKeysSettings } from '@/src/components/sheets/settings/StatsigKeysSettings'
import { StorageSettings } from '@/src/components/sheets/settings/StorageSettings'
import { Button } from '@/src/components/ui/button'
import { Form } from '@/src/components/ui/form'
import { Separator } from '@/src/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/src/components/ui/sheet'
import { useSettingsForm } from '@/src/hooks/use-settings-form'

export const SettingsSheet = () => {
  const { form, handleClose, handleSave, isSettingsSheetOpen } = useSettingsForm()

  return (
    <Sheet open={isSettingsSheetOpen} onOpenChange={handleClose}>
      <SheetContent className="flex w-[400px] flex-col gap-0 sm:w-[540px]">
        <Form {...form}>
          <form onSubmit={handleSave} className="flex h-full flex-col">
            <SheetHeader className="shrink-0 border-b px-6 py-4">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <SheetTitle>Extension Settings</SheetTitle>
              </div>
              <SheetDescription>Configure how the extension interacts with Statsig.</SheetDescription>
            </SheetHeader>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              <AppearanceSettings />

              <Separator />

              <StatsigKeysSettings control={form.control} />

              <Separator />

              <StorageSettings control={form.control} />
            </div>

            <SheetFooter className="border-t bg-muted/50 px-6 py-4">
              <Button type="submit" className="w-full gap-2 sm:w-auto">
                <Save className="h-4 w-4" />
                Save Settings
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
