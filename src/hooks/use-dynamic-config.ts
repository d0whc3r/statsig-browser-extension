import { useQuery } from '@tanstack/react-query'

import { fetcher } from '@/src/lib/fetcher'
import { handleApiError } from '@/src/lib/utils'

import type { DynamicConfig } from '../types/statsig'

interface ApiResponse<DataType> {
  data: DataType
}

const fetchDynamicConfig = async (configId: string): Promise<DynamicConfig> => {
  try {
    const result = await fetcher<ApiResponse<DynamicConfig>>(`/dynamic_configs/${configId}`)
    return result.data
  } catch (error) {
    throw new Error(handleApiError(error), { cause: error })
  }
}

export const useDynamicConfig = (configId?: string) =>
  useQuery({
    enabled: Boolean(configId),
    queryFn: () => fetchDynamicConfig(configId!),
    queryKey: ['dynamic-config', configId],
  })
