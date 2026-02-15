import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
    renderWithProviders(<AppContent />)

    // Open experiment sheet
    const expRow = await screen.findByText('Validation Experiment')
    await userEvent.click(expRow)

    // Wait for sheet to open by finding "Details" tab
    await screen.findByRole('tab', { name: 'Details' })

    // Click Overrides tab
    await userEvent.click(await screen.findByRole('tab', { name: 'Overrides' }))

    // Wait for overrides section
    await screen.findByText('Experiment overrides')

    // Find input fields
    const userIdInput = screen.getByPlaceholderText('User ID')

    const selectTrigger = screen.getByRole('combobox')
    await userEvent.click(selectTrigger)

    // Verify valid groups are present
    expect(screen.getByText('Control')).toBeInTheDocument()
    expect(screen.getByText('Test')).toBeInTheDocument()

    // Select a valid group
    await userEvent.click(screen.getByText('Test'))
    await userEvent.type(userIdInput, 'test_user_1')

    const addButton = screen.getByLabelText('Add Override')
    await userEvent.click(addButton)

    // Verify api.post WAS called for valid group
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledTimes(1)
    })
  })

  it('should send PARTIAL payload for gate overrides', async () => {
    // Switch to gates tab
    renderWithProviders(<AppContent />)
    await userEvent.click(screen.getByText('Feature Gates'))

    // Open gate sheet
    const gateRow = await screen.findByText('Payload Gate')
    await userEvent.click(gateRow)

    // Wait for sheet to open by finding "Details" tab
    await screen.findByRole('tab', { name: 'Details' })

    // Click Overrides tab
    await userEvent.click(await screen.findByRole('tab', { name: 'Overrides' }))

    // Wait for overrides section
    // For gates, the header is "Active Overrides"
    await screen.findByText('Active Overrides')

    // Click "Add Manual" to open form
    const addManualBtn = screen.getByRole('button', { name: /Add Manual/i })
    await userEvent.click(addManualBtn)

    // Fill form
    // Default is PASS, Production, UserID
    const userIdInput = screen.getByPlaceholderText('Enter ID')
    await userEvent.type(userIdInput, 'gate_user_1')

    // The button says "Add PASS Override"
    const saveButton = screen.getByRole('button', { name: /Add PASS Override/i })
    await userEvent.click(saveButton)

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

    // Verify it does NOT contain other fields like failingUserIDs if they are empty/irrelevant for this partial update
    const callArgs = vi.mocked(poster).mock.calls[0][1]
    expect(callArgs).not.toHaveProperty('passingUserIDs')
    expect(callArgs).not.toHaveProperty('failingUserIDs')
  })
})
