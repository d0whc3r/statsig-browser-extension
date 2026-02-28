import { useMutation } from '@tanstack/react-query'
import { screen, waitFor } from '@testing-library/react'

import { AuthForm } from '../../components/modals/AuthForm'
import { renderWithProviders } from '../utils/TestUtils'

// Mocking dependencies with simpler string-based mocks to avoid TS complexity in this environment
vi.mock(import('@tanstack/react-query'), async (importOriginal) => {
  const actual = await importOriginal<any>()
  return {
    ...actual,
    useMutation: vi.fn(),
    useQueryClient: vi.fn(() => ({
      invalidateQueries: vi.fn(),
    })),
  }
})

vi.mock(import('@/src/hooks/use-settings-storage'), async (importOriginal) => {
  const actual = await importOriginal<any>()
  return {
    ...actual,
    useSettingsStorage: vi.fn(() => ({
      setApiKey: vi.fn(),
    })),
  }
})

describe('AuthForm component', () => {
  const defaultProps = {
    onSuccess: vi.fn(),
  }

  const mockMutate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useMutation as any).mockReturnValue({
      isPending: false,
      mutate: mockMutate,
    })
  })

  it('renders initial state correctly', () => {
    renderWithProviders(<AuthForm {...defaultProps} />)

    expect(screen.getByText('Login to Statsig')).toBeInTheDocument()
    expect(screen.getByLabelText(/Statsig Console API Key/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument()
  })

  it('shows validation error for empty API key', async () => {
    const { user } = renderWithProviders(<AuthForm {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /Login/i }))

    await waitFor(() => {
      expect(screen.getByText('Please enter an API key')).toBeInTheDocument()
    })
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('shows validation error for invalid API key prefix', async () => {
    const { user } = renderWithProviders(<AuthForm {...defaultProps} />)

    const input = screen.getByPlaceholderText('console-...')
    await user.type(input, 'wrong-prefix-key')
    await user.click(screen.getByRole('button', { name: /Login/i }))

    await waitFor(() => {
      expect(screen.getByText('API key should start with "console-"')).toBeInTheDocument()
    })
    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('calls mutate with correct API key on valid submission', async () => {
    const { user } = renderWithProviders(<AuthForm {...defaultProps} />)

    const input = screen.getByPlaceholderText('console-...')
    await user.type(input, 'console-valid-key')
    await user.click(screen.getByRole('button', { name: /Login/i }))

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith('console-valid-key')
    })
  })

  it('disables input and button when pending', () => {
    ;(useMutation as any).mockReturnValue({
      isPending: true,
      mutate: mockMutate,
    })

    renderWithProviders(<AuthForm {...defaultProps} />)

    expect(screen.getByPlaceholderText('console-...')).toBeDisabled()
    expect(screen.getByRole('button', { name: /Login/i })).toBeDisabled()
  })
})
