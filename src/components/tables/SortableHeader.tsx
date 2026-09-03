import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

import { Button } from '@/src/components/ui/button'

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

export function SortableHeader({ label, onSort, sortDirection }: SortableHeaderProps) {
  const Icon = sortDirection === false ? ArrowUpDown : sortIcons[sortDirection]

  return (
    <Button
      type="button"
      variant="ghost"
      size="xs"
      className="-ml-2 font-medium tracking-wide text-muted-foreground hover:text-foreground"
      aria-sort={getAriaSort(sortDirection)}
      onClick={onSort}
    >
      {label}
      <Icon />
    </Button>
  )
}
