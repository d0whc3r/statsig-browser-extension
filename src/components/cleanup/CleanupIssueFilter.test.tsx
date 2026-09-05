import { describe, expect, it, vi } from 'vitest'

import type { GateIssueKey } from '@/src/lib/gate-audit'

import { GATE_ISSUE_KEYS } from '@/src/lib/gate-audit'
import { renderWithProviders, screen } from '@/src/tests/utils/TestUtils'

import { CleanupIssueFilter } from './CleanupIssueFilter'

const noCounts = Object.fromEntries(GATE_ISSUE_KEYS.map((key) => [key, 0])) as Record<GateIssueKey, number>

const counts = (overrides: Partial<Record<GateIssueKey, number>> = {}) => ({ ...noCounts, ...overrides })

describe('cleanupIssueFilter', () => {
  it('only offers chips for issues that flagged at least one gate', () => {
    renderWithProviders(
      <CleanupIssueFilter counts={counts({ always_on: 2, orphan: 1 })} onSelect={vi.fn()} selected="all" total={3} />,
    )

    expect(screen.getByRole('button', { name: /all gates/iu })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /always on/iu })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /orphan/iu })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /frozen/iu })).not.toBeInTheDocument()
  })

  it('leaves only the "all gates" chip when nothing was flagged', () => {
    renderWithProviders(<CleanupIssueFilter counts={counts()} onSelect={vi.fn()} selected="all" total={0} />)

    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(screen.getByRole('button', { name: /all gates 0/iu })).toBeInTheDocument()
  })

  it('reports the issue key of the chip that was clicked', async () => {
    const onSelect = vi.fn()
    const { user } = renderWithProviders(
      <CleanupIssueFilter counts={counts({ frozen: 4 })} onSelect={onSelect} selected="all" total={4} />,
    )

    await user.click(screen.getByRole('button', { name: /frozen/iu }))

    expect(onSelect).toHaveBeenCalledWith('frozen')
  })

  it('reports "all" when the total chip is clicked', async () => {
    const onSelect = vi.fn()
    const { user } = renderWithProviders(
      <CleanupIssueFilter counts={counts({ frozen: 4 })} onSelect={onSelect} selected="frozen" total={4} />,
    )

    await user.click(screen.getByRole('button', { name: /all gates/iu }))

    expect(onSelect).toHaveBeenCalledWith('all')
  })

  it('highlights the selected chip and only that one', () => {
    renderWithProviders(
      <CleanupIssueFilter
        counts={counts({ always_on: 1, frozen: 4 })}
        onSelect={vi.fn()}
        selected="frozen"
        total={5}
      />,
    )

    // The active chip uses the solid `default` button variant, the rest stay outlined.
    expect(screen.getByRole('button', { name: /frozen/iu }).className).toContain('bg-primary')
    expect(screen.getByRole('button', { name: /all gates/iu }).className).not.toContain('bg-primary')
    expect(screen.getByRole('button', { name: /always on/iu }).className).not.toContain('bg-primary')
  })
})
