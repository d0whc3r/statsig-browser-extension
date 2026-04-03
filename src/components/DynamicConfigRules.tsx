import React, { memo } from 'react'

import type { DynamicConfigRule } from '@/src/types/statsig'

import {
  EntityDetailsList,
  EntityDetailsField,
  EntityDetailsSection,
} from '@/src/components/sheets/EntityDetails'
import { Badge } from '@/src/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { CopyableText } from '@/src/components/ui/copyable-text'
import { GeneralEmptyState } from '@/src/components/ui/general-empty-state'
import { useDynamicConfigRules } from '@/src/hooks/use-dynamic-config-rules'
import { formatConditionDetails } from '@/src/lib/rules'

interface Props {
  configId: string
}

interface DynamicConfigRuleCardProps {
  rule: DynamicConfigRule
}

const FULL_PASS_PERCENTAGE = 100

const DynamicConfigRuleCard = memo(({ rule }: DynamicConfigRuleCardProps) => (
  <Card className="overflow-hidden shadow-sm">
    <CardHeader className="py-3 px-4 bg-muted/30 border-b">
      <div className="flex justify-between items-start gap-4">
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
          {rule.passPercentage}%
        </Badge>
      </div>
    </CardHeader>
    <CardContent className="p-0">
      <EntityDetailsList className="border-0 rounded-none">
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
              {rule.conditions.map((condition, index) => (
                <Badge
                  // oxlint-disable-next-line react/no-array-index-key
                  key={`${rule.id}-${index}`}
                  variant="secondary"
                  className="text-xs font-normal"
                >
                  {formatConditionDetails(condition)}
                </Badge>
              ))}
            </div>
          </EntityDetailsField>
        )}
      </EntityDetailsList>

      {/* Return Value */}
      {rule.returnValue && (
        <div className="px-4 pb-4">
          <div className="pt-2">
            <EntityDetailsSection title="Return Value">
              <div className="rounded-md border bg-muted p-2 overflow-auto max-h-[200px] mt-1">
                <pre className="text-[10px] font-mono whitespace-pre-wrap break-all">
                  {JSON.stringify(rule.returnValue, undefined, 2)}
                </pre>
              </div>
            </EntityDetailsSection>
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
      <div className="space-y-3">
        {rules.map((rule) => (
          <DynamicConfigRuleCard key={rule.id} rule={rule} />
        ))}
      </div>
    </div>
  )
})
DynamicConfigRules.displayName = 'DynamicConfigRules'
