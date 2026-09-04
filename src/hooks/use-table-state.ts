import type { SortingState } from '@tanstack/react-table'
import type { Dispatch, SetStateAction } from 'react'

import { useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'

import type { TableId } from '@/src/store/use-ui-preferences-store'

import { toggleFacetSelection } from '@/src/hooks/use-entity-table-logic.utils'
import { useUiPreferencesStore } from '@/src/store/use-ui-preferences-store'

const useTableMutations = (tableId: TableId) => {
  const updateTable = useUiPreferencesStore((state) => state.updateTable)

  const onRowsPerPageChange = useCallback(
    (value: number) => {
      updateTable(tableId, { page: 1, rowsPerPage: value })
    },
    [tableId, updateTable],
  )

  const onSearchChange = useCallback(
    (value: string) => {
      updateTable(tableId, value ? { filterValue: value, page: 1 } : { filterValue: '' })
    },
    [tableId, updateTable],
  )

  const handleSetFilterValue = useCallback(
    (value: string) => {
      updateTable(tableId, { filterValue: value })
    },
    [tableId, updateTable],
  )

  const handleToggleFacet = useCallback(
    (facetKey: string, value: string) => {
      updateTable(tableId, (current) => ({
        ...current,
        facetFilters: toggleFacetSelection(current.facetFilters, facetKey, value),
        page: 1,
      }))
    },
    [tableId, updateTable],
  )

  const handleClearFacets = useCallback(() => {
    updateTable(tableId, { facetFilters: {}, page: 1 })
  }, [tableId, updateTable])

  const handleSetVisibleColumns = useCallback(
    (keys: string[]) => {
      updateTable(tableId, { visibleColumns: keys })
    },
    [tableId, updateTable],
  )

  const setPage = useCallback<Dispatch<SetStateAction<number>>>(
    (page) => {
      updateTable(tableId, (current) => ({
        ...current,
        page: typeof page === 'function' ? page(current.page) : page,
      }))
    },
    [tableId, updateTable],
  )

  const setSorting = useCallback(
    (sorting: SortingState) => {
      updateTable(tableId, { page: 1, sorting })
    },
    [tableId, updateTable],
  )

  return {
    handleClearAllFilters: useCallback(() => {
      updateTable(tableId, { facetFilters: {}, filterValue: '', page: 1 })
    }, [tableId, updateTable]),
    handleClearFacets,
    handleSetFilterValue,
    handleSetVisibleColumns,
    handleToggleFacet,
    onRowsPerPageChange,
    onSearchChange,
    setPage,
    setSorting,
  }
}

export const useTableState = (tableId: TableId) => {
  const table = useUiPreferencesStore(useShallow((state) => state.tables[tableId]))
  const mutations = useTableMutations(tableId)

  return {
    facetFilters: table.facetFilters,
    filterValue: table.filterValue,
    page: table.page,
    rowsPerPage: table.rowsPerPage,
    sorting: table.sorting,
    visibleColumns: table.visibleColumns,
    ...mutations,
  }
}
