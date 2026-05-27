import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AppearanceSettings } from './AppearanceSettings'

const { setThemeMock, useThemeMock } = vi.hoisted(() => ({
  setThemeMock: vi.fn(),
  useThemeMock: vi.fn(),
}))

vi.mock('@/src/hooks/use-theme', () => ({
  useTheme: useThemeMock,
}))

describe('appearanceSettings', () => {
  beforeEach(() => {
    setThemeMock.mockReset()
    useThemeMock.mockReset()
    useThemeMock.mockReturnValue({
      isLoading: false,
      resolvedTheme: 'light',
      setTheme: setThemeMock,
      theme: 'light',
    })
  })

  it('renders the theme selector with the active value', () => {
    render(<AppearanceSettings />)
    expect(screen.getByText(/select your preferred theme/iu)).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toHaveTextContent(/light/iu)
  })

  it('calls setTheme with "dark" when the user picks dark mode', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    render(<AppearanceSettings />)

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: /dark/iu }))

    await waitFor(() => {
      expect(setThemeMock).toHaveBeenCalledWith('dark')
    })
  })

  it('shows a placeholder when the theme is system', () => {
    useThemeMock.mockReturnValue({
      isLoading: false,
      resolvedTheme: 'dark',
      setTheme: setThemeMock,
      theme: 'system',
    })
    render(<AppearanceSettings />)
    expect(screen.getByText(/select theme/iu)).toBeInTheDocument()
  })
})
