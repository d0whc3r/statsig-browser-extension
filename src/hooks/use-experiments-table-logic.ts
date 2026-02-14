import { useCallback, useMemo } from 'react'

import { experimentColumns, experimentStatusOptions } from '@/src/components/tables/data'
import { useExperiments } from '@/src/hooks/use-experiments'
import { useFusedItems } from '@/src/hooks/use-fused-items'
import { useTableState } from '@/src/hooks/use-table-state'
import { useStore } from '@/src/store/use-store'

export const useExperimentsTableLogic = () => {
  const { data: experiments = [], isLoading } = useExperiments()
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
    initialVisibleColumns: ['name', 'status', 'allocation', 'tags', 'actions'],
    rowsPerPageKey: 'experiments-table-rows-per-page',
    visibleColumnsKey: 'experiments-table-visible-columns',
  })
  const { setCurrentItemId, setItemSheetOpen } = useStore((state) => state)

  const headerColumns = useMemo(
    () => experimentColumns.filter((column) => visibleColumns.includes(column.uid)),
    [visibleColumns],
  )

  const filteredByStatus = useMemo(() => {
    if (statusFilter.size !== experimentStatusOptions.length) {
      return experiments.filter((experiment) => statusFilter.has(experiment.status))
    }
    return experiments
  }, [experiments, statusFilter])

  const filteredItems = useFusedItems({
    filterValue,
    items: filteredByStatus,
    keys: ['name', 'id', 'description', 'hypothesis', 'tags'],
  })

  const pages = Math.ceil(filteredItems.length / rowsPerPage) || 1

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    const end = start + rowsPerPage

    return filteredItems.slice(start, end)
  }, [page, filteredItems, rowsPerPage])

  const setCurrentExperiment = useCallback(
    (experimentId: string) => {
      setCurrentItemId(experimentId)
      setItemSheetOpen(true)
    },
    [setCurrentItemId, setItemSheetOpen],
  )

  return {
    experimentColumns,
    experimentStatusOptions,
    filterValue,
    handleSetFilterValue,
    handleSetStatusFilter,
    handleSetVisibleColumns,
    headerColumns,
    isLoading,
    items,
    onRowsPerPageChange,
    onSearchChange,
    page,
    pages,
    rowsPerPage,
    setCurrentExperiment,
    setPage,
    statusFilter,
    totalExperiments: experiments.length,
    visibleColumns,
  }
}
