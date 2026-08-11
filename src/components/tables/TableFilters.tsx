import { ChevronDown, ListFilter, X } from 'lucide-react'
import { memo, useCallback } from 'react'

import type { FacetGroup, FacetOption, FacetSelection } from '@/src/components/tables/table-types'

import { Button } from '@/src/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { countActiveFacetValues } from '@/src/hooks/use-entity-table-logic.utils'
import { cn } from '@/src/lib/utils'

// Keeps the dropdown open while ticking several values of the same facet.
const preventClose = (event: Event) => {
  event.preventDefault()
}

interface FacetOptionItemProps {
  facetKey: string
  option: FacetOption
  isChecked: boolean
  onToggle: (facetKey: string, value: string) => void
}

const FacetOptionItem = memo(function FacetOptionItem({ facetKey, option, isChecked, onToggle }: FacetOptionItemProps) {
  const handleChange = useCallback(() => {
    onToggle(facetKey, option.value)
  }, [onToggle, facetKey, option.value])

  return (
    <DropdownMenuCheckboxItem checked={isChecked} onCheckedChange={handleChange} onSelect={preventClose}>
      <span className="flex-1 truncate capitalize">{option.label}</span>
      <span className="ml-2 text-xs text-muted-foreground tabular-nums">{option.count}</span>
    </DropdownMenuCheckboxItem>
  )
})
FacetOptionItem.displayName = 'FacetOptionItem'

const NO_SELECTION: string[] = []

interface FacetDropdownProps {
  group: FacetGroup
  selectedValues?: string[]
  onToggle: (facetKey: string, value: string) => void
}

const FacetDropdown = memo(function FacetDropdown({ group, selectedValues, onToggle }: FacetDropdownProps) {
  const selected = selectedValues ?? NO_SELECTION

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('gap-1', selected.length > 0 && 'border-primary text-foreground')}
        >
          {group.label}
          {selected.length > 0 && (
            <span className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground tabular-nums">
              {selected.length}
            </span>
          )}
          <ChevronDown className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-64 w-56 overflow-y-auto">
        {group.options.map((option) => (
          <FacetOptionItem
            key={option.value}
            facetKey={group.key}
            option={option}
            isChecked={selected.includes(option.value)}
            onToggle={onToggle}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
})
FacetDropdown.displayName = 'FacetDropdown'

interface TableFiltersProps {
  facetGroups: FacetGroup[]
  facetFilters: FacetSelection
  onToggleFacet: (facetKey: string, value: string) => void
  onClearFacets: () => void
}

export const TableFilters = memo(function TableFilters({
  facetGroups,
  facetFilters,
  onToggleFacet,
  onClearFacets,
}: TableFiltersProps) {
  if (facetGroups.length === 0) {
    return null
  }

  const activeCount = countActiveFacetValues(facetFilters)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ListFilter className="size-4 text-muted-foreground" />
      {facetGroups.map((group) => (
        <FacetDropdown
          key={group.key}
          group={group}
          selectedValues={facetFilters[group.key]}
          onToggle={onToggleFacet}
        />
      ))}
      {activeCount > 0 && (
        <Button variant="ghost" size="sm" onClick={onClearFacets} className="text-muted-foreground">
          <X className="size-4" />
          Clear
        </Button>
      )}
    </div>
  )
})
TableFilters.displayName = 'TableFilters'
