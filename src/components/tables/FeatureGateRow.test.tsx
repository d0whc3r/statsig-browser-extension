import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Table, TableBody } from '@/src/components/ui/table'
import { mockFeatureGates } from '@/src/tests/fixtures/statsig'

import { FeatureGateRow } from './FeatureGateRow'

const fullColumns = [{ uid: 'name' }, { uid: 'status' }, { uid: 'isEnabled' }, { uid: 'tags' }, { uid: 'unknown' }]
const statusColumns = [{ uid: 'isEnabled' }, { uid: 'status' }]
const [checkoutGate, darkThemeGate] = mockFeatureGates

describe('featureGateRow', () => {
  it('renders name, status, enabled, tags, and unknown columns as empty', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    const onRowClick = vi.fn()

    render(
      <Table>
        <TableBody>
          <FeatureGateRow headerColumns={fullColumns} item={checkoutGate} onRowClick={onRowClick} />
        </TableBody>
      </Table>,
    )

    expect(screen.getByText('new_checkout_flow')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Enabled')).toBeInTheDocument()
    expect(screen.getByText('checkout')).toBeInTheDocument()

    await user.click(screen.getByText('new_checkout_flow'))
    expect(onRowClick).toHaveBeenCalledWith(checkoutGate.id)
  })

  it('renders Disabled for an inactive gate', () => {
    render(
      <Table>
        <TableBody>
          <FeatureGateRow headerColumns={statusColumns} item={darkThemeGate} onRowClick={vi.fn()} />
        </TableBody>
      </Table>,
    )
    expect(screen.getAllByText('Disabled').length).toBeGreaterThan(0)
  })
})
