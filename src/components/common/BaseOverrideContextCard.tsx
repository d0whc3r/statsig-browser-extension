import { CheckCircle2 } from 'lucide-react'
import { memo, useMemo, useState } from 'react'

import { SharedPageContextCard } from '@/src/components/common/SharedPageContextCard'
import { Badge } from '@/src/components/ui/badge'
import { Label } from '@/src/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'

export interface BaseOverrideContextCardProps {
  detectedUser: Record<string, unknown> | undefined
  detectedUserId: string
  isDetectedUserOverridden: boolean
  detectedUserOverrides?: {
    environment: string | null
  }[]
  canEdit: boolean
  idType?: string
  children: (selectedEnvironment: string | null) => React.ReactNode
}

const ALL_ENVIRONMENTS = 'All Environments'
const DEFAULT_ENVIRONMENTS = ['development', 'staging', 'production']

export const BaseOverrideContextCard = memo(
  ({
    detectedUser,
    detectedUserId,
    isDetectedUserOverridden,
    detectedUserOverrides = [],
    canEdit,
    idType = 'userID',
    children,
  }: BaseOverrideContextCardProps) => {
    // Extract the user's current environment tier
    const currentTier = // oxlint-disable-next-line typescript/no-unsafe-type-assertion
      (detectedUser?.statsigEnvironment as { tier?: string } | undefined)?.tier?.toLowerCase()

    // Create a dynamic list of environments that includes the current one if it's custom
    const availableEnvironments = useMemo(() => {
      const envs = [...DEFAULT_ENVIRONMENTS]
      if (currentTier && !envs.includes(currentTier)) {
        envs.push(currentTier)
      }
      return envs
    }, [currentTier])

    // Determine the default environment to select
    const initialEnv = useMemo(() => {
      // 1. If we detected an environment, try to pre-select it if it's not already overridden
      if (currentTier) {
        const isCurrentTierOverridden = detectedUserOverrides.some(
          (override) => override.environment === currentTier,
        )
        if (!isCurrentTierOverridden) {
          return currentTier
        }
      }

      // 2. Otherwise, fallback to All Environments if not overridden
      if (!detectedUserOverrides.some((override) => override.environment === null)) {
        return ALL_ENVIRONMENTS
      }

      // 3. Fallback to the first available environment that isn't overridden
      for (const env of availableEnvironments) {
        if (!detectedUserOverrides.some((override) => override.environment === env)) {
          return env
        }
      }

      return ALL_ENVIRONMENTS // Fallback even if overridden
    }, [detectedUserOverrides, currentTier, availableEnvironments])

    const [environment, setEnvironment] = useState(initialEnv)

    // Sync if initialEnv changes (e.g. user details loaded later)
    useMemo(() => {
      setEnvironment(initialEnv)
    }, [initialEnv])

    const currentEnvValue = environment === ALL_ENVIRONMENTS ? null : environment

    return (
      <SharedPageContextCard detectedUser={detectedUser} detectedUserId={detectedUserId}>
        <div className="space-y-5 mt-1">
          {idType !== 'userID' && (
            <div className="text-[11px] text-muted-foreground">
              Using ID Type: <span className="font-medium text-foreground">{idType}</span>
            </div>
          )}

          {isDetectedUserOverridden && (
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Active Overrides
              </span>
              <div className="flex flex-wrap gap-1.5">
                {detectedUserOverrides.map((override) => (
                  <Badge
                    key={override.environment ?? 'global'}
                    variant="secondary"
                    className="h-5 px-1.5 text-[10px] bg-green-500/10 text-green-600 border-green-500/20"
                  >
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    {override.environment ?? 'Global'}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {canEdit && detectedUserId && detectedUserId !== 'Unknown ID' && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex flex-col gap-2">
                <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Environment
                </Label>
                <Select value={environment} onValueChange={setEnvironment}>
                  <SelectTrigger className="h-8 text-xs w-full bg-background">
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value={ALL_ENVIRONMENTS}
                      disabled={detectedUserOverrides.some(
                        (override) => override.environment === null,
                      )}
                    >
                      All Environments{' '}
                      {detectedUserOverrides.some((override) => override.environment === null) &&
                        '(Already Set)'}
                    </SelectItem>
                    {availableEnvironments.map((env) => {
                      const isOverridden = detectedUserOverrides.some(
                        (override) => override.environment === env,
                      )
                      return (
                        <SelectItem key={env} value={env} disabled={isOverridden}>
                          {env} {env === currentTier && '(Current)'}{' '}
                          {isOverridden && '(Already Set)'}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {children(currentEnvValue)}
            </div>
          )}
        </div>
      </SharedPageContextCard>
    )
  },
)

BaseOverrideContextCard.displayName = 'BaseOverrideContextCard'
