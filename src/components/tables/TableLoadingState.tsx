import { Skeleton } from '@/src/components/ui/skeleton'
import { TableCell, TableRow } from '@/src/components/ui/table'

interface TableLoadingStateProps {
  columnCount: number
  rowCount?: number
}

export function TableLoadingState({ columnCount, rowCount = 5 }: TableLoadingStateProps) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: columnCount }).map((_, j) => (
            <TableCell key={j}>
              <Skeleton className="h-6 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}
