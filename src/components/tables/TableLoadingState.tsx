import { Skeleton } from '@/src/components/ui/skeleton'
import { TableCell, TableRow } from '@/src/components/ui/table'

interface TableLoadingStateProps {
  columnCount: number
  rowCount?: number
}

export function TableLoadingState({ columnCount, rowCount = 5 }: Readonly<TableLoadingStateProps>) {
  return (
    <>
      {Array.from({ length: rowCount })
        .map((_row, rowIndex) => rowIndex)
        .map((row) => (
          <TableRow key={row}>
            {Array.from({ length: columnCount })
              .map((_col, colIndex) => colIndex)
              .map((col) => (
                <TableCell key={col}>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
              ))}
          </TableRow>
        ))}
    </>
  )
}
