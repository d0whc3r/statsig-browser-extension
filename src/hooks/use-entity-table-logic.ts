import type { WxtStorageItem } from 'wxt/utils/storage'

import { useCallback, useMemo } from 'react'

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

interface UseEntityTableLogicProps {
  data: unknown
  isLoading: boolean
  isError?: boolean
  error?: unknown
  refetch?: () => void | Promise<unknown>
  fetchNextPage: () => void | Promise<unknown>
  hasNextPage: boolean
  isFetchingNextPage: boolean
  columns: readonly { uid: string; name: string }[]
  statusOptions?: readonly { uid: string; name: string }[]
  rowsPerPageStorage: WxtStorageItem<number, Record<string, unknown>>
  visibleColumnsStorage: WxtStorageItem<string[], Record<string, unknown>>
  fusedKeys: string[]
  entityType: 'experiment' | 'feature_gate' | 'dynamic_config'
}

export function useEntityTableLogic<T extends { id: string; status?: string; tags?: string[] }>({
  data,
  isLoading,
  isError = false,
  error = null,
  refetch,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  columns,
  statusOptions,
  rowsPerPageStorage,
  visibleColumnsStorage,
  fusedKeys,
  entityType,
}: UseEntityTableLogicProps) {
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

  const initialStatusFilter = useMemo(
    () => (statusOptions ? new Set(statusOptions.map((option) => option.uid)) : undefined),
    [statusOptions],
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
    initialStatusFilter,
    rowsPerPageStorage,
    visibleColumnsStorage,
  })

  const { setCurrentItemId, setItemSheetOpen, setCurrentItemType } = useUIStore((state) => state)

  const headerColumns = useMemo(
    () => columns.filter((column) => visibleColumns.includes(column.uid)),
    [visibleColumns, columns],
  )

  const filteredItems = useFusedItems<T>({
    filterValue,
    items: useMemo(() => {
      if (statusOptions && statusFilter.size !== statusOptions.length) {
        return entities.filter((entity) => entity.status && statusFilter.has(entity.status))
      }
      return entities
    }, [entities, statusFilter, statusOptions]),
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
    fetchNextPage,
    filterValue,
    handleRefetch: useCallback(() => {
      void refetch?.()
    }, [refetch]),
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
    setCurrentEntity: useCallback(
      (entityId: string) => {
        setCurrentItemId(entityId)
        setCurrentItemType(entityType)
        setItemSheetOpen(true)
      },
      [setCurrentItemId, setItemSheetOpen, setCurrentItemType, entityType],
    ),
    setPage,
    statusFilter,
    totalItems: totalServerItems > 0 ? totalServerItems : entities.length,
    visibleColumns,
  }
}
