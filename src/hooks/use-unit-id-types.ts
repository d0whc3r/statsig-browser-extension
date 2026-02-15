import { useQuery } from '@tanstack/react-query'

import { getUnitIDTypes } from '@/src/handlers/get-unit-id-types'

export const useUnitIDTypes = () =>
  useQuery({
    queryFn: getUnitIDTypes,
    queryKey: ['unit-id-types'],
    // Cache for a long time as these don't change often
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
  })
