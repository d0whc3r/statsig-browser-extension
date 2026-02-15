import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { AppContent } from '@/entrypoints/popup/App'
import { useUIStore } from '@/src/store/use-ui-store'

import { renderWithProviders } from '../utils/TestUtils'

// Mock sub-components to isolate navigation logic and avoid complex data fetching setup
vi.mock('@/src/components/tables/FeatureGatesTable', () => ({
  FeatureGatesTable: () => <div data-testid="feature-gates-table">Feature Gates Table</div>,
}))
vi.mock('@/src/components/tables/ExperimentsTable', () => ({
  ExperimentsTable: () => <div data-testid="experiments-table">Experiments Table</div>,
}))
vi.mock('@/src/components/tables/DynamicConfigsTable', () => ({
  DynamicConfigsTable: () => <div data-testid="dynamic-configs-table">Dynamic Configs Table</div>,
}))
vi.mock('@/src/components/AuditLogs', () => ({
  AuditLogs: () => <div data-testid="audit-logs">Audit Logs Component</div>,
}))

// Mock API key to bypass login modal
vi.mock('@/src/hooks/use-wxt-storage', () => ({
  useWxtStorage: vi.fn((item) => {
    if (item.key === 'local:statsig-console-api-key') {
      return ['test-api-key', vi.fn(), false]
    }
    return [item.defaultValue, vi.fn(), false]
  }),
}))

describe('Navigation Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useUIStore.setState({
      isAuthModalOpen: false,
      isSettingsSheetOpen: false,
      isUserDetailsSheetOpen: false,
    })
  })

  it('should render default tab (Experiments)', () => {
    renderWithProviders(<AppContent />)

    expect(screen.getByTestId('experiments-table')).toBeInTheDocument()
    expect(screen.queryByTestId('feature-gates-table')).not.toBeInTheDocument()
  })

  it('should switch to Feature Gates tab', async () => {
    renderWithProviders(<AppContent />)

    const featureGatesTab = screen.getByRole('tab', { name: /Feature Gates/i })
    await userEvent.click(featureGatesTab)

    expect(screen.getByTestId('feature-gates-table')).toBeInTheDocument()
    expect(screen.queryByTestId('experiments-table')).not.toBeInTheDocument()
  })

  it('should switch to Dynamic Configs tab', async () => {
    renderWithProviders(<AppContent />)

    const dynamicConfigsTab = screen.getByRole('tab', { name: /Dynamic Configs/i })
    await userEvent.click(dynamicConfigsTab)

    expect(screen.getByTestId('dynamic-configs-table')).toBeInTheDocument()
  })

  it('should open Settings Sheet via menu', async () => {
    renderWithProviders(<AppContent />)

    // The icon button might not have a name, need to check
    // Actually, looking at App.tsx, it's a generic button with SettingsIcon
    // We can find it by class or testid if added.
    // Or we can assume it's one of the few buttons in header.

    // Let's try to find by svg or accessible name if possible.
    // In App.tsx: <Button variant="ghost" size="icon"><Settings ... /></Button>
    // It is wrapped in DropdownMenuTrigger.

    // Let's rely on finding the trigger.
    const menuTrigger = document.querySelector('button[aria-haspopup="menu"]')
    if (!menuTrigger) {
      throw new Error('Menu trigger not found')
    }

    await userEvent.click(menuTrigger)

    const settingsItem = screen.getByText('Settings')
    await userEvent.click(settingsItem)

    expect(useUIStore.getState().isSettingsSheetOpen).toBeTruthy()
  })

  it('should navigate to Audit Logs via menu', async () => {
    renderWithProviders(<AppContent />)

    expect(screen.queryByTestId('audit-logs')).not.toBeInTheDocument()

    const menuTrigger = document.querySelector('button[aria-haspopup="menu"]')
    if (!menuTrigger) {
      throw new Error('Menu trigger not found')
    }

    await userEvent.click(menuTrigger)

    const auditLogsItem = screen.getByRole('menuitem', { name: 'Audit Logs' })
    await userEvent.click(auditLogsItem)

    expect(screen.getByTestId('audit-logs')).toBeInTheDocument()
  })
})
