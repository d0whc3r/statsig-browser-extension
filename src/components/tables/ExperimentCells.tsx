import { memo } from 'react'

import type { Experiment } from '@/src/types/statsig'

import { ActionsCell, NameCell, StatusCell, TagsCell } from '@/src/components/tables/CommonCells'

const statusMap: Record<string, string> = {
  abandoned: 'Abandoned',
  active: 'In Progress',
  archived: 'Archived',
  decision_made: 'Decision Made',
  setup: 'Setup',
}

const statusColorMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  abandoned: 'destructive',
  active: 'default',
  decision_made: 'secondary',
  setup: 'outline',
}

const getBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' =>
  statusColorMap[status] || 'outline'

interface BaseCellProps {
  item: Experiment
  onRowClick: (id: string) => void
}

interface ExperimentNameCellProps {
  item: Experiment
  showInlineId: boolean
}

export const ExperimentNameCell = memo(({ item, showInlineId }: ExperimentNameCellProps) => (
  <NameCell id={item.id} name={item.name} showInlineId={showInlineId} />
))

ExperimentNameCell.displayName = 'ExperimentNameCell'

export const ExperimentStatusCell = memo(({ item }: BaseCellProps) => (
  <StatusCell
    status={item.status}
    variant={getBadgeVariant(item.status)}
    label={statusMap[item.status] || item.status}
  />
))

ExperimentStatusCell.displayName = 'ExperimentStatusCell'

export const ExperimentAllocationCell = memo(({ item }: BaseCellProps) => (
  <div>{item.allocation}%</div>
))

ExperimentAllocationCell.displayName = 'ExperimentAllocationCell'

export const ExperimentTagsCell = memo(({ item }: BaseCellProps) => <TagsCell tags={item.tags} />)

ExperimentTagsCell.displayName = 'ExperimentTagsCell'

export const ExperimentActionsCell = memo(({ item, onRowClick }: BaseCellProps) => (
  <ActionsCell
    id={item.id}
    onRowClick={onRowClick}
    statsigUrl={`https://console.statsig.com/experiments/${item.id}`}
  />
))

ExperimentActionsCell.displayName = 'ExperimentActionsCell'

export const ExperimentDefaultCell = memo(({ value }: { value: unknown }) => (
  <div>{String(value)}</div>
))

ExperimentDefaultCell.displayName = 'ExperimentDefaultCell'
