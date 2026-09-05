import type { Dispatch, SetStateAction } from 'react'

import { FilterX } from 'lucide-react'
import { memo } from 'react'

import type { AuditLog } from '@/src/types/statsig'

import { BottomContent } from '@/src/components/tables/BottomContent'
import { Button } from '@/src/components/ui/button'
import { GeneralEmptyState } from '@/src/components/ui/general-empty-state'
import { Skeleton } from '@/src/components/ui/skeleton'

import { AuditLogRow } from './AuditLogRow'

interface AuditLogListProps {
  filteredItems: AuditLog[]
  filterValue: string
  actionFilter: string
  onViewDetails: (id: string) => void
  onLoadMore: () => void
  onClearFilters: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
  isLoading: boolean
  page: number
  setPage: Dispatch<SetStateAction<number>>
  totalPages: number
}

function EmptyState({
  filterValue,
  actionFilter,
  onClearFilters,
}: Readonly<{ filterValue: string; actionFilter: string; onClearFilters: () => void }>) {
  const isFiltered = Boolean(filterValue) || actionFilter !== 'all'

  if (!isFiltered) {
    return <GeneralEmptyState variant="audit_log" />
  }

  return (
    <GeneralEmptyState
      variant="search"
      title="No results with the current filters"
      description="Every audit log is hidden by the active search or filters. Clear them to see all results."
    >
      <Button variant="outline" size="sm" onClick={onClearFilters} className="mt-2">
        <FilterX className="size-4" />
        Clear all filters
      </Button>
    </GeneralEmptyState>
  )
}

function Footer({
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  page,
  setPage,
  totalPages,
}: Readonly<{
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
  page: number
  setPage: Dispatch<SetStateAction<number>>
  totalPages: number
}>) {
  return (
    <div className="flex flex-col gap-2">
      <BottomContent page={page} setPage={setPage} total={totalPages} />
      {hasNextPage && (
        <Button variant="secondary" onClick={onLoadMore} disabled={isFetchingNextPage} size="sm" className="h-8 w-full">
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </Button>
      )}
    </div>
  )
}

const SKELETON_IDS = Array.from({ length: 10 }, (_unused, index) => `skeleton-${index}`)

export const AuditLogList = memo(function AuditLogList({
  filteredItems,
  filterValue,
  actionFilter,
  onViewDetails,
  onLoadMore,
  onClearFilters,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  page,
  setPage,
  totalPages,
}: AuditLogListProps) {
  if (isLoading) {
    return (
      <div className="min-h-0 flex-1 divide-y overflow-auto">
        {SKELETON_IDS.map((key) => (
          <div key={key} className="px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 max-w-[200px] flex-1" />
                </div>
                <Skeleton className="mb-1.5 h-4 w-3/4" />
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-auto">
        {filteredItems.length === 0 ? (
          <EmptyState
            filterValue={filterValue}
            actionFilter={actionFilter}
            // oxlint-disable-next-line react/jsx-handler-names
            onClearFilters={onClearFilters}
          />
        ) : (
          <div className="divide-y">
            {filteredItems.map((auditLog) => (
              <AuditLogRow key={auditLog.id} auditLog={auditLog} onViewDetails={onViewDetails} />
            ))}
          </div>
        )}
      </div>

      {filteredItems.length > 0 && (
        <div className="flex-none border-t bg-background p-3">
          <Footer
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={onLoadMore}
            page={page}
            setPage={setPage}
            totalPages={totalPages}
          />
        </div>
      )}
    </div>
  )
})
AuditLogList.displayName = 'AuditLogList'
