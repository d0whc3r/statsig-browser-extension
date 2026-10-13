/** Pagination metadata returned by the Statsig Console API list endpoints. */
export interface PaginatedResponse<Item> {
  data: Item[]
  pagination: {
    itemsPerPage: number
    nextPage: string | null
    pageNumber: number
    previousPage: string | null
    totalItems?: number
  }
}

/** The API's nextPage marker is authoritative; totalItems may be omitted. */
export const getNextPageParam = <Item>(lastPage: PaginatedResponse<Item>): number | null =>
  lastPage.pagination?.nextPage ? lastPage.pagination.pageNumber + 1 : null
