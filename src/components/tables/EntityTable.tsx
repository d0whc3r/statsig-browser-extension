import type { Dispatch, SetStateAction } from 'react'

import React, { useCallback } from 'react'

import type { Column, FacetGroup, FacetSelection } from '@/src/components/tables/table-types'

import { BottomContent } from '@/src/components/tables/BottomContent'
import { TopContent } from '@/src/components/tables/TopContent'
import { Button } from '@/src/components/ui/button'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'
import { cn } from '@/src/lib/utils'

interface EntityTableProps {
  columns: readonly Column[]
  type: 'experiments' | 'dynamicConfigs' | 'featureGates' | 'auditLogs'
  fetchNextPage: () => void | Promise<unknown>
  filterValue: string
  facetGroups: FacetGroup[]
  facetFilters: FacetSelection
  handleToggleFacet: (facetKey: string, value: string) => void
  handleClearFacets: () => void
  handleSetFilterValue: (value: string) => void
  handleSetVisibleColumns: (keys: string[]) => void
  hasNextPage: boolean
  headerColumns: readonly Column[]
  isFetchingNextPage: boolean
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
  onSearchChange: (value: string) => void
  page: number
  pages: number
  rowsPerPage: number
  setPage: Dispatch<SetStateAction<number>>
  totalItems: number
  filteredCount: number
  visibleColumns: string[]
  children: React.ReactNode
  loadMoreText: string
}

export function EntityTable({
  columns,
  type,
  fetchNextPage,
  filterValue,
  facetGroups,
  facetFilters,
  handleToggleFacet,
  handleClearFacets,
  handleSetFilterValue,
  handleSetVisibleColumns,
  hasNextPage,
  headerColumns,
  isFetchingNextPage,
  onRowsPerPageChange,
  onSearchChange,
  page,
  pages,
  rowsPerPage,
  setPage,
  totalItems,
  filteredCount,
  visibleColumns,
  children,
  loadMoreText,
}: EntityTableProps) {
  const handleFetchNextPage = useCallback(() => {
    void fetchNextPage()
  }, [fetchNextPage])

  return (
    <div className="flex h-full flex-col">
      <div className="flex-none px-4 pt-3 pb-2">
        <TopContent
          filterValue={filterValue}
          onRowsPerPageChange={onRowsPerPageChange}
          onSearchChange={onSearchChange}
          rowsPerPage={rowsPerPage}
          setFilterValue={handleSetFilterValue}
          setVisibleColumns={handleSetVisibleColumns}
          total={totalItems}
          filteredCount={filteredCount}
          type={type}
          visibleColumns={new Set(visibleColumns)}
          columns={columns}
          facetGroups={facetGroups}
          facetFilters={facetFilters}
          onToggleFacet={handleToggleFacet}
          onClearFacets={handleClearFacets}
        />
      </div>

      <div className="min-h-0 flex-1 px-4 pb-2">
        <div className="h-full overflow-hidden rounded-md border">
          <Table className="table-fixed" containerClassName="h-full overflow-y-auto">
            <TableHeader>
              <TableRow>
                {headerColumns.map((column) => (
                  <TableHead key={column.uid} className={cn(column.width, column.uid === 'actions' && 'text-right')}>
                    {column.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>{children}</TableBody>
          </Table>
        </div>
      </div>
      {(pages > 1 || hasNextPage) && (
        <div className="flex flex-none flex-col gap-2 px-4 pb-3">
          <BottomContent page={page} setPage={setPage} total={pages} />
          {hasNextPage && (
            <Button variant="secondary" className="w-full" onClick={handleFetchNextPage} disabled={isFetchingNextPage}>
              {isFetchingNextPage ? 'Loading more...' : loadMoreText}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
