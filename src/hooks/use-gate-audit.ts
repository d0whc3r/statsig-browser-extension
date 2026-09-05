import { useEffect, useMemo } from 'react'

import { useFeatureGates } from '@/src/hooks/use-feature-gates'
import { auditGates, countIssues } from '@/src/lib/gate-audit'

/**
 * Audits every feature gate of the project for signals that it is no longer needed.
 *
 * The audit only makes sense over the full gate list (twin detection compares gates against each
 * other), so this keeps pulling pages until the infinite query is exhausted.
 *
 * @param thresholdDays - Age in days after which a gate counts as frozen or as an aged temporary gate.
 * @returns Findings sorted by suspicion, per-issue counts and the loading progress.
 */
export const useGateAudit = (thresholdDays: number) => {
  const { data, error, fetchNextPage, hasNextPage, isError, isFetchingNextPage, isLoading, refetch } = useFeatureGates()

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const gates = useMemo(() => data?.pages.flatMap((page) => page.data ?? []) ?? [], [data])
  const findings = useMemo(() => auditGates(gates, thresholdDays), [gates, thresholdDays])

  return {
    counts: useMemo(() => countIssues(findings), [findings]),
    error,
    findings,
    // Twins and counts are unreliable until every page is in, so callers can warn about it.
    isComplete: !hasNextPage && !isLoading,
    isError,
    isLoading,
    refetch,
    scannedCount: gates.length,
    totalCount: data?.pages[0]?.pagination?.totalItems ?? gates.length,
  }
}
