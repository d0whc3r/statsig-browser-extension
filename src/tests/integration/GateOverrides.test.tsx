import { screen, waitFor, within } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { AppContent } from '@/entrypoints/popup/App'
import { api, fetcher, poster } from '@/src/lib/fetcher'
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
    patch: vi.fn(),
    post: vi.fn(),
  },
  fetcher: vi.fn(),
  poster: vi.fn(),
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
    if (item.key === 'local:api_key_type') {
      return ['write-key', vi.fn(), false]
    }
    if (item.key === 'local:statsig-console-api-key') {
      return ['test-api-key', vi.fn(), false]
    }
    return [item.defaultValue, vi.fn(), false]
  }),
}))

const mockGate = {
  id: 'gate_1',
  isEnabled: true,
  lastModifiedTime: Date.now(),
  name: 'Test Gate 1',
}

const mockOverrides = {
  environmentOverrides: [
    {
      environment: 'Development',
      failingIDs: [],
      passingIDs: ['stable_pass'],
      unitID: 'stableID',
    },
  ],
  failingUserIDs: ['user_fail'],
  passingUserIDs: ['user_pass'],
}

const setupMocks = () => {
  // Mock fetcher for hooks
  vi.mocked(fetcher).mockImplementation((url: string) => {
    const urlString = url.toString()
    if (urlString.includes('/gates/gate_1/overrides')) {
      return Promise.resolve({
        data: mockOverrides,
      }) as unknown as Promise<unknown>
    }
    if (urlString.includes('/gates?')) {
      return Promise.resolve({
        data: [mockGate],
        pagination: { limit: 100, page: 1, totalItems: 1 },
      }) as unknown as Promise<unknown>
    }
    if (urlString.includes('/gates/gate_1')) {
      return Promise.resolve({ data: mockGate }) as unknown as Promise<unknown>
    }

    // Default empty paginated response
    return Promise.resolve({
      data: [],
      pagination: { limit: 100, page: 1, totalItems: 0 },
    }) as unknown as Promise<unknown>
  })

  // Setup API mocks
  const mockDelete = vi.mocked(api.delete)
  mockDelete.mockImplementation((_url) => Promise.resolve({ data: { data: {} }, status: 200 }))
  vi.mocked(poster).mockResolvedValue({ data: {}, status: 200 })
}

describe('Gate Overrides Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.style.pointerEvents = 'auto'
    useUIStore.setState({
      currentItemId: undefined,
      isAuthModalOpen: false,
      isItemSheetOpen: false,
      isManageGateOverridesModalOpen: false,
    })
  })

  it('should display gate overrides with environment and ID type', async () => {
    setupMocks()
    const { user } = renderWithProviders(<AppContent />)

    // Switch to Feature Gates tab
    await waitFor(() => expect(screen.getByText('Feature Gates')).toBeInTheDocument())
    await user.click(screen.getByText('Feature Gates'))

    // Wait for gates list
    await waitFor(() => expect(screen.getByText('Test Gate 1')).toBeInTheDocument())

    // Open gate details (click on row)
    await user.click(screen.getByText('Test Gate 1').closest('tr')!)

    // Switch to Overrides tab
    await waitFor(() => expect(screen.getByRole('tab', { name: /Overrides/i })).toBeInTheDocument())
    await user.click(screen.getByRole('tab', { name: /Overrides/i }))

    // Verify overrides are displayed
    await waitFor(() => {
      expect(screen.getByText('user_pass')).toBeInTheDocument()
      expect(screen.getByText('stable_pass')).toBeInTheDocument()
      expect(screen.getByText('Development')).toBeInTheDocument()
      expect(screen.getByText('stableID')).toBeInTheDocument()
    })
  })

  it('should call DELETE API when deleting an override', async () => {
    setupMocks()
    const { user } = renderWithProviders(<AppContent />)

    // Switch to Feature Gates tab
    await waitFor(() => expect(screen.getByText('Feature Gates')).toBeInTheDocument())
    await user.click(screen.getByText('Feature Gates'))

    // Navigate to Overrides tab (same steps as above)
    await waitFor(() => expect(screen.getByText('Test Gate 1')).toBeInTheDocument())
    await user.click(screen.getByText('Test Gate 1').closest('tr')!)
    await waitFor(() => expect(screen.getByRole('tab', { name: /Overrides/i })).toBeInTheDocument())
    await user.click(screen.getByRole('tab', { name: /Overrides/i }))

    // Find delete button for user_pass (root override)
    await waitFor(() => expect(screen.getByText('user_pass')).toBeInTheDocument())
    const row = screen.getByText('user_pass').closest('tr')!
    const deleteBtn = within(row).getByRole('button')

    await user.click(deleteBtn)

    // Verify DELETE API call
    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith(
        '/gates/gate_1/overrides',
        expect.objectContaining({
          data: expect.objectContaining({
            passingUserIDs: ['user_pass'],
          }),
        }),
      )
    })
  })

  it('should call DELETE API correctly for environment override', async () => {
    setupMocks()
    const { user } = renderWithProviders(<AppContent />)

    // Switch to Feature Gates tab
    await waitFor(() => expect(screen.getByText('Feature Gates')).toBeInTheDocument())
    await user.click(screen.getByText('Feature Gates'))

    // Navigate to Overrides tab
    await waitFor(() => expect(screen.getByText('Test Gate 1')).toBeInTheDocument())
    await user.click(screen.getByText('Test Gate 1').closest('tr')!)
    await waitFor(() => expect(screen.getByRole('tab', { name: /Overrides/i })).toBeInTheDocument())
    await user.click(screen.getByRole('tab', { name: /Overrides/i }))

    // Find delete button for stable_pass (env override)
    await waitFor(() => expect(screen.getByText('stable_pass')).toBeInTheDocument())
    const row = screen.getByText('stable_pass').closest('tr')!
    const deleteBtn = within(row).getByRole('button')

    await user.click(deleteBtn)

    // Verify DELETE API call
    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith(
        '/gates/gate_1/overrides',
        expect.objectContaining({
          data: expect.objectContaining({
            environmentOverrides: [
              expect.objectContaining({
                environment: 'Development',
                passingIDs: ['stable_pass'],
                unitID: 'stableID',
              }),
            ],
          }),
        }),
      )
    })
  })

  it('should allow adding an environment override', async () => {
    setupMocks()
    const { user } = renderWithProviders(<AppContent />, { container: document.body })

    // Switch to Feature Gates tab
    await waitFor(() => expect(screen.getByText('Feature Gates')).toBeInTheDocument())
    await user.click(screen.getByText('Feature Gates'))

    // Navigate to Overrides tab
    await waitFor(() => expect(screen.getByText('Test Gate 1')).toBeInTheDocument())
    await user.click(screen.getByText('Test Gate 1').closest('tr')!)
    await waitFor(() => expect(screen.getByRole('tab', { name: /Overrides/i })).toBeInTheDocument())
    await user.click(screen.getByRole('tab', { name: /Overrides/i }))

    // Click Add Manual
    await user.click(screen.getByRole('button', { name: /Add Manual/i }))

    // Fill form
    // Select Type: PASS (default)
    // Select Environment: Staging
    const envSelect = await screen.findByRole('combobox', { name: 'Environment' })
    await user.click(envSelect)
    await screen.findByRole('option', { name: 'Staging' })
    await user.click(screen.getByRole('option', { name: 'Staging' }))

    // Select ID Type: Stable ID
    const idTypeSelect = screen.getByRole('combobox', { name: 'ID Type' })
    await user.click(idTypeSelect)
    await screen.findByRole('option', { name: 'stableID' })
    await user.click(screen.getByRole('option', { name: 'stableID' }))

    // Enter ID
    const input = screen.getByLabelText('ID Value')
    await user.type(input, 'new_stable_id')

    // Submit
    const saveBtn = await screen.findByRole('button', { name: /Add .* Override/i })
    await user.click(saveBtn)

    // Verify POST API call via poster
    await waitFor(() => {
      expect(poster).toHaveBeenCalledWith(
        '/gates/gate_1/overrides',
        expect.objectContaining({
          environmentOverrides: expect.arrayContaining([
            expect.objectContaining({
              environment: 'Staging',
              passingIDs: ['new_stable_id'],
              unitID: 'stableID',
            }),
          ]),
          failingUserIDs: ['user_fail'],
          passingUserIDs: ['user_pass'],
        }),
      )
    })
  })

  it('should allow adding an override for All Environments and Stable ID', async () => {
    setupMocks()
    const { user } = renderWithProviders(<AppContent />, { container: document.body })

    // Switch to Feature Gates tab
    await waitFor(() => expect(screen.getByText('Feature Gates')).toBeInTheDocument())
    await user.click(screen.getByText('Feature Gates'))

    // Navigate to Overrides tab
    await waitFor(() => expect(screen.getByText('Test Gate 1')).toBeInTheDocument())
    await user.click(screen.getByText('Test Gate 1').closest('tr')!)
    await waitFor(() => expect(screen.getByRole('tab', { name: /Overrides/i })).toBeInTheDocument())
    await user.click(screen.getByRole('tab', { name: /Overrides/i }))

    // Click Add Manual
    await user.click(screen.getByRole('button', { name: /Add Manual/i }))

    // Select Environment: All Environments
    const envSelect = await screen.findByRole('combobox', { name: 'Environment' })
    await user.click(envSelect)
    await screen.findByRole('option', { name: 'All Environments' })
    await user.click(screen.getByRole('option', { name: 'All Environments' }))

    // Select ID Type: Stable ID
    const idTypeSelect = screen.getByRole('combobox', { name: 'ID Type' })
    await user.click(idTypeSelect)
    await screen.findByRole('option', { name: 'stableID' })
    await user.click(screen.getByRole('option', { name: 'stableID' }))

    // Enter ID
    const input = screen.getByLabelText('ID Value')
    await user.type(input, 'all_env_stable_id')

    // Submit
    const saveBtn = await screen.findByRole('button', { name: /Add .* Override/i })
    await user.click(saveBtn)

    // Verify POST API call via poster
    await waitFor(() => {
      expect(poster).toHaveBeenCalledWith(
        '/gates/gate_1/overrides',
        expect.objectContaining({
          environmentOverrides: expect.arrayContaining([
            expect.objectContaining({
              environment: null,
              passingIDs: ['all_env_stable_id'],
              unitID: 'stableID',
            }),
          ]),
        }),
      )
    })
  })
})
