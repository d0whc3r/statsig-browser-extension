import { ExternalLink, Filter, RefreshCw, Search } from 'lucide-react'
import { memo } from 'react'

import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'

export const actionFilterOptions = [
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

const HeaderControls = ({
  onRefresh,
  isFetching,
}: {
  onRefresh: () => void
  isFetching: boolean
}) => (
  <div className="flex justify-between items-center">
    <Button
      variant="ghost"
      size="sm"
      onClick={onRefresh}
      disabled={isFetching}
      className="h-8 gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
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
  <div className="flex gap-2">
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
      <Input
        className="w-full pl-9 h-8 text-xs"
        placeholder="Search audit logs..."
        value={filterValue}
        onChange={onFilterChange}
      />
    </div>
    <Select value={actionFilter} onValueChange={onActionFilterChange}>
      <SelectTrigger className="w-[140px] h-8 text-xs">
        <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
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
    <div className="flex flex-col gap-3 p-3 border-b">
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
