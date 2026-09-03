import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { AuditLogFilters } from './AuditLogFilters'

describe('auditLogFilters', () => {
  it('keeps action options visible after opening the select', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    render(
      <AuditLogFilters
        filterValue=""
        onFilterChange={vi.fn()}
        actionFilter="all"
        onActionFilterChange={vi.fn()}
        onRefresh={vi.fn()}
        isFetching={false}
      />,
    )

    await user.click(screen.getByRole('combobox', { name: /filter by action/iu }))

    expect(screen.getByRole('option', { name: /all actions/iu })).toBeVisible()

    act(() => {
      globalThis.dispatchEvent(new Event('resize'))
      globalThis.dispatchEvent(new Event('blur'))
    })

    expect(screen.getByRole('option', { name: /create \/ start/iu })).toBeVisible()
    expect(screen.getByRole('option', { name: /overrides/iu })).toBeVisible()
  })
})
