import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { storage } from 'wxt/utils/storage'

import {
  DEFAULT_UI_PREFERENCES,
  UI_PREFERENCES_STORAGE_KEY,
  useUiPreferencesStore,
} from '@/src/store/use-ui-preferences-store'

import { useTableState } from './use-table-state'

const resetPreferences = async () => {
  useUiPreferencesStore.setState({
    activeTab: DEFAULT_UI_PREFERENCES.activeTab,
    auditLogs: structuredClone(DEFAULT_UI_PREFERENCES.auditLogs),
    tables: structuredClone(DEFAULT_UI_PREFERENCES.tables),
  })
  await storage.removeItem(UI_PREFERENCES_STORAGE_KEY)
}

describe('useTableState', () => {
  beforeEach(async () => {
    await resetPreferences()
  })

  it('exposes default table prefs and page 1', () => {
    const { result } = renderHook(() => useTableState('featureGates'))

    expect(result.current.visibleColumns).toStrictEqual(['name', 'tags', 'status', 'isEnabled', 'actions'])
    expect(result.current.rowsPerPage).toBe(5)
    expect(result.current.filterValue).toBe('')
    expect(result.current.page).toBe(1)
    expect(result.current.facetFilters).toStrictEqual({})
  })

  it('keeps search and facet filters after remount', () => {
    const { result, unmount } = renderHook(() => useTableState('featureGates'))

    act(() => {
      result.current.onSearchChange('checkout')
    })
    act(() => {
      result.current.handleToggleFacet('tags', 'checkout')
    })

    expect(result.current.filterValue).toBe('checkout')
    expect(result.current.facetFilters).toStrictEqual({ tags: ['checkout'] })

    unmount()

    const { result: remounted } = renderHook(() => useTableState('featureGates'))
    expect(remounted.current.filterValue).toBe('checkout')
    expect(remounted.current.facetFilters).toStrictEqual({ tags: ['checkout'] })
  })

  it('toggles facet values, resets the page, and clears them all', () => {
    const { result } = renderHook(() => useTableState('featureGates'))

    act(() => {
      result.current.setPage(4)
    })
    act(() => {
      result.current.handleToggleFacet('tags', 'checkout')
    })
    act(() => {
      result.current.handleToggleFacet('isEnabled', 'Enabled')
    })

    expect(result.current.facetFilters).toStrictEqual({ isEnabled: ['Enabled'], tags: ['checkout'] })
    expect(result.current.page).toBe(1)

    act(() => {
      result.current.handleToggleFacet('tags', 'checkout')
    })
    expect(result.current.facetFilters).toStrictEqual({ isEnabled: ['Enabled'] })

    act(() => {
      result.current.handleClearFacets()
    })
    expect(result.current.facetFilters).toStrictEqual({})
  })

  it('resets the page when changing rows per page', () => {
    const { result } = renderHook(() => useTableState('featureGates'))

    act(() => {
      result.current.setPage(5)
    })
    expect(result.current.page).toBe(5)

    act(() => {
      result.current.onRowsPerPageChange(25)
    })

    expect(result.current.rowsPerPage).toBe(25)
    expect(result.current.page).toBe(1)
  })

  it('resets the page to 1 when a non-empty search value is set', () => {
    const { result } = renderHook(() => useTableState('featureGates'))

    act(() => {
      result.current.setPage(3)
    })
    act(() => {
      result.current.onSearchChange('gate_a')
    })

    expect(result.current.filterValue).toBe('gate_a')
    expect(result.current.page).toBe(1)
  })

  it('clears filterValue without resetting page when search is emptied', () => {
    const { result } = renderHook(() => useTableState('featureGates'))

    act(() => {
      result.current.onSearchChange('foo')
    })
    act(() => {
      result.current.setPage(7)
    })
    act(() => {
      result.current.onSearchChange('')
    })

    expect(result.current.filterValue).toBe('')
    expect(result.current.page).toBe(7)
  })

  it('exposes setters for filter value, visible columns, and sorting', () => {
    const { result } = renderHook(() => useTableState('featureGates'))

    act(() => {
      result.current.handleSetFilterValue('xx')
      result.current.handleSetVisibleColumns(['name'])
      result.current.setSorting([{ desc: true, id: 'name' }])
    })

    expect(result.current.filterValue).toBe('xx')
    expect(result.current.visibleColumns).toStrictEqual(['name'])
    expect(result.current.sorting).toStrictEqual([{ desc: true, id: 'name' }])
    expect(result.current.page).toBe(1)
  })
})
