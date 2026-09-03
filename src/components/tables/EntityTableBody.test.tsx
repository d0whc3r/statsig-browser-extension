import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Table, TableBody } from '@/src/components/ui/table'

import { EntityTableBody } from './EntityTableBody'
import { TableLoadingState } from './TableLoadingState'

const HEADER_COLUMNS = [{ uid: 'name' }]
const EMPTY_ITEMS: { id: string; name: string }[] = []
const GATE_ITEMS = [{ id: 'g1', name: 'gate_one' }]

function RowComponent({ item }: { item: { id: string; name: string }; onRowClick: (id: string) => void }) {
  return (
    <tr>
      <td>{item.name}</td>
    </tr>
  )
}

const renderBody = (props: Partial<Parameters<typeof EntityTableBody<{ id: string; name: string }>>[0]> = {}) =>
  render(
    <Table>
      <TableBody>
        <EntityTableBody
          RowComponent={RowComponent}
          emptyVariant="feature_gate"
          headerColumns={HEADER_COLUMNS}
          isLoading={false}
          items={EMPTY_ITEMS}
          onRowClick={vi.fn()}
          {...props}
        />
      </TableBody>
    </Table>,
  )

describe('entityTableBody', () => {
  it('shows the loading state', () => {
    const { container } = renderBody({ isLoading: true })
    expect(container.querySelectorAll('tr').length).toBeGreaterThan(0)
    expect(TableLoadingState).toBeDefined()
  })

  it('shows an error with retry when errorTitle is set', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    renderBody({
      error: new Error('upstream'),
      errorTitle: 'Failed to load feature gates',
      isError: true,
      onRetry,
    })

    expect(screen.getByText('Failed to load feature gates')).toBeInTheDocument()
    expect(screen.getByText('upstream')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /retry/iu }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('falls back to a generic error description for non-Error values', () => {
    renderBody({ error: 'nope', errorTitle: 'Failed to load', isError: true })
    expect(screen.getByText('An unknown error occurred')).toBeInTheDocument()
  })

  it('does not treat isError as an error row without an errorTitle', () => {
    renderBody({ isError: true, items: EMPTY_ITEMS })
    expect(screen.getByText('No feature gates found')).toBeInTheDocument()
  })

  it('renders rows', () => {
    renderBody({ items: GATE_ITEMS })
    expect(screen.getByText('gate_one')).toBeInTheDocument()
  })
})
