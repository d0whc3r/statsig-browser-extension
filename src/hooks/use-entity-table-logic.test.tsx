import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { featureGateColumns, featureGateFacets } from '@/src/components/tables/data'
import { DEFAULT_UI_PREFERENCES, useUiPreferencesStore } from '@/src/store/use-ui-preferences-store'
import { useUIStore } from '@/src/store/use-ui-store'
import { mockFeatureGates, paginated } from '@/src/tests/fixtures/statsig'

import { useEntityTableLogic } from './use-entity-table-logic'

describe('useEntityTableLogic', () => {
  beforeEach(() => {
    useUiPreferencesStore.setState({
      tables: structuredClone(DEFAULT_UI_PREFERENCES.tables),
    })
    useUIStore.getState().reset()
  })

  it('flattens pages, falls back to entity count, and opens the entity sheet', () => {
    const refetch = vi.fn()
    const { result } = renderHook(() =>
      useEntityTableLogic({
        columns: featureGateColumns,
        data: { pages: [paginated(mockFeatureGates)] },
        entityType: 'feature_gate',
        facets: featureGateFacets,
        fetchNextPage: vi.fn(),
        fusedKeys: ['name', 'id'],
        hasNextPage: false,
        isFetchingNextPage: false,
        isLoading: false,
        refetch,
      }),
    )

    expect(result.current.entities).toHaveLength(2)
    expect(result.current.totalItems).toBe(2)
    expect(result.current.items.map((item) => item.name)).toContain('new_checkout_flow')

    act(() => {
      result.current.setCurrentEntity('gate-checkout')
      result.current.handleRefetch()
    })

    expect(useUIStore.getState().currentItemId).toBe('gate-checkout')
    expect(useUIStore.getState().currentItemType).toBe('feature_gate')
    expect(useUIStore.getState().isItemSheetOpen).toBeTruthy()
    expect(refetch).toHaveBeenCalled()
  })

  it('treats missing pages as an empty list', () => {
    const { result } = renderHook(() =>
      useEntityTableLogic({
        columns: featureGateColumns,
        data: undefined,
        entityType: 'feature_gate',
        fetchNextPage: vi.fn(),
        fusedKeys: ['name'],
        hasNextPage: false,
        isFetchingNextPage: false,
        isLoading: false,
      }),
    )

    expect(result.current.entities).toStrictEqual([])
    expect(result.current.totalItems).toBe(0)
  })
})
