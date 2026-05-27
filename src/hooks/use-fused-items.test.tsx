import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useFusedItems } from './use-fused-items'

const items = [
  { id: 1, name: 'Alpha Gate', tag: 'red' },
  { id: 2, name: 'Beta Experiment', tag: 'blue' },
  { id: 3, name: 'Gamma Config', tag: 'green' },
]

describe('useFusedItems', () => {
  it('returns all items when filterValue is empty', () => {
    const { result } = renderHook(() =>
      useFusedItems({
        filterValue: '',
        items,
        keys: ['name'],
      }),
    )
    expect(result.current).toStrictEqual(items)
  })

  it('returns fuzzy matches when filterValue is provided', () => {
    const { result } = renderHook(() =>
      useFusedItems({
        filterValue: 'Alpha',
        items,
        keys: ['name'],
      }),
    )
    expect(result.current.map((item) => item.id)).toContain(1)
  })

  it('respects custom Fuse options', () => {
    const { result } = renderHook(() =>
      useFusedItems({
        filterValue: 'red',
        items,
        keys: ['name'],
        options: { keys: ['tag'], threshold: 0 },
      }),
    )
    expect(result.current.map((item) => item.id)).toContain(1)
  })

  it('returns empty list when no fuzzy match', () => {
    const { result } = renderHook(() =>
      useFusedItems({
        filterValue: 'zzzzz-not-present',
        items,
        keys: ['name'],
      }),
    )
    expect(result.current).toStrictEqual([])
  })
})
