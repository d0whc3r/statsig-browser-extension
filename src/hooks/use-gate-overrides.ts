import { useQuery } from '@tanstack/react-query'

import { fetcher } from '@/src/lib/fetcher'
import { handleApiError } from '@/src/lib/utils'

import type { GateOverride } from '../types/statsig'

interface ApiResponse<DataType> {
  data: DataType
}

const fetchGateOverrides = async (gateId: string): Promise<GateOverride> => {
  try {
    const result = await fetcher<ApiResponse<GateOverride>>(`/gates/${gateId}/overrides`)
    return result.data
  } catch (error) {
    throw new Error(handleApiError(error), { cause: error })
  }
}

export const useGateOverrides = (gateId?: string) =>
  useQuery({
    enabled: Boolean(gateId),
    queryFn: () => fetchGateOverrides(gateId!),
    queryKey: ['gate-overrides', gateId],
  })
