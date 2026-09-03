import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Table, TableHeader, TableRow } from '@/src/components/ui/table'

import { SortableHeader, SortableTableHeads } from './SortableHeader'

const sortedNameColumn = {
  canSort: true,
  name: 'NAME',
  onSort: vi.fn(),
  sortDirection: 'asc' as const,
  uid: 'name',
}

const sortedNameColumns = [sortedNameColumn]

describe('sortableHeader', () => {
  it('renders the column label and calls onSort when clicked', async () => {
    const onSort = vi.fn()
    const user = userEvent.setup()

    render(<SortableHeader label="NAME" sortDirection={false} onSort={onSort} />)

    await user.click(screen.getByRole('button', { name: /name/iu }))

    expect(onSort).toHaveBeenCalledTimes(1)
  })

  it('exposes the current sort direction on the column header', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <SortableTableHeads columns={sortedNameColumns} />
          </TableRow>
        </TableHeader>
      </Table>,
    )

    expect(screen.getByRole('columnheader')).toHaveAttribute('aria-sort', 'ascending')
  })
})
