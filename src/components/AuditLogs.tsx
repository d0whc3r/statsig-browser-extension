import { memo, useCallback, useMemo, useState } from 'react'

import { useAuditLogFiltering } from '@/src/hooks/use-audit-log-filtering'
import { useAuditLogs } from '@/src/hooks/use-audit-logs'
import { useDebounce } from '@/src/hooks/use-debounce'
import { useUIStore } from '@/src/store/use-ui-store'

import { AuditLogFilters } from './audit-logs/AuditLogFilters'
import { AuditLogList } from './audit-logs/AuditLogList'

const FILTER_DEBOUNCE_MS = 700

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

const useAuditLogState = () => {
  const [filterValue, setFilterValue] = useState('')
  const debouncedFilterValue = useDebounce(filterValue, FILTER_DEBOUNCE_MS)
  const [actionFilter, setActionFilter] = useState('all')
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, refetch, isLoading } = useAuditLogs()

  const auditLogs = useMemo(() => data?.pages.flatMap((page) => page?.data ?? []) ?? [], [data])
  const filteredItems = useAuditLogFiltering(auditLogs, debouncedFilterValue, actionFilter)

  return {
    actionFilter,
    debouncedFilterValue,
    fetchNextPage,
    filterValue,
    filteredItems,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    refetch,
    setActionFilter,
    setFilterValue,
  }
}

export const AuditLogs = memo(() => {
  const {
    actionFilter,
    fetchNextPage,
    filterValue,
    filteredItems,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    refetch,
    setActionFilter,
    setFilterValue,
  } = useAuditLogState()

  const { setCurrentAuditLogId, setAuditLogDetailSheetOpen, setAuditLogSheetOpen } = useUIStore((state) => state)

  const setCurrentAuditLog = useCallback(
    (auditLogId: string) => {
      setCurrentAuditLogId(auditLogId)
      setAuditLogSheetOpen(false)
      setAuditLogDetailSheetOpen(true)
    },
    [setCurrentAuditLogId, setAuditLogSheetOpen, setAuditLogDetailSheetOpen],
  )

  const handleFilterChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFilterValue(event.target.value)
    },
    [setFilterValue],
  )

  const { handleLoadMore, handleRefresh, setCurrentAuditLogDetail } = useAuditLogActions(
    fetchNextPage,
    refetch,
    setCurrentAuditLog,
  )

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
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
