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

interface ExperimentCellProps {
  item: Experiment
  columnKey: ExperimentColumnKey
  onRowClick: (id: string) => void
  showInlineId: boolean
}

type DefaultExperimentColumnKey = Exclude<
  ExperimentColumnKey,
  'actions' | 'allocation' | 'name' | 'status' | 'tags'
>

const getExperimentDefaultValue = (item: Experiment, columnKey: DefaultExperimentColumnKey) =>
  item[columnKey]

const ExperimentCell = memo(
  ({ item, columnKey, onRowClick, showInlineId }: ExperimentCellProps) => {
    switch (columnKey) {
      case 'name': {
        return <ExperimentNameCell item={item} showInlineId={showInlineId} />
      }
      case 'status': {
        return <ExperimentStatusCell item={item} onRowClick={onRowClick} />
      }
      case 'allocation': {
        return <ExperimentAllocationCell item={item} onRowClick={onRowClick} />
      }
      case 'hypothesis': {
        return <ExperimentDefaultCell value={getExperimentDefaultValue(item, columnKey)} />
      }
      case 'tags': {
        return <ExperimentTagsCell item={item} onRowClick={onRowClick} />
      }
      case 'actions': {
        return <ExperimentActionsCell item={item} onRowClick={onRowClick} />
      }
      default: {
        return null
      }
    }
  },
)
ExperimentCell.displayName = 'ExperimentCell'

interface ExperimentRowProps {
  item: Experiment
  headerColumns: readonly { uid: ExperimentColumnKey }[]
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
          <ExperimentCell item={item} columnKey={column.uid} onRowClick={onRowClick} showInlineId />
        </TableCell>
      ))}
    </TableRow>
  )
})
ExperimentRow.displayName = 'ExperimentRow'
