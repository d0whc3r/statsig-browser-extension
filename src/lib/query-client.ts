import { QueryClient } from '@tanstack/react-query'

const ONE_SECOND_IN_MS = 1000
const ONE_MINUTE_IN_SECONDS = 60
const ONE_MINUTE_IN_MS = ONE_SECOND_IN_MS * ONE_MINUTE_IN_SECONDS

const GC_TIME_MINUTES = 10
const STALE_TIME_MINUTES = 5

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: GC_TIME_MINUTES * ONE_MINUTE_IN_MS,
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: STALE_TIME_MINUTES * ONE_MINUTE_IN_MS,
    },
  },
})
