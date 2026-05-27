import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ErrorBoundary } from './ErrorBoundary'

const Boom = ({ message = 'kaboom' }: { message?: string }) => {
  throw new Error(message)
}

describe('errorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders children when no error is thrown', () => {
    render(
      <ErrorBoundary>
        <p>healthy</p>
      </ErrorBoundary>,
    )
    expect(screen.getByText('healthy')).toBeInTheDocument()
  })

  it('renders the fallback with the error message when a child throws', () => {
    render(
      <ErrorBoundary>
        <Boom message="upstream failed" />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('upstream failed')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reload extension/iu })).toBeInTheDocument()
  })

  it('calls location.reload when the user clicks Reload Extension', async () => {
    const reload = vi.fn()
    Object.defineProperty(globalThis, 'location', {
      configurable: true,
      value: { reload },
      writable: true,
    })

    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    )

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /reload extension/iu }))
    expect(reload).toHaveBeenCalledTimes(1)
  })
})
