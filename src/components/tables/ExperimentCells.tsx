import { ExternalLink, Eye, MoreVertical } from 'lucide-react'
import { memo, useCallback } from 'react'

import type { Experiment } from '@/src/types/statsig'

import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'

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

export const ExperimentNameCell = memo(({ item }: BaseCellProps) => (
  <div className="cursor-pointer font-medium hover:underline">{item.name}</div>
))

ExperimentNameCell.displayName = 'ExperimentNameCell'

export const ExperimentStatusCell = memo(({ item }: BaseCellProps) => (
  <Badge variant={getBadgeVariant(item.status)} className="capitalize">
    {statusMap[item.status] || item.status}
  </Badge>
))

ExperimentStatusCell.displayName = 'ExperimentStatusCell'

export const ExperimentAllocationCell = memo(({ item }: BaseCellProps) => (
  <div>{item.allocation}%</div>
))

ExperimentAllocationCell.displayName = 'ExperimentAllocationCell'

export const ExperimentTagsCell = memo(({ item }: BaseCellProps) => {
  const tags = item.tags as string[]
  return (
    <div className="flex flex-wrap gap-1">
      {tags?.map((tag) => (
        <Badge key={tag} variant="secondary" className="capitalize">
          {tag}
        </Badge>
      ))}
    </div>
  )
})

ExperimentTagsCell.displayName = 'ExperimentTagsCell'

export const ExperimentActionsCell = memo(({ item, onRowClick }: BaseCellProps) => {
  const handleRowClick = useCallback(() => {
    onRowClick(item.id)
  }, [onRowClick, item.id])

  const handleOpenStatsig = useCallback((event: React.MouseEvent) => {
    event.stopPropagation()
  }, [])

  return (
    <div className="relative flex justify-end items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleRowClick}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              href={`https://console.statsig.com/experiments/${item.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
              onClick={handleOpenStatsig}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open on Statsig
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
})

ExperimentActionsCell.displayName = 'ExperimentActionsCell'

export const ExperimentDefaultCell = memo(({ value }: { value: unknown }) => (
  <div>{String(value)}</div>
))

ExperimentDefaultCell.displayName = 'ExperimentDefaultCell'
