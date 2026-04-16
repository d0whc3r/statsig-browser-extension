import { screen, waitFor, within } from '@testing-library/react'
import { beforeEach, vi, describe, expect, it } from 'vitest'

import { AppContent } from '@/entrypoints/popup/App'
import { fetcher, poster } from '@/src/lib/fetcher'
import { useUIStore } from '@/src/store/use-ui-store'

import { renderWithProviders } from '../utils/TestUtils'

// Mock the api instance methods
const { mockJson, mockWretch } = vi.hoisted(() => {
  const innerMockJson = vi.fn()
  const instanceWretch = {
    body: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
    headers: vi.fn(),
    json: innerMockJson,
    post: vi.fn(),
    url: vi.fn(),
  }
  instanceWretch.body.mockReturnValue(instanceWretch)
  instanceWretch.delete.mockReturnValue(instanceWretch)
  instanceWretch.get.mockReturnValue(instanceWretch)
  instanceWretch.headers.mockReturnValue(instanceWretch)
  instanceWretch.post.mockReturnValue(instanceWretch)
  instanceWretch.url.mockReturnValue(instanceWretch)
  return { mockJson: innerMockJson, mockWretch: instanceWretch }
})

vi.mock('@/src/lib/fetcher', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/src/lib/fetcher')>()
  const mockFetcher: typeof actual.fetcher = vi.fn()
  const mockPoster: typeof actual.poster = vi.fn()
  return {
    ...actual,
    api: mockWretch,
    fetcher: mockFetcher,
    poster: mockPoster,
  }
})

// Mock API key and mock detected user
vi.mock(import('@/src/hooks/use-wxt-storage'), async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/src/hooks/use-wxt-storage')>()
  return {
    ...actual,
    useWxtStorage: <T,>(item: { defaultValue: T; key: string }): [T, (val: T) => void, boolean] => {
      if (item.key === 'local:api_key_type') {
        return ['write-key' as unknown as T, vi.fn(), false]
      }
      if (item.key === 'local:statsig-console-api-key') {
        return ['test-api-key' as unknown as T, vi.fn(), false]
      }
      return [item.defaultValue, vi.fn(), false]
    },
  }
})

vi.mock(import('@/src/hooks/use-user-details'), () => ({
  useUserDetails: () => ({ data: { userID: 'user_123' }, isLoading: false }) as any,
}))

vi.mock(import('@/src/lib/storage'), async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/src/lib/storage')>()
  return {
    ...actual,
    apiKeyStorage: {
      getValue: vi.fn().mockResolvedValue('test-api-key'),
      setValue: vi.fn(),
      watch: vi.fn(),
    } as any,
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

const mockOverrides = {
  overrides: [
    { groupID: 'Control', name: 'gate_1', type: 'gate' },
    { groupID: 'Test', name: 'segment_1', type: 'segment' },
  ],
  userIDOverrides: [{ environment: 'Production', groupID: 'Test', ids: ['user_123'], unitType: 'userID' }],
}

const setupMocks = () => {
  // Mock fetcher for hooks - ALL Statig API responses are wrapped in { data: ... }
  vi.mocked(fetcher).mockImplementation((url: string) => {
    const urlString = url
    if (urlString.includes('/overrides')) {
      return Promise.resolve({ data: mockOverrides })
    }
    if (urlString.includes('/experiments/exp_1')) {
      return Promise.resolve({ data: mockExperiments[0] })
    }
    if (urlString.includes('/experiments?')) {
      return Promise.resolve({
        data: mockExperiments,
        pagination: { limit: 100, page: 1, totalItems: mockExperiments.length },
      })
    }
    if (urlString.includes('/gates?')) {
      return Promise.resolve({
        data: [],
        pagination: { limit: 100, page: 1, totalItems: 0 },
      })
    }
    return Promise.resolve({ data: {} })
  })

  // Mock poster - also returns wrapped response
  vi.mocked(poster).mockResolvedValue({ data: { success: true } })

  // Smart mock for api.json() - used for DELETE and setting body
  mockJson.mockImplementation((body) => {
    if (body) {
      return mockWretch // Chain
    }
    return Promise.resolve({ data: mockOverrides }) // Response for DELETE
  })
}

describe('Experiment Overrides Flow', () => {
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

    // Wait for sheet to open and switch to Overrides tab
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /Overrides/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('tab', { name: /Overrides/i }))

    // Check for User ID override (isCurrentUser: true since we mocked user_123)
    // Use findAllByText because user_123 appears in context card AND list
    const userElements = await screen.findAllByText('user_123')
    expect(userElements.length).toBeGreaterThanOrEqual(1)

    // Check for Gate override
    expect(screen.getByText('gate_1')).toBeInTheDocument()
    expect(screen.getByText('gate')).toBeInTheDocument()

    // Check for Segment override
    expect(screen.getByText('segment_1')).toBeInTheDocument()
    expect(screen.getByText('segment')).toBeInTheDocument()
  })

  it('should allow creating a new user override via modal', async () => {
    setupMocks()
    const { user } = renderWithProviders(<AppContent />)

    // Open experiment details and go to Overrides
    await waitFor(() => expect(screen.getByText('Test Experiment 1')).toBeInTheDocument())
    await user.click(screen.getByText('Test Experiment 1').closest('tr')!)
    await waitFor(() => expect(screen.getByRole('tab', { name: /Overrides/i })).toBeInTheDocument())
    await user.click(screen.getByRole('tab', { name: /Overrides/i }))

    // Click Add Manual
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add Manual/i })).toBeInTheDocument()
    })
    const addBtn = screen.getByRole('button', { name: /Add Manual/i })
    await user.click(addBtn)

    // Fill form
    const idInput = screen.getByLabelText(/ID Value/i)
    await user.type(idInput, 'new_user_456')

    const groupSelect = screen.getByLabelText('Group')
    await user.click(groupSelect)
    const option = await screen.findByRole('option', { name: 'Test' })
    await user.click(option)

    // Submit
    const saveBtn = screen.getByRole('button', { name: /Add Override to Test/i })
    await user.click(saveBtn)

    // Verify API call
    await waitFor(() => {
      expect(poster).toHaveBeenCalledWith(
        '/experiments/exp_1/overrides',
        expect.objectContaining({
          userIDOverrides: expect.arrayContaining([
            expect.objectContaining({
              environment: 'Production',
              groupID: 'Test',
              ids: expect.arrayContaining(['new_user_456']) as unknown as string[],
              unitType: 'userID',
            }),
          ]) as unknown as unknown[],
        }),
      )
    })
  })

  it('should allow creating a new gate override via modal', async () => {
    setupMocks()
    const { user } = renderWithProviders(<AppContent />)

    // Open experiment details and go to Overrides
    await waitFor(() => expect(screen.getByText('Test Experiment 1')).toBeInTheDocument())
    await user.click(screen.getByText('Test Experiment 1').closest('tr')!)
    await waitFor(() => expect(screen.getByRole('tab', { name: /Overrides/i })).toBeInTheDocument())
    await user.click(screen.getByRole('tab', { name: /Overrides/i }))

    // Click Add Manual
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add Manual/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /Add Manual/i }))

    // Switch to Gate/Segment tab
    await user.click(screen.getByRole('tab', { name: /Gate\/Segment Override/i }))

    // Fill form
    await user.type(screen.getByLabelText('Name'), 'my_new_gate')

    const groupSelect = screen.getByLabelText('Target Group')
    await user.click(groupSelect)
    const option = await screen.findByRole('option', { name: 'Control' })
    await user.click(option)

    // Submit
    await user.click(screen.getByRole('button', { name: /Add Override/i }))

    // Verify API call
    await waitFor(() => {
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
    // Mock a non-current user to trigger confirmation
    vi.mocked(fetcher).mockImplementation((url: string) => {
      if (url.includes('/overrides')) {
        return Promise.resolve({
          data: {
            ...mockOverrides,
            userIDOverrides: [
              {
                environment: 'Production',
                groupID: 'Test',
                ids: ['other_user'],
                unitType: 'userID',
              },
            ],
          },
        })
      }
      if (url.includes('/experiments/exp_1')) {
        return Promise.resolve({ data: mockExperiments[0] })
      }
      if (url.includes('/experiments?')) {
        return Promise.resolve({
          data: mockExperiments,
          pagination: { limit: 100, page: 1, totalItems: 1 },
        })
      }
      if (url.includes('/gates?')) {
        return Promise.resolve({
          data: [],
          pagination: { limit: 100, page: 1, totalItems: 0 },
        })
      }
      return Promise.resolve({ data: {} })
    })

    const { user } = renderWithProviders(<AppContent />)

    // Navigate to overrides
    await waitFor(() => expect(screen.getByText('Test Experiment 1')).toBeInTheDocument())
    await user.click(screen.getByText('Test Experiment 1').closest('tr')!)
    await waitFor(() => expect(screen.getByRole('tab', { name: /Overrides/i })).toBeInTheDocument())
    await user.click(screen.getByRole('tab', { name: /Overrides/i }))

    // Click "Show others" button since other_user is not current user
    await waitFor(() => {
      expect(screen.getByText(/Show 1 other overrides/i)).toBeInTheDocument()
    })
    const showOthersBtn = await screen.findByText(/Show 1 other overrides/i)
    await user.click(showOthersBtn)

    // Click delete
    const row = screen.getByText('other_user').closest('tr')!
    const deleteBtn = within(row).getByRole('button', { name: /Delete override/i })
    await user.click(deleteBtn)

    // Confirm in dialog
    const confirmBtn = await screen.findByRole('button', { name: /^Delete$/i })
    await user.click(confirmBtn)

    // Verify DELETE API call
    await waitFor(() => {
      expect(mockWretch.url).toHaveBeenCalledWith('/experiments/exp_1/overrides')
      expect(mockWretch.delete).toHaveBeenCalled()
    })
  })
})
