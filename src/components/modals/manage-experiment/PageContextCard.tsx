import { memo, useCallback, useState } from 'react'

import type { Group } from '@/src/types/statsig'

import { SharedPageContextCard } from '@/src/components/common/SharedPageContextCard'
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
  isDetectedUserOverridden: boolean
  canEdit: boolean
  isPending: boolean
  groups: Group[]
  onAddOverride: (userId: string, groupId: string) => void
}

export const PageContextCard = memo(
  ({
    detectedUser,
    detectedUserId,
    isDetectedUserOverridden,
    canEdit,
    isPending,
    groups,
    onAddOverride,
  }: ExperimentPageContextCardProps) => {
    const [selectedGroupId, setSelectedGroupId] = useState('')

    const handleOverride = useCallback(() => {
      if (detectedUserId && selectedGroupId) {
        onAddOverride(detectedUserId, selectedGroupId)
      }
    }, [detectedUserId, selectedGroupId, onAddOverride])

    return (
      <SharedPageContextCard
        detectedUser={detectedUser}
        detectedUserId={detectedUserId}
        isDetectedUserOverridden={isDetectedUserOverridden}
      >
        {canEdit && detectedUserId && detectedUserId !== 'Unknown ID' && (
          <div className="mt-3 flex items-center gap-2">
            <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
              <SelectTrigger
                className="h-8 w-[140px] bg-background"
                aria-label="Select group for detected user"
              >
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
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
              disabled={isPending || !selectedGroupId}
            >
              Override
            </Button>
          </div>
        )}
      </SharedPageContextCard>
    )
  },
)

PageContextCard.displayName = 'PageContextCard'
