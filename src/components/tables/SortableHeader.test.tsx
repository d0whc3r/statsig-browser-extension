import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { HeaderColumn } from '@/src/components/tables/table-types'

import { Table, TableHeader, TableRow } from '@/src/components/ui/table'

import { SortableTableHeads } from './SortableHeader'

const sortedNameColumn = {
  canSort: true,
  name: 'NAME',
  onSort: vi.fn(),
  sortDirection: 'asc' as const,
  uid: 'name',
}

const ascendingColumns = [sortedNameColumn]
const descendingColumns = [{ ...sortedNameColumn, sortDirection: 'desc' as const }]
const unsortedColumns = [{ ...sortedNameColumn, sortDirection: false as const }]
const unsortableColumns = [{ ...sortedNameColumn, canSort: false }]

const renderHeads = (columns: readonly HeaderColumn[]) =>
  render(
    <Table>
      <TableHeader>
        <TableRow>
          <SortableTableHeads columns={columns} />
        </TableRow>
      </TableHeader>
    </Table>,
  )

describe('sortableHeader', () => {
  beforeEach(() => {
    sortedNameColumn.onSort.mockClear()
  })

  it('renders the column label and calls onSort when clicked', async () => {
    const user = userEvent.setup()

    renderHeads(unsortedColumns)

    await user.click(screen.getByRole('button', { name: /name/iu }))

    expect(sortedNameColumn.onSort).toHaveBeenCalledTimes(1)
  })

  it.each([
    { columns: ascendingColumns, expected: 'ascending' },
    { columns: descendingColumns, expected: 'descending' },
    { columns: unsortedColumns, expected: 'none' },
  ])('exposes aria-sort=$expected', ({ columns, expected }) => {
    renderHeads(columns)

    expect(screen.getByRole('columnheader')).toHaveAttribute('aria-sort', expected)
  })

  it('omits aria-sort when the column is not sortable', () => {
    renderHeads(unsortableColumns)

    expect(screen.getByRole('columnheader')).not.toHaveAttribute('aria-sort')
  })
})
