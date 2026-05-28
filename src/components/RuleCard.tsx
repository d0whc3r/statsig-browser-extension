import type { VariantProps } from 'class-variance-authority'

import React, { memo } from 'react'

import type { badgeVariants } from '@/src/components/ui/badge'

import { EntityDetailsList, EntityDetailsField, EntityDetailsSection } from '@/src/components/sheets/EntityDetails'
import { Badge } from '@/src/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { CopyableText } from '@/src/components/ui/copyable-text'
import { formatConditionDetails } from '@/src/lib/rules'

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

interface RuleCondition {
  type: string
  operator?: string
  targetValue?: unknown
  field?: string
  customID?: string
}

interface RuleLike {
  id: string
  name: string
  baseID?: string
  passPercentage: number
  conditions: RuleCondition[]
  environments: string[]
  groupName?: string
  returnValue?: Record<string, unknown>
}

interface RuleCardProps {
  rule: RuleLike
  passBadgeVariant: BadgeVariant
}

export const RuleCard = memo(({ rule, passBadgeVariant }: RuleCardProps) => (
  <Card className="overflow-hidden shadow-sm">
    <CardHeader className="border-b bg-muted/30 px-4 py-3">
      <div className="flex w-full items-start justify-between gap-4">
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
        <Badge variant={passBadgeVariant} className="shrink-0">
          {rule.passPercentage}%
        </Badge>
      </div>
    </CardHeader>
    <CardContent className="p-0">
      <EntityDetailsList className="rounded-none border-0">
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
RuleCard.displayName = 'RuleCard'
