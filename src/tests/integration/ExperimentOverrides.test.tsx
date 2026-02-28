import { screen, waitFor, within } from '@testing-library/react'

import { AppContent } from '@/entrypoints/popup/App'
import { fetcher, poster } from '@/src/lib/fetcher'
import { useUIStore } from '@/src/store/use-ui-store'

import { renderWithProviders } from '../utils/TestUtils'

// Mock the api instance methods
const { mockJson, mockWretch } = vi.hoisted(() => {
  const innerMockJson = vi.fn()
  const instanceWretch = {
    delete: vi.fn().mockReturnThis(),
    get: vi.fn().mockReturnThis(),
    headers: vi.fn().mockReturnThis(),
    json: innerMockJson,
    post: vi.fn().mockReturnThis(),
    url: vi.fn().mockReturnThis(),
  }
  return { mockJson: innerMockJson, mockWretch: instanceWretch }
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
  overrides: [
    { groupID: 'Control', name: 'gate_1', type: 'gate' },
    { groupID: 'Test', name: 'segment_1', type: 'segment' },
  ],
  userIDOverrides: [{ groupID: 'Test', ids: ['user_123'] }],
}

const setupMocks = () => {
  // Mock fetcher for hooks
  vi.mocked(fetcher).mockImplementation((url: string) => {
    const urlString = url.toString()
    if (urlString.includes('/experiments/exp_1/overrides')) {
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
    if (urlString.includes('/experiments/exp_1')) {
      return Promise.resolve({ data: mockExperiments[0] }) as unknown as Promise<unknown>
    }

    // Default empty paginated response
    return Promise.resolve({
      data: [],
      pagination: { limit: 100, page: 1, totalItems: 0 },
    }) as unknown as Promise<unknown>
  })

  // Smart mock for api.json() - handles both request body and response parsing
  mockJson.mockImplementation((body) => {
    if (body) {
      return mockWretch
    }
    // Hooks like useOverrides expect the raw result.data from fetcher
    return Promise.resolve({ data: mockOverrides })
  })

  // Mock poster
  vi.mocked(poster).mockResolvedValue({ data: {}, status: 200 } as any)
}

describe('Experiment Overrides Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useUIStore.setState({
      currentItemId: undefined,
      isAuthModalOpen: false,
      isItemSheetOpen: false,
      isManageExperimentModalOpen: false,
      isSettingsSheetOpen: false,
      isUserDetailsSheetOpen: false,
    })
  })

  it('should list all overrides in the manage modal', async () => {
    setupMocks()
    const { user } = renderWithProviders(<AppContent />)

    // Wait for experiments to load
    await waitFor(() => {
      expect(screen.getByText('Test Experiment 1')).toBeInTheDocument()
    })

    // Click on the experiment to open details
    const experimentRow = screen.getByText('Test Experiment 1').closest('tr')
    await user.click(experimentRow!)

    // Wait for sheet to open
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /Overrides/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('tab', { name: /Overrides/i }))

    // Check for User ID override
    expect(screen.getByText('user_123')).toBeInTheDocument()

    // Check for Gate override
    expect(screen.getByText('gate')).toBeInTheDocument()
    expect(screen.getByText('gate_1')).toBeInTheDocument()

    // Check for Segment override
    expect(screen.getByText('segment')).toBeInTheDocument()
    expect(screen.getByText('segment_1')).toBeInTheDocument()
  })

  it('should allow creating a new user override via modal', async () => {
    setupMocks()
    const { user } = renderWithProviders(<AppContent />)

    // Open experiment details
    await waitFor(() => expect(screen.getByText('Test Experiment 1')).toBeInTheDocument())
    await user.click(screen.getByText('Test Experiment 1').closest('tr')!)

    // Switch to Overrides tab
    await waitFor(() => expect(screen.getByRole('tab', { name: /Overrides/i })).toBeInTheDocument())
    await user.click(screen.getByRole('tab', { name: /Overrides/i }))

    // Click Create override
    const createBtn = screen.getByRole('button', { name: /Add Manual/i })
    await user.click(createBtn)

    // Check if form is displayed
    expect(screen.getByText('Group')).toBeInTheDocument()

    // Select Group
    const groupSelect = screen.getByLabelText('Group')
    await user.click(groupSelect)
    const option = await screen.findByRole('option', { name: 'Test' })
    await user.click(option)

    // Fill User ID
    const input = screen.getByLabelText('ID Value')
    await user.type(input, 'new_user_456')

    // Submit
    const saveBtn = screen.getByRole('button', { name: /Add override/i })
    await user.click(saveBtn)

    // Verify API call
    await waitFor(() => {
      expect(mockWretch.url).toHaveBeenCalledWith('/experiments/exp_1/overrides')
      expect(poster).toHaveBeenCalledWith(
        '/experiments/exp_1/overrides',
        expect.objectContaining({
          userIDOverrides: expect.arrayContaining([
            expect.objectContaining({
              environment: 'Production',
              groupID: 'Test',
              ids: ['new_user_456'],
              unitType: 'userID',
            }),
          ]),
        }),
      )
    })
  })

  it('should allow creating a new gate override via modal', async () => {
    setupMocks()
    const { user } = renderWithProviders(<AppContent />)

    // Open experiment details
    await waitFor(() => expect(screen.getByText('Test Experiment 1')).toBeInTheDocument())
    await user.click(screen.getByText('Test Experiment 1').closest('tr')!)

    // Switch to Overrides tab
    await waitFor(() => expect(screen.getByRole('tab', { name: /Overrides/i })).toBeInTheDocument())
    await user.click(screen.getByRole('tab', { name: /Overrides/i }))

    // Click Create override
    const createBtn = screen.getByRole('button', { name: /Add Manual/i })
    await user.click(createBtn)

    // Switch to Gate/Segment tab
    await user.click(screen.getByRole('tab', { name: /Gate\/Segment Override/i }))

    // Fill Gate Name
    const nameInput = screen.getByLabelText('Name')
    await user.type(nameInput, 'my_new_gate')

    // Select Group
    const groupSelect = screen.getByLabelText('Target Group')
    await user.click(groupSelect)
    const option = await screen.findByRole('option', { name: 'Control' })
    await user.click(option)

    // Submit
    const saveBtn = screen.getByRole('button', { name: /Add Override/i })
    await user.click(saveBtn)

    // Verify API call
    await waitFor(() => {
      expect(mockWretch.url).toHaveBeenCalledWith('/experiments/exp_1/overrides')
      expect(poster).toHaveBeenCalledWith(
        '/experiments/exp_1/overrides',
        expect.objectContaining({
          overrides: expect.arrayContaining([
            expect.objectContaining({
              groupID: 'Control',
              name: 'my_new_gate',
              type: 'gate',
            }),
          ]),
        }),
      )
    })
  })

  it('should allow deleting an override with confirmation', async () => {
    setupMocks()
    const { user } = renderWithProviders(<AppContent />)

    // Open experiment details
    await waitFor(() => expect(screen.getByText('Test Experiment 1')).toBeInTheDocument())
    await user.click(screen.getByText('Test Experiment 1').closest('tr')!)

    // Switch to Overrides tab
    await waitFor(() => expect(screen.getByRole('tab', { name: /Overrides/i })).toBeInTheDocument())
    await user.click(screen.getByRole('tab', { name: /Overrides/i }))

    // Find delete button for user_123
    await waitFor(() => expect(screen.getByText('user_123')).toBeInTheDocument())
    const row = screen.getByText('user_123').closest('tr')!
    const deleteBtn = within(row).getByRole('button')

    await user.click(deleteBtn)

    // Click confirm in dialog
    const confirmBtn = await screen.findByRole('button', { name: /^Delete$/i })
    await user.click(confirmBtn)

    // Verify DELETE API call
    await waitFor(() => {
      expect(mockWretch.url).toHaveBeenCalledWith('/experiments/exp_1/overrides')
      expect(mockWretch.delete).toHaveBeenCalled()
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          userIDOverrides: [
            expect.objectContaining({
              groupID: 'Test',
              ids: ['user_123'],
            }),
          ],
        }),
      )
    })
  })
})
