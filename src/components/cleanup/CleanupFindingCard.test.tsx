import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { GateFinding } from '@/src/lib/gate-audit'

import { makeFeatureGate } from '@/src/tests/fixtures/statsig'
import { render, screen } from '@/src/tests/utils/TestUtils'

import { CleanupFindingCard } from './CleanupFindingCard'

const finding = (overrides: Partial<GateFinding> = {}): GateFinding => ({
  gate: makeFeatureGate({ id: 'gate_1', name: 'Old gate' }),
  issues: [{ detail: 'Everyone passes in every environment.', key: 'always_on' }],
  ...overrides,
})

describe('cleanupFindingCard', () => {
  it('shows the gate identity and one badge plus one detail per issue', () => {
    render(
      <CleanupFindingCard
        finding={finding({
          issues: [
            { detail: 'Everyone passes in every environment.', key: 'always_on' },
            { detail: 'No owner and no team.', key: 'orphan' },
          ],
        })}
        onOpen={vi.fn()}
      />,
    )

    expect(screen.getByText('Old gate')).toBeInTheDocument()
    expect(screen.getByText('gate_1')).toBeInTheDocument()
    expect(screen.getByText('Always on')).toBeInTheDocument()
    expect(screen.getByText('Orphan')).toBeInTheDocument()
    expect(screen.getByText('Everyone passes in every environment.')).toBeInTheDocument()
    expect(screen.getByText('No owner and no team.')).toBeInTheDocument()
  })

  it('opens the gate by id when its name is clicked', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    const onOpen = vi.fn()
    render(<CleanupFindingCard finding={finding()} onOpen={onOpen} />)

    await user.click(screen.getByRole('button', { name: /old gate/iu }))

    expect(onOpen).toHaveBeenCalledWith('gate_1')
  })

  it('reports an enabled gate as enabled', () => {
    render(<CleanupFindingCard finding={finding()} onOpen={vi.fn()} />)

    expect(screen.getByText('Enabled')).toBeInTheDocument()
  })

  it('reports a disabled gate as disabled', () => {
    render(
      <CleanupFindingCard
        finding={finding({ gate: makeFeatureGate({ id: 'gate_1', isEnabled: false, name: 'Old gate' }) })}
        onOpen={vi.fn()}
      />,
    )

    expect(screen.getByText('Disabled')).toBeInTheDocument()
  })

  it('links to the gate on the Statsig console', () => {
    render(<CleanupFindingCard finding={finding()} onOpen={vi.fn()} />)

    expect(screen.getByRole('link', { name: /open on statsig/iu })).toHaveAttribute(
      'href',
      'https://console.statsig.com/gates/gate_1',
    )
  })
})
