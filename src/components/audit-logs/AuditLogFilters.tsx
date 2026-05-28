import { ExternalLink, Filter, RefreshCw, Search } from 'lucide-react'
import { memo } from 'react'

import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select'
import { cn } from '@/src/lib/utils'

const actionFilterOptions = [
  { label: 'All Actions', value: 'all' },
  { label: 'Create / Start', value: 'create' },
  { label: 'Update / Edit', value: 'update' },
  { label: 'Delete / Archive', value: 'delete' },
  { label: 'Overrides', value: 'override' },
]

interface AuditLogFiltersProps {
  filterValue: string
  onFilterChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  actionFilter: string
  onActionFilterChange: (value: string) => void
  onRefresh: () => void
  isFetching: boolean
}

const HeaderControls = ({ onRefresh, isFetching }: { onRefresh: () => void; isFetching: boolean }) => (
  <div className="flex items-center justify-between">
    <Button variant="ghost" size="sm" onClick={onRefresh} disabled={isFetching} className="h-8 gap-2">
      <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
      Refresh
    </Button>
    <Button variant="outline" size="sm" className="h-8 gap-2" asChild>
      <a href="https://console.statsig.com/" target="_blank" rel="noreferrer">
        Open Statsig
        <ExternalLink className="h-3 w-3" />
      </a>
    </Button>
  </div>
)

const SearchControls = ({
  filterValue,
  onFilterChange,
  actionFilter,
  onActionFilterChange,
}: {
  filterValue: string
  onFilterChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  actionFilter: string
  onActionFilterChange: (value: string) => void
}) => (
  <div className="flex items-center gap-2">
    <div className="relative flex-1">
      <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 transform text-muted-foreground" />
      <Input
        type="search"
        className="h-9 w-full pl-9 text-xs"
        placeholder="Search audit logs..."
        value={filterValue}
        onChange={onFilterChange}
      />
    </div>
    <Select value={actionFilter} onValueChange={onActionFilterChange}>
      <SelectTrigger className="h-9 w-[140px] text-xs">
        <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
        <SelectValue placeholder="Filter" />
      </SelectTrigger>
      <SelectContent>
        {actionFilterOptions.map((option) => (
          <SelectItem key={option.value} value={option.value} className="text-xs">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)

export const AuditLogFilters = memo(
  ({
    filterValue,
    onFilterChange,
    actionFilter,
    onActionFilterChange,
    onRefresh,
    isFetching,
  }: AuditLogFiltersProps) => (
    <div className="flex flex-col gap-3 border-b p-3">
      <HeaderControls onRefresh={onRefresh} isFetching={isFetching} />
      <SearchControls
        filterValue={filterValue}
        onFilterChange={onFilterChange}
        actionFilter={actionFilter}
        onActionFilterChange={onActionFilterChange}
      />
    </div>
  ),
)

AuditLogFilters.displayName = 'AuditLogFilters'
