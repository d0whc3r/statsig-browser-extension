import { useCallback } from 'react'

import { BottomContent } from '@/src/components/tables/BottomContent'
import { ExperimentsTableBody } from '@/src/components/tables/ExperimentsTableBody'
import { TopContent } from '@/src/components/tables/TopContent'
import { Button } from '@/src/components/ui/button'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'
import { useExperimentsTableLogic } from '@/src/hooks/use-experiments-table-logic'

export function ExperimentsTable() {
  const {
    experimentColumns,
    experimentStatusOptions,
    fetchNextPage,
    filterValue,
    handleSetFilterValue,
    handleSetStatusFilter,
    handleSetVisibleColumns,
    hasNextPage,
    headerColumns,
    isFetchingNextPage,
    isLoading,
    items,
    onRowsPerPageChange,
    onSearchChange,
    page,
    pages,
    rowsPerPage,
    setCurrentExperiment,
    setPage,
    statusFilter,
    totalExperiments,
    visibleColumns,
  } = useExperimentsTableLogic()

  const handleFetchNextPage = useCallback(() => {
    fetchNextPage()
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
          total={totalExperiments}
          type="experiments"
          visibleColumns={new Set(visibleColumns)}
          columns={experimentColumns}
          statusOptions={experimentStatusOptions}
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
            <TableBody>
              <ExperimentsTableBody
                headerColumns={headerColumns}
                isLoading={isLoading}
                items={items}
                setCurrentExperiment={setCurrentExperiment}
              />
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex-none p-4 pt-0 flex flex-col gap-4">
        <BottomContent page={page} setPage={setPage} total={pages} />
        {hasNextPage && (
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleFetchNextPage}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Loading more...' : 'Load More Experiments'}
          </Button>
        )}
      </div>
    </div>
  )
}
