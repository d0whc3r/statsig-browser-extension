import { memo, useCallback, useMemo, useState } from 'react'

import type { PaginatedResponse } from '@/src/hooks/use-audit-logs'
import type { AuditLog } from '@/src/types/statsig'

import { useAuditLogFiltering } from '@/src/hooks/use-audit-log-filtering'
import { useAuditLogs } from '@/src/hooks/use-audit-logs'
import { useStore } from '@/src/store/use-store'

import { AuditLogFilters } from './audit-logs/AuditLogFilters'
import { AuditLogList } from './audit-logs/AuditLogList'

export const AuditLogs = memo(() => {
  const [filterValue, setFilterValue] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, refetch } =
    useAuditLogs()

  const { setCurrentAuditLogId, setAuditLogDetailSheetOpen, setAuditLogSheetOpen } = useStore(
    (state) => state,
  )

  const auditLogs = useMemo(
    () => data?.pages.flatMap((page: PaginatedResponse<AuditLog>) => page.data) || [],
    [data],
  )

  const setCurrentAuditLog = useCallback(
    (auditLogId: string) => {
      setCurrentAuditLogId(auditLogId)
      setAuditLogSheetOpen(false)
      setAuditLogDetailSheetOpen(true)
    },
    [setCurrentAuditLogId, setAuditLogSheetOpen, setAuditLogDetailSheetOpen],
  )

  const filteredItems = useAuditLogFiltering(auditLogs, filterValue, actionFilter)

  const handleFilterChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(event.target.value)
  }, [])

  return (
    <div className="w-full overflow-hidden flex flex-col h-full">
      <AuditLogFilters
        filterValue={filterValue}
        onFilterChange={handleFilterChange}
        actionFilter={actionFilter}
        onActionFilterChange={setActionFilter}
        onRefresh={refetch}
        isFetching={isFetching}
      />

      <AuditLogList
        filteredItems={filteredItems}
        filterValue={filterValue}
        actionFilter={actionFilter}
        onViewDetails={setCurrentAuditLog}
        onLoadMore={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </div>
  )
})
AuditLogs.displayName = 'AuditLogs'
