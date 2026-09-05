import { describe, expect, it, vi } from 'vitest'

import type { Column, HeaderColumn } from '@/src/components/tables/table-types'

import { renderWithProviders, screen } from '@/src/tests/utils/TestUtils'

import { EntityTable } from './EntityTable'

const columns: Column[] = [{ name: 'Name', uid: 'name' }]
const headerColumns: HeaderColumn[] = [{ canSort: false, name: 'Name', sortDirection: false, uid: 'name' }]

const renderTable = (overrides: Record<string, unknown> = {}) => {
  const props = {
    columns,
    facetFilters: {},
    facetGroups: [],
    fetchNextPage: vi.fn(),
    filterValue: '',
    filteredCount: 1,
    handleClearFacets: vi.fn(),
    handleSetFilterValue: vi.fn(),
    handleSetVisibleColumns: vi.fn(),
    handleToggleFacet: vi.fn(),
    hasNextPage: false,
    headerColumns,
    isFetchingNextPage: false,
    loadMoreText: 'Load more gates',
    onRowsPerPageChange: vi.fn(),
    onSearchChange: vi.fn(),
    page: 1,
    pages: 1,
    rowsPerPage: 10,
    setPage: vi.fn(),
    totalItems: 1,
    type: 'featureGates' as const,
    visibleColumns: ['name'],
    ...overrides,
  }

  return {
    props,
    ...renderWithProviders(
      <EntityTable {...props}>
        <tr>
          <td>row content</td>
        </tr>
      </EntityTable>,
    ),
  }
}

describe('entityTable', () => {
  it('renders the header columns and the row children', () => {
    renderTable()

    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument()
    expect(screen.getByText('row content')).toBeInTheDocument()
  })

  it('hides the footer while everything fits on a single page', () => {
    renderTable()

    expect(screen.queryByRole('button', { name: /load more gates/iu })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '1' })).not.toBeInTheDocument()
  })

  it('shows the pager once there is more than one page', () => {
    renderTable({ pages: 3 })

    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /load more gates/iu })).not.toBeInTheDocument()
  })

  it('shows the load-more button on a single page that still has a next page', () => {
    renderTable({ hasNextPage: true })

    expect(screen.getByRole('button', { name: /load more gates/iu })).toBeEnabled()
  })

  it('fetches the next page when load-more is clicked', async () => {
    const { props, user } = renderTable({ hasNextPage: true })

    await user.click(screen.getByRole('button', { name: /load more gates/iu }))

    expect(props.fetchNextPage).toHaveBeenCalledTimes(1)
  })

  it('disables load-more while a page is already in flight', () => {
    renderTable({ hasNextPage: true, isFetchingNextPage: true })

    expect(screen.getByRole('button', { name: /loading more/iu })).toBeDisabled()
  })
})
