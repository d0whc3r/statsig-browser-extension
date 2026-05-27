import type { WxtStorageItem } from 'wxt/utils/storage'

import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useTableState } from './use-table-state'

type Listener<T> = (value: T) => void

const createStorageItem = <T,>(initial: T) => {
  const listeners: Listener<T>[] = []
  let stored = initial
  const item = {
    fallback: initial,
    getValue: () => stored,
    setValue: (value: T) => {
      stored = value
      return Promise.resolve()
    },
    watch: (cb: Listener<T>) => {
      listeners.push(cb)
      return () => {
        const i = listeners.indexOf(cb)
        if (i !== -1) {
          listeners.splice(i, 1)
        }
      }
    },
  }
  return item as unknown as WxtStorageItem<T, Record<string, unknown>>
}

const setup = () => {
  const visibleColumnsStorage = createStorageItem<string[]>(['col-a', 'col-b'])
  const rowsPerPageStorage = createStorageItem<number>(10)
  return { rowsPerPageStorage, visibleColumnsStorage }
}

describe('useTableState', () => {
  it('exposes initial values from storage and transient state', async () => {
    const { visibleColumnsStorage, rowsPerPageStorage } = setup()
    const { result } = renderHook(() =>
      useTableState({ initialStatusFilter: new Set(['active']), rowsPerPageStorage, visibleColumnsStorage }),
    )

    await waitFor(() => {
      expect(result.current.visibleColumns).toStrictEqual(['col-a', 'col-b'])
      expect(result.current.rowsPerPage).toBe(10)
    })

    expect(result.current.filterValue).toBe('')
    expect(result.current.page).toBe(1)
    expect(result.current.statusFilter).toStrictEqual(new Set(['active']))
  })

  it('defaults statusFilter to "all" when no initial filter is provided', () => {
    const { visibleColumnsStorage, rowsPerPageStorage } = setup()
    const { result } = renderHook(() => useTableState({ rowsPerPageStorage, visibleColumnsStorage }))

    expect(result.current.statusFilter).toStrictEqual(new Set(['all']))
  })

  it('resets the page when changing rows per page', () => {
    const { visibleColumnsStorage, rowsPerPageStorage } = setup()
    const { result } = renderHook(() => useTableState({ rowsPerPageStorage, visibleColumnsStorage }))

    act(() => {
      result.current.setPage(5)
    })
    expect(result.current.page).toBe(5)

    act(() => {
      result.current.onRowsPerPageChange({
        target: { value: '25' },
      } as React.ChangeEvent<HTMLSelectElement>)
    })

    expect(result.current.rowsPerPage).toBe(25)
    expect(result.current.page).toBe(1)
  })

  it('resets the page to 1 when a non-empty search value is set', () => {
    const { visibleColumnsStorage, rowsPerPageStorage } = setup()
    const { result } = renderHook(() => useTableState({ rowsPerPageStorage, visibleColumnsStorage }))

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
    const { visibleColumnsStorage, rowsPerPageStorage } = setup()
    const { result } = renderHook(() => useTableState({ rowsPerPageStorage, visibleColumnsStorage }))

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

  it('exposes setters for filter, status filter, and visible columns', () => {
    const { visibleColumnsStorage, rowsPerPageStorage } = setup()
    const { result } = renderHook(() => useTableState({ rowsPerPageStorage, visibleColumnsStorage }))

    act(() => {
      result.current.handleSetFilterValue('xx')
      result.current.handleSetStatusFilter(new Set(['enabled']))
      result.current.handleSetVisibleColumns(['name'])
    })

    expect(result.current.filterValue).toBe('xx')
    expect(result.current.statusFilter).toStrictEqual(new Set(['enabled']))
    expect(result.current.visibleColumns).toStrictEqual(['name'])
  })
})
