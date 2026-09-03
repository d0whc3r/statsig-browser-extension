import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useUIStore } from '@/src/store/use-ui-store'
import { mockAuditLogs } from '@/src/tests/fixtures/statsig'
import { renderWithProviders } from '@/src/tests/utils/TestUtils'

import { AuditLogDetailSheet } from './AuditLogDetailSheet'

const useAuditLogs = vi.fn()

vi.mock('@/src/hooks/use-audit-logs', () => ({
  useAuditLogs: () => useAuditLogs(),
}))

describe('auditLogDetailSheet', () => {
  beforeEach(() => {
    useAuditLogs.mockReset()
    useUIStore.setState({
      currentAuditLogId: mockAuditLogs[0]?.id,
      isAuditLogDetailSheetOpen: true,
    })
  })

  it('renders the log name, action, user, and Statsig deep link', () => {
    useAuditLogs.mockReturnValue({ data: { pages: [{ data: mockAuditLogs }] }, isLoading: false })
    renderWithProviders(<AuditLogDetailSheet />)

    expect(screen.getByText('new_checkout_flow')).toBeInTheDocument()
    expect(screen.getByText('gate::created')).toBeInTheDocument()
    expect(screen.getByText('Creator One')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /statsig/iu })).toHaveAttribute(
      'href',
      `https://console.statsig.com/audit_logs/${mockAuditLogs[0]?.id}`,
    )
    expect(screen.getByText(/Created new feature gate/u)).toBeInTheDocument()
  })

  it('shows a not-found state when the log is missing', () => {
    useAuditLogs.mockReturnValue({ data: { pages: [{ data: [] }] }, isLoading: false })
    renderWithProviders(<AuditLogDetailSheet />)
    expect(screen.getByText('Audit log details not found.')).toBeInTheDocument()
  })

  it('shows skeletons while loading and no log is cached', () => {
    useAuditLogs.mockReturnValue({ data: undefined, isLoading: true })
    renderWithProviders(<AuditLogDetailSheet />)
    expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)
  })
})
