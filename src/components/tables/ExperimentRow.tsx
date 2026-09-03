import { memo, useCallback } from 'react'

import type { ExperimentColumnKey } from '@/src/components/tables/data'
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
import { cn } from '@/src/lib/utils'

interface ExperimentCellProps {
  item: Experiment
  columnKey: string
  onRowClick: (id: string) => void
  showInlineId: boolean
}

type DefaultExperimentColumnKey = Exclude<ExperimentColumnKey, 'actions' | 'allocation' | 'name' | 'status' | 'tags'>

const getExperimentDefaultValue = (item: Experiment, columnKey: DefaultExperimentColumnKey) => item[columnKey]

const ExperimentCell = memo(function ExperimentCell({
  item,
  columnKey,
  onRowClick,
  showInlineId,
}: ExperimentCellProps) {
  switch (columnKey) {
    case 'name': {
      return <ExperimentNameCell item={item} showInlineId={showInlineId} />
    }
    case 'status': {
      return <ExperimentStatusCell item={item} />
    }
    case 'allocation': {
      return <ExperimentAllocationCell item={item} />
    }
    case 'hypothesis': {
      return <ExperimentDefaultCell value={getExperimentDefaultValue(item, columnKey)} />
    }
    case 'tags': {
      return <ExperimentTagsCell item={item} />
    }
    case 'actions': {
      return <ExperimentActionsCell item={item} onRowClick={onRowClick} />
    }
    default: {
      return null
    }
  }
})
ExperimentCell.displayName = 'ExperimentCell'

interface ExperimentRowProps {
  item: Experiment
  headerColumns: readonly { uid: string }[]
  onRowClick: (id: string) => void
}

export const ExperimentRow = memo(function ExperimentRow({ item, headerColumns, onRowClick }: ExperimentRowProps) {
  const handleRowClick = useCallback(() => {
    onRowClick(item.id)
  }, [onRowClick, item.id])

  return (
    <TableRow className="cursor-pointer hover:bg-muted/50" onClick={handleRowClick}>
      {headerColumns.map((column) => (
        <TableCell key={column.uid} className={cn('overflow-hidden', column.uid === 'actions' && 'text-right')}>
          <ExperimentCell item={item} columnKey={column.uid} onRowClick={onRowClick} showInlineId />
        </TableCell>
      ))}
    </TableRow>
  )
})
ExperimentRow.displayName = 'ExperimentRow'
