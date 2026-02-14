import { useLocalStorage } from '@/src/hooks/use-local-storage'

interface UsePersistentTableStateOptions {
  visibleColumnsKey: string
  rowsPerPageKey: string
  initialVisibleColumns: string[]
  initialRowsPerPage?: number
}

export const usePersistentTableState = ({
  visibleColumnsKey,
  rowsPerPageKey,
  initialVisibleColumns,
  initialRowsPerPage = 5,
}: UsePersistentTableStateOptions) => {
  const [visibleColumns, setVisibleColumns] = useLocalStorage<string[]>(
    visibleColumnsKey,
    initialVisibleColumns,
  )
  const [rowsPerPage, setRowsPerPage] = useLocalStorage<number>(rowsPerPageKey, initialRowsPerPage)

  return { rowsPerPage, setRowsPerPage, setVisibleColumns, visibleColumns }
}
