import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { UserDetailsContent } from './UserDetailsContent'

describe('userDetailsContent', () => {
  it('renders the empty state when there is no user', () => {
    const onRefetch = vi.fn()
    render(<UserDetailsContent userDetails={null} onRefetch={onRefetch} />)
    expect(screen.getByRole('button', { name: /try again/iu })).toBeInTheDocument()
  })

  it('renders an empty state for an empty user object', () => {
    render(<UserDetailsContent userDetails={{}} onRefetch={vi.fn()} />)
    expect(screen.getByRole('button', { name: /try again/iu })).toBeInTheDocument()
  })

  it('renders error state with retry button when error is set', async () => {
    const onRefetch = vi.fn()
    render(
      <UserDetailsContent
        userDetails={{ userID: 'should-not-render' }}
        onRefetch={onRefetch}
        error="connection failed"
      />,
    )
    expect(screen.getByText('connection failed')).toBeInTheDocument()
    const button = screen.getByRole('button', { name: /retry detection/iu })
    const user = userEvent.setup()
    await user.click(button)
    expect(onRefetch).toHaveBeenCalled()
  })

  it('renders user header with name, userID, stableID, and environment tier', () => {
    render(
      <UserDetailsContent
        userDetails={{
          name: 'Alice',
          stableID: 'stable_42',
          statsigEnvironment: { tier: 'production' },
          userID: 'u_1',
        }}
        onRefetch={vi.fn()}
      />,
    )
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('production')).toBeInTheDocument()
    expect(screen.getAllByText('u_1').length).toBeGreaterThan(0)
    expect(screen.getAllByText('stable_42').length).toBeGreaterThan(0)
  })

  it('shows fallbacks when name, userID, and stableID are missing', () => {
    render(<UserDetailsContent userDetails={{ email: 'x@y' }} onRefetch={vi.fn()} />)
    expect(screen.getByText('Anonymous User')).toBeInTheDocument()
    expect(screen.getByText('No User ID')).toBeInTheDocument()
    expect(screen.getByText('No Stable ID')).toBeInTheDocument()
  })

  it('renders overview fields when present', () => {
    render(
      <UserDetailsContent
        userDetails={{
          country: 'ES',
          email: 'a@b.com',
          ip: '1.2.3.4',
          locale: 'en-US',
          userAgent: 'TestAgent/1.0',
        }}
        onRefetch={vi.fn()}
      />,
    )
    expect(screen.getByText('a@b.com')).toBeInTheDocument()
    expect(screen.getByText('ES')).toBeInTheDocument()
    expect(screen.getByText('en-US')).toBeInTheDocument()
    expect(screen.getByText('1.2.3.4')).toBeInTheDocument()
    expect(screen.getByText('TestAgent/1.0')).toBeInTheDocument()
  })

  it('renders custom and private attribute sections when present', () => {
    render(
      <UserDetailsContent
        userDetails={{
          custom: { plan: 'pro' },
          privateAttributes: { ssn: 'secret' },
          userID: 'u_1',
        }}
        onRefetch={vi.fn()}
      />,
    )
    expect(screen.getByText('Custom Properties')).toBeInTheDocument()
    expect(screen.getByText('Private Attributes')).toBeInTheDocument()
    expect(screen.getByText('plan')).toBeInTheDocument()
    expect(screen.getByText('pro')).toBeInTheDocument()
    expect(screen.getByText('ssn')).toBeInTheDocument()
    expect(screen.getByText('secret')).toBeInTheDocument()
  })

  it('renders additional non-standard properties under their own section', () => {
    render(
      <UserDetailsContent
        userDetails={{
          extra_attr: 'value-1',
          userID: 'u_1',
        }}
        onRefetch={vi.fn()}
      />,
    )
    expect(screen.getByText('Additional Properties')).toBeInTheDocument()
    expect(screen.getByText('extra_attr')).toBeInTheDocument()
    expect(screen.getByText('value-1')).toBeInTheDocument()
  })

  it('serializes non-string property values to JSON for display', () => {
    render(
      <UserDetailsContent
        userDetails={{
          custom: { meta: { ab: 1 } },
          userID: 'u_1',
        }}
        onRefetch={vi.fn()}
      />,
    )
    expect(screen.getByText('{"ab":1}')).toBeInTheDocument()
  })
})
