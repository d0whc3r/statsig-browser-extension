import React, { memo } from 'react'

import type { DynamicConfigRule } from '@/src/types/statsig'

import { Badge } from '@/src/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { GeneralEmptyState } from '@/src/components/ui/general-empty-state'
import { useDynamicConfigRules } from '@/src/hooks/use-dynamic-config-rules'
import { getConditionLabel } from '@/src/lib/rules'

interface Props {
  configId: string
}

interface DynamicConfigRuleCardProps {
  rule: DynamicConfigRule
}

const FULL_PASS_PERCENTAGE = 100

const DynamicConfigRuleCard = memo(({ rule }: DynamicConfigRuleCardProps) => (
  <Card className="overflow-hidden">
    <CardHeader className="py-3 px-4 bg-muted/30">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <CardTitle className="text-sm font-semibold truncate" title={rule.name}>
            {rule.name}
          </CardTitle>
          {rule.groupName && (
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                {rule.groupName}
              </Badge>
            </div>
          )}
        </div>
        <Badge
          variant={rule.passPercentage === FULL_PASS_PERCENTAGE ? 'default' : 'secondary'}
          className="shrink-0"
        >
          {rule.passPercentage}% Pass
        </Badge>
      </div>
    </CardHeader>
    <CardContent className="p-4 space-y-4">
      {/* Return Value */}
      {rule.returnValue && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Return Value</p>
          <div className="rounded-md border bg-muted p-2 overflow-auto max-h-[200px]">
            <pre className="text-[10px] font-mono whitespace-pre-wrap break-all">
              {JSON.stringify(rule.returnValue, undefined, 2)}
            </pre>
          </div>
        </div>
      )}

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
            {rule.conditions.map((condition, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Badge key={`${condition.type}-${index}`} variant="secondary" className="text-xs">
                {getConditionLabel(condition.type)}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </CardContent>
  </Card>
))
DynamicConfigRuleCard.displayName = 'DynamicConfigRuleCard'

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
    return <div className="text-center text-sm text-destructive py-4">Failed to load rules</div>
  }

  if (!rules || rules.length === 0) {
    return <GeneralEmptyState variant="rule" entityName="dynamic config" />
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
          <DynamicConfigRuleCard key={rule.id} rule={rule} />
        ))}
      </div>
    </div>
  )
})
DynamicConfigRules.displayName = 'DynamicConfigRules'
