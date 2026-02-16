import { Skeleton } from '@/src/components/ui/skeleton'
import { TableCell, TableRow } from '@/src/components/ui/table'

interface TableLoadingStateProps {
  columnCount: number
  rowCount?: number
}

export function TableLoadingState({ columnCount, rowCount = 5 }: TableLoadingStateProps) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_row, rowIndex) => (
        // eslint-disable-next-line react/no-array-index-key
        <TableRow key={rowIndex}>
          {Array.from({ length: columnCount }).map((_col, colIndex) => (
            // eslint-disable-next-line react/no-array-index-key
            <TableCell key={colIndex}>
              <Skeleton className="h-6 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}
