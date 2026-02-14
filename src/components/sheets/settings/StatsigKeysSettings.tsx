import { CheckCircle2, Key, ShieldAlert } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Switch } from '@/src/components/ui/switch'

interface StatsigKeysSettingsProps {
  value: string
  handleValueChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  error: boolean
  apiKeyValue: string
}

export const StatsigKeysSettings = ({
  value,
  handleValueChange,
  error,
  apiKeyValue,
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
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-base">Console API Key</CardTitle>
            <CardDescription>
              {apiKeyValue ? (
                <span className="text-green-600 dark:text-green-500 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  API Key is configured and ready to use.
                </span>
              ) : (
                'Required to fetch experiment and gate details from the Statsig Console. If you have already logged in, please check if your key is saved correctly.'
              )}
            </CardDescription>
          </div>
          {apiKeyValue && (
            <div className="shrink-0">
              <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20">
                Active
              </span>
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  </div>
)
