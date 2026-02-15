import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
    patch: vi.fn(),
    post: vi.fn(),
  },
  fetcher: vi.fn(),
}))

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

vi.mock('@/src/lib/storage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/src/lib/storage')>()
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

  // Setup API mocks
  const mockPost = vi.mocked(api.post)
  mockPost.mockImplementation((_url) => Promise.resolve({ data: {}, status: 200 }))
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
    renderWithProviders(<AppContent />)

    // Wait for experiments to load
    await waitFor(() => {
      expect(screen.getByText('Test Experiment 1')).toBeInTheDocument()
    })

    // Click on the experiment to open details
    const experimentRow = screen.getByText('Test Experiment 1').closest('tr')
    await userEvent.click(experimentRow!)

    // Wait for sheet to open
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Manage experiment/i })).toBeInTheDocument()
    })

    // Click Manage button
    const manageBtn = screen.getByRole('button', { name: /Manage experiment/i })
    await userEvent.click(manageBtn)

    // Wait for modal and switch to Overrides tab
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /Overrides/i })).toBeInTheDocument()
    })
    await userEvent.click(screen.getByRole('tab', { name: /Overrides/i }))

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
    renderWithProviders(<AppContent />)

    // Open experiment details
    await waitFor(() => expect(screen.getByText('Test Experiment 1')).toBeInTheDocument())
    await userEvent.click(screen.getByText('Test Experiment 1').closest('tr')!)

    // Open Manage Modal
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Manage experiment/i })).toBeInTheDocument(),
    )
    await userEvent.click(screen.getByRole('button', { name: /Manage experiment/i }))

    // Switch to Overrides tab
    await waitFor(() => expect(screen.getByRole('tab', { name: /Overrides/i })).toBeInTheDocument())
    await userEvent.click(screen.getByRole('tab', { name: /Overrides/i }))

    // Click Create override
    const createBtn = screen.getByRole('button', { name: /Add Manual/i })
    await userEvent.click(createBtn)

    // Check if form is displayed
    expect(screen.getByText('Group')).toBeInTheDocument()

    // Select Group
    const groupSelect = screen.getByLabelText('Group')
    await userEvent.click(groupSelect)
    await screen.findByRole('option', { name: 'Test' })
    await userEvent.click(screen.getByRole('option', { name: 'Test' }))

    // Fill User ID
    const input = screen.getByLabelText('ID Value')
    await userEvent.type(input, 'new_user_456')

    // Submit
    const saveBtn = screen.getByRole('button', { name: /Add override/i })
    await userEvent.click(saveBtn)

    // Verify API call
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/experiments/exp_1/overrides',
        expect.objectContaining({
          userIDOverrides: [
            expect.objectContaining({
              groupID: 'Test',
              ids: ['new_user_456'],
              // Type: 'user', // Depending on implementation
            }),
          ],
        }),
      )
    })
  })
})
