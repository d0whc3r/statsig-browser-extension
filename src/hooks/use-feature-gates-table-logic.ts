import { useCallback, useMemo } from 'react'

import { featureGateColumns } from '@/src/components/tables/data'
import { useFeatureGates } from '@/src/hooks/use-feature-gates'
import { useFusedItems } from '@/src/hooks/use-fused-items'
import { useTableState } from '@/src/hooks/use-table-state'
import { useUIStore } from '@/src/store/use-ui-store'

export const useFeatureGatesTableLogic = () => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeatureGates()

  const featureGates = useMemo(() => data?.pages.flatMap((page) => page.data) || [], [data])

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
    initialVisibleColumns: ['name', 'tags', 'status', 'isEnabled', 'actions'],
    rowsPerPageKey: 'feature-gate-table-rows-per-page',
    visibleColumnsKey: 'feature-gate-table-visible-columns',
  })

  const { setCurrentItemId, setItemSheetOpen, setCurrentItemType } = useUIStore((state) => state)

  const headerColumns = useMemo(
    () => featureGateColumns.filter((column) => visibleColumns.includes(column.uid)),
    [visibleColumns],
  )

  const filteredGates = useFusedItems({
    filterValue,
    items: featureGates,
    keys: ['name', 'id', 'description', 'tags'],
  })

  const pages = Math.ceil(filteredGates.length / rowsPerPage) || 1

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    const end = start + rowsPerPage

    return filteredGates.slice(start, end)
  }, [page, filteredGates, rowsPerPage])

  const setCurrentFeatureGate = useCallback(
    (featureGateId: string) => {
      setCurrentItemId(featureGateId)
      setCurrentItemType('feature_gate')
      setItemSheetOpen(true)
    },
    [setCurrentItemId, setItemSheetOpen, setCurrentItemType],
  )

  const handleRetry = useCallback(() => {
    refetch()
  }, [refetch])

  return {
    error,
    featureGates,
    fetchNextPage,
    filterValue,
    handleRetry,
    handleSetFilterValue,
    handleSetStatusFilter,
    handleSetVisibleColumns,
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
    setCurrentFeatureGate,
    setPage,
    statusFilter,
    visibleColumns,
  }
}
