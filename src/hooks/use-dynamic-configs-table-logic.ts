import { useCallback, useMemo } from 'react'

import { dynamicConfigColumns } from '@/src/components/tables/data'
import { useDynamicConfigs } from '@/src/hooks/use-dynamic-configs'
import { useFusedItems } from '@/src/hooks/use-fused-items'
import { useTableState } from '@/src/hooks/use-table-state'
import {
  dynamicConfigRowsPerPageStorage,
  dynamicConfigVisibleColumnsStorage,
} from '@/src/lib/storage'
import { useUIStore } from '@/src/store/use-ui-store'

export const useDynamicConfigsTableLogic = () => {
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

  const dynamicConfigs = useMemo(
    () => data?.pages.flatMap((page) => page?.data ?? []) || [],
    [data],
  )

  const {
    filterValue,
    handleSetFilterValue,
    handleSetStatusFilter,
    handleSetVisibleColumns,
    onRowsPerPageChange,
    onSearchChange,
    page,
    rowsPerPage,
    setPage,
    statusFilter,
    visibleColumns,
  } = useTableState({
    rowsPerPageStorage: dynamicConfigRowsPerPageStorage,
    visibleColumnsStorage: dynamicConfigVisibleColumnsStorage,
  })
  const { setCurrentItemId, setItemSheetOpen, setCurrentItemType } = useUIStore((state) => state)

  const headerColumns = useMemo(
    () => dynamicConfigColumns.filter((column) => visibleColumns.includes(column.uid)),
    [visibleColumns],
  )

  const filteredItems = useFusedItems({
    filterValue,
    items: dynamicConfigs,
    keys: ['name', 'id', 'tags'],
  })

  const pages = Math.ceil(filteredItems.length / rowsPerPage) || 1

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    const end = start + rowsPerPage

    return filteredItems.slice(start, end)
  }, [page, filteredItems, rowsPerPage])

  return {
    error,
    fetchNextPage,
    filterValue,
    handleRefetch: useCallback(() => {
      refetch()
    }, [refetch]),
    handleStatusFilter: handleSetStatusFilter,
    handleVisibleColumns: handleSetVisibleColumns,
    hasNextPage,
    headerColumns,
    isError,
    isFetchingNextPage,
    isLoading,
    items,
    onRowsPerPageChange,
    onSearchChange,
    page,
    pages,
    rowsPerPage,
    setCurrentConfig: useCallback(
      (configId: string) => {
        setCurrentItemId(configId)
        setCurrentItemType('dynamic_config')
        setItemSheetOpen(true)
      },
      [setCurrentItemId, setItemSheetOpen, setCurrentItemType],
    ),
    setFilterValue: handleSetFilterValue,
    setPage,
    statusFilter,
    totalConfigs: dynamicConfigs.length,
    visibleColumns,
  }
}
