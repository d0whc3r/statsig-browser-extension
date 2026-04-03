import { ChevronDown, ChevronUp } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

import { ConfirmDialog } from '@/src/components/common/ConfirmDialog'
import { Button } from '@/src/components/ui/button'
import { GeneralEmptyState } from '@/src/components/ui/general-empty-state'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/src/components/ui/table'

interface SharedOverridesTableProps<T> {
  items: T[]
  isCurrentUserPredicate: (item: T) => boolean
  renderRow: (item: T, onDeleteClick: (item: T, isCurrentUser: boolean) => void) => React.ReactNode
  onDeleteConfirm: (item: T) => void
  headers: React.ReactNode
  colSpan: number
  emptyEntityName: string
}

export function SharedOverridesTable<T>({
  items,
  isCurrentUserPredicate,
  renderRow,
  onDeleteConfirm,
  headers,
  colSpan,
  emptyEntityName,
}: SharedOverridesTableProps<T>) {
  const [showOthers, setShowOthers] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<T | null>(null)

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
    for (const item of items) {
      if (isCurrentUserPredicate(item)) {
        current.push(item)
      } else {
        others.push(item)
      }
    }
    return { currentUserOverrides: current, otherOverrides: others }
  }, [items, isCurrentUserPredicate])

  const hasOverrides = items.length > 0

  return (
    <div className="space-y-2">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>{headers}</TableRow>
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
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={toggleOthers}
          >
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
