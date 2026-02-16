import { memo, useCallback, useMemo, useState } from 'react'

import { useAuditLogFiltering } from '@/src/hooks/use-audit-log-filtering'
import { useAuditLogs } from '@/src/hooks/use-audit-logs'
import { useUIStore } from '@/src/store/use-ui-store'

import { AuditLogFilters } from './audit-logs/AuditLogFilters'
import { AuditLogList } from './audit-logs/AuditLogList'

export const AuditLogs = memo(() => {
  const [filterValue, setFilterValue] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, refetch, isLoading } =
    useAuditLogs()

  const { setCurrentAuditLogId, setAuditLogDetailSheetOpen, setAuditLogSheetOpen } = useUIStore(
    (state) => state,
  )

  const auditLogs = useMemo(() => data?.pages.flatMap((page) => page?.data ?? []) || [], [data])

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
        isLoading={isLoading}
      />
    </div>
  )
})
AuditLogs.displayName = 'AuditLogs'
