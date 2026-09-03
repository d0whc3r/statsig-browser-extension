import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DEFAULT_UI_PREFERENCES, useUiPreferencesStore } from '@/src/store/use-ui-preferences-store'
import { mockDynamicConfigs, paginated } from '@/src/tests/fixtures/statsig'
import { renderWithProviders } from '@/src/tests/utils/TestUtils'

import { DynamicConfigsTable } from './DynamicConfigsTable'

vi.mock('@/src/hooks/use-dynamic-configs', () => ({
  useDynamicConfigs: () => ({
    data: { pages: [paginated(mockDynamicConfigs)] },
    error: null,
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isError: false,
    isFetchingNextPage: false,
    isLoading: false,
    refetch: vi.fn(),
  }),
}))

describe('dynamicConfigsTable', () => {
  beforeEach(() => {
    useUiPreferencesStore.setState({
      tables: structuredClone(DEFAULT_UI_PREFERENCES.tables),
    })
  })

  it('renders mocked dynamic configs in the table', () => {
    renderWithProviders(<DynamicConfigsTable />)
    expect(screen.getByText('homepage_banner_config')).toBeInTheDocument()
    expect(screen.getAllByText('Enabled').length).toBeGreaterThan(0)
  })
})
