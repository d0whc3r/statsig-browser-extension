import React, { memo } from 'react'

import type { FeatureGateRule } from '@/src/types/statsig'

import { Badge } from '@/src/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { GeneralEmptyState } from '@/src/components/ui/general-empty-state'
import { useFeatureGateRules } from '@/src/hooks/use-feature-gate-rules'
import { getConditionLabel } from '@/src/lib/rules'
import { cn } from '@/src/lib/utils'

interface Props {
  featureGateId: string
}

interface FeatureGateRuleCardProps {
  rule: FeatureGateRule
}

const MAX_PERCENTAGE = 100
const MIN_PERCENTAGE = 0

const getProgressColor = (percentage: number) => {
  if (percentage === MAX_PERCENTAGE) {
    return 'bg-primary'
  }
  if (percentage === MIN_PERCENTAGE) {
    return 'bg-destructive'
  }
  return 'bg-yellow-500'
}

const getBadgeVariant = (
  percentage: number,
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  if (percentage === MIN_PERCENTAGE) {
    return 'destructive'
  }
  if (percentage === MAX_PERCENTAGE) {
    return 'default'
  }
  return 'secondary'
}

const FeatureGateRuleCard = memo(({ rule }: FeatureGateRuleCardProps) => (
  <Card className="shadow-sm">
    <CardHeader className="pb-2">
      <div className="flex w-full justify-between items-start">
        <div className="flex-1">
          <CardTitle className="text-sm font-semibold">{rule.name}</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">Rule ID: {rule.id}</p>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <Badge variant={getBadgeVariant(rule.passPercentage)}>{rule.passPercentage}% Pass</Badge>
        </div>
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="space-y-3">
        {/* Pass Percentage Progress Bar */}
        <div>
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>Pass Rate</span>
            <span>{rule.passPercentage}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn('h-full', getProgressColor(rule.passPercentage))}
              style={{ width: `${rule.passPercentage}%` }}
            />
          </div>
        </div>

        {/* Environments */}
        {rule.environments && rule.environments.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Environments</p>
            <div className="flex flex-wrap gap-1">
              {rule.environments.map((env) => (
                <Badge key={env} variant="outline" className="text-xs">
                  {env}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Conditions */}
        {rule.conditions && rule.conditions.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Conditions</p>
            <div className="flex flex-wrap gap-1">
              {rule.conditions.map((condition) => (
                <Badge key={JSON.stringify(condition)} variant="secondary" className="text-xs">
                  {getConditionLabel(condition.type)}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
))
FeatureGateRuleCard.displayName = 'FeatureGateRuleCard'

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
    return <div className="text-center text-sm text-destructive py-4">Failed to load rules</div>
  }

  if (!rules || rules.length === 0) {
    return <GeneralEmptyState variant="rule" entityName="feature gate" />
  }

  return (
    <div className="space-y-3">
      <h3 className="text-md font-medium">Rules ({rules.length})</h3>
      <div className="space-y-3">
        {rules.map((rule: FeatureGateRule) => (
          <FeatureGateRuleCard key={rule.id} rule={rule} />
        ))}
      </div>
    </div>
  )
})
FeatureGateRules.displayName = 'FeatureGateRules'
