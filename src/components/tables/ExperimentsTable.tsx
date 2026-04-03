import type { Experiment } from '@/src/types/statsig'

import { experimentColumns, experimentStatusOptions } from '@/src/components/tables/data'
import { EntityTable } from '@/src/components/tables/EntityTable'
import { ExperimentsTableBody } from '@/src/components/tables/ExperimentsTableBody'
import { useEntityTableLogic } from '@/src/hooks/use-entity-table-logic'
import { useExperiments } from '@/src/hooks/use-experiments'
import { experimentsRowsPerPageStorage, experimentsVisibleColumnsStorage } from '@/src/lib/storage'

export function ExperimentsTable() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useExperiments()

  const tableLogic = useEntityTableLogic<Experiment>({
    columns: experimentColumns,
    data,
    entityType: 'experiment',
    fetchNextPage,
    fusedKeys: ['name', 'id', 'description', 'hypothesis', 'tags'],
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    rowsPerPageStorage: experimentsRowsPerPageStorage,
    statusOptions: experimentStatusOptions,
    visibleColumnsStorage: experimentsVisibleColumnsStorage,
  })

  return (
    <EntityTable
      {...tableLogic}
      columns={experimentColumns}
      statusOptions={experimentStatusOptions}
      type="experiments"
      totalItems={tableLogic.totalItems}
      loadMoreText="Load More Experiments"
    >
      <ExperimentsTableBody
        headerColumns={tableLogic.headerColumns}
        isLoading={tableLogic.isLoading}
        items={tableLogic.items}
        setCurrentExperiment={tableLogic.setCurrentEntity}
      />
    </EntityTable>
  )
}
