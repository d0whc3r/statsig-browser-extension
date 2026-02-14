import { Cookie, Database, HardDrive } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Label } from '@/src/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/src/components/ui/radio-group'

interface StorageSettingsProps {
  storageType: string
  handleStorageTypeChange: (value: string) => void
}

export const StorageSettings = ({ storageType, handleStorageTypeChange }: StorageSettingsProps) => (
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
        <RadioGroup
          value={storageType}
          onValueChange={handleStorageTypeChange}
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
      </CardContent>
    </Card>
  </div>
)
