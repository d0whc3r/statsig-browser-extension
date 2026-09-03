import type { Facet, FacetGroup, FacetSelection } from '@/src/components/tables/table-types'

/**
 * Derives the selectable options of each facet from the loaded rows, with a
 * count per value. Facets with no values in the current data are dropped.
 */
export const buildFacetGroups = <T>(entities: T[], facets: readonly Facet<T>[]): FacetGroup[] =>
  facets
    .map((facet) => {
      const counts = new Map<string, number>()
      for (const entity of entities) {
        for (const value of facet.getValues(entity)) {
          counts.set(value, (counts.get(value) ?? 0) + 1)
        }
      }

      return {
        key: facet.key,
        label: facet.label,
        options: [...counts.entries()]
          .map(([value, count]) => ({ count, label: facet.format?.(value) ?? value, value }))
          .toSorted((first, second) => first.label.localeCompare(second.label)),
      }
    })
    .filter((group) => group.options.length > 0)

/** Keeps rows matching every active facet (AND across facets, OR within a facet). */
export const applyFacetFilters = <T>(entities: T[], facets: readonly Facet<T>[], selection: FacetSelection): T[] => {
  const activeFacets = facets.filter((facet) => (selection[facet.key]?.length ?? 0) > 0)
  if (activeFacets.length === 0) {
    return entities
  }

  return entities.filter((entity) =>
    activeFacets.every((facet) => {
      const selected = selection[facet.key] ?? []
      return facet.getValues(entity).some((value) => selected.includes(value))
    }),
  )
}

export const clampPage = (page: number, pageCount: number): number =>
  Math.min(Math.max(page, 1), Math.max(pageCount, 1))

/** Adds/removes a value from a facet selection, dropping the key when it empties. */
export const toggleFacetSelection = (selection: FacetSelection, facetKey: string, value: string): FacetSelection => {
  const current = selection[facetKey] ?? []
  const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value]

  const updated = { ...selection, [facetKey]: next }
  if (next.length === 0) {
    delete updated[facetKey]
  }

  return updated
}

export const countActiveFacetValues = (selection: FacetSelection): number =>
  Object.values(selection).reduce((total, values) => total + values.length, 0)
