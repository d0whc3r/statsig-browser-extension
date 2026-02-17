import { QueryClientProvider } from '@tanstack/react-query'

import { ErrorBoundary } from '@/src/components/ErrorBoundary'
import { GlobalModals } from '@/src/components/layout/GlobalModals'
import { Header } from '@/src/components/layout/Header'
import { MainTabs } from '@/src/components/layout/MainTabs'
import { useAppLogic } from '@/src/hooks/use-app-logic'
import { queryClient } from '@/src/lib/query-client'
// eslint-disable-next-line import/no-unassigned-import
import '@/src/styles/globals.css'

export function AppContent() {
  const { activeTab, handleTabChange, handleLogout } = useAppLogic()

  return (
    <div className="w-[780px] h-[600px] flex flex-col bg-background text-foreground overflow-hidden">
      <Header onLogout={handleLogout} />

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
