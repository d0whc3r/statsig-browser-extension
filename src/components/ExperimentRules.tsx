import React, { memo } from 'react'

import type { FeatureGateRule } from '@/src/types/statsig'

import { Badge } from '@/src/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Empty } from '@/src/components/ui/empty'
import { useExperimentRules } from '@/src/hooks/use-experiment-rules'
import { getConditionLabel } from '@/src/lib/rules'

interface Props {
  experimentId: string
}

interface ExperimentRuleCardProps {
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

const ExperimentRuleCard = memo(({ rule }: ExperimentRuleCardProps) => (
  <Card className="overflow-hidden">
    <CardHeader className="py-3 px-4 bg-muted/30">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <CardTitle className="text-sm font-semibold truncate" title={rule.name}>
            {rule.name}
          </CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-muted-foreground font-mono">{rule.id}</span>
          </div>
        </div>
        <Badge
          variant={rule.passPercentage === MAX_PERCENTAGE ? 'default' : 'secondary'}
          className="shrink-0"
        >
          {rule.passPercentage}% Pass
        </Badge>
      </div>
    </CardHeader>
    <CardContent className="p-4 space-y-4">
      {/* Pass Percentage Visual */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Pass Rate</span>
          <span>{rule.passPercentage}%</span>
        </div>
        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${getProgressColor(rule.passPercentage)}`}
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
    </CardContent>
  </Card>
))

ExperimentRuleCard.displayName = 'ExperimentRuleCard'

export const ExperimentRules = memo(({ experimentId }: Props) => {
  const { data: rules, isLoading, error } = useExperimentRules(experimentId)

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
    return (
      <Empty className="py-8">
        <div className="text-muted-foreground">No rules configured for this experiment</div>
      </Empty>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Rules ({rules.length})
        </h3>
      </div>
      <div className="space-y-3">
        {rules.map((rule) => (
          <ExperimentRuleCard key={rule.id} rule={rule} />
        ))}
      </div>
    </div>
  )
})

ExperimentRules.displayName = 'ExperimentRules'
