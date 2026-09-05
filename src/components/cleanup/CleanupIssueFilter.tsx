import { memo, useCallback } from 'react'

import type { GateIssueKey } from '@/src/lib/gate-audit'

import { Button } from '@/src/components/ui/button'
import { GATE_ISSUE_DESCRIPTIONS, GATE_ISSUE_KEYS, GATE_ISSUE_LABELS } from '@/src/lib/gate-audit'

export type IssueFilter = GateIssueKey | 'all'

interface ChipProps {
  count: number
  filter: IssueFilter
  isActive: boolean
  label: string
  onSelect: (filter: IssueFilter) => void
  title?: string
}

const Chip = memo(function Chip({ count, filter, isActive, label, onSelect, title }: ChipProps) {
  const handleClick = useCallback(() => {
    onSelect(filter)
  }, [onSelect, filter])

  return (
    <Button
      variant={isActive ? 'default' : 'outline'}
      size="sm"
      className="h-7 shrink-0 text-xs"
      title={title}
      onClick={handleClick}
    >
      {label}
      <span className="ml-1 opacity-70">{count}</span>
    </Button>
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
        filter="all"
        isActive={selected === 'all'}
        label="All gates"
        onSelect={onSelect}
        title="Every gate with at least one issue"
      />
      {GATE_ISSUE_KEYS.filter((key) => counts[key] > 0).map((key) => (
        <Chip
          key={key}
          count={counts[key]}
          filter={key}
          isActive={selected === key}
          label={GATE_ISSUE_LABELS[key]}
          onSelect={onSelect}
          title={GATE_ISSUE_DESCRIPTIONS[key]}
        />
      ))}
    </div>
  )
})
CleanupIssueFilter.displayName = 'CleanupIssueFilter'
