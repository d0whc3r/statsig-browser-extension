import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DEFAULT_UI_PREFERENCES, useUiPreferencesStore } from '@/src/store/use-ui-preferences-store'
import { mockFeatureGates, paginated } from '@/src/tests/fixtures/statsig'
import { renderWithProviders } from '@/src/tests/utils/TestUtils'

import { FeatureGatesTable } from './FeatureGatesTable'

vi.mock('@/src/hooks/use-feature-gates', () => ({
  useFeatureGates: () => ({
    data: { pages: [paginated(mockFeatureGates)] },
    error: null,
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isError: false,
    isFetchingNextPage: false,
    isLoading: false,
    refetch: vi.fn(),
  }),
}))

describe('featureGatesTable', () => {
  beforeEach(() => {
    useUiPreferencesStore.setState({
      tables: structuredClone(DEFAULT_UI_PREFERENCES.tables),
    })
  })

  it('renders mocked feature gates', () => {
    renderWithProviders(<FeatureGatesTable />)
    expect(screen.getByText('new_checkout_flow')).toBeInTheDocument()
    expect(screen.getByText('dark_theme_enabled')).toBeInTheDocument()
  })
})
