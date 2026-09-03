import { memo, useMemo } from 'react'

import type { Column, FacetGroup, FacetSelection } from './table-types'

import { TableFilters } from './TableFilters'
import { TopContentActions } from './TopContentActions'
import { TopContentPagination } from './TopContentPagination'
import { TopContentSearch } from './TopContentSearch'

interface TopContentProps {
  filterValue: string
  onRowsPerPageChange: (value: number) => void
  onSearchChange: (value: string) => void
  rowsPerPage: number
  setFilterValue: (value: string) => void
  setVisibleColumns: (keys: string[]) => void
  total: number
  filteredCount: number
  type: 'experiments' | 'dynamicConfigs' | 'featureGates' | 'auditLogs'
  visibleColumns: Set<string>
  columns: readonly Column[]
  facetGroups: FacetGroup[]
  facetFilters: FacetSelection
  onToggleFacet: (facetKey: string, value: string) => void
  onClearFacets: () => void
}

export const TopContent = memo(function TopContent({
  filterValue,
  onRowsPerPageChange,
  onSearchChange,
  rowsPerPage,
  setFilterValue,
  setVisibleColumns,
  total,
  filteredCount,
  type,
  visibleColumns,
  columns,
  facetGroups,
  facetFilters,
  onToggleFacet,
  onClearFacets,
}: TopContentProps) {
  const typeLabel = useMemo(() => {
    switch (type) {
      case 'experiments': {
        return 'experiment'
      }
      case 'dynamicConfigs': {
        return 'dynamic config'
      }
      case 'featureGates': {
        return 'feature gate'
      }
      case 'auditLogs': {
        return 'audit log'
      }
      default: {
        return type
      }
    }
  }, [type])

  const typeLabelPlural = useMemo(() => {
    switch (type) {
      case 'experiments': {
        return 'experiments'
      }
      case 'dynamicConfigs': {
        return 'dynamic configs'
      }
      case 'featureGates': {
        return 'feature gates'
      }
      case 'auditLogs': {
        return 'audit logs'
      }
      default: {
        return type
      }
    }
  }, [type])

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <TopContentSearch
          filterValue={filterValue}
          onSearchChange={onSearchChange}
          setFilterValue={setFilterValue}
          typeLabel={typeLabel}
        />
        <TopContentActions columns={columns} visibleColumns={visibleColumns} setVisibleColumns={setVisibleColumns} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <TableFilters
          facetGroups={facetGroups}
          facetFilters={facetFilters}
          onToggleFacet={onToggleFacet}
          onClearFacets={onClearFacets}
        />
        <TopContentPagination
          total={total}
          filteredCount={filteredCount}
          typeLabelPlural={typeLabelPlural}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </div>
    </div>
  )
})
TopContent.displayName = 'TopContent'
