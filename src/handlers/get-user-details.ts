import { browser } from 'wxt/browser'

import type { StatsigUser } from '../types/statsig'

import { getUserDetailsFromPage } from '../lib/get-user-details-injector'
import { handleApiError } from '../lib/utils'

export interface UserDetails {
  user: StatsigUser
  context?: Record<string, unknown>
}

export const getUserDetails = async (tabId: number): Promise<UserDetails | undefined> => {
  try {
    const [result] = await browser.scripting.executeScript({
      func: getUserDetailsFromPage,
      target: { tabId },
      world: 'MAIN',
    })

    if (result?.result) {
      return result.result
    }
  } catch (error) {
    // Ignore error when accessing restricted URLs like about:blank
    if (
      error instanceof Error &&
      error.message.includes('Cannot access contents of url "about:blank"')
    ) {
      return undefined
    }
    console.error('Failed to get user details from page', handleApiError(error))
    return undefined
  }
  return undefined
}
