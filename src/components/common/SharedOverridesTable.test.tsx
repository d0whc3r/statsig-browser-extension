import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { TableCell, TableRow } from '@/src/components/ui/table'

import { SharedOverridesTable } from './SharedOverridesTable'

interface Item {
  id: string
  isCurrentUser: boolean
  name: string
}

const columns = [
  { accessor: (item: Item) => item.name, header: 'Name', id: 'name' },
  { header: '', id: 'actions' },
]

const items: Item[] = [
  { id: '2', isCurrentUser: false, name: 'bravo' },
  { id: '1', isCurrentUser: true, name: 'alpha' },
  { id: '3', isCurrentUser: false, name: 'charlie' },
]

const renderRow = (item: Item) => (
  <TableRow key={item.id}>
    <TableCell>{item.name}</TableCell>
    <TableCell>{item.isCurrentUser ? 'you' : 'other'}</TableCell>
  </TableRow>
)

const getRowId = (item: Item) => item.id
const isCurrentUserPredicate = (item: Item) => item.isCurrentUser
const onDeleteConfirm = vi.fn()

const renderTable = (overrides: Item[] = items) =>
  render(
    <SharedOverridesTable
      items={overrides}
      columns={columns}
      getRowId={getRowId}
      isCurrentUserPredicate={isCurrentUserPredicate}
      renderRow={renderRow}
      onDeleteConfirm={onDeleteConfirm}
      colSpan={2}
      emptyEntityName="item"
    />,
  )

describe('sharedOverridesTable', () => {
  it('sorts the current-user group when a column header is clicked', async () => {
    const user = userEvent.setup()
    renderTable()

    expect(screen.getByText('alpha')).toBeInTheDocument()
    expect(screen.queryByText('bravo')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /name/iu }))

    expect(screen.getAllByRole('row')[1]).toHaveTextContent('alpha')
  })

  it('sorts other overrides after they are revealed', async () => {
    const user = userEvent.setup()
    renderTable()

    await user.click(screen.getByRole('button', { name: /show 2 other overrides/iu }))
    await user.click(screen.getByRole('button', { name: /name/iu }))

    const names = screen
      .getAllByRole('row')
      .slice(1)
      .map((row) => row.textContent)
    expect(names).toStrictEqual(['alphayou', 'bravoother', 'charlieother'])
  })
})
