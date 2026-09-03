import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { SortableHeader } from './SortableHeader'

describe('sortableHeader', () => {
  it('renders the column label and calls onSort when clicked', async () => {
    const onSort = vi.fn()
    const user = userEvent.setup()

    render(<SortableHeader label="NAME" sortDirection={false} onSort={onSort} />)

    await user.click(screen.getByRole('button', { name: /name/iu }))

    expect(onSort).toHaveBeenCalledTimes(1)
  })

  it('exposes the current sort direction to assistive tech', () => {
    render(<SortableHeader label="NAME" sortDirection="asc" onSort={vi.fn()} />)

    expect(screen.getByRole('button', { name: /name/iu })).toHaveAttribute('aria-sort', 'ascending')
  })
})
