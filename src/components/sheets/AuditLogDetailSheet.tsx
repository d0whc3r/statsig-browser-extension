import { Copy, ExternalLink } from 'lucide-react'
import { useCallback, useMemo } from 'react'

import type { PaginatedResponse } from '@/src/hooks/use-audit-logs'
import type { AuditLog } from '@/src/types/statsig'

import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { ScrollArea } from '@/src/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/src/components/ui/sheet'
import { Skeleton } from '@/src/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/src/components/ui/tooltip'
import { useAuditLogs } from '@/src/hooks/use-audit-logs'
import { useStore } from '@/src/store/use-store'
import { getActionTypeColor } from '@/src/utils/audit-log-utils'

const AuditLogHeader = ({
  auditLog,
  isLoading,
  currentAuditLogId,
  onCopyId,
}: {
  auditLog?: AuditLog
  isLoading: boolean
  currentAuditLogId?: string
  onCopyId: () => void
}) => (
  <SheetHeader className="px-6 py-4 border-b">
    <div className="flex justify-between items-center gap-4">
      <div className="flex-1 min-w-0">
        <SheetTitle className="truncate" title={auditLog?.name}>
          {isLoading && !auditLog ? (
            <Skeleton className="h-6 w-32" />
          ) : (
            auditLog?.name || 'Audit Log Detail'
          )}
        </SheetTitle>
        {!isLoading && auditLog && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground font-mono">{currentAuditLogId}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-4 w-4" onClick={onCopyId}>
                    <Copy className="h-3 w-3" />
                    <span className="sr-only">Copy ID</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy ID</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
      <div className="shrink-0">
        {!isLoading && auditLog && (
          <Button variant="outline" size="sm" className="h-8 gap-2" asChild>
            <a
              href={`https://console.statsig.com/audit_logs/${currentAuditLogId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Statsig
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        )}
      </div>
    </div>
    <SheetDescription className="sr-only">Details for audit log {auditLog?.name}</SheetDescription>
  </SheetHeader>
)

const AuditLogContent = ({ auditLog, isLoading }: { auditLog?: AuditLog; isLoading: boolean }) => {
  if (isLoading && !auditLog) {
    return (
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </ScrollArea>
    )
  }

  if (!auditLog) {
    return (
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          <div className="text-center text-sm text-muted-foreground py-10">
            Audit log details not found.
          </div>
        </div>
      </ScrollArea>
    )
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-6 space-y-6">
        <div className="bg-muted/50 rounded-lg p-3 border border-border space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Action
              </h3>
              <Badge variant={getActionTypeColor(auditLog.actionType)}>{auditLog.actionType}</Badge>
            </div>
            <div className="text-right">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Date
              </h3>
              <div className="text-xs font-medium">{auditLog.date}</div>
              <div className="text-[10px] text-muted-foreground">{auditLog.time}</div>
            </div>
          </div>

          <div className="pt-2 border-t border-border/50">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
              User
            </h3>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                {auditLog.updatedBy.charAt(0).toUpperCase()}
              </div>
              <div className="text-xs font-medium">
                {auditLog.updatedBy}
                <span className="text-muted-foreground ml-1 font-normal">
                  ({auditLog.modifierEmail})
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Details</h3>
          <div className="bg-muted rounded-md p-4 overflow-x-auto">
            <pre className="text-xs font-mono whitespace-pre-wrap break-all">
              {JSON.stringify(
                {
                  changeLog: auditLog.changeLog,
                  changes: auditLog.changes,
                  tags: auditLog.tags,
                  targetAppIDs: auditLog.targetAppIDs,
                },
                undefined,
                2,
              )}
            </pre>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}

export const AuditLogDetailSheet = () => {
  const { currentAuditLogId, isAuditLogDetailSheetOpen, setAuditLogDetailSheetOpen } = useStore(
    (state) => state,
  )

  const { data, isLoading } = useAuditLogs()

  const auditLog = useMemo(() => {
    if (!data || !currentAuditLogId) {
      return
    }
    const allLogs = data.pages.flatMap((page: PaginatedResponse<AuditLog>) => page.data)
    return allLogs.find((log) => log.id === currentAuditLogId)
  }, [data, currentAuditLogId])

  const handleClose = useCallback(
    (open: boolean) => {
      setAuditLogDetailSheetOpen(open)
    },
    [setAuditLogDetailSheetOpen],
  )

  const handleCopyId = useCallback(() => {
    if (currentAuditLogId) {
      navigator.clipboard.writeText(currentAuditLogId)
    }
  }, [currentAuditLogId])

  return (
    <Sheet open={isAuditLogDetailSheetOpen} onOpenChange={handleClose}>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0">
        <AuditLogHeader
          auditLog={auditLog}
          isLoading={isLoading}
          currentAuditLogId={currentAuditLogId}
          onCopyId={handleCopyId}
        />
        <AuditLogContent auditLog={auditLog} isLoading={isLoading} />
      </SheetContent>
    </Sheet>
  )
}
