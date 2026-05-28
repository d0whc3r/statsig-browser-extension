import { screen, waitFor, within } from '@testing-library/react'
import { beforeEach, vi, describe, expect, it } from 'vitest'

import { AppContent } from '@/entrypoints/popup/App'
import { fetcher, poster } from '@/src/lib/fetcher'
import { useUIStore } from '@/src/store/use-ui-store'

import { makeFeatureGate, makeGateOverride, paginated, single } from '../fixtures/statsig'
import { resetUIStoreState } from '../utils/integration-mocks'
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

vi.mock(import('@/src/hooks/use-user-details'), async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/src/hooks/use-user-details')>()
  return {
    ...actual,
    useUserDetails: () => ({ data: { userID: 'user_pass' }, isLoading: false }) as any,
  }
})

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

const mockGates = [
  makeFeatureGate({
    creatorID: 'creator_1',
    creatorName: 'Creator',
    description: 'Test gate',
    id: 'gate_1',
    name: 'Test Gate 1',
    status: 'active',
  }),
]

const mockOverrides = makeGateOverride({
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
})

const setupMocks = () => {
  // Mock fetcher for hooks - adjust responses to match expected shapes
  vi.mocked(fetcher).mockImplementation((url: string) => {
    const urlString = url
    if (urlString.includes('/overrides')) {
      return Promise.resolve(single(mockOverrides))
    }
    if (urlString.includes('/gates?')) {
      return Promise.resolve(paginated(mockGates))
    }
    if (urlString.includes('/experiments?')) {
      return Promise.resolve(paginated([]))
    }
    if (urlString.includes('/gates/')) {
      const id = urlString.split('/').pop()
      const gate = mockGates.find((gt) => gt.id === id) ?? mockGates[0]
      return Promise.resolve(single(gate))
    }
    return Promise.resolve({ data: {} })
  })

  // Mock poster - returns wrapped response
  vi.mocked(poster).mockResolvedValue({ data: { success: true } })

  // Smart mock for api.json()
  mockJson.mockImplementation((body) => {
    if (body) {
      return mockWretch // Chain
    }
    return Promise.resolve({ data: mockOverrides }) // Response body for DELETE
  })
}

describe('gate Overrides Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useUIStore.setState(resetUIStoreState)
  })

  it('should list all overrides in the manage modal', async () => {
    setupMocks()
    const { user } = renderWithProviders(<AppContent />)

    // Switch to Gates tab
    await waitFor(() => expect(screen.getByText('Gates')).toBeInTheDocument())
    await user.click(screen.getByRole('tab', { name: /Gates/iu }))

    // Wait for gates to load and click one
    await expect(screen.findByText('Test Gate 1')).resolves.toBeInTheDocument()
    await user.click(screen.getByText('Test Gate 1').closest('tr')!)

    // Wait for sheet and go to Overrides
    await expect(screen.findByRole('tab', { name: /Overrides/iu })).resolves.toBeInTheDocument()
    await user.click(screen.getByRole('tab', { name: /Overrides/iu }))

    // Wait for data to load and user_pass to be rendered
    // Use findAllByText because user_pass appears in context card AND list
    const userElements = await screen.findAllByText('user_pass')
    expect(userElements.length).toBeGreaterThanOrEqual(1)

    // Show others to see user_fail and environment overrides
    const showOthersBtn = await screen.findByText(/Show 3 other overrides/iu)
    await user.click(showOthersBtn)

    expect(screen.getByText('user_fail')).toBeInTheDocument()
    expect(screen.getByText('stable_pass')).toBeInTheDocument()
    expect(screen.getByText('stable_fail')).toBeInTheDocument()
  })

  it('should call DELETE API when deleting an override', async () => {
    setupMocks()
    const { user } = renderWithProviders(<AppContent />)

    // Navigate to overrides
    await waitFor(() => expect(screen.getByText('Gates')).toBeInTheDocument())
    await user.click(screen.getByRole('tab', { name: /Gates/iu }))
    await expect(screen.findByText('Test Gate 1')).resolves.toBeInTheDocument()
    await user.click(screen.getByText('Test Gate 1').closest('tr')!)
    await expect(screen.findByRole('tab', { name: /Overrides/iu })).resolves.toBeInTheDocument()
    await user.click(screen.getByRole('tab', { name: /Overrides/iu }))

    // Delete user_pass (current user, no confirmation)
    const userElements = await screen.findAllByText('user_pass')
    expect(userElements.length).toBeGreaterThanOrEqual(1)
    const row = userElements.find((el) => el.closest('tr'))?.closest('tr')
    expect(row).toBeDefined()
    const deleteBtn = within(row as HTMLElement).getByRole('button')
    await user.click(deleteBtn)

    // Verify DELETE API call
    await waitFor(() => {
      expect(mockWretch.url).toHaveBeenCalledWith('/gates/gate_1/overrides')
      expect(mockWretch.delete).toHaveBeenCalledWith()
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          passingUserIDs: ['user_pass'],
        }),
      )
    })
  })

  it('should allow adding an environment override', async () => {
    setupMocks()
    const { user } = renderWithProviders(<AppContent />)

    // Navigate to overrides
    await waitFor(() => expect(screen.getByText('Gates')).toBeInTheDocument())
    await user.click(screen.getByText('Gates'))
    await waitFor(() => expect(screen.getByText('Test Gate 1')).toBeInTheDocument())
    await user.click(screen.getByText('Test Gate 1').closest('tr')!)
    await waitFor(() => expect(screen.getByRole('tab', { name: /Overrides/iu })).toBeInTheDocument(), { timeout: 3000 })
    await user.click(screen.getByRole('tab', { name: /Overrides/iu }))

    // Click Add Manual
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add Manual/iu })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /Add Manual/iu }))

    // Fill form
    await user.type(screen.getByLabelText(/ID Value/iu), 'new_stable_1')

    const envSelect = screen.getByLabelText(/Environment/iu)
    await user.click(envSelect)
    const stagingOption = await screen.findByRole('option', { name: 'Staging' })
    await user.click(stagingOption)

    const idTypeSelect = screen.getByLabelText(/ID Type/iu)
    await user.click(idTypeSelect)
    const stableIdOption = await screen.findByRole('option', { name: 'stableID' })
    await user.click(stableIdOption)

    // Submit
    await user.click(screen.getByRole('button', { name: /Add Pass Override/iu }))

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
          ]) as unknown as unknown[],
        }),
      )
    })
  })
})
