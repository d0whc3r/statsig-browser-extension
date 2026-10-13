import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DEFAULT_UI_PREFERENCES, useUiPreferencesStore } from '@/src/store/use-ui-preferences-store'
import { mockExperiments, paginated } from '@/src/tests/fixtures/statsig'
import { renderWithProviders } from '@/src/tests/utils/TestUtils'

import { ExperimentsTable } from './ExperimentsTable'

const { useExperimentsMock } = vi.hoisted(() => ({ useExperimentsMock: vi.fn() }))

vi.mock('@/src/hooks/use-experiments', () => ({ useExperiments: useExperimentsMock }))

describe('experimentsTable', () => {
  beforeEach(() => {
    useExperimentsMock.mockReturnValue({
      data: { pages: [paginated(mockExperiments)] },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: false,
    })
    useUiPreferencesStore.setState({
      tables: structuredClone(DEFAULT_UI_PREFERENCES.tables),
    })
  })

  it('shows API failures and lets the user retry', async () => {
    const refetch = vi.fn().mockResolvedValue(null)
    useExperimentsMock.mockReturnValue({
      data: undefined,
      error: new Error('Server unavailable'),
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isError: true,
      isFetchingNextPage: false,
      isLoading: false,
      refetch,
    })
    renderWithProviders(<ExperimentsTable />)

    expect(screen.getByText('Failed to load experiments')).toBeInTheDocument()
    await userEvent.setup().click(screen.getByRole('button', { name: 'Retry' }))
    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it('renders mocked experiments', () => {
    renderWithProviders(<ExperimentsTable />)
    expect(screen.getByText('homepage_hero_reorder')).toBeInTheDocument()
  })
})
