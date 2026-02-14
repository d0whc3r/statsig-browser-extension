import { useCallback, useMemo } from 'react'

import { dynamicConfigColumns } from '@/src/components/tables/data'
import { useDynamicConfigs } from '@/src/hooks/use-dynamic-configs'
import { useFusedItems } from '@/src/hooks/use-fused-items'
import { useTableState } from '@/src/hooks/use-table-state'
import { useStore } from '@/src/store/use-store'

export const useDynamicConfigsTableLogic = () => {
  const { data: dynamicConfigs = [], isLoading, isError, error, refetch } = useDynamicConfigs()
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
    initialVisibleColumns: ['name', 'tags', 'isEnabled', 'actions'],
    rowsPerPageKey: 'dynamic-config-table-rows-per-page',
    visibleColumnsKey: 'dynamic-config-table-visible-columns',
  })
  const { setCurrentItemId, setItemSheetOpen } = useStore((state) => state)

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

  const setCurrentConfig = useCallback(
    (configId: string) => {
      setCurrentItemId(configId)
      setItemSheetOpen(true)
    },
    [setCurrentItemId, setItemSheetOpen],
  )

  const handleRefetch = useCallback(() => {
    refetch()
  }, [refetch])

  return {
    error,
    filterValue,
    handleRefetch,
    handleStatusFilter: handleSetStatusFilter,
    handleVisibleColumns: handleSetVisibleColumns,
    headerColumns,
    isError,
    isLoading,
    items,
    onRowsPerPageChange,
    onSearchChange,
    page,
    pages,
    rowsPerPage,
    setCurrentConfig,
    setFilterValue: handleSetFilterValue,
    setPage,
    statusFilter,
    visibleColumns,
  }
}
