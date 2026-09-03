import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Table, TableBody } from '@/src/components/ui/table'
import { mockDynamicConfigs } from '@/src/tests/fixtures/statsig'

import { DynamicConfigRow } from './DynamicConfigRow'

const headerColumns = [{ uid: 'name' }, { uid: 'isEnabled' }, { uid: 'tags' }, { uid: 'actions' }, { uid: 'unknown' }]
const statusColumns = [{ uid: 'isEnabled' }, { uid: 'tags' }]
const [enabledConfig] = mockDynamicConfigs
const disabledConfig = { ...enabledConfig, isEnabled: false, tags: [] as string[] }

describe('dynamicConfigRow', () => {
  it('renders name, enabled badge, tags, and forwards row clicks', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    const onRowClick = vi.fn()

    render(
      <Table>
        <TableBody>
          <DynamicConfigRow headerColumns={headerColumns} item={enabledConfig} onRowClick={onRowClick} />
        </TableBody>
      </Table>,
    )

    expect(screen.getByText('homepage_banner_config')).toBeInTheDocument()
    expect(screen.getByText('Enabled')).toBeInTheDocument()
    expect(screen.getByText('homepage')).toBeInTheDocument()

    await user.click(screen.getByText('homepage_banner_config'))
    expect(onRowClick).toHaveBeenCalledWith(enabledConfig.id)
  })

  it('renders a Disabled badge when the config is off', () => {
    render(
      <Table>
        <TableBody>
          <DynamicConfigRow headerColumns={statusColumns} item={disabledConfig} onRowClick={vi.fn()} />
        </TableBody>
      </Table>,
    )
    expect(screen.getByText('Disabled')).toBeInTheDocument()
    expect(screen.getByText('—')).toBeInTheDocument()
  })
})
