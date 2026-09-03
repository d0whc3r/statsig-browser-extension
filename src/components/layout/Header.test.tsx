import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useUIStore } from '@/src/store/use-ui-store'

import { Header } from './Header'

describe('header', () => {
  beforeEach(() => {
    useUIStore.getState().reset()
  })

  it('renders the Statsig wordmark and version', () => {
    render(<Header onLogout={vi.fn()} />)
    expect(screen.getByAltText('Statsig')).toBeInTheDocument()
    expect(screen.getByText(/^v/u)).toBeInTheDocument()
  })

  it('opens user details and settings from the account menu and logs out', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    const onLogout = vi.fn()
    render(<Header onLogout={onLogout} />)

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByRole('menuitem', { name: /user details/iu }))
    expect(useUIStore.getState().isUserDetailsSheetOpen).toBeTruthy()

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByRole('menuitem', { name: /^settings$/iu }))
    expect(useUIStore.getState().isSettingsSheetOpen).toBeTruthy()

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByRole('menuitem', { name: /logout/iu }))
    expect(onLogout).toHaveBeenCalledTimes(1)
  })
})
