import { memo, useState } from 'react'

import type { Experiment, Group } from '@/src/types/statsig'

import { BaseOverrideContextCard } from '@/src/components/common/BaseOverrideContextCard'
import { Button } from '@/src/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'

interface ExperimentPageContextCardProps {
  detectedUser: Record<string, unknown> | undefined
  detectedUserId: string
  detectedUserOverrides?: {
    environment: string | null
    groupID: string
  }[]
  isDetectedUserOverridden: boolean
  canEdit: boolean
  isPending: boolean
  groups: Group[]
  onAddOverride: (
    userId: string,
    groupId: string,
    environment?: string | null,
    idType?: string | null,
  ) => void
  experiment?: Experiment
}

export const PageContextCard = memo(
  ({
    detectedUser,
    detectedUserId,
    isDetectedUserOverridden,
    detectedUserOverrides = [],
    canEdit,
    isPending,
    groups,
    onAddOverride,
    experiment,
  }: ExperimentPageContextCardProps) => {
    const [selectedGroupId, setSelectedGroupId] = useState('')

    const idType = experiment?.idType || 'userID'

    return (
      <BaseOverrideContextCard
        detectedUser={detectedUser}
        detectedUserId={detectedUserId}
        isDetectedUserOverridden={isDetectedUserOverridden}
        detectedUserOverrides={detectedUserOverrides}
        canEdit={canEdit}
        idType={idType}
      >
        {(currentEnvValue) => {
          const isCurrentEnvOverridden = detectedUserOverrides.some(
            (override) => override.environment === currentEnvValue,
          )

          const handleOverride = () => {
            if (detectedUserId && selectedGroupId) {
              onAddOverride(detectedUserId, selectedGroupId, currentEnvValue, idType)
            }
          }

          return (
            <div className="flex items-center gap-2">
              <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                <SelectTrigger
                  className="h-8 w-full bg-background"
                  aria-label="Select group for detected user"
                >
                  <SelectValue placeholder="Select group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.name} value={group.name}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="outline"
                className="h-8 border-primary/20 text-xs hover:bg-primary/10 hover:text-primary"
                onClick={handleOverride}
                disabled={isPending || !selectedGroupId || isCurrentEnvOverridden}
              >
                {isCurrentEnvOverridden ? 'Overridden' : 'Override'}
              </Button>
            </div>
          )
        }}
      </BaseOverrideContextCard>
    )
  },
)

PageContextCard.displayName = 'PageContextCard'
