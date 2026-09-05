import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { FeatureGate } from '@/src/types/statsig'

import { makeFeatureGate } from '@/src/tests/fixtures/statsig'
import { renderHook, renderInAct } from '@/src/tests/utils/TestUtils'

import { useGateAudit, useGateCleanupIssues } from './use-gate-audit'

const { useFeatureGatesMock } = vi.hoisted(() => ({ useFeatureGatesMock: vi.fn() }))

vi.mock('@/src/hooks/use-feature-gates', () => ({
  useFeatureGates: useFeatureGatesMock,
}))

const page = (data: FeatureGate[], totalItems = data.length) => ({
  data,
  pagination: { limit: 100, page: 1, totalItems },
})

const mockGates = (overrides: Record<string, unknown> = {}) => {
  const result = {
    data: { pages: [page([])] },
    error: undefined as unknown,
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isError: false,
    isFetchingNextPage: false,
    isLoading: false,
    refetch: vi.fn(),
    ...overrides,
  }
  useFeatureGatesMock.mockReturnValue(result)
  return result
}

/** A gate with no owner, no team, no description and no tags: flagged as `orphan` + `no_metadata`. */
const bareGate = (id: string) =>
  makeFeatureGate({ description: '', id, name: id, owner: undefined, tags: [], team: null })

describe('useGateAudit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('keeps pulling pages until the gate list is exhausted', async () => {
    const gates = mockGates({ hasNextPage: true })

    await renderInAct(() => renderHook(() => useGateAudit(7)))

    expect(gates.fetchNextPage).toHaveBeenCalledTimes(1)
  })

  it('does not stack a second page request on top of the one in flight', async () => {
    const gates = mockGates({ hasNextPage: true, isFetchingNextPage: true })

    await renderInAct(() => renderHook(() => useGateAudit(7)))

    expect(gates.fetchNextPage).not.toHaveBeenCalled()
  })

  it('flattens every page into the audited gate list', async () => {
    mockGates({ data: { pages: [page([bareGate('a')]), page([bareGate('b')])] } })

    const { result } = await renderInAct(() => renderHook(() => useGateAudit(7)))

    expect(result.current.scannedCount).toBe(2)
    expect(result.current.findings.map((found) => found.gate.id)).toStrictEqual(['a', 'b'])
  })

  it('tolerates a page that carries no data', async () => {
    mockGates({ data: { pages: [{ pagination: { limit: 100, page: 1, totalItems: 0 } }] } })

    const { result } = await renderInAct(() => renderHook(() => useGateAudit(7)))

    expect(result.current.scannedCount).toBe(0)
    expect(result.current.findings).toStrictEqual([])
  })

  it('counts the gates flagged per issue', async () => {
    mockGates({ data: { pages: [page([bareGate('a'), bareGate('b')])] } })

    const { result } = await renderInAct(() => renderHook(() => useGateAudit(7)))

    expect(result.current.counts.orphan).toBe(2)
    expect(result.current.counts.no_metadata).toBe(2)
    expect(result.current.counts.always_on).toBe(0)
  })

  it('is incomplete while more pages are pending', async () => {
    mockGates({ hasNextPage: true })

    const { result } = await renderInAct(() => renderHook(() => useGateAudit(7)))

    expect(result.current.isComplete).toBeFalsy()
  })

  it('is incomplete while the first page is still loading', async () => {
    mockGates({ isLoading: true })

    const { result } = await renderInAct(() => renderHook(() => useGateAudit(7)))

    expect(result.current.isComplete).toBeFalsy()
  })

  it('is complete once no page is pending and nothing is loading', async () => {
    mockGates()

    const { result } = await renderInAct(() => renderHook(() => useGateAudit(7)))

    expect(result.current.isComplete).toBeTruthy()
  })

  it('reports the total announced by the API', async () => {
    mockGates({ data: { pages: [page([bareGate('a')], 250)] } })

    const { result } = await renderInAct(() => renderHook(() => useGateAudit(7)))

    expect(result.current.totalCount).toBe(250)
  })

  it('falls back to the scanned count when the API announces no total', async () => {
    mockGates({ data: { pages: [{ data: [bareGate('a'), bareGate('b')] }] } })

    const { result } = await renderInAct(() => renderHook(() => useGateAudit(7)))

    expect(result.current.totalCount).toBe(2)
  })

  it('passes the query error and refetch straight through', async () => {
    const boom = new Error('Boom')
    const gates = mockGates({ error: boom, isError: true })

    const { result } = await renderInAct(() => renderHook(() => useGateAudit(7)))

    expect(result.current.isError).toBeTruthy()
    expect(result.current.error).toBe(boom)
    expect(result.current.refetch).toBe(gates.refetch)
  })
})

describe('useGateCleanupIssues', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the strong cleanup signals audited for the requested gate', async () => {
    mockGates({ data: { pages: [page([bareGate('a')])] } })

    const { result } = await renderInAct(() => renderHook(() => useGateCleanupIssues('a')))

    expect(result.current.map((issue) => issue.key)).toStrictEqual(['always_off', 'no_traffic'])
  })

  it('drops the hygiene-only signals the cleanup panel still shows', async () => {
    mockGates({ data: { pages: [page([bareGate('a')])] } })

    const { result } = await renderInAct(() => renderHook(() => useGateCleanupIssues('a')))

    // `bareGate` is also frozen, orphan and without metadata; none of those justify removing it.
    const keys = result.current.map((issue) => issue.key)
    expect(keys).not.toContain('frozen')
    expect(keys).not.toContain('orphan')
    expect(keys).not.toContain('no_metadata')
  })

  it('returns nothing while no gate is selected', async () => {
    mockGates({ data: { pages: [page([bareGate('a')])] } })

    const { result } = await renderInAct(() => renderHook(() => useGateCleanupIssues()))

    expect(result.current).toStrictEqual([])
  })

  it('returns nothing while no gate has been loaded', async () => {
    mockGates({ data: undefined })

    const { result } = await renderInAct(() => renderHook(() => useGateCleanupIssues('a')))

    expect(result.current).toStrictEqual([])
  })

  it('returns nothing for a gate the audit did not flag', async () => {
    mockGates({ data: { pages: [page([bareGate('a')])] } })

    const { result } = await renderInAct(() => renderHook(() => useGateCleanupIssues('unknown')))

    expect(result.current).toStrictEqual([])
  })
})
