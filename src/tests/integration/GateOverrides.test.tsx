import { screen, waitFor, within } from '@testing-library/react'

import { AppContent } from '@/entrypoints/popup/App'
import { fetcher, poster } from '@/src/lib/fetcher'
import { useUIStore } from '@/src/store/use-ui-store'

import { renderWithProviders } from '../utils/TestUtils'

// Mock the api instance methods
const { mockJson, mockWretch } = vi.hoisted(() => {
  const innerMockJson = vi.fn()
  const wretchInstance = {
    delete: vi.fn().mockReturnThis(),
    get: vi.fn().mockReturnThis(),
    headers: vi.fn().mockReturnThis(),
    json: innerMockJson,
    post: vi.fn().mockReturnThis(),
    url: vi.fn().mockReturnThis(),
  }

  return { mockJson: innerMockJson, mockWretch: wretchInstance }
})

vi.mock(import('@/src/lib/fetcher'), async (importOriginal) => {
  const actual = await importOriginal<any>()
  return {
    ...actual,
    api: mockWretch,
    fetcher: vi.fn(),
    poster: vi.fn(),
  }
})

// Mock API key
vi.mock(import('@/src/hooks/use-wxt-storage'), async (importOriginal) => {
  const actual = await importOriginal<any>()
  return {
    ...actual,
    useWxtStorage: vi.fn((item) => {
      if (item.key === 'local:api_key_type') {
        return ['write-key', vi.fn(), false]
      }
      if (item.key === 'local:statsig-console-api-key') {
        return ['test-api-key', vi.fn(), false]
      }
      return [item.defaultValue, vi.fn(), false]
    }),
  }
})

vi.mock(import('@/src/lib/storage'), async (importOriginal) => {
  const actual = await importOriginal<any>()
  return {
    ...actual,
    apiKeyStorage: {
      ...actual.apiKeyStorage,
      getValue: vi.fn().mockResolvedValue('test-api-key'),
      setValue: vi.fn(),
      watch: vi.fn(),
    },
  }
})

const mockExperiments = [
  {
    groups: [
      { id: 'group_1', name: 'Control', size: 50 },
      { id: 'group_2', name: 'Test', size: 50 },
    ],
    id: 'exp_1',
    lastModifiedTime: Date.now(),
    name: 'Test Experiment 1',
    status: 'active',
  },
]

const mockGates = [
  { id: 'gate_1', isEnabled: true, lastModifiedTime: Date.now(), name: 'Test Gate 1' },
]

const mockOverrides = {
  environmentOverrides: [
    {
      environment: 'Development',
      failingIDs: ['stable_fail'],
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
    if (urlString.includes('/experiments?')) {
      return Promise.resolve({
        data: mockExperiments,
        pagination: { limit: 100, page: 1, totalItems: mockExperiments.length },
      }) as unknown as Promise<unknown>
    }
    if (urlString.includes('/gates?')) {
      return Promise.resolve({
        data: mockGates,
        pagination: { limit: 100, page: 1, totalItems: mockGates.length },
      }) as unknown as Promise<unknown>
    }

    // Default empty paginated response
    return Promise.resolve({
      data: [],
      pagination: { limit: 100, page: 1, totalItems: 0 },
    }) as unknown as Promise<unknown>
  })

  // Smart mock for api.json()
  mockJson.mockImplementation((body) => {
    if (body) {
      return mockWretch
    }
    // UseGateOverrides expects result.data
    return Promise.resolve({ data: mockOverrides })
  })

  // Setup API mocks
  vi.mocked(poster).mockResolvedValue({ data: {}, status: 200 } as any)
}

describe('Gate Overrides Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useUIStore.setState({
      currentItemId: undefined,
      isAuthModalOpen: false,
      isItemSheetOpen: false,
      isManageGateOverridesModalOpen: false,
      isSettingsSheetOpen: false,
      isUserDetailsSheetOpen: false,
    })
  })

  it('should list all overrides in the manage modal', async () => {
    setupMocks()
    const { user } = renderWithProviders(<AppContent />)

    // Switch to Feature Gates tab
    await waitFor(() => expect(screen.getByText('Feature Gates')).toBeInTheDocument())
    await user.click(screen.getByText('Feature Gates'))

    // Wait for gates to load
    await waitFor(() => {
      expect(screen.getByText('Test Gate 1')).toBeInTheDocument()
    })

    // Click on the gate to open details
    const experimentRow = screen.getByText('Test Gate 1').closest('tr')
    await user.click(experimentRow!)

    // Wait for sheet to open
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /Overrides/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('tab', { name: /Overrides/i }))

    // Check for root overrides
    expect(screen.getByText('user_pass')).toBeInTheDocument()
    expect(screen.getByText('user_fail')).toBeInTheDocument()

    // Check for environment overrides
    expect(screen.getByText('stable_pass')).toBeInTheDocument()
    expect(screen.getByText('stable_fail')).toBeInTheDocument()
  })

  it('should call DELETE API when deleting an override', async () => {
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

    // Find delete button for user_pass (root override)
    await waitFor(() => expect(screen.getByText('user_pass')).toBeInTheDocument())
    const row = screen.getByText('user_pass').closest('tr')!
    const deleteBtn = within(row).getByRole('button')

    await user.click(deleteBtn)

    // Click confirm in dialog
    const confirmBtn = await screen.findByRole('button', { name: /^Delete$/i })
    await user.click(confirmBtn)

    // Verify DELETE API call
    await waitFor(() => {
      expect(mockWretch.url).toHaveBeenCalledWith('/gates/gate_1/overrides')
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          passingUserIDs: ['user_pass'],
        }),
      )
      expect(mockWretch.delete).toHaveBeenCalled()
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

    // Click confirm in dialog
    const confirmBtn = await screen.findByRole('button', { name: /^Delete$/i })
    await user.click(confirmBtn)

    // Verify DELETE API call
    await waitFor(() => {
      expect(mockWretch.url).toHaveBeenCalledWith('/gates/gate_1/overrides')
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          environmentOverrides: [
            expect.objectContaining({
              environment: 'Development',
              passingIDs: ['stable_pass'],
              unitID: 'stableID',
            }),
          ],
        }),
      )
      expect(mockWretch.delete).toHaveBeenCalled()
    })
  })

  it('should allow adding an environment override', async () => {
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

    // Click Add Manual
    await user.click(screen.getByRole('button', { name: /Add Manual/i }))

    // Fill form
    await user.type(screen.getByLabelText(/ID Value/i), 'new_stable_1')

    // Select environment
    const envSelect = screen.getByLabelText(/Environment/i)
    await user.click(envSelect)
    const stagingOption = await screen.findByRole('option', { name: 'Staging' })
    await user.click(stagingOption)

    // Select ID type
    const idTypeSelect = screen.getByLabelText(/ID Type/i)
    await user.click(idTypeSelect)
    const stableIdOption = await screen.findByRole('option', { name: 'stableID' })
    await user.click(stableIdOption)

    // Submit
    await user.click(screen.getByRole('button', { name: /Add Pass Override/i }))

    // Verify API call
    await waitFor(() => {
      expect(poster).toHaveBeenCalledWith(
        '/gates/gate_1/overrides',
        expect.objectContaining({
          environmentOverrides: expect.arrayContaining([
            expect.objectContaining({
              environment: 'Staging',
              passingIDs: ['new_stable_1'],
              unitID: 'stableID',
            }),
          ]),
        }),
      )
    })
  })
})
