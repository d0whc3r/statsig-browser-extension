import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { mockAuditLogs } from '@/src/tests/fixtures/statsig'
import { renderWithProviders } from '@/src/tests/utils/TestUtils'

import { AuditLogList } from './AuditLogList'

const EMPTY_LOGS: typeof mockAuditLogs = []

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
        onClearFilters={vi.fn()}
        onLoadMore={vi.fn()}
        onViewDetails={vi.fn()}
        page={1}
        setPage={vi.fn()}
        totalPages={1}
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
        onClearFilters={vi.fn()}
        onLoadMore={vi.fn()}
        onViewDetails={vi.fn()}
        page={1}
        setPage={vi.fn()}
        totalPages={1}
      />,
    )
    expect(screen.getByText('No audit logs found')).toBeInTheDocument()
  })

  it('shows the search empty state when filters are active and clears them', async () => {
    const user = userEvent.setup()
    const onClearFilters = vi.fn()
    render(
      <AuditLogList
        actionFilter="create"
        filterValue="checkout"
        filteredItems={EMPTY_LOGS}
        hasNextPage={false}
        isFetchingNextPage={false}
        isLoading={false}
        onClearFilters={onClearFilters}
        onLoadMore={vi.fn()}
        onViewDetails={vi.fn()}
        page={1}
        setPage={vi.fn()}
        totalPages={1}
      />,
    )
    expect(screen.getByText('No results with the current filters')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /clear all filters/iu }))
    expect(onClearFilters).toHaveBeenCalledTimes(1)
  })

  it('renders rows, load-more, and the end-of-list footer', async () => {
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
        onClearFilters={vi.fn()}
        onLoadMore={onLoadMore}
        onViewDetails={onViewDetails}
        page={1}
        setPage={vi.fn()}
        totalPages={1}
      />,
    )

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
        onClearFilters={vi.fn()}
        onLoadMore={onLoadMore}
        onViewDetails={onViewDetails}
        page={1}
        setPage={vi.fn()}
        totalPages={1}
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
        onClearFilters={vi.fn()}
        onLoadMore={onLoadMore}
        onViewDetails={onViewDetails}
        page={1}
        setPage={vi.fn()}
        totalPages={1}
      />,
    )
    expect(screen.queryByRole('button', { name: /load more/iu })).not.toBeInTheDocument()
  })

  it('renders page controls and moves to the next page', async () => {
    const setPage = vi.fn()
    const user = userEvent.setup({ pointerEventsCheck: 0 })

    renderWithProviders(
      <AuditLogList
        actionFilter="all"
        filterValue=""
        filteredItems={mockAuditLogs}
        hasNextPage={false}
        isFetchingNextPage={false}
        isLoading={false}
        onClearFilters={vi.fn()}
        onLoadMore={vi.fn()}
        onViewDetails={vi.fn()}
        page={1}
        setPage={setPage}
        totalPages={3}
      />,
    )

    await user.click(screen.getByRole('button', { name: '2' }))
    expect(setPage).toHaveBeenCalledWith(2)
  })
})
