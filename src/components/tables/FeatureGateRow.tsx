import { ExternalLink, Eye, MoreVertical } from 'lucide-react'
import { memo, useCallback } from 'react'

import type { featureGateColumns } from '@/src/components/tables/data'
import type { FeatureGate } from '@/src/types/statsig'

import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { TableCell, TableRow } from '@/src/components/ui/table'

interface FeatureGateCellProps {
  item: FeatureGate
  columnKey: string
  onRowClick: (id: string) => void
}

const FeatureGateActions = ({
  item,
  onRowClick,
}: {
  item: FeatureGate
  onRowClick: (id: string) => void
}) => {
  const handleRowClick = useCallback(() => {
    onRowClick(item.id)
  }, [onRowClick, item.id])

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
              href={`https://console.statsig.com/gates/${item.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open on Statsig
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

const FeatureGateStatus = ({ status }: { status: string }) => (
  <Badge variant={status === 'In Progress' ? 'secondary' : 'outline'} className="capitalize">
    {status}
  </Badge>
)

const FeatureGateTags = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-wrap gap-1">
    {tags?.map((tag: string) => (
      <Badge key={tag} variant="secondary" className="capitalize">
        {tag}
      </Badge>
    ))}
  </div>
)

const FeatureGateCellContent = ({ item, columnKey, onRowClick }: FeatureGateCellProps) => {
  const cellValue = item[columnKey as keyof FeatureGate]

  switch (columnKey) {
    case 'name': {
      return <div className="cursor-pointer font-medium hover:underline">{item.name}</div>
    }
    case 'status': {
      return <FeatureGateStatus status={item.status} />
    }
    case 'tags': {
      return <FeatureGateTags tags={cellValue as string[]} />
    }
    case 'isEnabled': {
      return (
        <Badge variant={item.isEnabled ? 'default' : 'destructive'} className="capitalize">
          {item.isEnabled ? 'Enabled' : 'Disabled'}
        </Badge>
      )
    }
    case 'actions': {
      return <FeatureGateActions item={item} onRowClick={onRowClick} />
    }
    default: {
      if (typeof cellValue === 'object' && cellValue !== null) {
        return <div>{JSON.stringify(cellValue)}</div>
      }
      return <div>{String(cellValue)}</div>
    }
  }
}

const FeatureGateCell = memo((props: FeatureGateCellProps) => <FeatureGateCellContent {...props} />)
FeatureGateCell.displayName = 'FeatureGateCell'

interface FeatureGateRowProps {
  item: FeatureGate
  headerColumns: typeof featureGateColumns
  onRowClick: (id: string) => void
}

export const FeatureGateRow = memo(({ item, headerColumns, onRowClick }: FeatureGateRowProps) => {
  const handleRowClick = useCallback(() => {
    onRowClick(item.id)
  }, [onRowClick, item.id])

  return (
    <TableRow className="cursor-pointer hover:bg-muted/50" onClick={handleRowClick}>
      {headerColumns.map((column) => (
        <TableCell key={column.uid} className={column.uid === 'actions' ? 'text-right' : ''}>
          <FeatureGateCell item={item} columnKey={column.uid} onRowClick={onRowClick} />
        </TableCell>
      ))}
    </TableRow>
  )
})
FeatureGateRow.displayName = 'FeatureGateRow'
