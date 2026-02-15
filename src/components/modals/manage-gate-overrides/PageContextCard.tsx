import { memo } from 'react'

import type { FeatureGate } from '@/src/types/statsig'

import { BaseOverrideContextCard } from '@/src/components/common/BaseOverrideContextCard'
import { Button } from '@/src/components/ui/button'

import type { OverrideType } from './types'

interface PageContextCardProps {
  detectedUser: Record<string, unknown> | undefined
  detectedUserId: string
  detectedUserOverrides?: {
    environment: string | null
    type: 'pass' | 'fail'
  }[]
  isDetectedUserOverridden: boolean
  canEdit: boolean
  isPending: boolean
  onAddOverride: (
    userId: string,
    type: OverrideType,
    environment?: string | null,
    idType?: string | null,
  ) => void
  featureGate?: FeatureGate
}

export const PageContextCard = memo(
  ({
    detectedUser,
    detectedUserId,
    isDetectedUserOverridden,
    detectedUserOverrides = [],
    canEdit,
    isPending,
    onAddOverride,
    featureGate,
  }: PageContextCardProps) => {
    const idType = featureGate?.idType || 'userID'

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
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 flex-1 border-primary/20 text-xs hover:bg-primary/10 hover:text-primary"
                onClick={() => onAddOverride(detectedUserId, 'pass', currentEnvValue, idType)}
                disabled={isPending || isCurrentEnvOverridden}
              >
                PASS
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 flex-1 border-destructive/20 text-xs hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onAddOverride(detectedUserId, 'fail', currentEnvValue, idType)}
                disabled={isPending || isCurrentEnvOverridden}
              >
                FAIL
              </Button>
            </div>
          )
        }}
      </BaseOverrideContextCard>
    )
  },
)

PageContextCard.displayName = 'PageContextCard'
