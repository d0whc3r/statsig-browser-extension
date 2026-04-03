import { ExternalLink } from 'lucide-react'
import { useCallback, useMemo } from 'react'

import type { PaginatedResponse } from '@/src/hooks/use-audit-logs'
import type { AuditLog } from '@/src/types/statsig'

import {
  EntityDetailsContainer,
  EntityDetailsDivider,
  EntityDetailsField,
  EntityDetailsHeader,
  EntityDetailsSection,
} from '@/src/components/sheets/EntityDetails'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { CopyableText } from '@/src/components/ui/copyable-text'
import { ScrollArea } from '@/src/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/src/components/ui/sheet'
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
  <SheetHeader className="px-6 py-4 border-b pr-12">
    <div className="flex justify-between items-center gap-4">
      <div className="flex-1 min-w-0">
        <SheetTitle className="truncate" title={auditLog?.name}>
          {isLoading && !auditLog ? (
            <Skeleton className="h-6 w-32" />
          ) : (
            (auditLog?.name ?? 'Audit Log Detail')
          )}
        </SheetTitle>
        {!isLoading && auditLog && currentAuditLogId && (
          <CopyableText
            value={currentAuditLogId}
            copyLabel="Copy ID"
            containerClassName="mt-1 text-xs text-muted-foreground font-mono"
          />
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
    <ScrollArea className="flex-1 min-h-0">
      <div className="p-4 space-y-4">
        <EntityDetailsContainer>
          <EntityDetailsHeader>
            <EntityDetailsField label="Action">
              <Badge variant={getActionTypeColor(auditLog.actionType)} className="rounded-sm px-2">
                {auditLog.actionType}
              </Badge>
            </EntityDetailsField>

            <EntityDetailsDivider />

            <EntityDetailsField label="Date">
              <div className="flex flex-col">
                <span className="text-xs font-medium">{auditLog.date}</span>
                <span className="text-[10px] text-muted-foreground font-mono">{auditLog.time}</span>
              </div>
            </EntityDetailsField>

            <EntityDetailsDivider />

            <EntityDetailsField label="User">
              <div className="flex items-center gap-2.5">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary ring-1 ring-primary/20">
                  {auditLog.updatedBy.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium truncate">{auditLog.updatedBy}</span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    {auditLog.modifierEmail}
                  </span>
                </div>
              </div>
            </EntityDetailsField>
          </EntityDetailsHeader>

          <EntityDetailsSection title="Details">
            <div className="bg-muted/50 rounded-md p-3 border border-border/50 overflow-x-auto mt-2">
              <pre className="text-[10px] font-mono whitespace-pre-wrap break-all leading-relaxed">
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
  const { currentAuditLogId, isAuditLogDetailSheetOpen, setAuditLogDetailSheetOpen } = useUIStore(
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

  return (
    <Sheet open={isAuditLogDetailSheetOpen} onOpenChange={handleClose}>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col h-full overflow-hidden p-0 gap-0">
        <AuditLogHeader
          auditLog={auditLog}
          isLoading={isLoading}
          currentAuditLogId={currentAuditLogId}
        />
        <AuditLogContent auditLog={auditLog} isLoading={isLoading} />
      </SheetContent>
    </Sheet>
  )
}
