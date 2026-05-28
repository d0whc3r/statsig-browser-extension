import React from 'react'

import type { GeneralEmptyStateVariant } from '@/src/components/ui/general-empty-state'

import { TableLoadingState } from '@/src/components/tables/TableLoadingState'
import { Button } from '@/src/components/ui/button'
import { GeneralEmptyState } from '@/src/components/ui/general-empty-state'
import { TableCell, TableRow } from '@/src/components/ui/table'

interface EntityRowProps<T> {
  item: T
  headerColumns: readonly { uid: string }[]
  onRowClick: (id: string) => void
}

interface EntityTableBodyProps<T extends { id: string }> {
  headerColumns: readonly { uid: string }[]
  isLoading: boolean
  items: T[]
  onRowClick: (id: string) => void
  emptyVariant: GeneralEmptyStateVariant
  RowComponent: React.ComponentType<EntityRowProps<T>>
  isError?: boolean
  error?: unknown
  onRetry?: () => void
  errorTitle?: string
}

export function EntityTableBody<T extends { id: string }>({
  headerColumns,
  isLoading,
  items,
  onRowClick,
  emptyVariant,
  RowComponent,
  isError,
  error,
  onRetry,
  errorTitle,
}: EntityTableBodyProps<T>) {
  if (isLoading) {
    return <TableLoadingState columnCount={headerColumns.length} />
  }

  if (isError && errorTitle) {
    return (
      <TableRow>
        <TableCell colSpan={headerColumns.length} className="h-24 text-center">
          <GeneralEmptyState
            variant="error"
            title={errorTitle}
            description={error instanceof Error ? error.message : 'An unknown error occurred'}
          >
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
                Retry
              </Button>
            )}
          </GeneralEmptyState>
        </TableCell>
      </TableRow>
    )
  }

  if (items.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={headerColumns.length} className="h-24 text-center">
          <GeneralEmptyState variant={emptyVariant} />
        </TableCell>
      </TableRow>
    )
  }

  return (
    <>
      {items.map((item) => (
        <RowComponent key={item.id} item={item} headerColumns={headerColumns} onRowClick={onRowClick} />
      ))}
    </>
  )
}
