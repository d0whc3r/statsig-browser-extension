import { screen } from '@testing-library/react'

import { AppContent } from '@/entrypoints/popup/App'
import { useUIStore } from '@/src/store/use-ui-store'

import { renderWithProviders } from '../utils/TestUtils'

// Mock sub-components to isolate navigation logic and avoid complex data fetching setup
vi.mock(import('@/src/components/tables/FeatureGatesTable'), () => ({
  FeatureGatesTable: () => <div data-testid="feature-gates-table">Feature Gates Table</div>,
}))
vi.mock(import('@/src/components/tables/ExperimentsTable'), () => ({
  ExperimentsTable: () => <div data-testid="experiments-table">Experiments Table</div>,
}))
vi.mock(import('@/src/components/tables/DynamicConfigsTable'), () => ({
  DynamicConfigsTable: () => <div data-testid="dynamic-configs-table">Dynamic Configs Table</div>,
}))
vi.mock(import('@/src/components/AuditLogs'), async (importOriginal) => ({
  ...(await importOriginal()),
  AuditLogs: () => <div data-testid="audit-logs">Audit Logs Component</div>,
}))

// Mock API key to bypass login modal
vi.mock(import('@/src/hooks/use-wxt-storage'), async (importOriginal) => ({
  ...(await importOriginal()),
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
    const { user } = renderWithProviders(<AppContent />)

    const featureGatesTab = screen.getByRole('tab', { name: /Feature Gates/i })
    await user.click(featureGatesTab)

    expect(screen.getByTestId('feature-gates-table')).toBeInTheDocument()
    expect(screen.queryByTestId('experiments-table')).not.toBeInTheDocument()
  })

  it('should switch to Dynamic Configs tab', async () => {
    const { user } = renderWithProviders(<AppContent />)

    const dynamicConfigsTab = screen.getByRole('tab', { name: /Dynamic Configs/i })
    await user.click(dynamicConfigsTab)

    expect(screen.getByTestId('dynamic-configs-table')).toBeInTheDocument()
  })

  it('should open Settings Sheet via menu', async () => {
    const { user } = renderWithProviders(<AppContent />)

    const menuTrigger = document.querySelector('button[aria-haspopup="menu"]')
    if (!menuTrigger) {
      throw new Error('Menu trigger not found')
    }

    await user.click(menuTrigger)

    const settingsItem = screen.getByText('Settings')
    await user.click(settingsItem)

    expect(useUIStore.getState().isSettingsSheetOpen).toBeTruthy()
  })

  it('should switch to Audit Logs tab', async () => {
    const { user } = renderWithProviders(<AppContent />)

    const auditLogsTab = screen.getByRole('tab', { name: /Audit Logs/i })
    await user.click(auditLogsTab)

    expect(screen.getByTestId('audit-logs')).toBeInTheDocument()
  })
})
