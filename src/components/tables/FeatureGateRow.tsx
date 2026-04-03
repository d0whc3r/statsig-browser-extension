import { memo, useCallback } from 'react'

import type { FeatureGate } from '@/src/types/statsig'

import { ActionsCell, NameCell, StatusCell, TagsCell } from '@/src/components/tables/CommonCells'
import { Badge } from '@/src/components/ui/badge'
import { TableCell, TableRow } from '@/src/components/ui/table'

interface FeatureGateCellProps {
  item: FeatureGate
  columnKey: string
  onRowClick: (id: string) => void
  showInlineId: boolean
}

const FeatureGateCellContent = ({
  item,
  columnKey,
  onRowClick,
  showInlineId,
}: FeatureGateCellProps) => {
  switch (columnKey) {
    case 'name': {
      return <NameCell id={item.id} name={item.name} showInlineId={showInlineId} />
    }
    case 'status': {
      return (
        <StatusCell
          status={item.status}
          variant={item.status === 'In Progress' ? 'secondary' : 'outline'}
        />
      )
    }
    case 'tags': {
      return <TagsCell tags={item.tags} />
    }
    case 'isEnabled': {
      return (
        <Badge variant={item.isEnabled ? 'default' : 'destructive'} className="capitalize">
          {item.isEnabled ? 'Enabled' : 'Disabled'}
        </Badge>
      )
    }
    case 'actions': {
      return (
        <ActionsCell
          id={item.id}
          onRowClick={onRowClick}
          statsigUrl={`https://console.statsig.com/gates/${item.id}`}
        />
      )
    }
    default: {
      return null
    }
  }
}

const FeatureGateCell = memo((props: FeatureGateCellProps) => <FeatureGateCellContent {...props} />)
FeatureGateCell.displayName = 'FeatureGateCell'

interface FeatureGateRowProps {
  item: FeatureGate
  headerColumns: readonly { uid: string }[]
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
          <FeatureGateCell
            item={item}
            columnKey={column.uid}
            onRowClick={onRowClick}
            showInlineId
          />
        </TableCell>
      ))}
    </TableRow>
  )
})
FeatureGateRow.displayName = 'FeatureGateRow'
