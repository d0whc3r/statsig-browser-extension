import type { ColumnDef, RowData } from '@tanstack/react-table'

import { useTable } from '@tanstack/react-table'
import { useMemo } from 'react'

import type { HeaderColumn } from '@/src/components/tables/table-types'

import { sortableTableFeatures } from '@/src/components/tables/entity-table-features'

export interface SortableColumnConfig<T extends RowData> {
  id: string
  header: string
  accessor?: (row: T) => unknown
  sortable?: boolean
  className?: string
}

type SortableTableFeatures = typeof sortableTableFeatures

const toSortableColumnDefs = <T extends RowData>(
  columns: readonly SortableColumnConfig<T>[],
): ColumnDef<SortableTableFeatures, T>[] =>
  columns.map((column) => {
    if (!column.accessor) {
      return {
        enableSorting: false,
        header: column.header,
        id: column.id,
      }
    }

    return {
      accessorFn: column.accessor,
      enableSorting: column.sortable !== false,
      header: column.header,
      id: column.id,
    }
  })

interface UseSortedTableOptions<T extends RowData> {
  columns: readonly SortableColumnConfig<T>[]
  data: T[]
  getRowId?: (originalRow: T, index: number) => string
}

export function useSortedTable<T extends RowData>({ columns, data, getRowId }: UseSortedTableOptions<T>) {
  const columnDefs = useMemo(() => toSortableColumnDefs(columns), [columns])

  const table = useTable({
    columns: columnDefs,
    data,
    enableMultiSort: false,
    features: sortableTableFeatures,
    getRowId,
  })

  const headerColumns: HeaderColumn[] = table.getAllLeafColumns().map((column) => {
    const source = columns.find((item) => item.id === column.id)
    const canSort = column.getCanSort()

    return {
      canSort,
      name: source?.header ?? column.id,
      onSort: canSort ? column.getToggleSortingHandler() : undefined,
      sortDirection: column.getIsSorted(),
      sortable: Boolean(source?.accessor) && source?.sortable !== false,
      uid: column.id,
      width: source?.className,
    }
  })

  return {
    headerColumns,
    items: table.getRowModel().rows.map((row) => row.original),
  }
}
