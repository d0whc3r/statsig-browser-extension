import { memo } from 'react'

import type { AuditLog } from '@/src/types/statsig'

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
  hasNextPage: boolean
  isFetchingNextPage: boolean
  isLoading: boolean
}

const EmptyState = ({
  filterValue,
  actionFilter,
}: {
  filterValue: string
  actionFilter: string
}) => {
  const isFiltered = filterValue || actionFilter !== 'all'

  return <GeneralEmptyState variant={isFiltered ? 'search' : 'audit_log'} />
}

const Footer = ({
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: {
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
}) => {
  if (hasNextPage) {
    return (
      <Button
        variant="secondary"
        onClick={onLoadMore}
        disabled={isFetchingNextPage}
        size="sm"
        className="h-8 w-full"
      >
        {isFetchingNextPage ? 'Loading...' : 'Load More'}
      </Button>
    )
  }
  return (
    <div className="text-center text-muted-foreground text-[10px] font-medium">
      No more audit logs
    </div>
  )
}

const SKELETON_IDS = Array.from({ length: 10 }, (_unused, index) => `skeleton-${index}`)

export const AuditLogList = memo(
  ({
    filteredItems,
    filterValue,
    actionFilter,
    onViewDetails,
    onLoadMore,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  }: AuditLogListProps) => {
    if (isLoading) {
      return (
        <div className="flex-1 overflow-auto min-h-0 divide-y">
          {SKELETON_IDS.map((key) => (
            <div key={key} className="px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 flex-1 max-w-[200px]" />
                  </div>
                  <Skeleton className="h-4 w-3/4 mb-1.5" />
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
      <div className="flex-1 overflow-auto min-h-0">
        {filteredItems.length === 0 ? (
          <EmptyState filterValue={filterValue} actionFilter={actionFilter} />
        ) : (
          <div className="divide-y">
            {filteredItems.map((auditLog) => (
              <AuditLogRow key={auditLog.id} auditLog={auditLog} onViewDetails={onViewDetails} />
            ))}
          </div>
        )}

        {filteredItems.length > 0 && (
          <div className="flex-none p-3 border-t bg-background">
            <Footer
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onLoadMore={onLoadMore}
            />
          </div>
        )}
      </div>
    )
  },
)
AuditLogList.displayName = 'AuditLogList'
