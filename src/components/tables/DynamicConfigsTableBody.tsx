import React from 'react'

import type { dynamicConfigColumns } from '@/src/components/tables/data'
import type { DynamicConfig } from '@/src/types/statsig'

import { DynamicConfigRow } from '@/src/components/tables/DynamicConfigRow'
import { Button } from '@/src/components/ui/button'
import { GeneralEmptyState } from '@/src/components/ui/general-empty-state'
import { TableCell, TableRow } from '@/src/components/ui/table'

interface DynamicConfigsTableBodyProps {
  error: Error | unknown
  handleRetry: () => void
  headerColumns: typeof dynamicConfigColumns
  isError: boolean
  isLoading: boolean
  items: DynamicConfig[]
  setCurrentConfig: (id: string) => void
}

export const DynamicConfigsTableBody = ({
  error,
  handleRetry,
  headerColumns,
  isError,
  isLoading,
  items,
  setCurrentConfig,
}: DynamicConfigsTableBodyProps) => {
  if (isLoading) {
    return (
      <TableRow>
        <TableCell colSpan={headerColumns.length} className="h-24 text-center">
          Loading...
        </TableCell>
      </TableRow>
    )
  }

  if (isError) {
    return (
      <TableRow>
        <TableCell colSpan={headerColumns.length} className="h-24 text-center">
          <GeneralEmptyState
            variant="error"
            title="Failed to load dynamic configs"
            description={error instanceof Error ? error.message : 'An unknown error occurred'}
          >
            <Button variant="outline" size="sm" onClick={handleRetry} className="mt-2">
              Retry
            </Button>
          </GeneralEmptyState>
        </TableCell>
      </TableRow>
    )
  }

  if (items.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={headerColumns.length} className="h-24 text-center">
          <GeneralEmptyState variant="dynamic_config" />
        </TableCell>
      </TableRow>
    )
  }

  return (
    <>
      {items.map((item) => (
        <DynamicConfigRow
          key={item.id}
          item={item}
          headerColumns={headerColumns}
          onRowClick={setCurrentConfig}
        />
      ))}
    </>
  )
}
