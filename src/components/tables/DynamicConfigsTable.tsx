import { BottomContent } from '@/src/components/tables/BottomContent'
import { dynamicConfigColumns } from '@/src/components/tables/data'
import { DynamicConfigsTableBody } from '@/src/components/tables/DynamicConfigsTableBody'
import { TopContent } from '@/src/components/tables/TopContent'
import { Button } from '@/src/components/ui/button'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'
import { useDynamicConfigsTableLogic } from '@/src/hooks/use-dynamic-configs-table-logic'

export function DynamicConfigsTable() {
  const {
    error,
    fetchNextPage,
    filterValue,
    handleRefetch,
    handleStatusFilter,
    handleVisibleColumns,
    hasNextPage,
    headerColumns,
    isError,
    isFetchingNextPage,
    isLoading,
    items,
    onRowsPerPageChange,
    onSearchChange,
    page,
    pages,
    rowsPerPage,
    setCurrentConfig,
    setFilterValue,
    setPage,
    statusFilter,
    totalConfigs,
    visibleColumns,
  } = useDynamicConfigsTableLogic()

  return (
    <div className="flex flex-col h-full">
      <div className="flex-none p-4 pb-0">
        <TopContent
          filterValue={filterValue}
          onRowsPerPageChange={onRowsPerPageChange}
          onSearchChange={onSearchChange}
          rowsPerPage={rowsPerPage}
          setFilterValue={setFilterValue}
          setStatusFilter={handleStatusFilter}
          setVisibleColumns={handleVisibleColumns}
          statusFilter={statusFilter}
          total={totalConfigs}
          type="dynamicConfigs"
          visibleColumns={new Set(visibleColumns)}
          columns={dynamicConfigColumns}
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
              <DynamicConfigsTableBody
                error={error}
                handleRetry={handleRefetch}
                headerColumns={headerColumns}
                isError={isError}
                isLoading={isLoading}
                items={items}
                setCurrentConfig={setCurrentConfig}
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
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Loading more...' : 'Load More Dynamic Configs'}
          </Button>
        )}
      </div>
    </div>
  )
}
