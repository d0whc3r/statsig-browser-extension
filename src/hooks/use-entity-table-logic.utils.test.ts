import { describe, expect, it } from 'vitest'

import type { Facet } from '@/src/components/tables/table-types'

import {
  applyFacetFilters,
  buildFacetGroups,
  countActiveFacetValues,
  toggleFacetSelection,
} from './use-entity-table-logic.utils'

interface Row {
  id: string
  status: string
  isEnabled: boolean
  tags: string[]
}

const rows: Row[] = [
  { id: 'a', isEnabled: true, status: 'In Progress', tags: ['checkout', 'frontend'] },
  { id: 'b', isEnabled: false, status: 'Disabled', tags: ['ui'] },
  { id: 'c', isEnabled: true, status: 'In Progress', tags: [] },
]

const facets: readonly Facet<Row>[] = [
  { getValues: (row) => [row.status], key: 'status', label: 'Status' },
  { getValues: (row) => [row.isEnabled ? 'Enabled' : 'Disabled'], key: 'isEnabled', label: 'Enabled' },
  { getValues: (row) => row.tags, key: 'tags', label: 'Tags' },
]

describe('buildFacetGroups', () => {
  it('derives sorted options with counts and drops empty facets', () => {
    const groups = buildFacetGroups(rows, facets)

    expect(groups.map((group) => group.key)).toStrictEqual(['status', 'isEnabled', 'tags'])
    expect(groups[0]?.options).toStrictEqual([
      { count: 1, label: 'Disabled', value: 'Disabled' },
      { count: 2, label: 'In Progress', value: 'In Progress' },
    ])
    expect(groups[2]?.options.map((option) => option.value)).toStrictEqual(['checkout', 'frontend', 'ui'])

    expect(buildFacetGroups([], facets)).toStrictEqual([])
  })

  it('uses the facet formatter for display labels', () => {
    const formatted: readonly Facet<Row>[] = [
      { format: (value) => value.toUpperCase(), getValues: (row) => [row.status], key: 'status', label: 'Status' },
    ]

    expect(buildFacetGroups(rows, formatted)[0]?.options[0]?.label).toBe('DISABLED')
  })
})

describe('applyFacetFilters', () => {
  it('returns everything when nothing is selected', () => {
    expect(applyFacetFilters(rows, facets, {})).toStrictEqual(rows)
    expect(applyFacetFilters(rows, facets, { tags: [] })).toStrictEqual(rows)
  })

  it('combines values with OR inside a facet and AND across facets', () => {
    expect(applyFacetFilters(rows, facets, { tags: ['ui', 'checkout'] }).map((row) => row.id)).toStrictEqual(['a', 'b'])

    expect(
      applyFacetFilters(rows, facets, { isEnabled: ['Enabled'], tags: ['ui', 'checkout'] }).map((row) => row.id),
    ).toStrictEqual(['a'])
  })

  it('excludes rows that have no value for an active facet', () => {
    expect(applyFacetFilters(rows, facets, { tags: ['checkout'] }).map((row) => row.id)).toStrictEqual(['a'])
  })
})

describe('toggleFacetSelection', () => {
  it('adds, removes, and prunes empty keys', () => {
    const added = toggleFacetSelection({}, 'tags', 'ui')
    expect(added).toStrictEqual({ tags: ['ui'] })

    const secondValue = toggleFacetSelection(added, 'tags', 'checkout')
    expect(secondValue).toStrictEqual({ tags: ['ui', 'checkout'] })

    expect(toggleFacetSelection(secondValue, 'tags', 'ui')).toStrictEqual({ tags: ['checkout'] })
    expect(toggleFacetSelection({ tags: ['ui'] }, 'tags', 'ui')).toStrictEqual({})
  })
})

describe('countActiveFacetValues', () => {
  it('counts every selected value across facets', () => {
    expect(countActiveFacetValues({})).toBe(0)
    expect(countActiveFacetValues({ isEnabled: ['Enabled'], tags: ['ui', 'checkout'] })).toBe(3)
  })
})
