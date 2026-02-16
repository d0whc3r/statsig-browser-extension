import React from 'react'

import type { featureGateColumns } from '@/src/components/tables/data'
import type { FeatureGate } from '@/src/types/statsig'

import { FeatureGateRow } from '@/src/components/tables/FeatureGateRow'
import { TableLoadingState } from '@/src/components/tables/TableLoadingState'
import { Button } from '@/src/components/ui/button'
import { GeneralEmptyState } from '@/src/components/ui/general-empty-state'
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
    return <TableLoadingState columnCount={headerColumns.length} />
  }

  if (isError) {
    return (
      <TableRow>
        <TableCell colSpan={headerColumns.length} className="h-24 text-center">
          <GeneralEmptyState
            variant="error"
            title="Failed to load feature gates"
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
          <GeneralEmptyState variant="feature_gate" />
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
