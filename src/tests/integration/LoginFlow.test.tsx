import { screen, waitFor } from '@testing-library/react'

import { AuthModal } from '@/src/components/modals/AuthModal'
import { initialLogin } from '@/src/handlers/initial-login'
import { useSettingsStore } from '@/src/store/use-settings-store'
import { useUIStore } from '@/src/store/use-ui-store'

import { renderWithProviders } from '../utils/TestUtils'

// Mock the initialLogin handler
vi.mock(import('@/src/handlers/initial-login'), () => ({
  initialLogin: vi.fn(),
}))

// Mock useWxtStorage
vi.mock(import('@/src/hooks/use-wxt-storage'), () => ({
  useWxtStorage: vi.fn((item) => {
    if (item.key === 'local:statsig-console-api-key') {
      return ['', vi.fn(), false]
    }
    return [item.defaultValue, vi.fn(), false]
  }),
}))

describe('Login Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store
    useUIStore.setState({ isAuthModalOpen: true })
    useSettingsStore.setState({ apiKey: '' })
  })

  it('should render the login modal when open', () => {
    renderWithProviders(<AuthModal />)

    expect(screen.getByText('Login to Statsig')).toBeInTheDocument()
    expect(screen.getByLabelText(/Statsig Console API Key/i)).toBeInTheDocument()
  })

  it('should show error when submitting empty key', async () => {
    const { user } = renderWithProviders(<AuthModal />)

    const loginButton = screen.getByRole('button', { name: /Login/i })
    await user.click(loginButton)

    expect(screen.getByText('Please enter an API key')).toBeInTheDocument()
  })

  it('should call login API and close modal on success', async () => {
    const mockLogin = vi.mocked(initialLogin)
    mockLogin.mockResolvedValue({ data: { message: 'Success' }, error: undefined, success: true })

    const { user } = renderWithProviders(<AuthModal />)

    const input = screen.getByLabelText(/Statsig Console API Key/i)
    await user.type(input, 'console-test-key')

    const loginButton = screen.getByRole('button', { name: /Login/i })
    await user.click(loginButton)

    await waitFor(() => {
      // Relaxed expectation to ignore extra arguments passed by react-query
      expect(mockLogin).toHaveBeenCalledWith('console-test-key', expect.anything())
    })

    await waitFor(
      () => {
        expect(useUIStore.getState().isAuthModalOpen).toBeFalsy()
      },
      { timeout: 2000 },
    )

    expect(useSettingsStore.getState().apiKey).toBe('console-test-key')
  })

  it('should show error message on API failure', async () => {
    const mockLogin = vi.mocked(initialLogin)
    mockLogin.mockResolvedValue({ data: undefined, error: 'Invalid API Key', success: false })

    const { user } = renderWithProviders(<AuthModal />)

    const input = screen.getByLabelText(/Statsig Console API Key/i)
    await user.type(input, 'invalid-key')

    const loginButton = screen.getByRole('button', { name: /Login/i })
    await user.click(loginButton)

    await waitFor(
      () => {
        expect(screen.getByText('Invalid API Key')).toBeInTheDocument()
      },
      { timeout: 2000 },
    )

    expect(useUIStore.getState().isAuthModalOpen).toBeTruthy()
  })
})
