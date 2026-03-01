import { screen, waitFor } from '@testing-library/react'

import { Dialog, DialogContent } from '@/src/components/ui/dialog'
import { initialLogin } from '@/src/handlers/initial-login'

import { AuthForm } from '../../components/modals/AuthForm'
import { renderWithProviders } from '../utils/TestUtils'

// Mock initialLogin handler
vi.mock(import('@/src/handlers/initial-login'), () => ({
  initialLogin: vi.fn(),
}))

// Mock useSettingsStorage
vi.mock(import('@/src/hooks/use-settings-storage'), () => ({
  useSettingsStorage: vi.fn(() => ({
    setApiKey: vi.fn(),
  })),
}))

describe('AuthForm component', () => {
  const defaultProps = {
    onSuccess: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders initial state correctly', () => {
    renderWithProviders(
      <Dialog open>
        <DialogContent>
          <AuthForm {...defaultProps} />
        </DialogContent>
      </Dialog>,
    )

    expect(screen.getByText('Login to Statsig')).toBeInTheDocument()
    expect(screen.getByLabelText(/Statsig Console API Key/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument()
  })

  it('shows validation error for empty API key', async () => {
    const { user } = renderWithProviders(
      <Dialog open>
        <DialogContent>
          <AuthForm {...defaultProps} />
        </DialogContent>
      </Dialog>,
    )

    await user.click(screen.getByRole('button', { name: /Login/i }))

    await waitFor(() => {
      expect(screen.getByText('Please enter an API key')).toBeInTheDocument()
    })
    expect(initialLogin).not.toHaveBeenCalled()
  })

  it('shows validation error for invalid API key prefix', async () => {
    const { user } = renderWithProviders(
      <Dialog open>
        <DialogContent>
          <AuthForm {...defaultProps} />
        </DialogContent>
      </Dialog>,
    )

    const input = screen.getByPlaceholderText('console-...')
    await user.type(input, 'wrong-prefix-key')
    await user.click(screen.getByRole('button', { name: /Login/i }))

    await waitFor(() => {
      expect(screen.getByText('API key should start with "console-"')).toBeInTheDocument()
    })
    expect(initialLogin).not.toHaveBeenCalled()
  })

  it('calls mutate with correct API key on valid submission', async () => {
    const mockLogin = vi.mocked(initialLogin)
    mockLogin.mockResolvedValue({ data: { message: 'Success' }, error: undefined, success: true })

    const { user } = renderWithProviders(
      <Dialog open>
        <DialogContent>
          <AuthForm {...defaultProps} />
        </DialogContent>
      </Dialog>,
    )

    const input = screen.getByPlaceholderText('console-...')
    await user.type(input, 'console-valid-key')
    await user.click(screen.getByRole('button', { name: /Login/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('console-valid-key', expect.anything())
    })
  })

  it('disables input and button when pending', async () => {
    // To test pending state, we need a promise that doesn't resolve immediately
    const mockLogin = vi.mocked(initialLogin)
    // oxlint-disable-next-line init-declarations
    let resolveLogin: (value: any) => void
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve
    })
    mockLogin.mockReturnValue(loginPromise as any)

    const { user } = renderWithProviders(
      <Dialog open>
        <DialogContent>
          <AuthForm {...defaultProps} />
        </DialogContent>
      </Dialog>,
    )

    const input = screen.getByPlaceholderText('console-...')
    await user.type(input, 'console-valid-key')
    await user.click(screen.getByRole('button', { name: /Login/i }))

    expect(input).toBeDisabled()
    expect(screen.getByRole('button', { name: /Login/i })).toBeDisabled()

    // Clean up
    resolveLogin!({ success: true })
  })
})
