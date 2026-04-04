import React, { memo } from 'react'

interface TopContentPaginationProps {
  total: number
  typeLabelPlural: string
  rowsPerPage: number
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
}

export const TopContentPagination = memo(
  ({ total, typeLabelPlural, rowsPerPage, onRowsPerPageChange }: TopContentPaginationProps) => {
    if (total <= 0) {
      return null
    }

    return (
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Total {total} {typeLabelPlural}
        </span>
        {total > 5 && (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            Rows per page:
            <select
              className="rounded-md border border-input bg-transparent px-2 py-1 text-sm text-muted-foreground outline-none"
              onChange={onRowsPerPageChange}
              value={rowsPerPage}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        )}
      </div>
    )
  },
)
TopContentPagination.displayName = 'TopContentPagination'
