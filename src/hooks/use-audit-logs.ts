import { useInfiniteQuery } from '@tanstack/react-query'

import { useSettingsStorage } from '@/src/hooks/use-settings-storage'
import { fetcher } from '@/src/lib/fetcher'
import { handleApiError } from '@/src/lib/utils'

import type { AuditLog } from '../types/statsig'

const PAGE_LIMIT = 50

export interface PaginatedResponse<ItemType> {
  data: ItemType[]
  pagination: {
    totalItems: number
    page: number
    limit: number
  }
}

/**
 * Fetches a single page of audit logs from the Statsig API.
 *
 * @param apiKey - The Statsig Console API Key
 * @param page - The page number to fetch
 * @returns A promise resolving to the paginated audit logs response
 * @throws Error if the fetch fails
 */
const fetchAuditLogsPage = async (page: number): Promise<PaginatedResponse<AuditLog>> => {
  try {
    return await fetcher<PaginatedResponse<AuditLog>>(
      `/audit_logs?limit=${PAGE_LIMIT}&page=${page}`,
    )
  } catch (error) {
    throw new Error(handleApiError(error), { cause: error })
  }
}

/**
 * React Query hook to fetch audit logs using infinite scrolling.
 * Uses the stored API key or an optional override.
 *
 * @returns The Infinite React Query result containing the audit logs pages
 */
export const useAuditLogs = () => {
  const { apiKey } = useSettingsStorage()

  return useInfiniteQuery({
    enabled: Boolean(apiKey),
    getNextPageParam: (lastPage: PaginatedResponse<AuditLog>) => {
      if (!lastPage?.pagination) {
        return
      }
      const currentTotal = lastPage.pagination.page * lastPage.pagination.limit
      if (currentTotal < lastPage.pagination.totalItems) {
        return lastPage.pagination.page + 1
      }
    },
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchAuditLogsPage(pageParam),
    queryKey: ['audit-logs'],
  })
}
