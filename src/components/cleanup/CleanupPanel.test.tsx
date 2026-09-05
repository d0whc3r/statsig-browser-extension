import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { GateFinding, GateIssueKey } from '@/src/lib/gate-audit'

import { GATE_ISSUE_KEYS } from '@/src/lib/gate-audit'
import { useUIStore } from '@/src/store/use-ui-store'
import { makeFeatureGate } from '@/src/tests/fixtures/statsig'
import { renderWithProviders, screen } from '@/src/tests/utils/TestUtils'

import { CleanupPanel } from './CleanupPanel'

const { useGateAuditMock } = vi.hoisted(() => ({ useGateAuditMock: vi.fn() }))

vi.mock('@/src/hooks/use-gate-audit', () => ({
  useGateAudit: useGateAuditMock,
}))

const noCounts = Object.fromEntries(GATE_ISSUE_KEYS.map((key) => [key, 0])) as Record<GateIssueKey, number>

const finding = (id: string, key: GateIssueKey): GateFinding => ({
  gate: makeFeatureGate({ id, name: `${id} name` }),
  issues: [{ detail: `${id} detail`, key }],
})

type AuditResult = ReturnType<typeof buildAudit>

const buildAudit = (overrides: Record<string, unknown> = {}) => ({
  counts: noCounts,
  error: undefined as unknown,
  findings: [] as GateFinding[],
  isComplete: true,
  isError: false,
  isLoading: false,
  refetch: vi.fn(),
  scannedCount: 0,
  totalCount: 0,
  ...overrides,
})

const mockAudit = (overrides: Record<string, unknown> = {}): AuditResult => {
  const audit = buildAudit(overrides)
  useGateAuditMock.mockReturnValue(audit)
  return audit
}

describe('cleanupPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useUIStore.setState({ currentItemId: undefined, currentItemType: undefined, isItemSheetOpen: false })
  })

  it('shows a spinner instead of an empty state while the gates are still loading', () => {
    mockAudit({ isComplete: false, isLoading: true })

    const { container } = renderWithProviders(<CleanupPanel />)

    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
    expect(screen.queryByText('Nothing looks redundant')).not.toBeInTheDocument()
  })

  it('reports the scan progress until every page is in', () => {
    mockAudit({ isComplete: false, isLoading: false, scannedCount: 100, totalCount: 250 })

    renderWithProviders(<CleanupPanel />)

    expect(screen.getByText('Scanning 100 of 250 gates...')).toBeInTheDocument()
  })

  it('reports how many of the scanned gates look redundant once complete', () => {
    mockAudit({ findings: [finding('gate_1', 'always_on')], scannedCount: 42 })

    renderWithProviders(<CleanupPanel />)

    expect(screen.getByText('1 of 42 gates look redundant')).toBeInTheDocument()
  })

  it('surfaces the error message and retries on demand', async () => {
    const audit = mockAudit({ error: new Error('Boom'), isError: true })

    const { user } = renderWithProviders(<CleanupPanel />)

    expect(screen.getByText('Failed to load feature gates')).toBeInTheDocument()
    expect(screen.getByText('Boom')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /retry/iu }))

    expect(audit.refetch).toHaveBeenCalledTimes(1)
  })

  it('falls back to a generic message when the error is not an Error', () => {
    mockAudit({ error: 'just a string', isError: true })

    renderWithProviders(<CleanupPanel />)

    expect(screen.getByText('An unknown error occurred')).toBeInTheDocument()
  })

  it('says nothing looks redundant when no gate was flagged', () => {
    mockAudit()

    renderWithProviders(<CleanupPanel />)

    expect(screen.getByText('Nothing looks redundant')).toBeInTheDocument()
  })

  it('narrows the list to the picked issue and says so when it empties', async () => {
    mockAudit({
      counts: { ...noCounts, always_on: 1, frozen: 1 },
      findings: [finding('gate_on', 'always_on'), finding('gate_frozen', 'frozen')],
      scannedCount: 2,
    })

    const { user } = renderWithProviders(<CleanupPanel />)

    expect(screen.getByText('gate_on name')).toBeInTheDocument()
    expect(screen.getByText('gate_frozen name')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /always on/iu }))

    expect(screen.getByText('gate_on name')).toBeInTheDocument()
    expect(screen.queryByText('gate_frozen name')).not.toBeInTheDocument()
  })

  it('explains an empty list differently when a filter is what emptied it', async () => {
    mockAudit({
      counts: { ...noCounts, frozen: 1 },
      findings: [finding('gate_a', 'frozen')],
      scannedCount: 1,
    })

    const { user } = renderWithProviders(<CleanupPanel />)
    expect(screen.getByText('gate_a name')).toBeInTheDocument()

    // A later audit pass drops the only frozen gate; the click re-renders against the new result.
    mockAudit({ counts: { ...noCounts, frozen: 1 }, findings: [], scannedCount: 1 })
    await user.click(screen.getByRole('button', { name: /frozen/iu }))

    expect(screen.getByText('No gates with this issue')).toBeInTheDocument()
    expect(screen.queryByText('Nothing looks redundant')).not.toBeInTheDocument()
  })

  it('opens the gate sheet on the clicked finding', async () => {
    mockAudit({ findings: [finding('gate_1', 'always_on')], scannedCount: 1 })

    const { user } = renderWithProviders(<CleanupPanel />)
    await user.click(screen.getByRole('button', { name: /gate_1/iu }))

    const state = useUIStore.getState()
    expect(state.currentItemId).toBe('gate_1')
    expect(state.currentItemType).toBe('feature_gate')
    expect(state.isItemSheetOpen).toBeTruthy()
  })

  it('re-audits with the threshold picked in the select', async () => {
    mockAudit()

    const { user } = renderWithProviders(<CleanupPanel />)
    expect(useGateAuditMock).toHaveBeenLastCalledWith(7)

    await user.click(screen.getByRole('combobox', { name: /days without changes/iu }))
    await user.click(screen.getByRole('option', { name: '90 days' }))

    expect(useGateAuditMock).toHaveBeenLastCalledWith(90)
  })
})
