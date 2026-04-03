import React, { memo } from 'react'

import type { Experiment } from '@/src/types/statsig'

import { EntityDetailsList, EntityDetailsField } from '@/src/components/sheets/EntityDetails'
import { Badge } from '@/src/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { CopyableText } from '@/src/components/ui/copyable-text'
import { Progress } from '@/src/components/ui/progress'

interface ExperimentGroupsProps {
  experiment: Experiment
}

export const ExperimentGroups = memo(({ experiment }: ExperimentGroupsProps) => {
  const { groups, allocation, targetingGateID, primaryMetrics, secondaryMetrics } = experiment

  return (
    <div className="space-y-6">
      <EntityDetailsList>
        <EntityDetailsField label="Total Allocation">
          <div className="flex flex-col gap-1.5 w-40 items-end">
            <span className="text-xs font-medium">{allocation}%</span>
            <Progress value={allocation} className="h-1.5" />
          </div>
        </EntityDetailsField>
        {targetingGateID && (
          <EntityDetailsField label="Targeting Gate">
            <CopyableText
              value={targetingGateID}
              copyLabel="Copy Targeting Gate ID"
              containerClassName="text-xs font-mono bg-secondary/50 px-2 py-1 rounded"
              valueClassName="truncate"
            />
          </EntityDetailsField>
        )}
      </EntityDetailsList>

      <div className="space-y-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Groups</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map((group) => (
            <Card key={group.id} className="overflow-hidden shadow-sm">
              <CardHeader className="py-3 px-4 bg-muted/30 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-semibold">{group.name}</CardTitle>
                  <Badge variant="outline">{group.size}%</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <EntityDetailsList className="border-0 rounded-none">
                  <EntityDetailsField label="Group ID">
                    <CopyableText
                      value={group.id}
                      copyLabel="Copy Group ID"
                      containerClassName="text-xs font-mono bg-secondary/50 px-2 py-1 rounded"
                      valueClassName="truncate max-w-[120px]"
                    />
                  </EntityDetailsField>
                </EntityDetailsList>
                {group.parameterValues && Object.keys(group.parameterValues).length > 0 && (
                  <div className="px-4 pb-4 pt-2">
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                        Parameters
                      </span>
                      <pre className="text-[10px] bg-muted p-2 rounded-md border border-border/50 overflow-x-auto max-h-[150px]">
                        {JSON.stringify(group.parameterValues, undefined, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {(primaryMetrics?.length ?? secondaryMetrics?.length) && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Metrics
          </h3>
          <EntityDetailsList>
            {primaryMetrics && primaryMetrics.length > 0 && (
              <EntityDetailsField label="Primary">
                <div className="flex flex-wrap gap-1 justify-end max-w-[250px]">
                  {primaryMetrics.map((metric) => (
                    <Badge key={metric.name} variant="secondary" className="text-xs">
                      {metric.name}
                    </Badge>
                  ))}
                </div>
              </EntityDetailsField>
            )}
            {secondaryMetrics && secondaryMetrics.length > 0 && (
              <EntityDetailsField label="Secondary">
                <div className="flex flex-wrap gap-1 justify-end max-w-[250px]">
                  {secondaryMetrics.map((metric) => (
                    <Badge key={metric.name} variant="outline" className="text-xs">
                      {metric.name}
                    </Badge>
                  ))}
                </div>
              </EntityDetailsField>
            )}
          </EntityDetailsList>
        </div>
      )}
    </div>
  )
})

ExperimentGroups.displayName = 'ExperimentGroups'
