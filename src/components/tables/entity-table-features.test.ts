import { describe, expect, it } from 'vitest'

import type { Column } from './table-types'

import { fromColumnVisibility, toColumnVisibility } from './entity-table-features'

const columns: readonly Column[] = [
  { name: 'NAME', sortable: true, uid: 'name' },
  { name: 'TAGS', sortable: true, uid: 'tags' },
  { name: 'ACTIONS', sortable: false, uid: 'actions' },
]

describe('toColumnVisibility', () => {
  it('marks omitted columns as hidden and listed columns as visible', () => {
    expect(toColumnVisibility(columns, ['name', 'actions'])).toStrictEqual({
      actions: true,
      name: true,
      tags: false,
    })
  })

  it('hides every column when the visible list is empty', () => {
    expect(toColumnVisibility(columns, [])).toStrictEqual({
      actions: false,
      name: false,
      tags: false,
    })
  })
})

describe('fromColumnVisibility', () => {
  it('returns only columns that are not explicitly hidden', () => {
    expect(fromColumnVisibility(columns, { actions: true, name: true, tags: false })).toStrictEqual(['name', 'actions'])
  })

  it('treats a missing key as visible', () => {
    expect(fromColumnVisibility(columns, { tags: false })).toStrictEqual(['name', 'actions'])
  })
})
