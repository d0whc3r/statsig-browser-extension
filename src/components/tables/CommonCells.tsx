import { ExternalLink, Eye, MoreVertical } from 'lucide-react'
import { memo, useCallback } from 'react'

import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { CopyableText } from '@/src/components/ui/copyable-text'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'

interface NameCellProps {
  id: string
  name: string
  showInlineId: boolean
}

export const NameCell = memo(({ id, name, showInlineId }: NameCellProps) => (
  <div className="min-w-0">
    <div className="cursor-pointer font-medium hover:underline truncate">{name}</div>
    {showInlineId && (
      <CopyableText
        value={id}
        copyLabel="Copy ID"
        containerClassName="text-xs text-muted-foreground font-mono"
        valueClassName="truncate hover:text-foreground transition-colors"
      />
    )}
  </div>
))
NameCell.displayName = 'NameCell'

interface TagsCellProps {
  tags?: string[]
}

export const TagsCell = memo(({ tags }: TagsCellProps) => {
  if (!tags || tags.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="capitalize text-xs">
          {tag}
        </Badge>
      ))}
    </div>
  )
})
TagsCell.displayName = 'TagsCell'

interface StatusCellProps {
  status: string
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  label?: string
}

export const StatusCell = memo(({ status, variant = 'outline', label }: StatusCellProps) => (
  <Badge variant={variant} className="capitalize">
    {label ?? status}
  </Badge>
))
StatusCell.displayName = 'StatusCell'

interface ActionsCellProps {
  id: string
  onRowClick: (id: string) => void
  statsigUrl: string
}

export const ActionsCell = memo(({ id, onRowClick, statsigUrl }: ActionsCellProps) => {
  const handleRowClick = useCallback(() => {
    onRowClick(id)
  }, [onRowClick, id])

  const handleOpenStatsig = useCallback((event: React.MouseEvent) => {
    event.stopPropagation()
  }, [])

  return (
    <div className="relative flex justify-end items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleRowClick}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              href={statsigUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
              onClick={handleOpenStatsig}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open on Statsig
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
})
ActionsCell.displayName = 'ActionsCell'
