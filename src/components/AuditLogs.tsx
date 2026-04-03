import { memo, useCallback, useMemo, useState } from 'react'

import { useAuditLogFiltering } from '@/src/hooks/use-audit-log-filtering'
import { useAuditLogs } from '@/src/hooks/use-audit-logs'
import { useUIStore } from '@/src/store/use-ui-store'

import { AuditLogFilters } from './audit-logs/AuditLogFilters'
import { AuditLogList } from './audit-logs/AuditLogList'

const useAuditLogActions = (
  fetchNextPage: () => Promise<unknown>,
  refetch: () => Promise<unknown>,
  setCurrentAuditLogDetail: (auditLogId: string) => void,
) => {
  const handleLoadMore = useCallback(() => {
    void fetchNextPage()
  }, [fetchNextPage])

  const handleRefresh = useCallback(() => {
    void refetch()
  }, [refetch])

  return {
    handleLoadMore,
    handleRefresh,
    setCurrentAuditLogDetail,
  }
}

export const AuditLogs = memo(() => {
  const [filterValue, setFilterValue] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, refetch, isLoading } =
    useAuditLogs()

  const { setCurrentAuditLogId, setAuditLogDetailSheetOpen, setAuditLogSheetOpen } = useUIStore(
    (state) => state,
  )

  const auditLogs = useMemo(() => data?.pages.flatMap((page) => page?.data ?? []) ?? [], [data])

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
  const { handleLoadMore, handleRefresh, setCurrentAuditLogDetail } = useAuditLogActions(
    fetchNextPage,
    refetch,
    setCurrentAuditLog,
  )

  return (
    <div className="w-full overflow-hidden flex flex-col h-full">
      <AuditLogFilters
        filterValue={filterValue}
        onFilterChange={handleFilterChange}
        actionFilter={actionFilter}
        onActionFilterChange={setActionFilter}
        onRefresh={handleRefresh}
        isFetching={isFetching}
      />

      <AuditLogList
        filteredItems={filteredItems}
        filterValue={filterValue}
        actionFilter={actionFilter}
        onViewDetails={setCurrentAuditLogDetail}
        onLoadMore={handleLoadMore}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isLoading={isLoading}
      />
    </div>
  )
})
AuditLogs.displayName = 'AuditLogs'
