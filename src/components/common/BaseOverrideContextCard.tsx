import { memo, useState } from 'react'

import { SharedPageContextCard } from '@/src/components/common/SharedPageContextCard'
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
    const [environment, setEnvironment] = useState<string>('All Environments')
    const currentEnvValue = environment === 'All Environments' ? null : environment

    return (
      <SharedPageContextCard
        detectedUser={detectedUser}
        detectedUserId={detectedUserId}
        isDetectedUserOverridden={isDetectedUserOverridden}
      >
        {idType !== 'userID' && (
          <div className="text-xs text-muted-foreground pt-1">
            Using ID Type: <span className="font-medium text-foreground">{idType}</span>
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
                    value="All Environments"
                    disabled={detectedUserOverrides.some(
                      (override) => override.environment === null,
                    )}
                  >
                    All Environments{' '}
                    {detectedUserOverrides.some((override) => override.environment === null) &&
                      '(Overridden)'}
                  </SelectItem>
                  {ENVIRONMENTS.map((env) => {
                    const isOverridden = detectedUserOverrides.some(
                      (override) => override.environment === env,
                    )
                    return (
                      <SelectItem key={env} value={env} disabled={isOverridden}>
                        {env} {isOverridden && '(Overridden)'}
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
