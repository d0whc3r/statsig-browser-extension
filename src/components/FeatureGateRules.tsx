import type { VariantProps } from 'class-variance-authority'

import React, { memo } from 'react'

import type { badgeVariants } from '@/src/components/ui/badge'

import { RuleCard } from '@/src/components/RuleCard'
import { GeneralEmptyState } from '@/src/components/ui/general-empty-state'
import { useFeatureGateRules } from '@/src/hooks/use-feature-gate-rules'

interface Props {
  featureGateId: string
}

const MAX_PERCENTAGE = 100
const MIN_PERCENTAGE = 0

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

const getBadgeVariant = (percentage: number): BadgeVariant => {
  if (percentage === MIN_PERCENTAGE) {
    return 'destructive'
  }
  if (percentage === MAX_PERCENTAGE) {
    return 'default'
  }
  return 'secondary'
}

export const FeatureGateRules = memo(({ featureGateId }: Props) => {
  const { data: rules, isLoading, error } = useFeatureGateRules(featureGateId)

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return <div className="py-4 text-center text-sm text-destructive">Failed to load rules</div>
  }

  if (!rules || rules.length === 0) {
    return <GeneralEmptyState variant="rule" entityName="feature gate" />
  }

  return (
    <div className="space-y-3">
      {rules.map((rule) => (
        <RuleCard key={rule.id} rule={rule} passBadgeVariant={getBadgeVariant(rule.passPercentage)} />
      ))}
    </div>
  )
})
FeatureGateRules.displayName = 'FeatureGateRules'
