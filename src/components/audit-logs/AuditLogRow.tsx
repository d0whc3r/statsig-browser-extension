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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/src/components/ui/tooltip'
import {
  getActionTypeColor,
  getActionTypeLabel,
  getDateFromAuditLog,
  getTagColor,
} from '@/src/utils/audit-log-utils'

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
      className="w-full text-left px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors focus:outline-none focus:bg-muted/50 block"
      onClick={handleRowClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Action and Name */}
          <div className="flex items-center gap-2 mb-1.5">
            <Badge
              variant={getActionTypeColor(auditLog.actionType)}
              className="h-5 text-[10px] font-medium px-1.5"
            >
              {getActionTypeLabel(auditLog.actionType)}
            </Badge>
            <h3 className="text-sm font-bold text-foreground truncate flex-1">{auditLog.name}</h3>
          </div>

          {/* Change Description */}
          {auditLog.changeLog && (
            <p className="text-xs text-muted-foreground mb-1.5 line-clamp-1 leading-relaxed">
              {auditLog.changeLog}
            </p>
          )}

          {/* User and Date */}
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1.5 font-medium">
            <span>By {auditLog.updatedBy}</span>
            {auditLog.modifierEmail && auditLog.modifierEmail !== auditLog.updatedBy && (
              <>
                <span>•</span>
                <span className="truncate max-w-[100px]">{auditLog.modifierEmail}</span>
              </>
            )}
            <span>•</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 cursor-help hover:text-foreground transition-colors">
                    <TimeAgo date={getDateFromAuditLog(auditLog.date, auditLog.time)} />
                    <Info className="h-3 w-3" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <div className="text-xs text-center">
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
                <Badge key={tag} variant={getTagColor(tag)} className="h-5 text-[10px] px-1.5">
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
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={handleStopPropagation}
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleViewDetails}>View Details</DropdownMenuItem>
              <DropdownMenuItem asChild onClick={handleStopPropagation}>
                <a
                  href="https://console.statsig.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center"
                >
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
