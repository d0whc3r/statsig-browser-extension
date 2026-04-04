import React, { memo } from 'react'

import type { DynamicConfigRule } from '@/src/types/statsig'

import { EntityDetailsList, EntityDetailsField, EntityDetailsSection } from '@/src/components/sheets/EntityDetails'
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
    <CardHeader className="border-b bg-muted/30 px-4 py-3">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <CardTitle className="truncate text-sm font-semibold" title={rule.name}>
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
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
                {rule.groupName}
              </Badge>
            </div>
          )}
        </div>
        <Badge variant={rule.passPercentage === FULL_PASS_PERCENTAGE ? 'default' : 'secondary'} className="shrink-0">
          {rule.passPercentage}%
        </Badge>
      </div>
    </CardHeader>
    <CardContent className="p-0">
      <EntityDetailsList className="rounded-none border-0">
        {/* Environments */}
        {rule.environments && rule.environments.length > 0 && (
          <EntityDetailsField label="Environments">
            <div className="flex flex-wrap justify-end gap-1">
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
            <div className="flex flex-wrap justify-end gap-1">
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
              <div className="mt-1 max-h-[200px] overflow-auto rounded-md border bg-muted p-2">
                <pre className="font-mono text-[10px] break-all whitespace-pre-wrap">
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
    return <div className="py-4 text-center text-sm text-destructive">Failed to load rules</div>
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
