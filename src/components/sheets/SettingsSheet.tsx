import { Save, Settings } from 'lucide-react'

import { StatsigKeysSettings } from '@/src/components/sheets/settings/StatsigKeysSettings'
import { StorageSettings } from '@/src/components/sheets/settings/StorageSettings'
import { Button } from '@/src/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/src/components/ui/sheet'
import { useSettingsForm } from '@/src/hooks/use-settings-form'

export const SettingsSheet = () => {
  const {
    isSettingsSheetOpen,
    handleClose,
    value,
    handleValueChange,
    error,
    apiKeyValue,
    storageType,
    handleStorageTypeChange,
    handleSave,
  } = useSettingsForm()

  return (
    <Sheet open={isSettingsSheetOpen} onOpenChange={handleClose}>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col gap-0">
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <SheetTitle>Extension Settings</SheetTitle>
          </div>
          <SheetDescription>Configure how the extension interacts with Statsig.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          <StatsigKeysSettings
            value={value}
            handleValueChange={handleValueChange}
            error={error}
            apiKeyValue={apiKeyValue}
          />

          <StorageSettings
            storageType={storageType}
            handleStorageTypeChange={handleStorageTypeChange}
          />
        </div>

        <SheetFooter className="px-6 py-4 border-t bg-muted/50">
          <Button onClick={handleSave} className="w-full sm:w-auto gap-2">
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
