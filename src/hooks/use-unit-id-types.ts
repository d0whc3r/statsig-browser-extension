import { useQuery } from '@tanstack/react-query'

import { getUnitIDTypes } from '@/src/handlers/get-unit-id-types'

// oxlint-disable-next-line no-magic-numbers
const ONE_HOUR_MS = 60 * 60 * 1000

export const useUnitIDTypes = () =>
  useQuery({
    queryFn: getUnitIDTypes,
    queryKey: ['unit-id-types'],
    refetchOnWindowFocus: false,
    // Cache for a long time as these don't change often
    staleTime: ONE_HOUR_MS, // 1 hour
  })
