import { QueryClientProvider } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'

import { ErrorBoundary } from '@/src/components/ErrorBoundary'
import { GlobalModals } from '@/src/components/layout/GlobalModals'
import { Header } from '@/src/components/layout/Header'
import { MainTabs } from '@/src/components/layout/MainTabs'
import { useSettingsStorage } from '@/src/hooks/use-settings-storage'
import { queryClient } from '@/src/lib/query-client'
import { useContextStore } from '@/src/store/use-context-store'
import { useUIStore } from '@/src/store/use-ui-store'
// eslint-disable-next-line import/no-unassigned-import
import '@/src/styles/globals.css'

export function AppContent() {
  const { setAuthModalOpen, setItemSheetOpen, setCurrentItemId } = useUIStore((state) => state)
  const { setDetectedUser } = useContextStore((state) => state)

  const { apiKey, setApiKey, isApiKeyLoading } = useSettingsStorage()
  const [activeTab, setActiveTab] = useState('experiments')

  useEffect(() => {
    if (!isApiKeyLoading && !apiKey) {
      setAuthModalOpen(true)
    }
  }, [apiKey, isApiKeyLoading, setAuthModalOpen])

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

  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value)
      // Clear selection when changing tabs to prevent sheet type mismatch
      setItemSheetOpen(false)
      setCurrentItemId(undefined)
    },
    [setItemSheetOpen, setCurrentItemId],
  )

  const handleLogout = useCallback(() => {
    setApiKey('')
    setAuthModalOpen(true)
    // Query cache invalidation is handled by queryClient if needed,
    // But clearing API key usually stops new fetches.
    queryClient.clear()
  }, [setApiKey, setAuthModalOpen])

  return (
    <div className="w-[780px] h-[600px] flex flex-col bg-background text-foreground overflow-hidden">
      <Header onNavigate={setActiveTab} onLogout={handleLogout} />

      <MainTabs activeTab={activeTab} onTabChange={handleTabChange} />

      <GlobalModals />
    </div>
  )
}

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
