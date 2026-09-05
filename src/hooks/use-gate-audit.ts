import { useEffect, useMemo } from 'react'

import type { GateIssue } from '@/src/lib/gate-audit'

import { useFeatureGates } from '@/src/hooks/use-feature-gates'
import { auditGates, countIssues, DEFAULT_THRESHOLD_DAYS, STRONG_GATE_ISSUE_KEYS } from '@/src/lib/gate-audit'

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

/**
 * Strong cleanup signals for a single gate, audited against the gate pages already loaded.
 *
 * Hygiene-only signals (frozen, orphan, no metadata) are dropped, and the full pagination the
 * cleanup panel does is not forced, so twin detection only sees the gates fetched so far.
 *
 * @param gateId - Gate to look up, or undefined while no gate is selected.
 * @returns The gate issues worth acting on, empty when the gate is clean or not loaded yet.
 */
export const useGateCleanupIssues = (gateId?: string): GateIssue[] => {
  const { data } = useFeatureGates()

  return useMemo(() => {
    const gates = data?.pages.flatMap((page) => page.data ?? []) ?? []
    if (!gateId || gates.length === 0) {
      return []
    }

    const issues = auditGates(gates, DEFAULT_THRESHOLD_DAYS).find((finding) => finding.gate.id === gateId)?.issues ?? []

    return issues.filter((issue) => STRONG_GATE_ISSUE_KEYS.has(issue.key))
  }, [data, gateId])
}
