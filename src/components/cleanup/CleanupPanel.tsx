import { Loader2 } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

import type { IssueFilter } from '@/src/components/cleanup/CleanupIssueFilter'
import type { GateFinding } from '@/src/lib/gate-audit'

import { CleanupFindingCard } from '@/src/components/cleanup/CleanupFindingCard'
import { CleanupIssueFilter } from '@/src/components/cleanup/CleanupIssueFilter'
import { Button } from '@/src/components/ui/button'
import { GeneralEmptyState } from '@/src/components/ui/general-empty-state'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select'
import { useGateAudit } from '@/src/hooks/use-gate-audit'
import { useUIStore } from '@/src/store/use-ui-store'

const THRESHOLD_OPTIONS = ['7', '30', '90'] as const
const DEFAULT_THRESHOLD_DAYS = 7

interface CleanupBodyProps {
  error: unknown
  findings: GateFinding[]
  hasActiveFilter: boolean
  isError: boolean
  isLoading: boolean
  onOpen: (gateId: string) => void
  onRetry: () => void
}

function CleanupBody({ error, findings, hasActiveFilter, isError, isLoading, onOpen, onRetry }: CleanupBodyProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError) {
    return (
      <GeneralEmptyState
        variant="error"
        title="Failed to load feature gates"
        description={error instanceof Error ? error.message : 'An unknown error occurred'}
      >
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
          Retry
        </Button>
      </GeneralEmptyState>
    )
  }

  if (findings.length === 0) {
    return (
      <GeneralEmptyState
        variant={hasActiveFilter ? 'search' : 'feature_gate'}
        title={hasActiveFilter ? 'No gates with this issue' : 'Nothing looks redundant'}
        description={
          hasActiveFilter
            ? 'Pick another issue to see the gates it flagged.'
            : 'No gate matched a cleanup signal at the current threshold.'
        }
      />
    )
  }

  return (
    <div className="space-y-2">
      {findings.map((finding) => (
        <CleanupFindingCard key={finding.gate.id} finding={finding} onOpen={onOpen} />
      ))}
    </div>
  )
}

export function CleanupPanel() {
  const [thresholdDays, setThresholdDays] = useState<number>(DEFAULT_THRESHOLD_DAYS)
  const [filter, setFilter] = useState<IssueFilter>('all')

  const { counts, error, findings, isComplete, isError, isLoading, refetch, scannedCount, totalCount } =
    useGateAudit(thresholdDays)

  const { setCurrentItemId, setCurrentItemType, setItemSheetOpen } = useUIStore(
    useShallow((state) => ({
      setCurrentItemId: state.setCurrentItemId,
      setCurrentItemType: state.setCurrentItemType,
      setItemSheetOpen: state.setItemSheetOpen,
    })),
  )

  const handleOpen = useCallback(
    (gateId: string) => {
      setCurrentItemId(gateId)
      setCurrentItemType('feature_gate')
      setItemSheetOpen(true)
    },
    [setCurrentItemId, setCurrentItemType, setItemSheetOpen],
  )

  const handleThresholdChange = useCallback((value: string) => {
    setThresholdDays(Number(value))
  }, [])

  const handleRetry = useCallback(() => {
    void refetch()
  }, [refetch])

  const visibleFindings = useMemo(
    () => (filter === 'all' ? findings : findings.filter((finding) => finding.issues.some((it) => it.key === filter))),
    [findings, filter],
  )

  return (
    <div className="flex h-full flex-col">
      <div className="flex-none space-y-2 px-4 pt-3 pb-2">
        <div className="flex items-center justify-between gap-2">
          <p className="min-w-0 truncate text-sm text-muted-foreground">
            {isComplete
              ? `${findings.length} of ${scannedCount} gates look redundant`
              : `Scanning ${scannedCount} of ${totalCount} gates...`}
          </p>
          <div className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
            <span className="whitespace-nowrap">Unused after</span>
            <Select value={String(thresholdDays)} onValueChange={handleThresholdChange}>
              <SelectTrigger size="sm" aria-label="Days without changes" className="w-[6rem] text-muted-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THRESHOLD_OPTIONS.map((days) => (
                  <SelectItem key={days} value={days}>
                    {days} days
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <CleanupIssueFilter counts={counts} onSelect={setFilter} selected={filter} total={findings.length} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3">
        <CleanupBody
          error={error}
          findings={visibleFindings}
          hasActiveFilter={filter !== 'all'}
          isError={isError}
          isLoading={isLoading}
          onOpen={handleOpen}
          onRetry={handleRetry}
        />
      </div>
    </div>
  )
}
