import React, { memo } from 'react'

interface TopContentPaginationProps {
  total: number
  typeLabelPlural: string
  rowsPerPage: number
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
}

export const TopContentPagination = memo(
  ({ total, typeLabelPlural, rowsPerPage, onRowsPerPageChange }: TopContentPaginationProps) => (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground text-sm">
        Total {total} {typeLabelPlural}
      </span>
      <label className="flex items-center text-muted-foreground text-sm gap-2">
        Rows per page:
        <select
          className="bg-transparent outline-none text-muted-foreground text-sm border border-input rounded-md px-2 py-1"
          onChange={onRowsPerPageChange}
          value={rowsPerPage}
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="15">15</option>
        </select>
      </label>
    </div>
  ),
)

TopContentPagination.displayName = 'TopContentPagination'
