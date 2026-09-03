import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useSortedTable } from './use-sorted-table'

interface Row {
  environment: string | null
  id: string
  type: string
}

const columns = [
  { accessor: (row: Row) => row.id, header: 'ID', id: 'id' },
  { accessor: (row: Row) => row.type, header: 'Type', id: 'type' },
  { accessor: (row: Row) => row.environment ?? 'All', header: 'Environment', id: 'environment' },
  { header: '', id: 'actions' },
] as const

const rows: Row[] = [
  { environment: 'production', id: 'bravo', type: 'fail' },
  { environment: null, id: 'alpha', type: 'pass' },
  { environment: 'staging', id: 'charlie', type: 'fail' },
]

const setup = (data: Row[] = rows) =>
  renderHook(() =>
    useSortedTable<Row>({
      columns,
      data,
      getRowId: (row) => row.id,
    }),
  )

describe('useSortedTable', () => {
  it('keeps the original row order until a column is sorted', () => {
    const { result } = setup()

    expect(result.current.items.map((item) => item.id)).toStrictEqual(['bravo', 'alpha', 'charlie'])
  })

  it('sorts by the clicked column and cycles back to unsorted', () => {
    const { result } = setup()
    const idHeader = () => result.current.headerColumns.find((column) => column.uid === 'id')

    act(() => {
      idHeader()?.onSort?.({})
    })
    expect(result.current.items.map((item) => item.id)).toStrictEqual(['alpha', 'bravo', 'charlie'])
    expect(idHeader()?.sortDirection).toBe('asc')

    act(() => {
      idHeader()?.onSort?.({})
    })
    expect(result.current.items.map((item) => item.id)).toStrictEqual(['charlie', 'bravo', 'alpha'])
    expect(idHeader()?.sortDirection).toBe('desc')

    act(() => {
      idHeader()?.onSort?.({})
    })
    expect(result.current.items.map((item) => item.id)).toStrictEqual(['bravo', 'alpha', 'charlie'])
    expect(idHeader()?.sortDirection).toBeFalsy()
  })

  it('sorts nullish values using the accessor fallback', () => {
    const { result } = setup()
    const environmentHeader = () => result.current.headerColumns.find((column) => column.uid === 'environment')

    act(() => {
      environmentHeader()?.onSort?.({})
    })

    expect(result.current.items.map((item) => item.environment)).toStrictEqual([null, 'production', 'staging'])
  })

  it('does not sort columns without an accessor', () => {
    const { result } = setup()
    const actions = result.current.headerColumns.find((column) => column.uid === 'actions')

    expect(actions?.canSort).toBeFalsy()
    expect(actions?.onSort).toBeUndefined()
  })
})
