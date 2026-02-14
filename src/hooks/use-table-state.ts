import { useCallback } from 'react'

import { usePersistentTableState } from '@/src/hooks/use-persistent-table-state'
import { useTransientTableState } from '@/src/hooks/use-transient-table-state'

interface UseTableStateOptions {
  initialVisibleColumns: string[]
  visibleColumnsKey: string
  rowsPerPageKey: string
  initialRowsPerPage?: number
  initialStatusFilter?: Set<string>
}

export const useTableState = ({
  initialVisibleColumns,
  visibleColumnsKey,
  rowsPerPageKey,
  initialRowsPerPage = 5,
  initialStatusFilter,
}: UseTableStateOptions) => {
  const { rowsPerPage, setRowsPerPage, setVisibleColumns, visibleColumns } =
    usePersistentTableState({
      initialRowsPerPage,
      initialVisibleColumns,
      rowsPerPageKey,
      visibleColumnsKey,
    })

  const { filterValue, page, setFilterValue, setPage, setStatusFilter, statusFilter } =
    useTransientTableState(initialStatusFilter)

  const onRowsPerPageChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(event.target.value))
      setPage(1)
    },
    [setRowsPerPage, setPage],
  )

  const onSearchChange = useCallback(
    (value: string) => {
      if (value) {
        setFilterValue(value)
        setPage(1)
      } else {
        setFilterValue('')
      }
    },
    [setFilterValue, setPage],
  )

  const handleSetFilterValue = useCallback(
    (value: string) => {
      setFilterValue(value)
    },
    [setFilterValue],
  )

  const handleSetStatusFilter = useCallback(
    (keys: Set<string>) => {
      setStatusFilter(keys)
    },
    [setStatusFilter],
  )

  const handleSetVisibleColumns = useCallback(
    (keys: string[]) => {
      setVisibleColumns(keys)
    },
    [setVisibleColumns],
  )

  return {
    filterValue,
    handleSetFilterValue,
    handleSetStatusFilter,
    handleSetVisibleColumns,
    onRowsPerPageChange,
    onSearchChange,
    page,
    rowsPerPage,
    setPage,
    statusFilter,
    visibleColumns,
  }
}
