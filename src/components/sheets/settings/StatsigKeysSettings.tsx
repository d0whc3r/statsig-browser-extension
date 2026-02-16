import { Key } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'

interface StatsigKeysSettingsProps {
  value: string
  handleValueChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  error: boolean
}

export const StatsigKeysSettings = ({
  value,
  handleValueChange,
  error,
}: StatsigKeysSettingsProps) => (
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
        <Label htmlFor="localStorageKey" className="sr-only">
          Local Storage Key
        </Label>
        <Input
          id="localStorageKey"
          placeholder="e.g. statsig_user"
          value={value}
          onChange={handleValueChange}
          className={error ? 'border-red-500' : ''}
        />
        {error && <p className="text-sm text-red-500">This field is required.</p>}
        <p className="text-xs text-muted-foreground">
          Default: <code>statsig_user</code>
        </p>
      </CardContent>
    </Card>
  </div>
)
