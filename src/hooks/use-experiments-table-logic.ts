import { useCallback, useMemo } from 'react'

import { experimentColumns, experimentStatusOptions } from '@/src/components/tables/data'
import { useExperiments } from '@/src/hooks/use-experiments'
import { useFusedItems } from '@/src/hooks/use-fused-items'
import { useTableState } from '@/src/hooks/use-table-state'
import { experimentsRowsPerPageStorage, experimentsVisibleColumnsStorage } from '@/src/lib/storage'
import { useUIStore } from '@/src/store/use-ui-store'

export const useExperimentsTableLogic = () => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useExperiments()

  const experiments = useMemo(() => data?.pages.flatMap((page) => page.data) || [], [data])

  const totalServerItems = useMemo(() => data?.pages[0]?.pagination.totalItems || 0, [data])

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
    initialStatusFilter: new Set(experimentStatusOptions.map((option) => option.uid)),
    rowsPerPageStorage: experimentsRowsPerPageStorage,
    visibleColumnsStorage: experimentsVisibleColumnsStorage,
  })
  const { setCurrentItemId, setItemSheetOpen, setCurrentItemType } = useUIStore((state) => state)

  const headerColumns = useMemo(
    () => experimentColumns.filter((column) => visibleColumns.includes(column.uid)),
    [visibleColumns],
  )

  const filteredItems = useFusedItems({
    filterValue,
    items: useMemo(() => {
      if (statusFilter.size !== experimentStatusOptions.length) {
        return experiments.filter((experiment) => statusFilter.has(experiment.status))
      }
      return experiments
    }, [experiments, statusFilter]),
    keys: ['name', 'id', 'description', 'hypothesis', 'tags'],
  })

  const pages = Math.ceil(filteredItems.length / rowsPerPage) || 1

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    const end = start + rowsPerPage

    return filteredItems.slice(start, end)
  }, [page, filteredItems, rowsPerPage])

  return {
    experimentColumns,
    experimentStatusOptions,
    fetchNextPage,
    filterValue,
    handleSetFilterValue,
    handleSetStatusFilter,
    handleSetVisibleColumns,
    hasNextPage,
    headerColumns,
    isFetchingNextPage,
    isLoading,
    items,
    onRowsPerPageChange,
    onSearchChange,
    page,
    pages,
    rowsPerPage,
    setCurrentExperiment: useCallback(
      (experimentId: string) => {
        setCurrentItemId(experimentId)
        setCurrentItemType('experiment')
        setItemSheetOpen(true)
      },
      [setCurrentItemId, setItemSheetOpen, setCurrentItemType],
    ),
    setPage,
    statusFilter,
    totalExperiments: totalServerItems > 0 ? totalServerItems : experiments.length,
    visibleColumns,
  }
}
