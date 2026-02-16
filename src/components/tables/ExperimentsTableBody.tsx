import React from 'react'

import type { experimentColumns } from '@/src/components/tables/data'
import type { Experiment } from '@/src/types/statsig'

import { ExperimentRow } from '@/src/components/tables/ExperimentRow'
import { TableLoadingState } from '@/src/components/tables/TableLoadingState'
import { GeneralEmptyState } from '@/src/components/ui/general-empty-state'
import { TableCell, TableRow } from '@/src/components/ui/table'

interface ExperimentsTableBodyProps {
  headerColumns: typeof experimentColumns
  isLoading: boolean
  items: Experiment[]
  setCurrentExperiment: (id: string) => void
}

export function ExperimentsTableBody({
  headerColumns,
  isLoading,
  items,
  setCurrentExperiment,
}: ExperimentsTableBodyProps) {
  if (isLoading) {
    return <TableLoadingState columnCount={headerColumns.length} />
  }

  if (items.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={headerColumns.length} className="h-24 text-center">
          <GeneralEmptyState variant="experiment" />
        </TableCell>
      </TableRow>
    )
  }

  return items.map((item) => (
    <ExperimentRow
      key={item.id}
      item={item}
      headerColumns={headerColumns}
      onRowClick={setCurrentExperiment}
    />
  ))
}
