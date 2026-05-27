import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { AuditLog } from '@/src/types/statsig'

import { AuditLogRow } from './AuditLogRow'

const buildAuditLog = (overrides: Partial<AuditLog> = {}): AuditLog =>
  ({
    actionType: 'update',
    changeLog: 'Renamed a config',
    date: '2026-05-26',
    id: 'log_1',
    modifierEmail: 'editor@example.com',
    name: 'my_feature_gate',
    tags: ['prod', 'experiment'],
    time: '10:00:00',
    type: 'gate',
    updatedBy: 'updater',
    ...overrides,
  }) as AuditLog

describe('auditLogRow', () => {
  it('renders the gate name, action label, change description and updatedBy', () => {
    render(<AuditLogRow auditLog={buildAuditLog()} onViewDetails={vi.fn()} />)
    expect(screen.getByText('my_feature_gate')).toBeInTheDocument()
    expect(screen.getByText('Update')).toBeInTheDocument()
    expect(screen.getByText('Renamed a config')).toBeInTheDocument()
    expect(screen.getByText(/By updater/u)).toBeInTheDocument()
    expect(screen.getByText('editor@example.com')).toBeInTheDocument()
  })

  it('hides the modifier email when it matches updatedBy', () => {
    render(
      <AuditLogRow
        auditLog={buildAuditLog({ modifierEmail: 'updater', updatedBy: 'updater' })}
        onViewDetails={vi.fn()}
      />,
    )
    expect(screen.queryByText('updater@')).toBeNull()
  })

  it('renders each tag as a badge', () => {
    render(<AuditLogRow auditLog={buildAuditLog()} onViewDetails={vi.fn()} />)
    expect(screen.getByText('prod')).toBeInTheDocument()
    expect(screen.getByText('experiment')).toBeInTheDocument()
  })

  it('omits the change description when none is provided', () => {
    render(<AuditLogRow auditLog={buildAuditLog({ changeLog: undefined })} onViewDetails={vi.fn()} />)
    expect(screen.queryByText('Renamed a config')).toBeNull()
  })

  it('invokes onViewDetails when the row is clicked', async () => {
    const onViewDetails = vi.fn()
    render(<AuditLogRow auditLog={buildAuditLog()} onViewDetails={onViewDetails} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /my_feature_gate/iu }))
    expect(onViewDetails).toHaveBeenCalledWith('log_1')
  })

  it('invokes onViewDetails when Enter is pressed', async () => {
    const onViewDetails = vi.fn()
    render(<AuditLogRow auditLog={buildAuditLog()} onViewDetails={onViewDetails} />)
    const user = userEvent.setup()
    const row = screen.getByRole('button', { name: /my_feature_gate/iu })
    row.focus()
    await user.keyboard('{Enter}')
    expect(onViewDetails).toHaveBeenCalledWith('log_1')
  })

  it('invokes onViewDetails when Space is pressed', async () => {
    const onViewDetails = vi.fn()
    render(<AuditLogRow auditLog={buildAuditLog()} onViewDetails={onViewDetails} />)
    const user = userEvent.setup()
    const row = screen.getByRole('button', { name: /my_feature_gate/iu })
    row.focus()
    await user.keyboard(' ')
    expect(onViewDetails).toHaveBeenCalledWith('log_1')
  })

  it('does not fire onViewDetails for unrelated keys', async () => {
    const onViewDetails = vi.fn()
    render(<AuditLogRow auditLog={buildAuditLog()} onViewDetails={onViewDetails} />)
    const user = userEvent.setup()
    const row = screen.getByRole('button', { name: /my_feature_gate/iu })
    row.focus()
    await user.keyboard('a')
    expect(onViewDetails).not.toHaveBeenCalled()
  })
})
