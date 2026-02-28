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
const ENVIRONMENTS = ['development', 'staging', 'production']

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
    // Determine the default environment to select (first one not overridden)
    const initialEnv = useMemo(() => {
      if (!detectedUserOverrides.some((override) => override.environment === null)) {
        return ALL_ENVIRONMENTS
      }
      for (const env of ENVIRONMENTS) {
        if (!detectedUserOverrides.some((override) => override.environment === env)) {
          return env
        }
      }
      return ALL_ENVIRONMENTS // Fallback to the first one even if overridden
    }, [detectedUserOverrides])

    const [environment, setEnvironment] = useState<string>(initialEnv)
    const currentEnvValue = environment === ALL_ENVIRONMENTS ? null : environment

    return (
      <SharedPageContextCard detectedUser={detectedUser} detectedUserId={detectedUserId}>
        {idType !== 'userID' && (
          <div className="text-xs text-muted-foreground pt-1">
            Using ID Type: <span className="font-medium text-foreground">{idType}</span>
          </div>
        )}

        {isDetectedUserOverridden && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="text-[10px] text-muted-foreground w-full mb-0.5">
              Active overrides for this user:
            </span>
            {detectedUserOverrides.map((override) => (
              <Badge
                key={override.environment || 'global'}
                variant="secondary"
                className="h-5 px-1.5 text-[10px] bg-green-500/10 text-green-600 border-green-500/20"
              >
                <CheckCircle2 className="mr-1 h-3 w-3" />
                {override.environment || 'Global'}
              </Badge>
            ))}
          </div>
        )}

        {canEdit && detectedUserId && detectedUserId !== 'Unknown ID' && (
          <div className="mt-3 space-y-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Override Environment</Label>
              <Select value={environment} onValueChange={setEnvironment}>
                <SelectTrigger className="h-8 text-xs w-full">
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
                  {ENVIRONMENTS.map((env) => {
                    const isOverridden = detectedUserOverrides.some(
                      (override) => override.environment === env,
                    )
                    return (
                      <SelectItem key={env} value={env} disabled={isOverridden}>
                        {env} {isOverridden && '(Already Set)'}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {children(currentEnvValue)}
          </div>
        )}
      </SharedPageContextCard>
    )
  },
)

BaseOverrideContextCard.displayName = 'BaseOverrideContextCard'
