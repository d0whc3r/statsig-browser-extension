import { QueryClientProvider } from '@tanstack/react-query'
import { useCallback } from 'react'

import { ErrorBoundary } from '@/src/components/ErrorBoundary'
import { GlobalModals } from '@/src/components/layout/GlobalModals'
import { Header } from '@/src/components/layout/Header'
import { MainTabs } from '@/src/components/layout/MainTabs'
import { useAppLogic } from '@/src/hooks/use-app-logic'
import { useTheme } from '@/src/hooks/use-theme'
import { queryClient } from '@/src/lib/query-client'

// oxlint-disable-next-line import/no-unassigned-import
import '../../src/styles/globals.css'

export function AppContent() {
  const { activeTab, handleTabChange, handleLogout } = useAppLogic()
  useTheme()

  const handleLogoutClick = useCallback(() => {
    void handleLogout()
  }, [handleLogout])

  return (
    <div className="flex h-[600px] w-[800px] flex-col overflow-hidden bg-background text-foreground">
      <Header onLogout={handleLogoutClick} />

      <main className="flex min-h-0 flex-1 flex-col">
        <MainTabs activeTab={activeTab} onTabChange={handleTabChange} />
      </main>

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
