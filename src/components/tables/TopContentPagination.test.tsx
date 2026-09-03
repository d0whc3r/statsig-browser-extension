import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { TopContentPagination } from './TopContentPagination'

describe('topContentPagination', () => {
  it('does not render a native select for rows per page', () => {
    render(
      <TopContentPagination
        total={20}
        filteredCount={20}
        typeLabelPlural="feature gates"
        rowsPerPage={10}
        onRowsPerPageChange={vi.fn()}
      />,
    )

    expect(document.querySelector('select')).toBeNull()
    expect(screen.getByRole('combobox', { name: /rows per page/iu })).toHaveTextContent('10')
  })

  it('calls onRowsPerPageChange with the chosen row count', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    const onRowsPerPageChange = vi.fn()
    render(
      <TopContentPagination
        total={20}
        filteredCount={20}
        typeLabelPlural="feature gates"
        rowsPerPage={10}
        onRowsPerPageChange={onRowsPerPageChange}
      />,
    )

    await user.click(screen.getByRole('combobox', { name: /rows per page/iu }))
    await user.click(screen.getByRole('option', { name: '25' }))

    await waitFor(() => {
      expect(onRowsPerPageChange).toHaveBeenCalledWith(25)
    })
  })
})
