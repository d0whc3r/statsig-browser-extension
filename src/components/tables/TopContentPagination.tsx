import React, { memo } from 'react'

interface TopContentPaginationProps {
  total: number
  filteredCount: number
  typeLabelPlural: string
  rowsPerPage: number
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
}

export const TopContentPagination = memo(function TopContentPagination({
  total,
  filteredCount,
  typeLabelPlural,
  rowsPerPage,
  onRowsPerPageChange,
}: TopContentPaginationProps) {
  if (total <= 0) {
    return null
  }

  return (
    <div className="ml-auto flex items-center gap-3">
      <span className="text-sm whitespace-nowrap text-muted-foreground">
        {filteredCount === total ? `${total} ${typeLabelPlural}` : `${filteredCount} of ${total} ${typeLabelPlural}`}
      </span>
      {total > 5 && (
        <label className="flex items-center gap-2 text-sm whitespace-nowrap text-muted-foreground">
          Rows:
          <select
            className="rounded-md border border-input bg-transparent px-2 py-1 text-sm text-muted-foreground outline-none"
            onChange={onRowsPerPageChange}
            value={rowsPerPage}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="25">25</option>
          </select>
        </label>
      )}
    </div>
  )
})
TopContentPagination.displayName = 'TopContentPagination'
