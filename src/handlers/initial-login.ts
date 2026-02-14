import { api } from '../lib/fetcher'
import { handleApiError } from '../lib/utils'

interface InitialLoginResponse {
  data: unknown
  error?: string
  success: boolean
}

const HTTP_OK = 200
const HTTP_UNAUTHORIZED = 401

/**
 * Verifies the Statsig Console API Key by making a request to the /gates endpoint.
 *
 * @param apiKey - The Statsig Console API Key to verify
 * @returns A promise resolving to the login response indicating success or failure
 */
export const initialLogin = async (apiKey: string): Promise<InitialLoginResponse> => {
  try {
    const { data, status } = await api.get('/gates?limit=1', {
      headers: {
        'STATSIG-API-KEY': apiKey,
      },
    })

    if (status === HTTP_UNAUTHORIZED) {
      return {
        data: undefined,
        error: 'Invalid Statsig Console API Key, please try again with a valid key.',
        success: false,
      }
    }

    if (status !== HTTP_OK) {
      return {
        data: undefined,
        error: 'An unknown error occurred, please try again.',
        success: false,
      }
    }

    return {
      data: data?.data,
      error: undefined,
      success: true,
    }
  } catch (error) {
    console.error('Failed to login:', error)
    return {
      data: undefined,
      error: handleApiError(error),
      success: false,
    }
  }
}
