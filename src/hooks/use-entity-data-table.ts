import type { SortingState } from '@tanstack/react-table'

import { useTable } from '@tanstack/react-table'
import { useCallback, useMemo } from 'react'

import type { Column, HeaderColumn } from '@/src/components/tables/table-types'

import {
  createEntityColumnDefs,
  entityTableFeatures,
  toColumnVisibility,
} from '@/src/components/tables/entity-table-features'

interface UseEntityDataTableOptions<T extends { id: string }> {
  columns: readonly Column[]
  data: T[]
  page: number
  rowsPerPage: number
  sorting: SortingState
  visibleColumns: string[]
  onSortingChange: (sorting: SortingState) => void
}

interface VisibleTableColumn {
  id: string
  getCanSort: () => boolean
  getIsSorted: () => false | 'asc' | 'desc'
  getToggleSortingHandler: () => ((event: unknown) => void) | undefined
}

const toHeaderColumns = (tableColumns: VisibleTableColumn[], columns: readonly Column[]): HeaderColumn[] =>
  tableColumns.map((column) => {
    const source = columns.find((item) => item.uid === column.id)
    const canSort = column.getCanSort()

    return {
      canSort,
      name: source?.name ?? column.id,
      onSort: canSort ? column.getToggleSortingHandler() : undefined,
      sortDirection: column.getIsSorted(),
      sortable: source?.sortable,
      uid: column.id,
      width: source?.width,
    }
  })

const paginateItems = <T>(rows: { original: T }[], page: number, rowsPerPage: number) => {
  const pages = Math.ceil(rows.length / rowsPerPage) || 1
  const start = (page - 1) * rowsPerPage

  return {
    items: rows.slice(start, start + rowsPerPage).map((row) => row.original),
    pages,
  }
}

export function useEntityDataTable<T extends { id: string }>({
  columns,
  data,
  onSortingChange,
  page,
  rowsPerPage,
  sorting,
  visibleColumns,
}: UseEntityDataTableOptions<T>) {
  const columnDefs = useMemo(() => createEntityColumnDefs<T>(columns), [columns])
  const columnVisibility = useMemo(() => toColumnVisibility(columns, visibleColumns), [columns, visibleColumns])

  const handleSortingChange = useCallback(
    (updater: SortingState | ((current: SortingState) => SortingState)) => {
      onSortingChange(typeof updater === 'function' ? updater(sorting) : updater)
    },
    [onSortingChange, sorting],
  )

  const table = useTable({
    columns: columnDefs,
    data,
    enableMultiSort: false,
    features: entityTableFeatures,
    getRowId: (row) => row.id,
    onSortingChange: handleSortingChange,
    state: {
      columnVisibility,
      sorting,
    },
  })

  const headerColumns = toHeaderColumns(table.getVisibleLeafColumns(), columns)
  const { items, pages } = paginateItems(table.getRowModel().rows, page, rowsPerPage)

  return { headerColumns, items, pages }
}
