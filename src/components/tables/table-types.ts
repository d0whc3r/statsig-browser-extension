export interface Column {
  name: string
  uid: string
  sortable?: boolean
  /** Tailwind width class applied to the header cell (the table uses `table-fixed`). */
  width?: string
}

/** Describes a filterable dimension of a table. Options are derived from the loaded rows. */
export interface Facet<T> {
  key: string
  label: string
  getValues: (item: T) => string[]
  /** Optional display label for a raw value (e.g. `active` -> `In Progress`). */
  format?: (value: string) => string
}

export interface FacetOption {
  value: string
  label: string
  count: number
}

export interface FacetGroup {
  key: string
  label: string
  options: FacetOption[]
}

/** Selected values per facet key. A missing/empty entry means "no filter". */
export type FacetSelection = Record<string, string[]>
