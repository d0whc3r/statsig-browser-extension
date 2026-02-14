import React, { memo, useMemo } from 'react'

import type { Column, StatusOption } from './table-types'

import { TopContentActions } from './TopContentActions'
import { TopContentPagination } from './TopContentPagination'
import { TopContentSearch } from './TopContentSearch'

interface TopContentProps {
  filterValue: string
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
  onSearchChange: (value: string) => void
  rowsPerPage: number
  setFilterValue: (value: string) => void
  setStatusFilter: (keys: Set<string>) => void
  setVisibleColumns: (keys: string[]) => void
  statusFilter: Set<string>
  total: number
  type: 'experiments' | 'dynamicConfigs' | 'featureGates' | 'auditLogs'
  visibleColumns: Set<string>
  columns: Column[]
  statusOptions?: StatusOption[]
}

export const TopContent = memo(
  ({
    filterValue,
    onRowsPerPageChange,
    onSearchChange,
    rowsPerPage,
    setFilterValue,
    setStatusFilter,
    setVisibleColumns,
    statusFilter,
    total,
    type,
    visibleColumns,
    columns,
    statusOptions,
  }: TopContentProps) => {
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
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <TopContentSearch
            filterValue={filterValue}
            onSearchChange={onSearchChange}
            setFilterValue={setFilterValue}
            typeLabel={typeLabel}
          />
          <TopContentActions
            type={type}
            statusOptions={statusOptions}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            columns={columns}
            visibleColumns={visibleColumns}
            setVisibleColumns={setVisibleColumns}
          />
        </div>
        <TopContentPagination
          total={total}
          typeLabelPlural={typeLabelPlural}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </div>
    )
  },
)
TopContent.displayName = 'TopContent'
