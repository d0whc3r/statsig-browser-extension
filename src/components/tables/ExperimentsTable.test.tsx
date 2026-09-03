import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DEFAULT_UI_PREFERENCES, useUiPreferencesStore } from '@/src/store/use-ui-preferences-store'
import { mockExperiments, paginated } from '@/src/tests/fixtures/statsig'
import { renderWithProviders } from '@/src/tests/utils/TestUtils'

import { ExperimentsTable } from './ExperimentsTable'

vi.mock('@/src/hooks/use-experiments', () => ({
  useExperiments: () => ({
    data: { pages: [paginated(mockExperiments)] },
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    isLoading: false,
  }),
}))

describe('experimentsTable', () => {
  beforeEach(() => {
    useUiPreferencesStore.setState({
      tables: structuredClone(DEFAULT_UI_PREFERENCES.tables),
    })
  })

  it('renders mocked experiments', () => {
    renderWithProviders(<ExperimentsTable />)
    expect(screen.getByText('homepage_hero_reorder')).toBeInTheDocument()
  })
})
