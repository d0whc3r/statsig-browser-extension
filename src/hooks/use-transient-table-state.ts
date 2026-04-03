import { useState } from 'react'

export const useTransientTableState = (initialStatusFilter = new Set<string>(['all'])) => {
  const [filterValue, setFilterValue] = useState('')
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter)
  const [page, setPage] = useState(1)

  return {
    filterValue,
    page,
    setFilterValue,
    setPage,
    setStatusFilter,
    statusFilter,
  }
}
