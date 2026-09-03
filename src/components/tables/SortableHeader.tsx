import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

import type { HeaderColumn } from '@/src/components/tables/table-types'

import { Button } from '@/src/components/ui/button'
import { TableHead } from '@/src/components/ui/table'
import { cn } from '@/src/lib/utils'

interface SortableHeaderProps {
  label: string
  sortDirection: false | 'asc' | 'desc'
  onSort?: (event: unknown) => void
}

export const getAriaSort = (sortDirection: SortableHeaderProps['sortDirection']) => {
  if (sortDirection === 'asc') {
    return 'ascending'
  }
  if (sortDirection === 'desc') {
    return 'descending'
  }
  return 'none'
}

const sortIcons = {
  asc: ArrowUp,
  desc: ArrowDown,
} as const

export function SortableHeader({ label, onSort, sortDirection }: Readonly<SortableHeaderProps>) {
  const Icon = sortDirection === false ? ArrowUpDown : sortIcons[sortDirection]

  return (
    <Button
      type="button"
      variant="ghost"
      size="xs"
      className="-ml-2 font-medium tracking-wide text-muted-foreground hover:text-foreground"
      onClick={onSort}
    >
      {label}
      <Icon />
    </Button>
  )
}

export function SortableTableHeads({ columns }: { columns: readonly HeaderColumn[] }) {
  return columns.map((column) => (
    <TableHead
      key={column.uid}
      className={cn(column.width, column.uid === 'actions' && 'text-right')}
      aria-sort={column.canSort ? getAriaSort(column.sortDirection) : undefined}
    >
      {column.canSort ? (
        <SortableHeader label={column.name} sortDirection={column.sortDirection} onSort={column.onSort} />
      ) : (
        column.name
      )}
    </TableHead>
  ))
}
