import { memo, useCallback } from 'react'

import type { GateIssueKey } from '@/src/lib/gate-audit'

import { Button } from '@/src/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/components/ui/tooltip'
import { GATE_ISSUE_DESCRIPTIONS, GATE_ISSUE_KEYS, GATE_ISSUE_LABELS } from '@/src/lib/gate-audit'

export type IssueFilter = GateIssueKey | 'all'

interface ChipProps {
  count: number
  description: string
  filter: IssueFilter
  isActive: boolean
  label: string
  onSelect: (filter: IssueFilter) => void
}

const Chip = memo(function Chip({ count, description, filter, isActive, label, onSelect }: ChipProps) {
  const handleClick = useCallback(() => {
    onSelect(filter)
  }, [onSelect, filter])

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isActive ? 'default' : 'outline'}
          size="sm"
          className="h-7 shrink-0 text-xs"
          onClick={handleClick}
        >
          {label}
          <span className="ml-1 opacity-70">{count}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p className="max-w-[240px]">{description}</p>
      </TooltipContent>
    </Tooltip>
  )
})
Chip.displayName = 'Chip'

interface CleanupIssueFilterProps {
  counts: Record<GateIssueKey, number>
  onSelect: (filter: IssueFilter) => void
  selected: IssueFilter
  total: number
}

export const CleanupIssueFilter = memo(function CleanupIssueFilter({
  counts,
  onSelect,
  selected,
  total,
}: CleanupIssueFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Chip
        count={total}
        description="Every gate with at least one cleanup signal."
        filter="all"
        isActive={selected === 'all'}
        label="All gates"
        onSelect={onSelect}
      />
      {GATE_ISSUE_KEYS.filter((key) => counts[key] > 0).map((key) => (
        <Chip
          key={key}
          count={counts[key]}
          description={GATE_ISSUE_DESCRIPTIONS[key]}
          filter={key}
          isActive={selected === key}
          label={GATE_ISSUE_LABELS[key]}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
})
CleanupIssueFilter.displayName = 'CleanupIssueFilter'
