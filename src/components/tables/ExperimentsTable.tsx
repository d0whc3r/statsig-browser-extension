import type { Experiment } from '@/src/types/statsig'

import { experimentColumns, experimentStatusOptions } from '@/src/components/tables/data'
import { EntityTable } from '@/src/components/tables/EntityTable'
import { EntityTableBody } from '@/src/components/tables/EntityTableBody'
import { ExperimentRow } from '@/src/components/tables/ExperimentRow'
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
      <EntityTableBody<Experiment>
        headerColumns={tableLogic.headerColumns}
        isLoading={tableLogic.isLoading}
        items={tableLogic.items}
        onRowClick={tableLogic.setCurrentEntity}
        emptyVariant="experiment"
        RowComponent={ExperimentRow}
      />
    </EntityTable>
  )
}
