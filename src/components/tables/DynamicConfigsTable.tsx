import type { DynamicConfig } from '@/src/types/statsig'

import { dynamicConfigColumns } from '@/src/components/tables/data'
import { DynamicConfigRow } from '@/src/components/tables/DynamicConfigRow'
import { EntityTable } from '@/src/components/tables/EntityTable'
import { EntityTableBody } from '@/src/components/tables/EntityTableBody'
import { useDynamicConfigs } from '@/src/hooks/use-dynamic-configs'
import { useEntityTableLogic } from '@/src/hooks/use-entity-table-logic'
import { dynamicConfigRowsPerPageStorage, dynamicConfigVisibleColumnsStorage } from '@/src/lib/storage'

export function DynamicConfigsTable() {
  const { data, isLoading, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useDynamicConfigs()

  const tableLogic = useEntityTableLogic<DynamicConfig>({
    columns: dynamicConfigColumns,
    data,
    entityType: 'dynamic_config',
    error,
    fetchNextPage,
    fusedKeys: ['name', 'id', 'tags'],
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    refetch,
    rowsPerPageStorage: dynamicConfigRowsPerPageStorage,
    visibleColumnsStorage: dynamicConfigVisibleColumnsStorage,
  })

  return (
    <EntityTable
      {...tableLogic}
      columns={dynamicConfigColumns}
      type="dynamicConfigs"
      totalItems={tableLogic.totalItems}
      loadMoreText="Load More Dynamic Configs"
    >
      <EntityTableBody<DynamicConfig>
        error={tableLogic.error}
        onRetry={tableLogic.handleRefetch}
        headerColumns={tableLogic.headerColumns}
        isError={tableLogic.isError}
        isLoading={tableLogic.isLoading}
        items={tableLogic.items}
        // oxlint-disable-next-line react/jsx-handler-names
        onRowClick={tableLogic.setCurrentEntity}
        emptyVariant="dynamic_config"
        errorTitle="Failed to load dynamic configs"
        RowComponent={DynamicConfigRow}
      />
    </EntityTable>
  )
}
