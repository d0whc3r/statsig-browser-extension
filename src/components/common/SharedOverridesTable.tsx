import type { RowData } from '@tanstack/react-table'

import { ChevronDown, ChevronUp } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

import type { SortableColumnConfig } from '@/src/hooks/use-sorted-table'

import { ConfirmDialog } from '@/src/components/common/ConfirmDialog'
import { SortableTableHeads } from '@/src/components/tables/SortableHeader'
import { Button } from '@/src/components/ui/button'
import { GeneralEmptyState } from '@/src/components/ui/general-empty-state'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/src/components/ui/table'
import { useSortedTable } from '@/src/hooks/use-sorted-table'

interface SharedOverridesTableProps<T extends RowData> {
  items: T[]
  columns: readonly SortableColumnConfig<T>[]
  isCurrentUserPredicate: (item: T) => boolean
  renderRow: (item: T, onDeleteClick: (item: T, isCurrentUser: boolean) => void) => React.ReactNode
  onDeleteConfirm: (item: T) => void
  colSpan: number
  emptyEntityName: string
  getRowId?: (item: T, index: number) => string
}

export function SharedOverridesTable<T extends RowData>({
  items,
  columns,
  isCurrentUserPredicate,
  renderRow,
  onDeleteConfirm,
  colSpan,
  emptyEntityName,
  getRowId,
}: SharedOverridesTableProps<T>) {
  const [showOthers, setShowOthers] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<T | null>(null)
  const { headerColumns, items: sortedItems } = useSortedTable({ columns, data: items, getRowId })

  const toggleOthers = useCallback(() => {
    setShowOthers((prev) => !prev)
  }, [])

  const handleDeleteClick = useCallback(
    (item: T, isCurrentUser: boolean) => {
      if (isCurrentUser) {
        onDeleteConfirm(item)
      } else {
        setConfirmDelete(item)
      }
    },
    [onDeleteConfirm],
  )

  const handleConfirmDelete = useCallback(() => {
    if (confirmDelete) {
      onDeleteConfirm(confirmDelete)
      setConfirmDelete(null)
    }
  }, [confirmDelete, onDeleteConfirm])

  const handleCloseConfirm = useCallback(() => {
    setConfirmDelete(null)
  }, [])

  const { currentUserOverrides, otherOverrides } = useMemo(() => {
    const current: T[] = []
    const others: T[] = []
    for (const item of sortedItems) {
      if (isCurrentUserPredicate(item)) {
        current.push(item)
      } else {
        others.push(item)
      }
    }
    return { currentUserOverrides: current, otherOverrides: others }
  }, [sortedItems, isCurrentUserPredicate])

  const hasOverrides = items.length > 0

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-md border bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <SortableTableHeads columns={headerColumns} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {hasOverrides ? (
              <>
                {currentUserOverrides.map((item) => renderRow(item, handleDeleteClick))}
                {showOthers && otherOverrides.map((item) => renderRow(item, handleDeleteClick))}
              </>
            ) : (
              <TableRow>
                <TableCell colSpan={colSpan} className="h-24 text-center">
                  <div className="flex justify-center">
                    <GeneralEmptyState variant="override" entityName={emptyEntityName} />
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {otherOverrides.length > 0 && (
        <div className="flex justify-center pt-2">
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={toggleOthers}>
            {showOthers ? (
              <>
                <ChevronUp className="mr-2 h-3 w-3" />
                Hide {otherOverrides.length} other overrides
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-3 w-3" />
                Show {otherOverrides.length} other overrides
              </>
            )}
          </Button>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(confirmDelete)}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmDelete}
        title="Delete Override"
        description="This override is for another user. Are you sure you want to delete it?"
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  )
}
