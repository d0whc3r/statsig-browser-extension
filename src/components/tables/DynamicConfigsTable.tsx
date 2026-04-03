import type { DynamicConfig } from '@/src/types/statsig'

import { dynamicConfigColumns } from '@/src/components/tables/data'
import { DynamicConfigsTableBody } from '@/src/components/tables/DynamicConfigsTableBody'
import { EntityTable } from '@/src/components/tables/EntityTable'
import { useDynamicConfigs } from '@/src/hooks/use-dynamic-configs'
import { useEntityTableLogic } from '@/src/hooks/use-entity-table-logic'
import {
  dynamicConfigRowsPerPageStorage,
  dynamicConfigVisibleColumnsStorage,
} from '@/src/lib/storage'

export function DynamicConfigsTable() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDynamicConfigs()

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
      <DynamicConfigsTableBody
        error={tableLogic.error}
        onRetry={tableLogic.handleRefetch}
        headerColumns={tableLogic.headerColumns}
        isError={tableLogic.isError}
        isLoading={tableLogic.isLoading}
        items={tableLogic.items}
        setCurrentConfig={tableLogic.setCurrentEntity}
      />
    </EntityTable>
  )
}
