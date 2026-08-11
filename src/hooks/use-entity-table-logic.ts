import type { WxtStorageItem } from 'wxt/utils/storage'

import { useCallback, useMemo } from 'react'

import type { Facet } from '@/src/components/tables/table-types'

import { applyFacetFilters, buildFacetGroups } from '@/src/hooks/use-entity-table-logic.utils'
import { useFusedItems } from '@/src/hooks/use-fused-items'
import { useTableState } from '@/src/hooks/use-table-state'
import { useUIStore } from '@/src/store/use-ui-store'

interface PaginationData<T> {
  pages?: {
    data?: T[]
    pagination?: {
      totalItems?: number
    }
  }[]
}

interface UseEntityTableLogicProps<T> {
  data: unknown
  isLoading: boolean
  isError?: boolean
  error?: unknown
  refetch?: () => void | Promise<unknown>
  fetchNextPage: () => void | Promise<unknown>
  hasNextPage: boolean
  isFetchingNextPage: boolean
  columns: readonly { uid: string; name: string }[]
  facets?: readonly Facet<T>[]
  rowsPerPageStorage: WxtStorageItem<number, Record<string, unknown>>
  visibleColumnsStorage: WxtStorageItem<string[], Record<string, unknown>>
  fusedKeys: string[]
  entityType: 'experiment' | 'feature_gate' | 'dynamic_config'
}

const NO_FACETS = [] as const

export function useEntityTableLogic<T extends { id: string }>({
  data,
  isLoading,
  isError = false,
  error = null,
  refetch,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  columns,
  facets = NO_FACETS,
  rowsPerPageStorage,
  visibleColumnsStorage,
  fusedKeys,
  entityType,
}: UseEntityTableLogicProps<T>) {
  const entities = useMemo<T[]>(() => {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const pData = data as PaginationData<T>
    return pData?.pages?.flatMap((page) => page?.data ?? []) ?? []
  }, [data])

  const totalServerItems = useMemo(() => {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const pData = data as PaginationData<T>
    return pData?.pages?.[0]?.pagination?.totalItems ?? 0
  }, [data])

  const {
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
  } = useTableState({
    rowsPerPageStorage,
    visibleColumnsStorage,
  })

  const { setCurrentItemId, setItemSheetOpen, setCurrentItemType } = useUIStore((state) => state)

  const headerColumns = useMemo(
    () => columns.filter((column) => visibleColumns.includes(column.uid)),
    [visibleColumns, columns],
  )

  const facetGroups = useMemo(() => buildFacetGroups(entities, facets), [entities, facets])

  const filteredItems = useFusedItems<T>({
    filterValue,
    items: useMemo(() => applyFacetFilters(entities, facets, facetFilters), [entities, facets, facetFilters]),
    keys: fusedKeys,
  })

  const pages = Math.ceil(filteredItems.length / rowsPerPage) || 1

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    const end = start + rowsPerPage

    return filteredItems.slice(start, end)
  }, [page, filteredItems, rowsPerPage])

  return {
    entities,
    error,
    facetFilters,
    facetGroups,
    fetchNextPage,
    filterValue,
    filteredCount: filteredItems.length,
    handleClearFacets,
    handleRefetch: useCallback(() => {
      void refetch?.()
    }, [refetch]),
    handleSetFilterValue,
    handleSetVisibleColumns,
    handleToggleFacet,
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
    setCurrentEntity: useCallback(
      (entityId: string) => {
        setCurrentItemId(entityId)
        setCurrentItemType(entityType)
        setItemSheetOpen(true)
      },
      [setCurrentItemId, setItemSheetOpen, setCurrentItemType, entityType],
    ),
    setPage,
    totalItems: totalServerItems > 0 ? totalServerItems : entities.length,
    visibleColumns,
  }
}
