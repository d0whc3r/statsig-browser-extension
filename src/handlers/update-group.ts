import type { Group } from '../types/statsig'

import { api } from '../lib/fetcher'
import { handleApiError } from '../lib/utils'

interface UpdateGroupArgs {
  experimentId: string
  groups: Group[]
}

interface UpdateGroupResponse {
  data: unknown
  error?: string
  success: boolean
}

const HTTP_OK = 200
const HTTP_UNAUTHORIZED = 401

export const updateGroup = async ({
  experimentId,
  groups,
}: UpdateGroupArgs): Promise<UpdateGroupResponse> => {
  try {
    const { data, status } = await api.patch(`/experiments/${experimentId}`, {
      groups,
    })

    if (status === HTTP_UNAUTHORIZED) {
      return {
        data: undefined,
        error: 'Invalid Statsig Console API Key, please try again with a valid key.',
        success: false,
      }
    }

    return {
      data: data.data,
      error: undefined,
      success: status === HTTP_OK,
    }
  } catch (error) {
    console.error('Failed to update group:', error)
    return {
      data: undefined,
      error: handleApiError(error),
      success: false,
    }
  }
}
