import type { IFuseOptions } from 'fuse.js'

import Fuse from 'fuse.js'
import { useMemo } from 'react'

interface UseFusedItemsOptions<Type> {
  items: Type[]
  filterValue: string
  keys: string[]
  options?: IFuseOptions<Type>
}

export const useFusedItems = <Type>({
  filterValue,
  items,
  keys,
  options,
}: UseFusedItemsOptions<Type>) => {
  const hasSearchFilter = Boolean(filterValue)

  return useMemo(() => {
    if (!hasSearchFilter) {
      return items
    }

    const fuse = new Fuse(items, {
      distance: 600,
      findAllMatches: true,
      keys,
      location: 10,
      threshold: 0.3,
      ...options,
    })

    return fuse.search(filterValue).map((result) => result.item)
  }, [items, filterValue, hasSearchFilter, keys, options])
}
