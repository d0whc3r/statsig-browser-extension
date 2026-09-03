import { useCallback, useMemo } from 'react'

import type { Column, Facet } from '@/src/components/tables/table-types'
import type { TableId } from '@/src/store/use-ui-preferences-store'

import { useEntityDataTable } from '@/src/hooks/use-entity-data-table'
import { applyFacetFilters, buildFacetGroups, clampPage } from '@/src/hooks/use-entity-table-logic.utils'
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
  columns: readonly Column[]
  facets?: readonly Facet<T>[]
  fusedKeys: string[]
  entityType: 'experiment' | 'feature_gate' | 'dynamic_config'
}

const TABLE_ID_BY_ENTITY = {
  dynamic_config: 'dynamicConfigs',
  experiment: 'experiments',
  feature_gate: 'featureGates',
} as const satisfies Record<UseEntityTableLogicProps<never>['entityType'], TableId>

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
    setSorting,
    sorting,
    visibleColumns,
  } = useTableState(TABLE_ID_BY_ENTITY[entityType])

  const { setCurrentItemId, setItemSheetOpen, setCurrentItemType } = useUIStore((state) => state)

  const facetGroups = useMemo(() => buildFacetGroups(entities, facets), [entities, facets])

  const filteredItems = useFusedItems<T>({
    filterValue,
    items: useMemo(() => applyFacetFilters(entities, facets, facetFilters), [entities, facets, facetFilters]),
    keys: fusedKeys,
  })

  const safePage = clampPage(page, Math.ceil(filteredItems.length / rowsPerPage) || 1)

  const { headerColumns, items, pages } = useEntityDataTable({
    columns,
    data: filteredItems,
    onSortingChange: setSorting,
    page: safePage,
    rowsPerPage,
    sorting,
    visibleColumns,
  })

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
    page: safePage,
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
