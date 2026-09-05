import type { Dispatch, SetStateAction } from 'react'

import { memo, useCallback, useMemo } from 'react'

import { useAuditLogFiltering } from '@/src/hooks/use-audit-log-filtering'
import { useAuditLogs } from '@/src/hooks/use-audit-logs'
import { useDebounce } from '@/src/hooks/use-debounce'
import { useUiPreferencesStore } from '@/src/store/use-ui-preferences-store'
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

const useAuditLogPreferences = () => {
  const setAuditLogs = useUiPreferencesStore((state) => state.setAuditLogs)

  return {
    actionFilter: useUiPreferencesStore((state) => state.auditLogs.actionFilter),
    filterValue: useUiPreferencesStore((state) => state.auditLogs.filterValue),
    page: useUiPreferencesStore((state) => state.auditLogs.page),
    rowsPerPage: useUiPreferencesStore((state) => state.auditLogs.rowsPerPage),
    setActionFilter: useCallback(
      (value: string) => {
        setAuditLogs({ actionFilter: value, page: 1 })
      },
      [setAuditLogs],
    ),
    setFilterValue: useCallback(
      (value: string) => {
        setAuditLogs({ filterValue: value, page: 1 })
      },
      [setAuditLogs],
    ),
    setPage: useCallback<Dispatch<SetStateAction<number>>>(
      (value) => {
        setAuditLogs((current) => ({
          ...current,
          page: typeof value === 'function' ? value(current.page) : value,
        }))
      },
      [setAuditLogs],
    ),
    setRowsPerPage: useCallback(
      (value: number) => {
        setAuditLogs({ page: 1, rowsPerPage: value })
      },
      [setAuditLogs],
    ),
  }
}

const useAuditLogState = () => {
  const { actionFilter, filterValue, page, rowsPerPage, setActionFilter, setFilterValue, setPage, setRowsPerPage } =
    useAuditLogPreferences()
  const debouncedFilterValue = useDebounce(filterValue, FILTER_DEBOUNCE_MS)
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, refetch, isLoading } = useAuditLogs()

  const auditLogs = useMemo(() => data?.pages.flatMap((apiPage) => apiPage?.data ?? []) ?? [], [data])
  const filteredItems = useAuditLogFiltering(auditLogs, debouncedFilterValue, actionFilter)

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / rowsPerPage))
  const currentPage = Math.min(page, totalPages)
  const pageItems = useMemo(
    () => filteredItems.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage),
    [filteredItems, currentPage, rowsPerPage],
  )

  return {
    actionFilter,
    fetchNextPage,
    filterValue,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    page: currentPage,
    pageItems,
    refetch,
    rowsPerPage,
    setActionFilter,
    setFilterValue,
    setPage,
    setRowsPerPage,
    totalPages,
  }
}

export const AuditLogs = memo(function AuditLogs() {
  const {
    actionFilter,
    fetchNextPage,
    filterValue,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    page,
    pageItems,
    refetch,
    rowsPerPage,
    setActionFilter,
    setFilterValue,
    setPage,
    setRowsPerPage,
    totalPages,
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

  const handleClearFilters = useCallback(() => {
    setFilterValue('')
    setActionFilter('all')
  }, [setFilterValue, setActionFilter])

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
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={setRowsPerPage}
      />

      <AuditLogList
        filteredItems={pageItems}
        filterValue={filterValue}
        actionFilter={actionFilter}
        onViewDetails={setCurrentAuditLogDetail}
        onLoadMore={handleLoadMore}
        onClearFilters={handleClearFilters}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isLoading={isLoading}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
      />
    </div>
  )
})
AuditLogs.displayName = 'AuditLogs'
