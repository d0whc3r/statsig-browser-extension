import type { Dispatch, SetStateAction } from 'react'

import React, { useCallback } from 'react'

import { BottomContent } from '@/src/components/tables/BottomContent'
import { TopContent } from '@/src/components/tables/TopContent'
import { Button } from '@/src/components/ui/button'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'

interface EntityTableProps {
  columns: readonly { uid: string; name: string }[]
  statusOptions?: readonly { uid: string; name: string }[]
  type: 'experiments' | 'dynamicConfigs' | 'featureGates' | 'auditLogs'
  fetchNextPage: () => void | Promise<unknown>
  filterValue: string
  handleSetFilterValue: (value: string) => void
  handleSetStatusFilter: (value: Set<string>) => void
  handleSetVisibleColumns: (keys: string[]) => void
  hasNextPage: boolean
  headerColumns: readonly { uid: string; name: string }[]
  isFetchingNextPage: boolean
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
  onSearchChange: (value: string) => void
  page: number
  pages: number
  rowsPerPage: number
  setPage: Dispatch<SetStateAction<number>>
  statusFilter: Set<string>
  totalItems: number
  visibleColumns: string[]
  children: React.ReactNode
  loadMoreText: string
}

export function EntityTable({
  columns,
  statusOptions,
  type,
  fetchNextPage,
  filterValue,
  handleSetFilterValue,
  handleSetStatusFilter,
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
  statusFilter,
  totalItems,
  visibleColumns,
  children,
  loadMoreText,
}: EntityTableProps) {
  const handleFetchNextPage = useCallback(() => {
    void fetchNextPage()
  }, [fetchNextPage])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-none p-4 pb-0">
        <TopContent
          filterValue={filterValue}
          onRowsPerPageChange={onRowsPerPageChange}
          onSearchChange={onSearchChange}
          rowsPerPage={rowsPerPage}
          setFilterValue={handleSetFilterValue}
          setStatusFilter={handleSetStatusFilter}
          setVisibleColumns={handleSetVisibleColumns}
          statusFilter={statusFilter}
          total={totalItems}
          type={type}
          visibleColumns={new Set(visibleColumns)}
          columns={columns}
          statusOptions={statusOptions}
        />
      </div>

      <div className="flex-1 overflow-auto min-h-0 p-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {headerColumns.map((column) => (
                  <TableHead
                    key={column.uid}
                    className={column.uid === 'actions' ? 'text-right' : ''}
                  >
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
        <div className="flex-none p-4 pt-0 flex flex-col gap-4">
          <BottomContent page={page} setPage={setPage} total={pages} />
          {hasNextPage && (
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleFetchNextPage}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? 'Loading more...' : loadMoreText}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
