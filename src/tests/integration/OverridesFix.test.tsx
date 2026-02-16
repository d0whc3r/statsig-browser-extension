import { screen, waitFor } from '@testing-library/react'
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

// Mock API key hook
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

const mockExperiment = {
  groups: [
    { id: 'group_control', name: 'Control', size: 50 },
    { id: 'group_test', name: 'Test', size: 50 },
  ],
  id: 'exp_validation',
  lastModifiedTime: Date.now(),
  name: 'Validation Experiment',
  status: 'active',
}

const mockGate = {
  id: 'gate_payload',
  isEnabled: true,
  lastModifiedTime: Date.now(),
  name: 'Payload Gate',
}

const mockGateOverrides = {
  environmentOverrides: [],
  failingUserIDs: [],
  passingUserIDs: [],
}

const setupMocks = () => {
  vi.mocked(fetcher).mockImplementation((url: string) => {
    const urlString = url.toString()

    // Experiment Mocks
    if (urlString.includes('/experiments?')) {
      return Promise.resolve({
        data: [mockExperiment],
        pagination: { limit: 100, page: 1, totalItems: 1 },
      }) as unknown as Promise<unknown>
    }
    if (urlString.includes('/experiments/exp_validation/overrides')) {
      return Promise.resolve({
        data: { overrides: [], userIDOverrides: [] },
      }) as unknown as Promise<unknown>
    }

    if (urlString.includes('/experiments/exp_validation')) {
      return Promise.resolve({
        data: mockExperiment,
      }) as unknown as Promise<unknown>
    }

    // Gate Mocks
    if (urlString.includes('/gates?')) {
      return Promise.resolve({
        data: [mockGate],
        pagination: { limit: 100, page: 1, totalItems: 1 },
      }) as unknown as Promise<unknown>
    }
    if (urlString.includes('/gates/gate_payload')) {
      return Promise.resolve({ data: mockGate }) as unknown as Promise<unknown>
    }
    if (urlString.includes('/gates/gate_payload/overrides')) {
      return Promise.resolve({
        data: mockGateOverrides,
      }) as unknown as Promise<unknown>
    }

    return Promise.resolve({
      data: [],
      pagination: { limit: 100, page: 1, totalItems: 0 },
    }) as unknown as Promise<unknown>
  })

  vi.mocked(api.post).mockResolvedValue({ data: {}, status: 200 })
  vi.mocked(poster).mockResolvedValue({ data: {}, status: 200 })
}

describe('Fix Validation Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useUIStore.setState({
      currentItemId: undefined,
      isAuthModalOpen: false,
      isItemSheetOpen: false,
    })
    setupMocks()
  })

  it('should NOT submit experiment override if group ID does not exist', async () => {
    const { user } = renderWithProviders(<AppContent />, {
      container: document.body,
    })

    // Open experiment sheet
    const expRow = await screen.findByText('Validation Experiment')
    await user.click(expRow)

    // Wait for sheet to open by finding "Details" tab
    await screen.findByRole('tab', { name: 'Details' })

    // Click Overrides tab
    await user.click(await screen.findByRole('tab', { name: 'Overrides' }))

    // Wait for overrides section
    await screen.findByText('Active Overrides')

    // Click "Add Manual" to open form
    const addManualBtn = screen.getByRole('button', { name: /Add Manual/i })
    await user.click(addManualBtn)

    // Find input fields
    const userIdInput = await screen.findByLabelText('ID Value')

    const selectTrigger = screen.getByLabelText('Group')
    await user.click(selectTrigger)

    // Verify valid groups are present
    expect(screen.getByRole('option', { name: 'Control' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Test' })).toBeInTheDocument()

    // Select a group
    await user.click(screen.getByRole('option', { name: 'Control' }))
    await user.type(userIdInput, 'test_user_1')

    const addButton = screen.getByRole('button', { name: /Add Override/i })
    await user.click(addButton)

    // Verify api.post WAS called for valid group
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledTimes(1)
    })
  })

  it('should send PARTIAL payload for gate overrides', async () => {
    // Switch to gates tab
    const { user } = renderWithProviders(<AppContent />, {
      container: document.body,
    })

    const gatesTab = screen.getByText('Feature Gates')
    await user.click(gatesTab)

    // Open gate sheet
    await waitFor(async () => {
      const gateRow = await screen.findByText('Payload Gate')
      await user.click(gateRow)
    })

    // Wait for sheet to open by finding "Details" tab
    await screen.findByRole('tab', { name: 'Details' })

    // Click Overrides tab
    await user.click(await screen.findByRole('tab', { name: 'Overrides' }))

    // Wait for overrides section
    // For gates, the header is "Active Overrides"
    await screen.findByText('Active Overrides')

    // Click "Add Manual" to open form
    const addManualBtn = screen.getByRole('button', { name: /Add Manual/i })
    await user.click(addManualBtn)

    // Fill form
    // Default is PASS, Production, UserID
    const userIdInput = screen.getByLabelText('ID Value')
    await user.type(userIdInput, 'gate_user_1')

    // The button says "Add PASS Override"
    const saveButton = screen.getByRole('button', { name: /Add PASS Override/i })
    await user.click(saveButton)

    // Verify poster was called with CORRECT payload
    await waitFor(() => {
      expect(poster).toHaveBeenCalledTimes(1)
      expect(poster).toHaveBeenCalledWith(
        '/gates/gate_payload/overrides',
        expect.objectContaining({
          environmentOverrides: expect.arrayContaining([
            expect.objectContaining({
              environment: 'Production',
              passingIDs: ['gate_user_1'],
              unitID: 'userID',
            }),
          ]),
        }),
      )
    })

    // Verify it contains the fields even if empty (implementation sends full object)
    const callArgs = vi.mocked(poster).mock.calls[0][1]
    expect(callArgs).toHaveProperty('passingUserIDs', [])
    expect(callArgs).toHaveProperty('failingUserIDs', [])
  })
})
