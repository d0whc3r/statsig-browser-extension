import { handleApiError } from '../lib/utils'

interface ExecuteStorageOpParams {
  tabId: number
  op:
    | 'getLocalStorage'
    | 'setLocalStorage'
    | 'removeLocalStorage'
    | 'getCookie'
    | 'setCookie'
    | 'removeCookie'
  key: string
  value?: string
}

// Helper to execute script safely avoiding inline script CSP violations
const executeStorageOp = async ({ tabId, op, key, value }: ExecuteStorageOpParams) => {
  // 1. Inject args into DOM (ISOLATED world) - Safe from CSP
  await chrome.scripting.executeScript({
    args: [{ key, op, value }],
    func: (args) => {
      const el = document.createElement('div')
      el.id = '__statsig_action_args'
      el.hidden = true
      el.textContent = JSON.stringify(args)
      document.body.append(el)
    },
    target: { tabId },
  })

  // 2. Execute external file (MAIN world) - Allowed by CSP (chrome-extension://...)
  // The file reads the args from DOM, executes logic, and returns result
  const result = await chrome.scripting.executeScript({
    files: ['storage-helper.js'],
    target: { tabId },
    world: 'MAIN',
  })

  // 3. Cleanup DOM (ISOLATED world)
  await chrome.scripting.executeScript({
    func: () => {
      const el = document.querySelector('#__statsig_action_args')
      if (el) {
        el.remove()
      }
    },
    target: { tabId },
  })

  return result[0]?.result
}

export const updateLocalStorageValue = async (
  tabId: number,
  localStorageKey: string,
  localStorageValue: string,
): Promise<void> => {
  try {
    await executeStorageOp({
      key: localStorageKey,
      op: 'setLocalStorage',
      tabId,
      value: localStorageValue,
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
    await executeStorageOp({
      key: localStorageKey,
      op: 'removeLocalStorage',
      tabId,
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
    const result = await executeStorageOp({
      key: localStorageKey,
      op: 'getLocalStorage',
      tabId,
    })
    // eslint-disable-next-line unicorn/no-null
    return (result as string | null) ?? null
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
    await executeStorageOp({
      key: cookieKey,
      op: 'setCookie',
      tabId,
      value: cookieValue,
    })
  } catch (error) {
    console.error('Failed to update cookie value:', handleApiError(error))
    throw new Error(handleApiError(error), { cause: error })
  }
}

export const removeCookieValue = async (tabId: number, cookieKey: string): Promise<void> => {
  try {
    await executeStorageOp({
      key: cookieKey,
      op: 'removeCookie',
      tabId,
    })
  } catch (error) {
    console.error('Failed to remove cookie value:', handleApiError(error))
    throw new Error(handleApiError(error), { cause: error })
  }
}

export const getCurrentCookieValue = async (tabId: number, cookieKey: string): Promise<string> => {
  try {
    const result = await executeStorageOp({
      key: cookieKey,
      op: 'getCookie',
      tabId,
    })
    return (result as string) ?? ''
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
