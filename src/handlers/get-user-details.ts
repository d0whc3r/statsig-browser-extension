import { getUserDetailsFromPage } from '../lib/get-user-details-injector'
import { handleApiError } from '../lib/utils'

export interface UserDetails {
  user: Record<string, unknown>
}

export const getUserDetails = async (tabId: number): Promise<UserDetails | undefined> => {
  try {
    const [result] = await chrome.scripting.executeScript({
      func: getUserDetailsFromPage,
      target: { tabId },
      world: 'MAIN',
    })

    if (result?.result) {
      return result.result as UserDetails
    }
  } catch (error) {
    console.error('Failed to get user details from page', handleApiError(error))
    return undefined
  }
  return undefined
}
