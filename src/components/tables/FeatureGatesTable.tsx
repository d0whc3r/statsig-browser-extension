import type { FeatureGate } from '@/src/types/statsig'

import { featureGateColumns } from '@/src/components/tables/data'
import { EntityTable } from '@/src/components/tables/EntityTable'
import { FeatureGatesTableBody } from '@/src/components/tables/FeatureGatesTableBody'
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
      <FeatureGatesTableBody
        error={tableLogic.error}
        onRetry={tableLogic.handleRefetch}
        headerColumns={tableLogic.headerColumns}
        isError={tableLogic.isError}
        isLoading={tableLogic.isLoading}
        items={tableLogic.items}
        setCurrentFeatureGate={tableLogic.setCurrentEntity}
      />
    </EntityTable>
  )
}
