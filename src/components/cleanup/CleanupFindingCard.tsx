import type { VariantProps } from 'class-variance-authority'

import { ExternalLink } from 'lucide-react'
import { memo, useCallback } from 'react'

import type { badgeVariants } from '@/src/components/ui/badge'
import type { GateFinding, GateIssueKey } from '@/src/lib/gate-audit'

import { Badge } from '@/src/components/ui/badge'
import { TimeAgo } from '@/src/components/ui/time-ago'
import { GATE_ISSUE_LABELS } from '@/src/lib/gate-audit'

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

const ISSUE_VARIANTS: Record<GateIssueKey, BadgeVariant> = {
  aging_temporary: 'secondary',
  always_off: 'destructive',
  always_on: 'destructive',
  dev_only: 'secondary',
  duplicate_rules: 'outline',
  frozen: 'secondary',
  large_id_list: 'outline',
  no_metadata: 'outline',
  no_traffic: 'destructive',
  orphan: 'outline',
  twin_gates: 'secondary',
}

interface CleanupFindingCardProps {
  finding: GateFinding
  onOpen: (gateId: string) => void
}

export const CleanupFindingCard = memo(function CleanupFindingCard({ finding, onOpen }: CleanupFindingCardProps) {
  const { gate, issues } = finding

  const handleOpen = useCallback(() => {
    onOpen(gate.id)
  }, [onOpen, gate.id])

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <button type="button" onClick={handleOpen} className="min-w-0 flex-1 text-left">
          <span className="block truncate font-medium hover:underline" title={gate.name}>
            {gate.name}
          </span>
          <span className="block truncate font-mono text-xs text-muted-foreground">{gate.id}</span>
        </button>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs whitespace-nowrap text-muted-foreground">
            <TimeAgo date={gate.lastModifiedTime} />
          </span>
          <Badge variant={gate.isEnabled ? 'default' : 'destructive'}>{gate.isEnabled ? 'Enabled' : 'Disabled'}</Badge>
          <a
            href={`https://console.statsig.com/gates/${gate.id}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Open on Statsig"
            className="text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="size-4" />
          </a>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {issues.map((issue) => (
          <Badge key={issue.key} variant={ISSUE_VARIANTS[issue.key]} className="text-xs">
            {GATE_ISSUE_LABELS[issue.key]}
          </Badge>
        ))}
      </div>

      <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
        {issues.map((issue) => (
          <li key={issue.key} className="truncate" title={issue.detail}>
            {issue.detail}
          </li>
        ))}
      </ul>
    </div>
  )
})
CleanupFindingCard.displayName = 'CleanupFindingCard'
