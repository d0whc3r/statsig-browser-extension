import type { HealthCheck } from '@/src/types/statsig'

import { Progress } from '@/src/components/ui/progress'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/components/ui/tooltip'
import { cn } from '@/src/lib/utils'

export const HealthCheckSection = ({ healthChecks }: { healthChecks?: HealthCheck[] }) => {
  if (!healthChecks || healthChecks.length === 0) {
    return
  }

  const progress = healthChecks.reduce((acc, healthCheck) => {
    if (healthCheck.status === 'PASSED') {
      const MAX_PERCENTAGE = 100
      acc += MAX_PERCENTAGE / healthChecks.length
    }
    return acc
  }, 0)

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium">
          <span>Checklist</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="space-y-2">
        {healthChecks.map((healthCheck) => (
          <div className="flex items-center gap-2" key={healthCheck.name}>
            <div
              className={cn(
                'h-2.5 w-2.5 rounded-full shrink-0',
                healthCheck.status === 'PASSED' ? 'bg-green-500' : 'bg-muted-foreground/30',
              )}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm cursor-help underline decoration-dotted decoration-muted-foreground/50 underline-offset-4">
                  {healthCheck.name}
                </span>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="max-w-[275px]">{healthCheck.description}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        ))}
      </div>
    </div>
  )
}
