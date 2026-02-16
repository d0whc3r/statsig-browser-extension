import type { WxtStorageItem } from 'wxt/utils/storage'

import { useWxtStorage } from '@/src/hooks/use-wxt-storage'

interface UsePersistentTableStateOptions {
  visibleColumnsStorage: WxtStorageItem<string[], Record<string, unknown>>
  rowsPerPageStorage: WxtStorageItem<number, Record<string, unknown>>
}

export const usePersistentTableState = ({
  visibleColumnsStorage,
  rowsPerPageStorage,
}: UsePersistentTableStateOptions) => {
  const [visibleColumns, setVisibleColumns] = useWxtStorage<string[]>(visibleColumnsStorage)
  const [rowsPerPage, setRowsPerPage] = useWxtStorage<number>(rowsPerPageStorage)

  return { rowsPerPage, setRowsPerPage, setVisibleColumns, visibleColumns }
}
