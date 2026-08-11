import type { WxtStorageItem } from 'wxt/utils/storage'

import { useCallback } from 'react'

import { toggleFacetSelection } from '@/src/hooks/use-entity-table-logic.utils'
import { usePersistentTableState } from '@/src/hooks/use-persistent-table-state'
import { useTransientTableState } from '@/src/hooks/use-transient-table-state'

interface UseTableStateOptions {
  visibleColumnsStorage: WxtStorageItem<string[], Record<string, unknown>>
  rowsPerPageStorage: WxtStorageItem<number, Record<string, unknown>>
}

export const useTableState = ({ visibleColumnsStorage, rowsPerPageStorage }: UseTableStateOptions) => {
  const { rowsPerPage, setRowsPerPage, setVisibleColumns, visibleColumns } = usePersistentTableState({
    rowsPerPageStorage,
    visibleColumnsStorage,
  })

  const { facetFilters, filterValue, page, setFacetFilters, setFilterValue, setPage } = useTransientTableState()

  const onRowsPerPageChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(event.target.value))
      setPage(1)
    },
    [setRowsPerPage, setPage],
  )

  const onSearchChange = useCallback(
    (value: string) => {
      if (value) {
        setFilterValue(value)
        setPage(1)
      } else {
        setFilterValue('')
      }
    },
    [setFilterValue, setPage],
  )

  const handleSetFilterValue = useCallback(
    (value: string) => {
      setFilterValue(value)
    },
    [setFilterValue],
  )

  const handleToggleFacet = useCallback(
    (facetKey: string, value: string) => {
      setFacetFilters((current) => toggleFacetSelection(current, facetKey, value))
      setPage(1)
    },
    [setFacetFilters, setPage],
  )

  const handleClearFacets = useCallback(() => {
    setFacetFilters({})
    setPage(1)
  }, [setFacetFilters, setPage])

  const handleSetVisibleColumns = useCallback(
    (keys: string[]) => {
      setVisibleColumns(keys)
    },
    [setVisibleColumns],
  )

  return {
    facetFilters,
    filterValue,
    handleClearFacets,
    handleSetFilterValue,
    handleSetVisibleColumns,
    handleToggleFacet,
    onRowsPerPageChange,
    onSearchChange,
    page,
    rowsPerPage,
    setPage,
    visibleColumns,
  }
}
