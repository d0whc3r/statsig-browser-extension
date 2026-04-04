import { ExternalLink } from 'lucide-react'
import { useCallback, useMemo } from 'react'

import type { PaginatedResponse } from '@/src/hooks/use-audit-logs'
import type { AuditLog } from '@/src/types/statsig'

import { EntityDetailsContainer, EntityDetailsSection } from '@/src/components/sheets/EntityDetails'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { CopyableText } from '@/src/components/ui/copyable-text'
import { ScrollArea } from '@/src/components/ui/scroll-area'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/src/components/ui/sheet'
import { Skeleton } from '@/src/components/ui/skeleton'
import { useAuditLogs } from '@/src/hooks/use-audit-logs'
import { useUIStore } from '@/src/store/use-ui-store'
import { getActionTypeColor } from '@/src/utils/audit-log-utils'

const AuditLogHeader = ({
  auditLog,
  isLoading,
  currentAuditLogId,
}: {
  auditLog?: AuditLog
  isLoading: boolean
  currentAuditLogId?: string
}) => (
  <SheetHeader className="shrink-0 border-b px-6 py-4 pr-12">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <SheetTitle className="truncate" title={auditLog?.name}>
            {isLoading && !auditLog ? <Skeleton className="h-6 w-32" /> : (auditLog?.name ?? 'Audit Log Detail')}
          </SheetTitle>
          {!isLoading && auditLog && (
            <Badge
              variant={getActionTypeColor(auditLog.actionType)}
              className="h-5 shrink-0 rounded-sm px-1.5 text-[10px]"
            >
              {auditLog.actionType}
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!isLoading && auditLog && currentAuditLogId && (
            <CopyableText
              value={currentAuditLogId}
              copyLabel="Copy ID"
              containerClassName="text-xs text-muted-foreground font-mono"
            />
          )}
          {!isLoading && auditLog && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span>{auditLog.date}</span>
              <span className="font-mono">{auditLog.time}</span>
            </div>
          )}
        </div>
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
        <div className="space-y-6 p-6">
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
        <div className="space-y-6 p-6">
          <div className="py-10 text-center text-sm text-muted-foreground">Audit log details not found.</div>
        </div>
      </ScrollArea>
    )
  }

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="space-y-4 p-4">
        <EntityDetailsContainer>
          <EntityDetailsSection title="User">
            <div className="flex w-full items-center justify-start gap-2.5">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary ring-1 ring-primary/20">
                {auditLog.updatedBy.charAt(0).toUpperCase()}
              </div>
              <div className="flex min-w-0 flex-col text-left">
                <span className="truncate text-xs font-medium">{auditLog.updatedBy}</span>
                <span className="truncate text-[10px] text-muted-foreground">{auditLog.modifierEmail}</span>
              </div>
            </div>
          </EntityDetailsSection>

          <EntityDetailsSection title="Details">
            <div className="mt-2 overflow-x-auto rounded-md border border-border/50 bg-muted/50 p-3">
              <pre className="font-mono text-[10px] leading-relaxed break-all whitespace-pre-wrap">
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
          </EntityDetailsSection>
        </EntityDetailsContainer>
      </div>
    </ScrollArea>
  )
}

export const AuditLogDetailSheet = () => {
  const { currentAuditLogId, isAuditLogDetailSheetOpen, setAuditLogDetailSheetOpen } = useUIStore((state) => state)

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

  return (
    <Sheet open={isAuditLogDetailSheetOpen} onOpenChange={handleClose}>
      <SheetContent className="flex h-full w-[400px] flex-col gap-0 overflow-hidden p-0 sm:w-[540px]">
        <AuditLogHeader auditLog={auditLog} isLoading={isLoading} currentAuditLogId={currentAuditLogId} />
        <AuditLogContent auditLog={auditLog} isLoading={isLoading} />
      </SheetContent>
    </Sheet>
  )
}
