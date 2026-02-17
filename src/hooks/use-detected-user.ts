import { useEffect, useCallback } from 'react'
import { browser } from 'wxt/browser'

import { getActiveTab } from '@/src/lib/tabs'
import { useContextStore } from '@/src/store/use-context-store'

interface DetectedResponse {
  user?: Record<string, unknown>
  context?: Record<string, unknown>
  error?: string
}

export function useDetectedUser() {
  const setDetectedUser = useContextStore((state) => state.setDetectedUser)
  const setDetectedContext = useContextStore((state) => state.setDetectedContext)
  const setDetectionError = useContextStore((state) => state.setDetectionError)

  const handleResponse = useCallback(
    (response: DetectedResponse | undefined) => {
      if (response?.user) {
        setDetectedUser(response.user)
        setDetectionError(null)
      }
      if (response?.context) {
        setDetectedContext(response.context)
      }
      if (response?.error) {
        setDetectionError(response.error)
      }
    },
    [setDetectedUser, setDetectedContext, setDetectionError],
  )

  const retryDetection = useCallback(async () => {
    console.log('[Statsig Extension] Retrying detection...')
    setDetectionError(null)

    const tab = await getActiveTab()
    if (!tab?.id) {
      console.error('[Statsig Extension] No active tab found')
      return
    }

    await browser.tabs
      .sendMessage(tab.id, { type: 'GET_STATSIG_USER' })
      .then(handleResponse)
      .catch((error) => {
        console.error('Statsig detection error:', error)
        setDetectionError('Connection failed. Please refresh the page.')
      })
  }, [setDetectedUser, setDetectedContext, setDetectionError, handleResponse])

  const fetchUser = useCallback(
    async (retries = 3, delay = 100) => {
      const tab = await getActiveTab()
      const activeTabId = tab?.id

      if (activeTabId) {
        try {
          const response = await browser.tabs.sendMessage(activeTabId, { type: 'GET_STATSIG_USER' })
          handleResponse(response)
        } catch (error) {
          if (retries > 0) {
            setTimeout(() => fetchUser(retries - 1, delay * 2), delay)
          } else {
            console.error('Statsig detection error:', error)
            setDetectionError('Connection failed. Please refresh the page.')
          }
        }
      }
    },
    [handleResponse, setDetectionError],
  )

  useEffect(() => {
    const handleMessage = (message: unknown) => {
      if (typeof message === 'object' && message !== null && 'type' in message) {
        const msg = message as {
          type: string
          user?: Record<string, unknown>
          context?: Record<string, unknown>
          error?: string
        }

        if (msg.type === 'STATSIG_USER_FOUND' && msg.user) {
          setDetectedUser(msg.user)
          if (msg.context) {
            setDetectedContext(msg.context)
          }
          setDetectionError(null)
        } else if (msg.type === 'STATSIG_DETECTED_BUT_ERROR' && msg.error) {
          setDetectionError(msg.error)
        }
      }
    }
    browser.runtime.onMessage.addListener(handleMessage)

    fetchUser()

    return () => {
      browser.runtime.onMessage.removeListener(handleMessage)
    }
  }, [setDetectedUser, setDetectedContext, setDetectionError, fetchUser])

  return { retryDetection }
}
