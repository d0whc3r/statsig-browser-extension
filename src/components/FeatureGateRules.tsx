import React, { memo } from 'react'

import type { FeatureGateRule } from '@/src/types/statsig'

import { EntityDetailsList, EntityDetailsField } from '@/src/components/sheets/EntityDetails'
import { Badge } from '@/src/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { CopyableText } from '@/src/components/ui/copyable-text'
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
  <Card className="shadow-sm overflow-hidden">
    <CardHeader className="py-3 px-4 bg-muted/30 border-b">
      <div className="flex w-full justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <CardTitle className="text-sm font-semibold truncate" title={rule.name}>
            {rule.name}
          </CardTitle>
          <CopyableText
            value={`rule_id: ${rule.id}`}
            copyValue={rule.id}
            copyLabel="Copy rule ID"
            containerClassName="mt-1 text-[11px] font-mono text-muted-foreground"
            valueClassName="truncate hover:text-foreground transition-colors"
          />
          {rule.baseID && rule.baseID !== rule.id && (
            <CopyableText
              value={`base_rule_id: ${rule.baseID}`}
              copyValue={rule.baseID}
              copyLabel="Copy base rule ID"
              containerClassName="text-[11px] font-mono text-muted-foreground"
              valueClassName="truncate hover:text-foreground transition-colors"
            />
          )}
        </div>
        <Badge variant={getBadgeVariant(rule.passPercentage)} className="shrink-0">
          {rule.passPercentage}% Pass
        </Badge>
      </div>
    </CardHeader>
    <CardContent className="p-0">
      <EntityDetailsList className="border-0 rounded-none">
        {/* Pass Percentage Progress Bar */}
        <EntityDetailsField label="Pass Rate">
          <div className="flex flex-col gap-1.5 w-32 items-end">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={cn('h-full', getProgressColor(rule.passPercentage))}
                style={{ width: `${rule.passPercentage}%` }}
              />
            </div>
          </div>
        </EntityDetailsField>

        {/* Environments */}
        {rule.environments && rule.environments.length > 0 && (
          <EntityDetailsField label="Environments">
            <div className="flex flex-wrap gap-1 justify-end">
              {rule.environments.map((env) => (
                <Badge key={env} variant="outline" className="text-xs">
                  {env}
                </Badge>
              ))}
            </div>
          </EntityDetailsField>
        )}

        {/* Conditions */}
        {rule.conditions && rule.conditions.length > 0 && (
          <EntityDetailsField label="Conditions">
            <div className="flex flex-wrap gap-1 justify-end">
              {rule.conditions.map((condition) => (
                <Badge key={JSON.stringify(condition)} variant="secondary" className="text-xs">
                  {getConditionLabel(condition.type)}
                </Badge>
              ))}
            </div>
          </EntityDetailsField>
        )}
      </EntityDetailsList>
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
      {rules.map((rule: FeatureGateRule) => (
        <FeatureGateRuleCard key={rule.id} rule={rule} />
      ))}
    </div>
  )
})
FeatureGateRules.displayName = 'FeatureGateRules'
