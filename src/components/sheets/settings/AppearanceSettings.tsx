import { Monitor } from 'lucide-react'
import React, { useCallback } from 'react'

import { Label } from '@/src/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select'
import { useTheme } from '@/src/hooks/use-theme'

export const AppearanceSettings = () => {
  const { theme, setTheme } = useTheme()

  const handleThemeChange = useCallback(
    (value: string) => {
      if (value === 'light' || value === 'dark' || value === 'system') {
        setTheme(value)
      }
    },
    [setTheme],
  )

  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        <Monitor className="h-3.5 w-3.5" />
        Appearance
      </h3>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-sm font-medium">Theme</Label>
          <p className="text-xs text-muted-foreground">Select your preferred theme.</p>
        </div>
        <Select value={theme === 'system' ? undefined : theme} onValueChange={handleThemeChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
