import type { WxtStorageItem } from 'wxt/utils/storage'

import { useCallback } from 'react'

import type { FacetSelection } from '@/src/components/tables/table-types'

import { useWxtStorage } from '@/src/hooks/use-wxt-storage'

interface UsePersistentTableStateOptions {
  visibleColumnsStorage: WxtStorageItem<string[], Record<string, unknown>>
  rowsPerPageStorage: WxtStorageItem<number, Record<string, unknown>>
  filterValueStorage: WxtStorageItem<string, Record<string, unknown>>
  facetFiltersStorage: WxtStorageItem<FacetSelection, Record<string, unknown>>
}

export const usePersistentTableState = ({
  visibleColumnsStorage,
  rowsPerPageStorage,
  filterValueStorage,
  facetFiltersStorage,
}: UsePersistentTableStateOptions) => {
  const [visibleColumns, setVisibleColumns] = useWxtStorage<string[]>(visibleColumnsStorage)
  const [rowsPerPage, setRowsPerPage] = useWxtStorage<number>(rowsPerPageStorage)
  const [filterValue, setFilterValue] = useWxtStorage<string>(filterValueStorage)
  const [facetFilters, persistFacetFilters] = useWxtStorage<FacetSelection>(facetFiltersStorage)

  const setFacetFilters = useCallback(
    (update: FacetSelection | ((current: FacetSelection) => FacetSelection)) => {
      persistFacetFilters(typeof update === 'function' ? update(facetFilters) : update)
    },
    [facetFilters, persistFacetFilters],
  )

  return {
    facetFilters,
    filterValue,
    rowsPerPage,
    setFacetFilters,
    setFilterValue,
    setRowsPerPage,
    setVisibleColumns,
    visibleColumns,
  }
}
