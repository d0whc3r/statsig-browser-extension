import type { FeatureGate } from '@/src/types/statsig'

import { featureGateColumns } from '@/src/components/tables/data'
import { EntityTable } from '@/src/components/tables/EntityTable'
import { EntityTableBody } from '@/src/components/tables/EntityTableBody'
import { FeatureGateRow } from '@/src/components/tables/FeatureGateRow'
import { useEntityTableLogic } from '@/src/hooks/use-entity-table-logic'
import { useFeatureGates } from '@/src/hooks/use-feature-gates'
import { featureGatesRowsPerPageStorage, featureGatesVisibleColumnsStorage } from '@/src/lib/storage'

export function FeatureGatesTable() {
  const { data, isLoading, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeatureGates()

  const tableLogic = useEntityTableLogic<FeatureGate>({
    columns: featureGateColumns,
    data,
    entityType: 'feature_gate',
    error,
    fetchNextPage,
    fusedKeys: ['name', 'id', 'description', 'tags'],
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    refetch,
    rowsPerPageStorage: featureGatesRowsPerPageStorage,
    visibleColumnsStorage: featureGatesVisibleColumnsStorage,
  })

  return (
    <EntityTable
      {...tableLogic}
      columns={featureGateColumns}
      type="featureGates"
      totalItems={tableLogic.totalItems}
      loadMoreText="Load More Feature Gates"
    >
      <EntityTableBody<FeatureGate>
        error={tableLogic.error}
        onRetry={tableLogic.handleRefetch}
        headerColumns={tableLogic.headerColumns}
        isError={tableLogic.isError}
        isLoading={tableLogic.isLoading}
        items={tableLogic.items}
        // oxlint-disable-next-line react/jsx-handler-names
        onRowClick={tableLogic.setCurrentEntity}
        emptyVariant="feature_gate"
        errorTitle="Failed to load feature gates"
        RowComponent={FeatureGateRow}
      />
    </EntityTable>
  )
}
