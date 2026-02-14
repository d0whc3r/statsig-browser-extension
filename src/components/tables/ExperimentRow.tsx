import { memo, useCallback } from 'react'

import type { experimentColumns } from '@/src/components/tables/data'
import type { Experiment } from '@/src/types/statsig'

import {
  ExperimentActionsCell,
  ExperimentAllocationCell,
  ExperimentDefaultCell,
  ExperimentNameCell,
  ExperimentStatusCell,
  ExperimentTagsCell,
} from '@/src/components/tables/ExperimentCells'
import { TableCell, TableRow } from '@/src/components/ui/table'

interface ExperimentCellProps {
  item: Experiment
  columnKey: string
  onRowClick: (id: string) => void
}

const ExperimentCell = memo(({ item, columnKey, onRowClick }: ExperimentCellProps) => {
  const cellValue = item[columnKey as keyof Experiment]

  switch (columnKey) {
    case 'name': {
      return <ExperimentNameCell item={item} onRowClick={onRowClick} />
    }
    case 'status': {
      return <ExperimentStatusCell item={item} onRowClick={onRowClick} />
    }
    case 'allocation': {
      return <ExperimentAllocationCell item={item} onRowClick={onRowClick} />
    }
    case 'tags': {
      return <ExperimentTagsCell item={item} onRowClick={onRowClick} />
    }
    case 'actions': {
      return <ExperimentActionsCell item={item} onRowClick={onRowClick} />
    }
    default: {
      return <ExperimentDefaultCell value={cellValue} />
    }
  }
})
ExperimentCell.displayName = 'ExperimentCell'

interface ExperimentRowProps {
  item: Experiment
  headerColumns: typeof experimentColumns
  onRowClick: (id: string) => void
}

export const ExperimentRow = memo(({ item, headerColumns, onRowClick }: ExperimentRowProps) => {
  const handleRowClick = useCallback(() => {
    onRowClick(item.id)
  }, [onRowClick, item.id])

  return (
    <TableRow className="cursor-pointer hover:bg-muted/50" onClick={handleRowClick}>
      {headerColumns.map((column) => (
        <TableCell key={column.uid} className={column.uid === 'actions' ? 'text-right' : ''}>
          <ExperimentCell item={item} columnKey={column.uid} onRowClick={onRowClick} />
        </TableCell>
      ))}
    </TableRow>
  )
})
ExperimentRow.displayName = 'ExperimentRow'
