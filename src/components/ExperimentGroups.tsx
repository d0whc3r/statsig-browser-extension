import React, { memo } from 'react'

import type { Experiment } from '@/src/types/statsig'

import { Badge } from '@/src/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Progress } from '@/src/components/ui/progress'

interface ExperimentGroupsProps {
  experiment: Experiment
}

export const ExperimentGroups = memo(({ experiment }: ExperimentGroupsProps) => {
  const { groups, allocation, targetingGateID, primaryMetrics, secondaryMetrics } = experiment

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="py-3 px-4 bg-muted/30">
          <CardTitle className="text-sm font-semibold">Allocation</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Allocation</span>
              <span className="font-medium">{allocation}%</span>
            </div>
            <Progress value={allocation} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {targetingGateID && (
        <Card>
          <CardHeader className="py-3 px-4 bg-muted/30">
            <CardTitle className="text-sm font-semibold">Targeting Gate</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono bg-secondary px-2 py-1 rounded">
                {targetingGateID}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Groups
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map((group) => (
            <Card key={group.id} className="overflow-hidden">
              <CardHeader className="py-3 px-4 bg-muted/30 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-semibold">{group.name}</CardTitle>
                  <Badge variant="outline">{group.size}%</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-medium uppercase">ID</span>
                  <div className="text-xs font-mono truncate bg-secondary/50 p-1.5 rounded">
                    {group.id}
                  </div>
                </div>
                {group.parameterValues && Object.keys(group.parameterValues).length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground font-medium uppercase">
                      Parameters
                    </span>
                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                      {JSON.stringify(group.parameterValues, undefined, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {(primaryMetrics?.length || secondaryMetrics?.length) && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Metrics
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {primaryMetrics && primaryMetrics.length > 0 && (
              <Card>
                <CardHeader className="py-3 px-4 bg-muted/30">
                  <CardTitle className="text-sm font-semibold">Primary Metrics</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {primaryMetrics.map((metric) => (
                      <Badge key={metric.name} variant="secondary">
                        {metric.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {secondaryMetrics && secondaryMetrics.length > 0 && (
              <Card>
                <CardHeader className="py-3 px-4 bg-muted/30">
                  <CardTitle className="text-sm font-semibold">Secondary Metrics</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {secondaryMetrics.map((metric) => (
                      <Badge key={metric.name} variant="outline">
                        {metric.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
})

ExperimentGroups.displayName = 'ExperimentGroups'
