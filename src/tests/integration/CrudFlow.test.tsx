import { screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

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

// Mock API key storage directly
vi.mock('@/src/lib/storage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/src/lib/storage')>()
  return {
    ...actual,
    apiKeyStorage: {
      ...actual.apiKeyStorage,
      getValue: vi.fn().mockResolvedValue('test-api-key'),
      watch: vi.fn(),
    },
  }
})

// Mock API key
vi.mock('@/src/hooks/use-wxt-storage', () => ({
  useWxtStorage: vi.fn((item) => {
    // Only mock api key for components that might still read it directly (e.g. AuthModal)
    if (item.key === 'local:statsig-console-api-key') {
      return ['test-api-key', vi.fn(), false]
    }
    return [item.defaultValue, vi.fn(), false]
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
    document.body.style.pointerEvents = 'auto'
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
    const { user } = renderWithProviders(<AppContent />, { container: document.body })

    // Switch to Feature Gates tab
    await waitFor(() => expect(screen.getByText('Feature Gates')).toBeInTheDocument())
    await user.click(screen.getByText('Feature Gates'))

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

    await user.click(gateRow)

    // Verify sheet opens
    await waitFor(() => {
      expect(useUIStore.getState().isItemSheetOpen).toBeTruthy()
      expect(useUIStore.getState().currentItemId).toBe('gate_1')
      // Check for elements that are always present in the sheet
      expect(screen.getByText('Statsig')).toBeInTheDocument() // External link button
    })
  })
})
