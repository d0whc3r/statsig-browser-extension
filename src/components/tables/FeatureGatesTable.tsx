import React from 'react'

import BottomContent from '@/src/components/tables/BottomContent'
import { featureGateColumns } from '@/src/components/tables/data'
import { FeatureGatesTableBody } from '@/src/components/tables/FeatureGatesTableBody'
import TopContent from '@/src/components/tables/TopContent'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/src/components/ui/table'
import { useFeatureGatesTableLogic } from '@/src/hooks/use-feature-gates-table-logic'

export default function FeatureGatesTable() {
  const {
    error,
    featureGates,
    filterValue,
    handleRetry,
    handleSetFilterValue,
    handleSetStatusFilter,
    handleSetVisibleColumns,
    headerColumns,
    isError,
    isLoading,
    items,
    onRowsPerPageChange,
    onSearchChange,
    page,
    pages,
    rowsPerPage,
    setCurrentFeatureGate,
    setPage,
    statusFilter,
    visibleColumns,
  } = useFeatureGatesTableLogic()

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
          total={featureGates.length}
          type="featureGates"
          visibleColumns={new Set(visibleColumns)}
          columns={featureGateColumns}
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
              <FeatureGatesTableBody
                error={error}
                handleRetry={handleRetry}
                headerColumns={headerColumns}
                isError={isError}
                isLoading={isLoading}
                items={items}
                setCurrentFeatureGate={setCurrentFeatureGate}
              />
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex-none p-4 pt-0">
        <BottomContent page={page} setPage={setPage} total={pages} />
      </div>
    </div>
  )
}
