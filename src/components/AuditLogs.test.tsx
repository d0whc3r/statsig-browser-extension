import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DEFAULT_UI_PREFERENCES, useUiPreferencesStore } from '@/src/store/use-ui-preferences-store'
import { useUIStore } from '@/src/store/use-ui-store'
import { mockAuditLogs } from '@/src/tests/fixtures/statsig'
import { renderWithProviders } from '@/src/tests/utils/TestUtils'

import { AuditLogs } from './AuditLogs'

const useAuditLogs = vi.fn()

vi.mock('@/src/hooks/use-audit-logs', () => ({
  useAuditLogs: () => useAuditLogs(),
}))

describe('auditLogs', () => {
  beforeEach(() => {
    useAuditLogs.mockReset()
    useUiPreferencesStore.setState({
      auditLogs: structuredClone(DEFAULT_UI_PREFERENCES.auditLogs),
    })
    useUIStore.getState().reset()
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() {
          return []
        }
      },
    )
  })

  it('renders filtered logs and opens the detail sheet on row click', async () => {
    const refetch = vi.fn().mockResolvedValue(null)
    const fetchNextPage = vi.fn().mockResolvedValue(null)
    useAuditLogs.mockReturnValue({
      data: { pages: [{ data: mockAuditLogs }] },
      fetchNextPage,
      hasNextPage: true,
      isFetching: false,
      isFetchingNextPage: false,
      isLoading: false,
      refetch,
    })

    const user = userEvent.setup({ pointerEventsCheck: 0 })
    renderWithProviders(<AuditLogs />)

    expect(screen.getByText('new_checkout_flow')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /new_checkout_flow/u }))
    expect(useUIStore.getState().currentAuditLogId).toBe(mockAuditLogs[0]?.id)
    expect(useUIStore.getState().isAuditLogDetailSheetOpen).toBeTruthy()
    expect(useUIStore.getState().isAuditLogSheetOpen).toBeFalsy()
  })

  it('updates the stored search filter as the user types', async () => {
    useAuditLogs.mockReturnValue({
      data: { pages: [{ data: mockAuditLogs }] },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetching: false,
      isFetchingNextPage: false,
      isLoading: false,
      refetch: vi.fn(),
    })

    const user = userEvent.setup({ pointerEventsCheck: 0 })
    renderWithProviders(<AuditLogs />)

    await user.type(screen.getByPlaceholderText(/search/iu), 'checkout')
    expect(useUiPreferencesStore.getState().auditLogs.filterValue).toBe('checkout')
  })
})
