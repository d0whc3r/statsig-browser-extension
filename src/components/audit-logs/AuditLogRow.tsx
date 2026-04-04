import { ExternalLink, MoreVertical, Info } from 'lucide-react'
import { memo, useCallback } from 'react'

import type { AuditLog } from '@/src/types/statsig'

import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { TimeAgo } from '@/src/components/ui/time-ago'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/src/components/ui/tooltip'
import { getActionTypeColor, getActionTypeLabel, getDateFromAuditLog, getTagColor } from '@/src/utils/audit-log-utils'

interface AuditLogRowProps {
  auditLog: AuditLog
  onViewDetails: (id: string) => void
}

export const AuditLogRow = memo(({ auditLog, onViewDetails }: AuditLogRowProps) => {
  const handleViewDetails = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      onViewDetails(auditLog.id)
    },
    [onViewDetails, auditLog.id],
  )

  const handleRowClick = useCallback(() => {
    onViewDetails(auditLog.id)
  }, [onViewDetails, auditLog.id])

  const handleStopPropagation = useCallback((event: React.MouseEvent) => {
    event.stopPropagation()
  }, [])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onViewDetails(auditLog.id)
      }
    },
    [onViewDetails, auditLog.id],
  )

  return (
    <div
      // oxlint-disable-next-line jsx_a11y/prefer-tag-over-role
      role="button"
      className="block w-full cursor-pointer border-0 bg-transparent px-4 py-3 text-left transition-colors hover:bg-muted/50 focus:bg-muted/50 focus:outline-none"
      onClick={handleRowClick}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Action and Name */}
          <div className="mb-1.5 flex items-center gap-2">
            <Badge variant={getActionTypeColor(auditLog.actionType)} className="h-5 px-1.5 text-[10px] font-medium">
              {getActionTypeLabel(auditLog.actionType)}
            </Badge>
            <h3 className="flex-1 truncate text-sm font-bold text-foreground">{auditLog.name}</h3>
          </div>

          {/* Change Description */}
          {auditLog.changeLog && (
            <p className="mb-1.5 line-clamp-1 text-xs leading-relaxed text-muted-foreground">{auditLog.changeLog}</p>
          )}

          {/* User and Date */}
          <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
            <span>By {auditLog.updatedBy}</span>
            {auditLog.modifierEmail && auditLog.modifierEmail !== auditLog.updatedBy && (
              <>
                <span>•</span>
                <span className="max-w-[100px] truncate">{auditLog.modifierEmail}</span>
              </>
            )}
            <span>•</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex cursor-help items-center gap-1 transition-colors hover:text-foreground">
                    <TimeAgo date={getDateFromAuditLog(auditLog.date, auditLog.time)} />
                    <Info className="h-3 w-3" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <div className="text-center text-xs">
                    <div className="font-semibold">{auditLog.date}</div>
                    <div className="text-muted-foreground">{auditLog.time}</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Tags */}
          {auditLog.tags && auditLog.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {auditLog.tags.map((tag: string) => (
                <Badge key={tag} variant={getTagColor(tag)} className="h-5 px-1.5 text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Actions Menu */}
        <div className="shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={handleStopPropagation}>
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleViewDetails}>View Details</DropdownMenuItem>
              <DropdownMenuItem asChild onClick={handleStopPropagation}>
                <a href="https://console.statsig.com" target="_blank" rel="noreferrer" className="flex items-center">
                  Open on Statsig
                  <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
})

AuditLogRow.displayName = 'AuditLogRow'
