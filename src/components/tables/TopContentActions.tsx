import { ChevronDown, ExternalLink } from 'lucide-react'
import React, { memo, useCallback } from 'react'

import { Button } from '@/src/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'

import type { Column, StatusOption } from './table-types'

interface TopContentActionsProps {
  type: string
  statusOptions?: StatusOption[]
  statusFilter: Set<string>
  setStatusFilter: (keys: Set<string>) => void
  columns: Column[]
  visibleColumns: Set<string>
  setVisibleColumns: (keys: string[]) => void
}

function capitalize(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

interface StatusFilterItemProps {
  status: StatusOption
  isChecked: boolean
  onChange: (checked: boolean, uid: string) => void
}

const StatusFilterItem = memo(({ status, isChecked, onChange }: StatusFilterItemProps) => {
  const handleChange = useCallback(
    (checked: boolean) => {
      onChange(checked, status.uid)
    },
    [onChange, status.uid],
  )

  return (
    <DropdownMenuCheckboxItem checked={isChecked} onCheckedChange={handleChange}>
      {capitalize(status.name)}
    </DropdownMenuCheckboxItem>
  )
})

StatusFilterItem.displayName = 'StatusFilterItem'

interface ColumnVisibilityItemProps {
  column: Column
  isChecked: boolean
  onChange: (checked: boolean, uid: string) => void
}

const ColumnVisibilityItem = memo(({ column, isChecked, onChange }: ColumnVisibilityItemProps) => {
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

export const TopContentActions = memo(
  ({
    type,
    statusOptions,
    statusFilter,
    setStatusFilter,
    columns,
    visibleColumns,
    setVisibleColumns,
  }: TopContentActionsProps) => {
    const handleStatusFilterChange = useCallback(
      (checked: boolean, statusUid: string) => {
        const newFilter = new Set(statusFilter)
        if (checked) {
          newFilter.add(statusUid)
        } else {
          newFilter.delete(statusUid)
        }
        setStatusFilter(newFilter)
      },
      [statusFilter, setStatusFilter],
    )

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
      <div className="flex gap-3">
        {type === 'experiments' && statusOptions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                Status
                <ChevronDown className="ml-2 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {statusOptions.map((status) => (
                <StatusFilterItem
                  key={status.uid}
                  status={status}
                  isChecked={statusFilter.has(status.uid)}
                  onChange={handleStatusFilterChange}
                />
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              Columns
              <ChevronDown className="ml-2 size-4" />
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
            <ExternalLink className="ml-2 size-4" />
          </a>
        </Button>
      </div>
    )
  },
)

TopContentActions.displayName = 'TopContentActions'
