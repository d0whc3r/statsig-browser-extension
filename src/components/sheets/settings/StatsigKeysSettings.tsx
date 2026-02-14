import { Key, ShieldAlert } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Switch } from '@/src/components/ui/switch'

interface StatsigKeysSettingsProps {
  value: string
  handleValueChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  error: boolean
  apiKeyValue: string
  handleApiKeyChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  typeApiKey: string
  handleWriteAccessChange: (checked: boolean) => void
}

export const StatsigKeysSettings = ({
  value,
  handleValueChange,
  error,
  apiKeyValue,
  handleApiKeyChange,
  typeApiKey,
  handleWriteAccessChange,
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

    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Console API Key</CardTitle>
        <CardDescription>
          Required to fetch experiment and gate details from the Statsig Console.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="apiKey" className="sr-only">
            Console API Key
          </Label>
          <Input
            id="apiKey"
            type="password"
            placeholder="statsig-..."
            value={apiKeyValue}
            onChange={handleApiKeyChange}
          />
          <p className="text-xs text-muted-foreground">
            You can find this in your Project Settings on the Statsig Console.
          </p>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm bg-muted/30">
          <div className="space-y-0.5">
            <Label className="text-base flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-orange-500" />
              Enable Write Access
            </Label>
            <div className="text-sm text-muted-foreground pr-4">
              Allows creating and deleting overrides. Requires a Write-Access API Key.
            </div>
          </div>
          <Switch checked={typeApiKey === 'write-key'} onCheckedChange={handleWriteAccessChange} />
        </div>
      </CardContent>
    </Card>
  </div>
)
