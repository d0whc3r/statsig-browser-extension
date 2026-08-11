import { ChevronDown, ExternalLink } from 'lucide-react'
import React, { memo, useCallback } from 'react'

import { Button } from '@/src/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'

import type { Column } from './table-types'

interface TopContentActionsProps {
  columns: readonly Column[]
  visibleColumns: Set<string>
  setVisibleColumns: (keys: string[]) => void
}

function capitalize(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

interface ColumnVisibilityItemProps {
  column: Column
  isChecked: boolean
  onChange: (checked: boolean, uid: string) => void
}

const ColumnVisibilityItem = memo(function ColumnVisibilityItem({
  column,
  isChecked,
  onChange,
}: ColumnVisibilityItemProps) {
  const handleChange = useCallback(
    (checked: boolean) => {
      onChange(checked, column.uid)
    },
    [onChange, column.uid],
  )

  return (
    <DropdownMenuCheckboxItem checked={isChecked} onCheckedChange={handleChange}>
      {capitalize(column.name)}
    </DropdownMenuCheckboxItem>
  )
})
ColumnVisibilityItem.displayName = 'ColumnVisibilityItem'

export const TopContentActions = memo(function TopContentActions({
  columns,
  visibleColumns,
  setVisibleColumns,
}: TopContentActionsProps) {
  const handleVisibleColumnsChange = useCallback(
    (checked: boolean, columnUid: string) => {
      const newColumns = new Set(visibleColumns)
      if (checked) {
        newColumns.add(columnUid)
      } else {
        newColumns.delete(columnUid)
      }
      setVisibleColumns([...newColumns])
    },
    [visibleColumns, setVisibleColumns],
  )

  return (
    <div className="flex shrink-0 gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Columns
            <ChevronDown className="ml-1 size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {columns.map((column) => (
            <ColumnVisibilityItem
              key={column.uid}
              column={column}
              isChecked={visibleColumns.has(column.uid)}
              onChange={handleVisibleColumnsChange}
            />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button asChild size="sm" className="bg-foreground text-background hover:bg-foreground/90">
        <a href="https://console.statsig.com/" target="_blank" rel="noopener noreferrer">
          Open Statsig
          <ExternalLink className="ml-1 size-4" />
        </a>
      </Button>
    </div>
  )
})
TopContentActions.displayName = 'TopContentActions'
