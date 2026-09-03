import { memo, useCallback } from 'react'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select'

const ROW_COUNT_OPTIONS = ['5', '10', '15', '25'] as const

interface TopContentPaginationProps {
  total: number
  filteredCount: number
  typeLabelPlural: string
  rowsPerPage: number
  onRowsPerPageChange: (value: number) => void
}

export const TopContentPagination = memo(function TopContentPagination({
  total,
  filteredCount,
  typeLabelPlural,
  rowsPerPage,
  onRowsPerPageChange,
}: TopContentPaginationProps) {
  const handleValueChange = useCallback(
    (value: string) => {
      onRowsPerPageChange(Number(value))
    },
    [onRowsPerPageChange],
  )

  if (total <= 0) {
    return null
  }

  return (
    <div className="ml-auto flex items-center gap-3">
      <span className="text-sm whitespace-nowrap text-muted-foreground">
        {filteredCount === total ? `${total} ${typeLabelPlural}` : `${filteredCount} of ${total} ${typeLabelPlural}`}
      </span>
      {total > 5 && (
        <div className="flex items-center gap-2 text-sm whitespace-nowrap text-muted-foreground">
          <span>Rows:</span>
          <Select value={String(rowsPerPage)} onValueChange={handleValueChange}>
            <SelectTrigger size="sm" aria-label="Rows per page" className="w-[4.5rem] text-muted-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROW_COUNT_OPTIONS.map((count) => (
                <SelectItem key={count} value={count}>
                  {count}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
})
TopContentPagination.displayName = 'TopContentPagination'
