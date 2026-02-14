import {
  deleteCookieValue,
  deleteLocalStorageValue,
  getCookieValue,
  getLocalStorageValue,
  setCookieValue,
  setLocalStorageValue,
} from '../lib/local-storage-injector'
import { handleApiError } from '../lib/utils'

export const updateLocalStorageValue = async (
  tabId: number,
  localStorageKey: string,
  localStorageValue: string,
): Promise<void> => {
  try {
    await chrome.scripting.executeScript({
      args: [localStorageKey, localStorageValue],
      func: setLocalStorageValue,
      target: { tabId },
      world: 'MAIN',
    })
  } catch (error) {
    console.error('Failed to update localStorage value:', handleApiError(error))
    throw new Error(handleApiError(error), { cause: error })
  }
}

export const removeLocalStorageValue = async (
  tabId: number,
  localStorageKey: string,
): Promise<void> => {
  try {
    await chrome.scripting.executeScript({
      args: [localStorageKey],
      func: deleteLocalStorageValue,
      target: { tabId },
      world: 'MAIN',
    })
  } catch (error) {
    console.error('Failed to remove localStorage value:', handleApiError(error))
    throw new Error(handleApiError(error), { cause: error })
  }
}

export const getCurrentLocalStorageValue = async (
  tabId: number,
  localStorageKey: string,
): Promise<string | null> => {
  try {
    const result = await chrome.scripting.executeScript({
      args: [localStorageKey],
      func: getLocalStorageValue,
      target: { tabId },
      world: 'MAIN',
    })
    // eslint-disable-next-line unicorn/no-null
    return result[0]?.result ?? null
  } catch (error) {
    console.error('Failed to get localStorage value:', handleApiError(error))
    throw new Error(handleApiError(error), { cause: error })
  }
}

export const updateCookieValue = async (
  tabId: number,
  cookieKey: string,
  cookieValue: string,
): Promise<void> => {
  try {
    await chrome.scripting.executeScript({
      args: [cookieKey, cookieValue],
      func: setCookieValue,
      target: { tabId },
      world: 'MAIN',
    })
  } catch (error) {
    console.error('Failed to update cookie value:', handleApiError(error))
    throw new Error(handleApiError(error), { cause: error })
  }
}

export const removeCookieValue = async (tabId: number, cookieKey: string): Promise<void> => {
  try {
    await chrome.scripting.executeScript({
      args: [cookieKey],
      func: deleteCookieValue,
      target: { tabId },
      world: 'MAIN',
    })
  } catch (error) {
    console.error('Failed to remove cookie value:', handleApiError(error))
    throw new Error(handleApiError(error), { cause: error })
  }
}

export const getCurrentCookieValue = async (tabId: number, cookieKey: string): Promise<string> => {
  try {
    const result = await chrome.scripting.executeScript({
      args: [cookieKey],
      func: getCookieValue,
      target: { tabId },
      world: 'MAIN',
    })
    return result[0]?.result ?? ''
  } catch (error) {
    console.error('Failed to get cookie value:', handleApiError(error))
    throw new Error(handleApiError(error), { cause: error })
  }
}

export const updateStorageValue = ({
  tabId,
  storageKey,
  storageValue,
  storageType,
}: {
  tabId: number
  storageKey: string
  storageValue: string
  storageType: 'cookie' | 'localStorage'
}): Promise<void> => {
  if (storageType === 'localStorage') {
    return updateLocalStorageValue(tabId, storageKey, storageValue)
  }
  return updateCookieValue(tabId, storageKey, storageValue)
}

export const removeStorageValue = (
  tabId: number,
  storageKey: string,
  storageType: 'cookie' | 'localStorage',
): Promise<void> => {
  if (storageType === 'localStorage') {
    return removeLocalStorageValue(tabId, storageKey)
  }
  return removeCookieValue(tabId, storageKey)
}

export const getCurrentStorageValue = (
  tabId: number,
  storageKey: string,
  storageType: 'cookie' | 'localStorage',
): Promise<string | null> => {
  if (storageType === 'localStorage') {
    return getCurrentLocalStorageValue(tabId, storageKey)
  }
  return getCurrentCookieValue(tabId, storageKey)
}
