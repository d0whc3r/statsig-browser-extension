import { memo, useCallback, useState } from 'react'

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

export interface AddOverrideParams {
  userId: string
  groupId: string
  environment?: string | null
  idType?: string | null
}

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
  onAddOverride: (params: AddOverrideParams) => void
  experiment?: Experiment
}

const EMPTY_OVERRIDES: {
  environment: string | null
  groupID: string
}[] = []

const ExperimentOverrideControls = memo(
  ({
    currentEnvValue,
    detectedUserId,
    selectedGroupId,
    setSelectedGroupId,
    onAddOverride,
    idType,
    isPending,
    isCurrentEnvOverridden,
    groups,
  }: {
    currentEnvValue: string | null
    detectedUserId: string
    selectedGroupId: string
    setSelectedGroupId: (value: string) => void
    onAddOverride: (params: AddOverrideParams) => void
    idType: string
    isPending: boolean
    isCurrentEnvOverridden: boolean
    groups: Group[]
  }) => {
    const handleOverride = useCallback(() => {
      if (detectedUserId && selectedGroupId) {
        onAddOverride({
          environment: currentEnvValue,
          groupId: selectedGroupId,
          idType,
          userId: detectedUserId,
        })
      }
    }, [detectedUserId, selectedGroupId, currentEnvValue, idType, onAddOverride])

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
  },
)

ExperimentOverrideControls.displayName = 'ExperimentOverrideControls'

export const PageContextCard = memo(
  ({
    detectedUser,
    detectedUserId,
    isDetectedUserOverridden,
    detectedUserOverrides = EMPTY_OVERRIDES,
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

          return (
            <ExperimentOverrideControls
              currentEnvValue={currentEnvValue}
              detectedUserId={detectedUserId}
              selectedGroupId={selectedGroupId}
              setSelectedGroupId={setSelectedGroupId}
              onAddOverride={onAddOverride}
              idType={idType}
              isPending={isPending}
              isCurrentEnvOverridden={isCurrentEnvOverridden}
              groups={groups}
            />
          )
        }}
      </BaseOverrideContextCard>
    )
  },
)

PageContextCard.displayName = 'PageContextCard'
