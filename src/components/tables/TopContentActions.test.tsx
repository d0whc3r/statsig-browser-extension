import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { TopContentActions } from './TopContentActions'

const columns = [
  { name: 'NAME', uid: 'name' },
  { name: 'TAGS', uid: 'tags' },
  { name: 'ACTIONS', uid: 'actions' },
]

describe('topContentActions', () => {
  it('toggles column visibility from the Columns menu', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    const setVisibleColumns = vi.fn()

    render(
      <TopContentActions
        columns={columns}
        setVisibleColumns={setVisibleColumns}
        visibleColumns={new Set(['name', 'tags', 'actions'])}
      />,
    )

    await user.click(screen.getByRole('button', { name: /columns/iu }))
    await user.click(screen.getByRole('menuitemcheckbox', { name: /tags/iu }))

    expect(setVisibleColumns).toHaveBeenCalledWith(['name', 'actions'])
  })

  it('adds a column back when it is re-checked', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    const setVisibleColumns = vi.fn()

    render(
      <TopContentActions columns={columns} setVisibleColumns={setVisibleColumns} visibleColumns={new Set(['name'])} />,
    )

    await user.click(screen.getByRole('button', { name: /columns/iu }))
    await user.click(screen.getByRole('menuitemcheckbox', { name: /tags/iu }))

    expect(setVisibleColumns).toHaveBeenCalledWith(['name', 'tags'])
  })

  it('exposes the Statsig console link', () => {
    render(<TopContentActions columns={columns} setVisibleColumns={vi.fn()} visibleColumns={new Set(['name'])} />)

    expect(screen.getByRole('link', { name: /open statsig/iu })).toHaveAttribute('href', 'https://console.statsig.com/')
  })
})
