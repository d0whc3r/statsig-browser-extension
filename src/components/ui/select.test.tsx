import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'

const renderSelect = () =>
  render(
    <Select defaultValue="all">
      <SelectTrigger aria-label="Action type">
        <SelectValue placeholder="Filter" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Actions</SelectItem>
        <SelectItem value="create">Create / Start</SelectItem>
        <SelectItem value="update">Update / Edit</SelectItem>
      </SelectContent>
    </Select>,
  )

describe('select', () => {
  it('keeps options visible after a window resize or blur (extension popup dismiss)', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    renderSelect()

    await user.click(screen.getByRole('combobox', { name: /action type/iu }))

    expect(screen.getByRole('option', { name: /all actions/iu })).toBeVisible()

    act(() => {
      globalThis.dispatchEvent(new Event('resize'))
      globalThis.dispatchEvent(new Event('blur'))
    })

    expect(screen.getByRole('option', { name: /create \/ start/iu })).toBeVisible()
    expect(screen.getByRole('option', { name: /update \/ edit/iu })).toBeVisible()
  })
})
