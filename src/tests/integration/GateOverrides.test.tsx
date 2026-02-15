import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
// eslint-disable-next-line import/no-unassigned-import
import '@testing-library/jest-dom'
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
vi.mock('@/src/hooks/use-local-storage', () => ({
  useLocalStorage: vi.fn((key, initial) => {
    if (key === 'statsig-console-api-key' || key === 'statsig-api-key-type') {
      return ['write-key', vi.fn()]
    }
    return [initial, vi.fn()]
  }),
}))

const mockGate = {
  id: 'gate_1',
  name: 'Test Gate 1',
  isEnabled: true,
  lastModifiedTime: Date.now(),
}

const mockOverrides = {
  passing_user_ids: ['user_pass'],
  failing_user_ids: ['user_fail'],
  environment_overrides: [
    {
      environment: 'Development',
      unit_id: 'stableID',
      passing_ids: ['stable_pass'],
      failing_ids: [],
    },
  ],
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

  const mockPoster = vi.mocked(poster)
  mockPoster.mockImplementation((_url) => Promise.resolve({ data: {}, status: 200 }))
}

describe('Gate Overrides Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useUIStore.setState({
      isAuthModalOpen: false,
      isManageGateOverridesModalOpen: false,
      isItemSheetOpen: false,
      currentItemId: undefined,
    })
  })

  it('should display gate overrides with environment and ID type', async () => {
    setupMocks()
    renderWithProviders(<AppContent />)

    // Switch to Feature Gates tab
    await waitFor(() => expect(screen.getByText('Feature Gates')).toBeInTheDocument())
    await userEvent.click(screen.getByText('Feature Gates'))

    // Wait for gates list
    await waitFor(() => expect(screen.getByText('Test Gate 1')).toBeInTheDocument())

    // Open gate details (click on row)
    await userEvent.click(screen.getByText('Test Gate 1').closest('tr')!)

    // Switch to Overrides tab
    await waitFor(() => expect(screen.getByRole('tab', { name: /Overrides/i })).toBeInTheDocument())
    await userEvent.click(screen.getByRole('tab', { name: /Overrides/i }))

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
    renderWithProviders(<AppContent />)

    // Switch to Feature Gates tab
    await waitFor(() => expect(screen.getByText('Feature Gates')).toBeInTheDocument())
    await userEvent.click(screen.getByText('Feature Gates'))

    // Navigate to Overrides tab (same steps as above)
    await waitFor(() => expect(screen.getByText('Test Gate 1')).toBeInTheDocument())
    await userEvent.click(screen.getByText('Test Gate 1').closest('tr')!)
    await waitFor(() => expect(screen.getByRole('tab', { name: /Overrides/i })).toBeInTheDocument())
    await userEvent.click(screen.getByRole('tab', { name: /Overrides/i }))

    // Find delete button for user_pass (root override)
    await waitFor(() => expect(screen.getByText('user_pass')).toBeInTheDocument())
    const row = screen.getByText('user_pass').closest('tr')!
    const deleteBtn = within(row).getByRole('button')

    await userEvent.click(deleteBtn)

    // Verify DELETE API call
    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith(
        '/gates/gate_1/overrides',
        expect.objectContaining({
          data: expect.objectContaining({
            passing_user_ids: ['user_pass'],
          }),
        }),
      )
    })
  })

  it('should call DELETE API correctly for environment override', async () => {
    setupMocks()
    renderWithProviders(<AppContent />)

    // Switch to Feature Gates tab
    await waitFor(() => expect(screen.getByText('Feature Gates')).toBeInTheDocument())
    await userEvent.click(screen.getByText('Feature Gates'))

    // Navigate to Overrides tab
    await waitFor(() => expect(screen.getByText('Test Gate 1')).toBeInTheDocument())
    await userEvent.click(screen.getByText('Test Gate 1').closest('tr')!)
    await waitFor(() => expect(screen.getByRole('tab', { name: /Overrides/i })).toBeInTheDocument())
    await userEvent.click(screen.getByRole('tab', { name: /Overrides/i }))

    // Find delete button for stable_pass (env override)
    await waitFor(() => expect(screen.getByText('stable_pass')).toBeInTheDocument())
    const row = screen.getByText('stable_pass').closest('tr')!
    const deleteBtn = within(row).getByRole('button')

    await userEvent.click(deleteBtn)

    // Verify DELETE API call
    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith(
        '/gates/gate_1/overrides',
        expect.objectContaining({
          data: expect.objectContaining({
            environment_overrides: [
              expect.objectContaining({
                environment: 'Development',
                unit_id: 'stableID',
                passing_ids: ['stable_pass'],
              }),
            ],
          }),
        }),
      )
    })
  })

  it('should allow adding an environment override', async () => {
    setupMocks()
    renderWithProviders(<AppContent />)

    // Switch to Feature Gates tab
    await waitFor(() => expect(screen.getByText('Feature Gates')).toBeInTheDocument())
    await userEvent.click(screen.getByText('Feature Gates'))

    // Navigate to Overrides tab
    await waitFor(() => expect(screen.getByText('Test Gate 1')).toBeInTheDocument())
    await userEvent.click(screen.getByText('Test Gate 1').closest('tr')!)
    await waitFor(() => expect(screen.getByRole('tab', { name: /Overrides/i })).toBeInTheDocument())
    await userEvent.click(screen.getByRole('tab', { name: /Overrides/i }))

    // Click Add Manual
    await userEvent.click(screen.getByRole('button', { name: /Add Manual/i }))

    // Fill form
    // Select Type: PASS (default)
    // Select Environment: Staging
    const envSelect = screen.getByRole('combobox', { name: 'Environment' })
    await userEvent.click(envSelect)
    await screen.findByRole('option', { name: 'Staging' })
    await userEvent.click(screen.getByRole('option', { name: 'Staging' }))

    // Select ID Type: Stable ID
    const idTypeSelect = screen.getByRole('combobox', { name: 'ID Type' })
    await userEvent.click(idTypeSelect)
    await screen.findByRole('option', { name: 'Stable ID' })
    await userEvent.click(screen.getByRole('option', { name: 'Stable ID' }))

    // Enter ID
    const input = screen.getByLabelText('ID Value')
    await userEvent.type(input, 'new_stable_id')

    // Submit
    const saveBtn = await screen.findByRole('button', { name: /Add .* Override/i })
    await userEvent.click(saveBtn)

    // Verify POST API call via poster
    await waitFor(() => {
      expect(poster).toHaveBeenCalledWith(
        '/gates/gate_1/overrides',
        expect.objectContaining({
          environment_overrides: expect.arrayContaining([
            expect.objectContaining({
              environment: 'Staging',
              unit_id: 'stableID',
              passing_ids: ['new_stable_id'],
            }),
          ]),
        }),
      )
    })
  })

  it('should allow adding an override for All Environments and Stable ID', async () => {
    setupMocks()
    renderWithProviders(<AppContent />)

    // Switch to Feature Gates tab
    await waitFor(() => expect(screen.getByText('Feature Gates')).toBeInTheDocument())
    await userEvent.click(screen.getByText('Feature Gates'))

    // Navigate to Overrides tab
    await waitFor(() => expect(screen.getByText('Test Gate 1')).toBeInTheDocument())
    await userEvent.click(screen.getByText('Test Gate 1').closest('tr')!)
    await waitFor(() => expect(screen.getByRole('tab', { name: /Overrides/i })).toBeInTheDocument())
    await userEvent.click(screen.getByRole('tab', { name: /Overrides/i }))

    // Click Add Manual
    await userEvent.click(screen.getByRole('button', { name: /Add Manual/i }))

    // Select Environment: All Environments
    const envSelect = screen.getByRole('combobox', { name: 'Environment' })
    await userEvent.click(envSelect)
    await screen.findByRole('option', { name: 'All Environments' })
    await userEvent.click(screen.getByRole('option', { name: 'All Environments' }))

    // Select ID Type: Stable ID
    const idTypeSelect = screen.getByRole('combobox', { name: 'ID Type' })
    await userEvent.click(idTypeSelect)
    await screen.findByRole('option', { name: 'Stable ID' })
    await userEvent.click(screen.getByRole('option', { name: 'Stable ID' }))

    // Enter ID
    const input = screen.getByLabelText('ID Value')
    await userEvent.type(input, 'all_env_stable_id')

    // Submit
    const saveBtn = await screen.findByRole('button', { name: /Add .* Override/i })
    await userEvent.click(saveBtn)

    // Verify POST API call via poster
    await waitFor(() => {
      expect(poster).toHaveBeenCalledWith(
        '/gates/gate_1/overrides',
        expect.objectContaining({
          environment_overrides: expect.arrayContaining([
            expect.objectContaining({
              environment: null,
              unit_id: 'stableID',
              passing_ids: ['all_env_stable_id'],
            }),
          ]),
        }),
      )
    })
  })
})
