import { memo, useCallback } from 'react'

import { SharedPageContextCard } from '@/src/components/common/SharedPageContextCard'
import { Button } from '@/src/components/ui/button'

import type { OverrideType } from './types'

interface PageContextCardProps {
  detectedUser: Record<string, unknown> | undefined
  detectedUserId: string
  isDetectedUserOverridden: boolean
  canEdit: boolean
  isPending: boolean
  onAddOverride: (userId: string, type: OverrideType) => void
}

export const PageContextCard = memo(
  ({
    detectedUser,
    detectedUserId,
    isDetectedUserOverridden,
    canEdit,
    isPending,
    onAddOverride,
  }: PageContextCardProps) => {
    const handleOverridePass = useCallback(
      () => onAddOverride(detectedUserId, 'pass'),
      [detectedUserId, onAddOverride],
    )

    const handleOverrideFail = useCallback(
      () => onAddOverride(detectedUserId, 'fail'),
      [detectedUserId, onAddOverride],
    )

    return (
      <SharedPageContextCard
        detectedUser={detectedUser}
        detectedUserId={detectedUserId}
        isDetectedUserOverridden={isDetectedUserOverridden}
      >
        {canEdit && detectedUserId && detectedUserId !== 'Unknown ID' && (
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-green-200 text-xs hover:bg-green-50 hover:text-green-700 dark:border-green-900 dark:hover:bg-green-900/20"
              onClick={handleOverridePass}
              disabled={isPending}
            >
              Override PASS
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-red-200 text-xs hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:hover:bg-red-900/20"
              onClick={handleOverrideFail}
              disabled={isPending}
            >
              Override FAIL
            </Button>
          </div>
        )}
      </SharedPageContextCard>
    )
  },
)

PageContextCard.displayName = 'PageContextCard'
