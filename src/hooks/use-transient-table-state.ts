import { useState } from 'react'

import type { FacetSelection } from '@/src/components/tables/table-types'

export const useTransientTableState = () => {
  const [filterValue, setFilterValue] = useState('')
  const [facetFilters, setFacetFilters] = useState<FacetSelection>({})
  const [page, setPage] = useState(1)

  return {
    facetFilters,
    filterValue,
    page,
    setFacetFilters,
    setFilterValue,
    setPage,
  }
}
