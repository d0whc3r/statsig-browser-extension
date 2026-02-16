import { memo, useCallback } from 'react'

import type { FeatureGate } from '@/src/types/statsig'

import { BaseOverrideContextCard } from '@/src/components/common/BaseOverrideContextCard'
import { Button } from '@/src/components/ui/button'

import type { AddGateOverrideParams } from './types'

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
  onAddOverride: (params: AddGateOverrideParams) => void
  featureGate?: FeatureGate
}

const EMPTY_OVERRIDES: {
  environment: string | null
  type: 'pass' | 'fail'
}[] = []

const GateOverrideControls = memo(
  ({
    currentEnvValue,
    detectedUserId,
    onAddOverride,
    idType,
    isPending,
    isCurrentEnvOverridden,
  }: {
    currentEnvValue: string | null
    detectedUserId: string
    onAddOverride: (params: AddGateOverrideParams) => void
    idType: string
    isPending: boolean
    isCurrentEnvOverridden: boolean
  }) => {
    const handlePass = useCallback(() => {
      onAddOverride({ environment: currentEnvValue, idType, type: 'pass', userId: detectedUserId })
    }, [detectedUserId, currentEnvValue, idType, onAddOverride])

    const handleFail = useCallback(() => {
      onAddOverride({ environment: currentEnvValue, idType, type: 'fail', userId: detectedUserId })
    }, [detectedUserId, currentEnvValue, idType, onAddOverride])

    return (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-8 flex-1 border-primary/20 text-xs hover:bg-primary/10 hover:text-primary"
          onClick={handlePass}
          disabled={isPending || isCurrentEnvOverridden}
        >
          PASS
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 flex-1 border-destructive/20 text-xs hover:bg-destructive/10 hover:text-destructive"
          onClick={handleFail}
          disabled={isPending || isCurrentEnvOverridden}
        >
          FAIL
        </Button>
      </div>
    )
  },
)

GateOverrideControls.displayName = 'GateOverrideControls'

export const PageContextCard = memo(
  ({
    detectedUser,
    detectedUserId,
    isDetectedUserOverridden,
    detectedUserOverrides = EMPTY_OVERRIDES,
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
            <GateOverrideControls
              currentEnvValue={currentEnvValue}
              detectedUserId={detectedUserId}
              onAddOverride={onAddOverride}
              idType={idType}
              isPending={isPending}
              isCurrentEnvOverridden={isCurrentEnvOverridden}
            />
          )
        }}
      </BaseOverrideContextCard>
    )
  },
)

PageContextCard.displayName = 'PageContextCard'
