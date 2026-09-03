import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { mockAuditLogs } from '@/src/tests/fixtures/statsig'
import { renderWithProviders } from '@/src/tests/utils/TestUtils'

import { AuditLogList } from './AuditLogList'

const observe = vi.fn()
const disconnect = vi.fn()
const EMPTY_LOGS: typeof mockAuditLogs = []

class MockIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  callback: IntersectionObserverCallback

  observe = observe

  unobserve = vi.fn()

  disconnect = disconnect

  takeRecords = () => []
}

describe('auditLogList', () => {
  it('renders skeletons while loading', () => {
    const { container } = render(
      <AuditLogList
        actionFilter="all"
        filterValue=""
        filteredItems={EMPTY_LOGS}
        hasNextPage={false}
        isFetchingNextPage={false}
        isLoading
        onLoadMore={vi.fn()}
        onViewDetails={vi.fn()}
      />,
    )
    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)
  })

  it('shows the unfiltered empty state when there are no logs', () => {
    render(
      <AuditLogList
        actionFilter="all"
        filterValue=""
        filteredItems={EMPTY_LOGS}
        hasNextPage={false}
        isFetchingNextPage={false}
        isLoading={false}
        onLoadMore={vi.fn()}
        onViewDetails={vi.fn()}
      />,
    )
    expect(screen.getByText('No audit logs found')).toBeInTheDocument()
  })

  it('shows the search empty state when filters are active', () => {
    render(
      <AuditLogList
        actionFilter="create"
        filterValue="checkout"
        filteredItems={EMPTY_LOGS}
        hasNextPage={false}
        isFetchingNextPage={false}
        isLoading={false}
        onLoadMore={vi.fn()}
        onViewDetails={vi.fn()}
      />,
    )
    expect(screen.getByText('No results found')).toBeInTheDocument()
  })

  it('renders rows, load-more, and the end-of-list footer', async () => {
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
    const onLoadMore = vi.fn()
    const onViewDetails = vi.fn()
    const user = userEvent.setup({ pointerEventsCheck: 0 })

    const { rerender } = renderWithProviders(
      <AuditLogList
        actionFilter="all"
        filterValue=""
        filteredItems={mockAuditLogs}
        hasNextPage
        isFetchingNextPage={false}
        isLoading={false}
        onLoadMore={onLoadMore}
        onViewDetails={onViewDetails}
      />,
    )

    expect(observe).toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: /new_checkout_flow/u }))
    expect(onViewDetails).toHaveBeenCalledWith(mockAuditLogs[0]?.id)

    await user.click(screen.getByRole('button', { name: /load more/iu }))
    expect(onLoadMore).toHaveBeenCalled()

    rerender(
      <AuditLogList
        actionFilter="all"
        filterValue=""
        filteredItems={mockAuditLogs}
        hasNextPage
        isFetchingNextPage
        isLoading={false}
        onLoadMore={onLoadMore}
        onViewDetails={onViewDetails}
      />,
    )
    expect(screen.getByRole('button', { name: /loading/iu })).toBeDisabled()

    rerender(
      <AuditLogList
        actionFilter="all"
        filterValue=""
        filteredItems={mockAuditLogs}
        hasNextPage={false}
        isFetchingNextPage={false}
        isLoading={false}
        onLoadMore={onLoadMore}
        onViewDetails={onViewDetails}
      />,
    )
    expect(screen.getByText('No more audit logs')).toBeInTheDocument()
    vi.unstubAllGlobals()
  })
})
