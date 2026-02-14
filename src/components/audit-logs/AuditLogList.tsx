import { memo } from 'react'

import type { AuditLog } from '@/src/types/statsig'

import { Button } from '@/src/components/ui/button'
import { GeneralEmptyState } from '@/src/components/ui/general-empty-state'

import { AuditLogRow } from './AuditLogRow'

interface AuditLogListProps {
  filteredItems: AuditLog[]
  filterValue: string
  actionFilter: string
  onViewDetails: (id: string) => void
  onLoadMore: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
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

export const AuditLogList = memo(
  ({
    filteredItems,
    filterValue,
    actionFilter,
    onViewDetails,
    onLoadMore,
    hasNextPage,
    isFetchingNextPage,
  }: AuditLogListProps) => (
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
  ),
)
AuditLogList.displayName = 'AuditLogList'
