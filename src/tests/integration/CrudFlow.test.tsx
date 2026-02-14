import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
// eslint-disable-next-line import/no-unassigned-import
import '@testing-library/jest-dom'
import { AppContent } from '@/entrypoints/popup/App'
import { api, fetcher } from '@/src/lib/fetcher'
import { useUIStore } from '@/src/store/use-ui-store'

import { renderWithProviders } from '../utils/TestUtils'

// Mock the api instance methods
vi.mock('@/src/lib/fetcher', () => ({
  api: {
    delete: vi.fn(),
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
    },
    post: vi.fn(),
  },
  fetcher: vi.fn(),
}))

// Mock API key
vi.mock('@/src/hooks/use-local-storage', () => ({
  useLocalStorage: vi.fn((key, initial) => {
    // Only mock api key for components that might still read it directly (e.g. AuthModal)
    // The hooks no longer read it
    if (key === 'statsig-console-api-key') {
      return ['test-api-key', vi.fn()]
    }
    return [initial, vi.fn()]
  }),
}))

const mockGates = [
  { id: 'gate_1', isEnabled: true, lastModifiedTime: Date.now(), name: 'Test Gate 1' },
  { id: 'gate_2', isEnabled: false, lastModifiedTime: Date.now(), name: 'Test Gate 2' },
]

const setupMocks = () => {
  // Mock fetcher for hooks
  vi.mocked(fetcher).mockImplementation((url: string) => {
    const urlString = url.toString()
    if (urlString.includes('/gates?')) {
      return Promise.resolve({
        data: mockGates,
        pagination: { limit: 100, page: 1, totalItems: mockGates.length },
      }) as unknown as Promise<unknown>
    }
    if (urlString.includes('/overrides')) {
      return Promise.resolve({
        data: {
          failingUserIDs: [],
          passingUserIDs: [],
        },
      }) as unknown as Promise<unknown>
    }
    if (urlString.includes('/rules')) {
      return Promise.resolve({ data: [] }) as unknown as Promise<unknown>
    }
    if (urlString.includes('/gates/gate_1')) {
      return Promise.resolve({ data: mockGates[0] }) as unknown as Promise<unknown>
    }

    // Default empty paginated response for other endpoints
    return Promise.resolve({
      data: [],
      pagination: { limit: 100, page: 1, totalItems: 0 },
    }) as unknown as Promise<unknown>
  })

  // Setup API mocks (still needed for handlers that use axios)
  const mockGet = vi.mocked(api.get)
  mockGet.mockImplementation((_url) => Promise.resolve({ data: {}, status: 200 }))
}

describe('CRUD Flow - Feature Gates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useUIStore.setState({
      currentItemId: undefined,
      isAuthModalOpen: false,
      isItemSheetOpen: false,
      isSettingsSheetOpen: false,
      isUserDetailsSheetOpen: false,
    })
  })

  it('should list feature gates and allow viewing details', async () => {
    setupMocks()
    renderWithProviders(<AppContent />)

    // Switch to Feature Gates tab
    const featureGatesTab = screen.getByRole('tab', { name: /Feature Gates/i })
    await userEvent.click(featureGatesTab)

    // Verify gates are listed
    await waitFor(() => {
      expect(screen.getByText('Test Gate 1')).toBeInTheDocument()
      expect(screen.getByText('Test Gate 2')).toBeInTheDocument()
    })

    // Click on a gate to open details
    const gateRow = screen.getByText('Test Gate 1').closest('tr')
    if (!gateRow) {
      throw new Error('Gate row not found')
    }

    await userEvent.click(gateRow)

    // Verify sheet opens
    await waitFor(() => {
      expect(useUIStore.getState().isItemSheetOpen).toBeTruthy()
      expect(useUIStore.getState().currentItemId).toBe('gate_1')
      // Check for elements that are always present in the sheet
      expect(screen.getByText('Statsig')).toBeInTheDocument() // External link button
    })
  })
})
