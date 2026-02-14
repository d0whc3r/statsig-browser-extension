import { Search, X } from 'lucide-react'
import React, { memo, useCallback } from 'react'

import { Input } from '@/src/components/ui/input'

interface TopContentSearchProps {
  filterValue: string
  onSearchChange: (value: string) => void
  setFilterValue: (value: string) => void
  typeLabel: string
}

export const TopContentSearch = memo(
  ({ filterValue, onSearchChange, setFilterValue, typeLabel }: TopContentSearchProps) => {
    const handleSearchChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        onSearchChange(event.target.value)
      },
      [onSearchChange],
    )

    const handleClearSearch = useCallback(() => {
      setFilterValue('')
    }, [setFilterValue])

    return (
      <div className="relative w-full sm:max-w-[44%]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          className="pl-9 pr-9"
          placeholder={`Search ${typeLabel} by name...`}
          value={filterValue}
          onChange={handleSearchChange}
        />
        {filterValue && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    )
  },
)

TopContentSearch.displayName = 'TopContentSearch'
