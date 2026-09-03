import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { Column } from '@/src/components/tables/table-types'

import { useEntityDataTable } from './use-entity-data-table'

interface Row {
  id: string
  name: string
  tags: string[]
}

const columns: readonly Column[] = [
  { name: 'NAME', sortable: true, uid: 'name', width: 'w-[50%]' },
  { name: 'TAGS', sortable: true, uid: 'tags', width: 'w-[30%]' },
  { name: 'ACTIONS', sortable: false, uid: 'actions', width: 'w-[20%]' },
]

const rows: Row[] = [
  { id: '2', name: 'bravo', tags: ['z'] },
  { id: '1', name: 'alpha', tags: ['m'] },
  { id: '3', name: 'charlie', tags: ['a'] },
]

const setup = (overrides: Partial<Parameters<typeof useEntityDataTable<Row>>[0]> = {}) =>
  renderHook(() =>
    useEntityDataTable<Row>({
      columns,
      data: rows,
      page: 1,
      rowsPerPage: 10,
      visibleColumns: ['name', 'tags', 'actions'],
      ...overrides,
    }),
  )

describe('useEntityDataTable', () => {
  it('keeps the original row order until a column is sorted', () => {
    const { result } = setup()

    expect(result.current.items.map((item) => item.name)).toStrictEqual(['bravo', 'alpha', 'charlie'])
  })

  it('sorts the full filtered set before paginating', () => {
    const { result } = setup({ rowsPerPage: 2 })

    act(() => {
      result.current.headerColumns[0]?.onSort?.({})
    })

    expect(result.current.items.map((item) => item.name)).toStrictEqual(['alpha', 'bravo'])
    expect(result.current.pages).toBe(2)
  })

  it('cycles a sortable column through asc, desc, and unsorted', () => {
    const { result } = setup()
    const nameHeader = () => result.current.headerColumns.find((column) => column.uid === 'name')

    act(() => {
      nameHeader()?.onSort?.({})
    })
    expect(result.current.items.map((item) => item.name)).toStrictEqual(['alpha', 'bravo', 'charlie'])
    expect(nameHeader()?.sortDirection).toBe('asc')

    act(() => {
      nameHeader()?.onSort?.({})
    })
    expect(result.current.items.map((item) => item.name)).toStrictEqual(['charlie', 'bravo', 'alpha'])
    expect(nameHeader()?.sortDirection).toBe('desc')

    act(() => {
      nameHeader()?.onSort?.({})
    })
    expect(result.current.items.map((item) => item.name)).toStrictEqual(['bravo', 'alpha', 'charlie'])
    expect(nameHeader()?.sortDirection).toBeFalsy()
  })

  it('does not sort the actions column', () => {
    const { result } = setup()
    const actions = result.current.headerColumns.find((column) => column.uid === 'actions')

    expect(actions?.canSort).toBeFalsy()
    expect(actions?.onSort).toBeUndefined()
  })

  it('hides columns that are not in visibleColumns', () => {
    const { result } = setup({ visibleColumns: ['name', 'actions'] })

    expect(result.current.headerColumns.map((column) => column.uid)).toStrictEqual(['name', 'actions'])
  })

  it('notifies the parent when sorting changes so pagination can reset', () => {
    const onSortingChange = vi.fn()
    const { result } = setup({ onSortingChange })

    act(() => {
      result.current.headerColumns[0]?.onSort?.({})
    })

    expect(onSortingChange).toHaveBeenCalledTimes(1)
  })
})
