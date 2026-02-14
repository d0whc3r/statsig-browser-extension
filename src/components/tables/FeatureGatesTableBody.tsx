import { AlertCircle } from 'lucide-react'
import React from 'react'

import type { featureGateColumns } from '@/src/components/tables/data'
import type { FeatureGate } from '@/src/types/statsig'

import { FeatureGateRow } from '@/src/components/tables/FeatureGateRow'
import { Button } from '@/src/components/ui/button'
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/src/components/ui/empty'
import { TableCell, TableRow } from '@/src/components/ui/table'

interface FeatureGatesTableBodyProps {
  error: Error | unknown
  handleRetry: () => void
  headerColumns: typeof featureGateColumns
  isError: boolean
  isLoading: boolean
  items: FeatureGate[]
  setCurrentFeatureGate: (id: string) => void
}

export const FeatureGatesTableBody = ({
  error,
  handleRetry,
  headerColumns,
  isError,
  isLoading,
  items,
  setCurrentFeatureGate,
}: FeatureGatesTableBodyProps) => {
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
            <EmptyTitle className="text-sm">Failed to load feature gates</EmptyTitle>
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
          No feature gates found.
        </TableCell>
      </TableRow>
    )
  }

  return (
    <>
      {items.map((item) => (
        <FeatureGateRow
          key={item.id}
          item={item}
          headerColumns={headerColumns}
          onRowClick={setCurrentFeatureGate}
        />
      ))}
    </>
  )
}
