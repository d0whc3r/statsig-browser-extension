import React, { memo } from 'react'

import { RuleCard } from '@/src/components/RuleCard'
import { GeneralEmptyState } from '@/src/components/ui/general-empty-state'
import { useDynamicConfigRules } from '@/src/hooks/use-dynamic-config-rules'

interface Props {
  configId: string
}

const FULL_PASS_PERCENTAGE = 100

export const DynamicConfigRules = memo(({ configId }: Props) => {
  const { data: rules, isLoading, error } = useDynamicConfigRules(configId)

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
    return <GeneralEmptyState variant="rule" entityName="dynamic config" />
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {rules.map((rule) => (
          <RuleCard
            key={rule.id}
            rule={rule}
            passBadgeVariant={rule.passPercentage === FULL_PASS_PERCENTAGE ? 'default' : 'secondary'}
          />
        ))}
      </div>
    </div>
  )
})
DynamicConfigRules.displayName = 'DynamicConfigRules'
