import { AlertCircle } from 'lucide-react'
import React from 'react'

import type { dynamicConfigColumns } from '@/src/components/tables/data'
import type { DynamicConfig } from '@/src/types/statsig'

import { DynamicConfigRow } from '@/src/components/tables/DynamicConfigRow'
import { Button } from '@/src/components/ui/button'
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/src/components/ui/empty'
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
          <Empty className="p-2 border-none">
            <EmptyMedia variant="icon" className="mb-2 mx-auto">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </EmptyMedia>
            <EmptyTitle className="text-sm">Failed to load dynamic configs</EmptyTitle>
            <EmptyDescription className="text-xs">
              {error instanceof Error ? error.message : 'An unknown error occurred'}
            </EmptyDescription>
            <Button variant="outline" size="sm" onClick={handleRetry} className="mt-2">
              Retry
            </Button>
          </Empty>
        </TableCell>
      </TableRow>
    )
  }

  if (items.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={headerColumns.length} className="h-24 text-center">
          No dynamic configs found.
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
