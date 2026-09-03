import type { ColumnDef, ColumnVisibilityState } from '@tanstack/react-table'

import {
  columnVisibilityFeature,
  createSortedRowModel,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  tableFeatures,
} from '@tanstack/react-table'

import type { Column } from './table-types'

export const entityTableFeatures = tableFeatures({
  columnVisibilityFeature,
  rowSortingFeature,
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    text: sortFn_text,
  },
  sortedRowModel: createSortedRowModel(),
})

export type EntityTableFeatures = typeof entityTableFeatures

export const toColumnVisibility = (
  columns: readonly { uid: string }[],
  visibleIds: readonly string[],
): ColumnVisibilityState => {
  const visible = new Set(visibleIds)
  return Object.fromEntries(columns.map((column) => [column.uid, visible.has(column.uid)]))
}

export const fromColumnVisibility = (
  columns: readonly { uid: string }[],
  visibility: ColumnVisibilityState,
): string[] => columns.filter((column) => visibility[column.uid] !== false).map((column) => column.uid)

const getColumnSortValue = (row: object, uid: string): unknown => {
  if (uid === 'tags') {
    const tags = 'tags' in row ? row.tags : undefined
    return Array.isArray(tags) ? tags.join(', ') : ''
  }

  return uid in row ? Reflect.get(row, uid) : undefined
}

export const createEntityColumnDefs = <T extends { id: string }>(
  columns: readonly Column[],
): ColumnDef<EntityTableFeatures, T>[] =>
  columns.map((column) => {
    if (column.uid === 'actions') {
      return {
        enableSorting: false,
        header: column.name,
        id: column.uid,
      }
    }

    return {
      accessorFn: (row) => getColumnSortValue(row, column.uid),
      enableSorting: column.sortable === true,
      header: column.name,
      id: column.uid,
    }
  })
