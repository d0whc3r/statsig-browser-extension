import { useEffect } from 'react'

import { useContextStore } from '@/src/store/use-context-store'

export function useDetectedUser() {
  const setDetectedUser = useContextStore((state) => state.setDetectedUser)

  useEffect(() => {
    // Listen for detected user
    const handleMessage = (message: unknown) => {
      if (
        typeof message === 'object' &&
        message !== null &&
        'type' in message &&
        (message as { type: string }).type === 'STATSIG_USER_FOUND' &&
        'user' in message
      ) {
        setDetectedUser((message as { user: Record<string, unknown> }).user)
      }
    }
    chrome.runtime.onMessage.addListener(handleMessage)

    // Query active tab for user
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTabId = tabs[0]?.id
      if (activeTabId) {
        chrome.tabs.sendMessage(activeTabId, { type: 'GET_STATSIG_USER' }, (response) => {
          if (chrome.runtime.lastError) {
            // Content script might not be ready or not injected
            return
          }
          if (response?.user) {
            setDetectedUser(response.user)
          }
        })
      }
    })

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [setDetectedUser])
}
